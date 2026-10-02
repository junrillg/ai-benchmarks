"""Offline, stdlib checks for the curated data and public-feed trust boundaries."""
import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("updater", ROOT / "scripts/update-data.py")
updater = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(updater)


def chart_html():
    parts = []
    for name in updater.SONNET_CHARTS:
        other = "GPT-5.6 Sol" if name in ("Terminal-Bench 4.0", "CursorBench 4.0") else "GPT-6 Sol"
        parts.append(f'<svg role="img" aria-label="{name}">')
        if name == "Terminal-Bench 4.0":
            parts.append('<text>Cost per attempt (USD, log scale)</text>')
        for model in ("Sonnet 5.5", "Opus 5.5", "Sonnet 5", other):
            for effort in ("Low", "Med", "High", "Xhigh", "Max"):
                score = "1500.0" if name == "AA-Briefcase v1.1" else "52.1%"
                parts.append(f'<g aria-label="{model} · {effort}: {score} $1.59"></g>')
        parts.append("</svg>")
    return "".join(parts).encode()


class PublicDataChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads((ROOT / "data/benchmarks.json").read_text())

    def test_shipped_snapshot_has_requested_models_and_exact_curves(self):
        updater.validate_data(self.data)
        model_ids = {model["id"] for model in self.data["models"]}
        self.assertTrue({"claude-opus-5.5", "claude-sonnet-5.5", "claude-fable-5.1", "gpt-6.1-sol", "gpt-6-astra", "gpt-6-sol", "gpt-6-luna", "grok-4.7", "kimi-k3", "glm-5.3"} <= model_ids)
        flash = next(m for m in self.data["models"] if m["id"] == "glm-5.3-flash")
        flash_source = next(s for s in self.data["sources"] if s["id"] == flash["sourceId"])
        self.assertEqual(flash_source["url"], "https://huggingface.co/zai-org/GLM-5.3-Flash")
        self.assertIsNone(flash["releaseDate"])
        self.assertEqual(flash["dateKind"], "unverified")
        flash_points = [p for b in self.data["benchmarks"] for p in b["points"] if p["modelId"] == "glm-5.3-flash" and p["sourceId"] == "zai-glm-5-3-flash"]
        self.assertEqual(len(flash_points), 6)
        self.assertEqual(sorted(p["score"] for p in flash_points), [26.3, 48.8, 55.3, 63.4, 84.3, 1773])
        self.assertTrue(all(p["cost"] is None for p in flash_points))
        benchmark = next(b for b in self.data["benchmarks"] if b["id"] == "frontiercode-1-1-main")
        points = [p for p in benchmark["points"] if p["modelId"] == "claude-sonnet-5.5" and p["sourceId"] == "anthropic-sonnet-5-5"]
        self.assertEqual(len(points), 5)
        by_effort = {p["effort"]: p for p in points}
        self.assertEqual((by_effort["xhigh"]["score"], by_effort["xhigh"]["cost"]), (52.1, 1.59))
        self.assertEqual((by_effort["max"]["score"], by_effort["max"]["cost"]), (46.2, 20.78))
        deepswe = next(b for b in self.data["benchmarks"] if b["id"] == "deep-swe-1-1")
        sol = next(p for p in deepswe["points"] if p["modelId"] == "gpt-6.1-sol" and p["effort"] == "high")
        self.assertEqual((sol["score"], sol["cost"]), (75.2, 0.65))
        science = next(b for b in self.data["benchmarks"] if b["id"] == "terminal-bench-science-0-1")
        sol_science = next(p for p in science["points"] if p["modelId"] == "gpt-6.1-sol" and p["effort"] == "max")
        self.assertEqual((sol_science["score"], sol_science["cost"]), (57.0, 5.47))
        factuality = next(b for b in self.data["benchmarks"] if b["id"] == "factuality-flagged-errors")
        self.assertFalse(factuality["higherIsBetter"])
        sol_factuality = next(p for p in factuality["points"] if p["modelId"] == "gpt-6.1-sol" and p["effort"] == "high")
        self.assertEqual((sol_factuality["score"], sol_factuality["cost"]), (4.5, 0.08))
        safety = [b for b in self.data["benchmarks"] if b["id"].startswith("openai-sol-")]
        self.assertEqual(len(safety), 4)
        self.assertEqual(sum(len(b["points"]) for b in safety), 16)
        for benchmark in safety:
            self.assertFalse(benchmark["higherIsBetter"])
            self.assertEqual(len({(p["modelId"], p["effort"]) for p in benchmark["points"]}), 4)
            self.assertTrue(all(p["cost"] is None for p in benchmark["points"]))
        for b in self.data["benchmarks"]:
            for point in b["points"]:
                if point["modelId"] == "claude-fable-5.1-opus-5-fallback":
                    self.assertEqual(point["costBasis"], "excludes-fallback-cost")
                if b["id"] == "terminal-bench-4" and point["cost"] is not None:
                    if point["sourceId"] in ("anthropic-sonnet-5-5", "anthropic-opus-5-5"):
                        self.assertEqual(point["costBasis"], "per-attempt")
                    elif point["sourceId"] == "anthropic-fable-5-1":
                        self.assertEqual(point["costBasis"], "mean-per-task")

    def test_parser_requires_complete_unambiguous_source_curves(self):
        parsed = updater.parse_sonnet(chart_html())
        self.assertEqual(sum(map(len, parsed.values())), 80)
        self.assertTrue(all(p["costBasis"] == "per-attempt" for p in parsed["terminal-bench-4"]))
        for bad in (b"blocked", chart_html().replace(b'Cost per attempt', b'Cost per task', 1), chart_html().replace(b'Sonnet 5.5', b'Unknown model', 1), chart_html().replace(b'52.1%', b'152.1%', 1), chart_html().replace(b'$1.59', b'$NaN', 1), chart_html().replace(b'<g aria-label="Sonnet 5.5', b'<g label="Sonnet 5.5', 1)):
            with self.assertRaises(ValueError):
                updater.parse_sonnet(bad)

    def test_deepswe_numeric_and_harness_boundaries(self):
        row = dict(model="gpt-6-astra", harness="mini-swe-agent", reasoning_effort="high", pass_at_1=0.73, mean_cost_usd=3.92, ci_lo=0.69, ci_hi=0.77)
        feed = dict(n_tasks_in_set=113, generated_at="2026-09-22T00:00:00Z", rows=[row])
        points, unknown, generated = updater.parse_deepswe(feed)
        self.assertEqual((points[0]["score"], unknown), (73.0, []))
        for key, value in (("harness", "different-harness"), ("pass_at_1", 1.1), ("mean_cost_usd", float("nan")), ("ci_hi", 0.1)):
            broken = copy.deepcopy(feed)
            broken["rows"][0][key] = value
            with self.assertRaises(ValueError):
                updater.parse_deepswe(broken)

    def test_failed_refresh_leaves_input_and_file_unchanged(self):
        before = copy.deepcopy(self.data)
        calls = []
        def fails_after_first_source(url):
            calls.append(url)
            if len(calls) == 1:
                return chart_html()
            raise OSError("simulated feed failure")
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "benchmarks.json"
            updater.atomic_write(path, self.data)
            original = path.read_bytes()
            with self.assertRaises(OSError):
                result = updater.refresh(self.data, fails_after_first_source)
                updater.atomic_write(path, result)
            self.assertEqual(path.read_bytes(), original)
            self.assertEqual(self.data, before)
            self.assertEqual(list(Path(directory).glob(".benchmarks-*")), [])

    def test_catalog_and_source_validation_reject_invalid_inputs(self):
        with self.assertRaises(ValueError):
            updater.parse_openrouter({"data": []})
        for url in ("http://openrouter.ai/api/v1/models", "https://user:password@openrouter.ai/api/v1/models", "https://untrusted.example/data"):
            with self.assertRaises(ValueError):
                updater.link(url)
        for value in (True, float("nan"), float("inf"), -1):
            with self.assertRaises(ValueError):
                updater.number(value, 0, 100)


if __name__ == "__main__":
    unittest.main()
