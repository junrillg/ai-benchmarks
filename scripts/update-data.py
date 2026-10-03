#!/usr/bin/env python3
"""Refresh verified public data. Failure preserves the last complete snapshot."""
import argparse
import copy
import hashlib
import json
import math
import os
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
import re
import tempfile
from urllib.parse import urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data/benchmarks.json"
PROVIDERS = {"anthropic": "Anthropic", "openai": "OpenAI", "x-ai": "xAI"}
SONNET_CHARTS = {"Terminal-Bench 4.0": "terminal-bench-4", "FrontierCode v1.1, main set": "frontiercode-1-1-main", "CursorBench 4.0": "cursorbench-4", "AA-Briefcase v1.1": "aa-briefcase-1-1"}
SONNET_MODELS = {"Sonnet 5.5": "claude-sonnet-5.5", "Opus 5.5": "claude-opus-5.5", "Sonnet 5": "claude-sonnet-5", "GPT-5.6 Sol": "gpt-5.6-sol", "GPT-6 Sol": "gpt-6-sol"}
# Explicit source identifiers, not inferred model-name or version substitutions.
DEEPSWE_MODELS = {"gpt-6-astra": "gpt-6-astra", "kimi-k3": "kimi-k3", "glm-5-3": "glm-5.3", "glm-5-3-flash": "glm-5.3-flash", "claude-sonnet-5": "claude-sonnet-5", "gpt-5-6-sol": "gpt-5.6-sol", "claude-fable-5": "claude-fable-5", "claude-opus-5": "claude-opus-5"}
FOCUSED_MODELS = {"claude-opus-5.5", "claude-sonnet-5.5", "claude-fable-5.1", "claude-fable-5", "claude-opus-5", "gpt-6.1-sol", "gpt-6-sol", "gpt-6-luna", "gpt-6-astra", "grok-4.7"}
DEEPSWE_MODELS = {name: model for name, model in DEEPSWE_MODELS.items() if model in FOCUSED_MODELS}
ALLOWED_HOSTS = {"platform.claude.com", "developers.openai.com", "docs.x.ai", "www.anthropic.com", "openai.com", "deploymentsafety.openai.com", "x.ai", "huggingface.co", "arxiv.org", "deepswe.datacurve.ai", "openrouter.ai", "artificialanalysis.ai", "z.ai"}


def now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def number(value, minimum, maximum):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not minimum <= value <= maximum:
        raise ValueError("Invalid numeric field")
    return value


def link(value):
    parsed = urlparse(value)
    if parsed.scheme != "https" or parsed.hostname not in ALLOWED_HOSTS or parsed.username or parsed.password:
        raise ValueError("Untrusted source URL")


def fetch(url):
    link(url)
    with urlopen(Request(url, headers={"User-Agent": "Mozilla/5.0 AI-Benchmarks/1.0", "Accept": "application/json,text/html"}), timeout=40) as response:
        link(response.geturl())
        raw = response.read(8_000_001)
    if len(raw) > 8_000_000:
        raise ValueError("Source exceeds size limit")
    return raw


class ChartParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.chart = None
        self.depth = 0
        self.charts = {}
        self.chart_text = {}

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "svg":
            self.depth += 1
            if attrs.get("role") == "img" and attrs.get("aria-label") in SONNET_CHARTS:
                self.chart = attrs["aria-label"]
                if self.chart in self.charts:
                    raise ValueError("Duplicate chart")
                self.charts[self.chart] = []
                self.chart_text[self.chart] = []
        if self.chart and tag == "g" and "aria-label" in attrs:
            self.charts[self.chart].append(attrs["aria-label"])

    def handle_data(self, value):
        if self.chart:
            self.chart_text[self.chart].append(value)

    def handle_endtag(self, tag):
        if tag == "svg":
            self.depth -= 1
            if self.depth == 0:
                self.chart = None


def parse_sonnet(raw):
    parser = ChartParser()
    parser.feed(raw.decode("utf-8"))
    if set(parser.charts) != set(SONNET_CHARTS):
        raise ValueError("Required Anthropic chart missing")
    result = {}
    for name, labels in parser.charts.items():
        if name == "Terminal-Bench 4.0" and "Cost per attempt (USD, log scale)" not in " ".join(parser.chart_text[name]):
            raise ValueError("Terminal-Bench cost axis changed")
        expected_models = {"Sonnet 5.5", "Opus 5.5", "Sonnet 5", "GPT-5.6 Sol" if name in ("Terminal-Bench 4.0", "CursorBench 4.0") else "GPT-6 Sol"}
        points = []
        for label in labels:
            match = re.fullmatch(r"(.+) · (Low|Med|High|Xhigh|Max): ([0-9]+(?:\.[0-9]+)?)(%?) \$([0-9]+(?:\.[0-9]+)?)", label)
            if not match or match[1] not in expected_models or bool(match[4]) != (name != "AA-Briefcase v1.1"):
                raise ValueError("Anthropic chart format changed")
            score, cost = number(float(match[3]), 0, 5000 if name == "AA-Briefcase v1.1" else 100), number(float(match[5]), 0, 1_000_000)
            point = {"modelId": SONNET_MODELS[match[1]], "score": score, "cost": cost, "effort": {"Med": "medium", "Xhigh": "xhigh"}.get(match[2], match[2].lower()), "sourceId": "anthropic-sonnet-5-5", "conditions": "Published effort curve; USD per attempt." if name == "Terminal-Bench 4.0" else "Published effort curve; USD per task."}
            if name == "Terminal-Bench 4.0":
                point["costBasis"] = "per-attempt"
            points.append(point)
        if len(points) != 20 or len({(p["modelId"], p["effort"]) for p in points}) != 20:
            raise ValueError("Incomplete Anthropic effort curve")
        result[SONNET_CHARTS[name]] = points
    return result


def parse_openrouter(payload):
    if not isinstance(payload.get("data"), list) or not payload["data"]:
        raise ValueError("OpenRouter models response missing")
    rows = []
    seen = set()
    for item in payload["data"]:
        api_id = item.get("id", "")
        if not isinstance(api_id, str) or "/" not in api_id:
            raise ValueError("Invalid OpenRouter model ID")
        provider = PROVIDERS.get(api_id.split("/", 1)[0])
        if not provider:
            continue
        if api_id in seen or not isinstance(item.get("name"), str) or not 1 <= len(item["name"]) <= 200:
            raise ValueError("Duplicate or invalid OpenRouter model")
        seen.add(api_id)
        created = number(item.get("created"), 0, datetime.now(timezone.utc).timestamp() + 86400)
        pricing = item.get("pricing", {})
        try:
            prompt, completion = float(pricing["prompt"]), float(pricing["completion"])
        except (KeyError, TypeError, ValueError) as error:
            raise ValueError("OpenRouter pricing missing") from error
        rows.append({"id": api_id, "name": item["name"], "provider": provider, "created": created, "releaseDate": datetime.fromtimestamp(created, timezone.utc).date().isoformat(), "contextLength": number(item.get("context_length"), 1, 100_000_000), "inputPricePerMillion": number(prompt * 1_000_000, 0, 1_000_000), "outputPricePerMillion": number(completion * 1_000_000, 0, 1_000_000), "sourceId": "openrouter-models"})
    if set(r["provider"] for r in rows) != set(PROVIDERS.values()):
        raise ValueError("OpenRouter response missing a target provider")
    return sorted(rows, key=lambda row: row["created"], reverse=True)


def parse_deepswe(payload):
    if payload.get("n_tasks_in_set") != 113 or not isinstance(payload.get("rows"), list) or not payload["rows"]:
        raise ValueError("DeepSWE v1.1 schema/task set changed")
    generated = payload.get("generated_at")
    if not isinstance(generated, str):
        raise ValueError("DeepSWE generated_at missing")
    datetime.fromisoformat(generated.replace("Z", "+00:00"))
    points, unknown, seen = [], set(), set()
    for row in payload["rows"]:
        if not isinstance(row.get("model"), str) or not re.fullmatch(r"[a-z0-9][a-z0-9._-]{0,100}", row["model"]):
            raise ValueError("Invalid DeepSWE model ID")
        model_id = DEEPSWE_MODELS.get(row["model"])
        if not model_id:
            unknown.add(row["model"])
            continue
        if row.get("harness") != "mini-swe-agent" or row.get("source") != "deep-swe":
            raise ValueError("DeepSWE harness changed")
        effort = row.get("reasoning_effort")
        if effort not in ("none", "low", "medium", "high", "xhigh", "max"):
            raise ValueError("Unexpected DeepSWE reasoning effort")
        key = (model_id, effort)
        if key in seen:
            raise ValueError("Duplicate DeepSWE model/effort")
        seen.add(key)
        score = number(row.get("pass_at_1"), 0, 1) * 100
        cost = number(row.get("mean_cost_usd"), 0, 1_000_000)
        lo, hi = number(row.get("ci_lo"), 0, 1) * 100, number(row.get("ci_hi"), 0, 1) * 100
        if not lo <= score <= hi:
            raise ValueError("DeepSWE confidence interval invalid")
        point = {"modelId": model_id, "score": score, "cost": cost, "effort": effort, "sourceId": "deepswe-public", "conditions": "mini-swe-agent; attempt pass@1; mean scored-attempt cost; source snapshot " + generated, "confidenceInterval": [lo, hi]}
        if "cost_basis" in row:
            if not isinstance(row["cost_basis"], str) or not row["cost_basis"].strip() or len(row["cost_basis"]) > 5000:
                raise ValueError("Invalid DeepSWE cost basis")
            point["costBasis"] = row["cost_basis"]
        points.append(point)
    if not points:
        raise ValueError("DeepSWE contains no mapped models")
    return points, sorted(unknown), generated


def validate_data(data):
    sources = {s["id"]: s for s in data["sources"]}
    models = {m["id"]: m for m in data["models"]}
    if len(sources) != len(data["sources"]) or len(models) != len(data["models"]):
        raise ValueError("Duplicate source/model IDs")
    if set(models) != FOCUSED_MODELS:
        raise ValueError("Snapshot must contain exactly the reviewed model shortlist")
    for source in sources.values():
        link(source["url"])
    for model in models.values():
        if model["sourceId"] not in sources:
            raise ValueError("Model source missing")
        pricing = model.get("apiPricing")
        if pricing:
            if pricing["sourceId"] not in sources or not pricing.get("checkedAt"):
                raise ValueError("API pricing provenance missing")
            for field in ("inputPerMillion", "outputPerMillion", "cachedInputPerMillion"):
                if field in pricing:
                    number(pricing[field], 0, 1_000_000)
            if "longContext" in pricing:
                number(pricing["longContext"]["threshold"], 1, 100_000_000)
                number(pricing["longContext"]["inputMultiplier"], 1, 100)
                number(pricing["longContext"]["outputMultiplier"], 1, 100)
    seen = set()
    for benchmark in data["benchmarks"]:
        if benchmark["id"] in seen or not benchmark["points"]:
            raise ValueError("Duplicate or empty benchmark")
        seen.add(benchmark["id"])
        for point in benchmark["points"]:
            if point["modelId"] not in models or point["sourceId"] not in sources or point["sourceId"] not in benchmark["sourceIds"]:
                raise ValueError("Dangling point reference")
            limit = 100 if benchmark["unit"] == "%" else 5000 if benchmark["unit"] == "Elo" else 1_000_000
            number(point["score"], -100 if benchmark["unit"] == "index" else 0, limit)
            if point["cost"] is not None:
                number(point["cost"], 0, 1_000_000)


def refresh(data, reader=fetch):
    result = copy.deepcopy(data)
    source_map = {source["id"]: source for source in result["sources"]}
    stamp = now()
    raw_sonnet = reader(source_map["anthropic-sonnet-5-5"]["url"])
    curves = parse_sonnet(raw_sonnet)
    raw_router = reader(source_map["openrouter-models"]["url"])
    discovery = parse_openrouter(json.loads(raw_router))
    raw_deepswe = reader(source_map["deepswe-public"]["url"])
    deepswe, review_queue, generated = parse_deepswe(json.loads(raw_deepswe))
    for benchmark in result["benchmarks"]:
        if benchmark["id"] in curves:
            benchmark["points"] = [p for p in benchmark["points"] if p["sourceId"] != "anthropic-sonnet-5-5"] + [p for p in curves[benchmark["id"]] if p["modelId"] in FOCUSED_MODELS]
        elif benchmark["id"] == "deep-swe-1-1-independent":
            benchmark["points"] = deepswe
            if "deepswe-public" not in benchmark["sourceIds"]:
                benchmark["sourceIds"].append("deepswe-public")
    models = {m["id"]: m for m in result["models"]}
    known_api_ids = {m.get("apiId") for m in models.values()}
    discovery = [row for row in discovery if row["id"] in known_api_ids]
    for source_id, raw in [("anthropic-sonnet-5-5", raw_sonnet), ("openrouter-models", raw_router), ("deepswe-public", raw_deepswe)]:
        source_map[source_id].update(retrievedAt=stamp, sha256=hashlib.sha256(raw).hexdigest())
    source_map["deepswe-public"]["publishedAt"] = generated
    result["updatedAt"] = stamp
    result["discovery"] = {"checkedAt": stamp, "models": discovery, "reviewQueue": review_queue, "notes": "Catalog-listed dates are not verified release dates. Discovery does not invent or match benchmark scores."}
    validate_data(result)
    return result


def atomic_write(path, data):
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent, prefix=".benchmarks-", suffix=".json", delete=False) as handle:
            temporary = Path(handle.name)
            json.dump(data, handle, ensure_ascii=False, indent=2, allow_nan=False)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        if temporary is not None and temporary.exists():
            temporary.unlink()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Validate the stored snapshot without network requests or writes")
    args = parser.parse_args()
    data = json.loads(DATA.read_text())
    validate_data(data)
    if args.check:
        print(f"Valid snapshot: {len(data['benchmarks'])} benchmarks, {sum(len(b['points']) for b in data['benchmarks'])} points")
        return
    updated = refresh(data)
    atomic_write(DATA, updated)
    print(f"Updated public feeds; {len(updated['discovery']['models'])} catalog models, {len(updated['discovery']['reviewQueue'])} unmapped DeepSWE names. Vendor tables retain their published snapshots.")


if __name__ == "__main__":
    main()
