---
name: AI Benchmarks
description: A precise scientific research plate for published model evidence.
colors:
  ink: "#000028"
  secondary: "#456287"
  blue: "#1551e7"
  rule: "#cfdeed"
  paper: "#fefefe"
  ground: "#ebf3fa"
  navigation: "#f1f7fd"
  panel: "#f2f8fd"
  control: "#f5f9fe"
  control-border: "#b7cde6"
  field: "#fbfdff"
  field-border: "#b8cce1"
  table-heading: "#f3f8fd"
  chart-grid: "#dee8f3"
  chart-axis: "#66758e"
  cost-warning: "#fff4e9"
  series-opus: "#e8721c"
  series-sol: "#349a57"
  series-fable: "#8453ab"
  series-sol-6-1: "#217d95"
  series-astra: "#aa486f"
  series-luna: "#8b7020"
  series-grok: "#5367a6"
  series-kimi: "#9e5736"
  series-glm: "#547e52"
  series-glm-flash: "#80676b"
  series-unmapped: "#77879c"
typography:
  display:
    fontFamily: "Geist, sans-serif"
    fontSize: "42px"
    fontWeight: 750
    lineHeight: "53px"
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist, sans-serif"
    fontSize: "28px"
    fontWeight: 750
    lineHeight: "34px"
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist, sans-serif"
    fontSize: "23px"
    fontWeight: 750
    lineHeight: "29px"
    letterSpacing: "-0.015em"
  subheading:
    fontFamily: "Geist, sans-serif"
    fontSize: "17px"
    fontWeight: 650
    lineHeight: "25px"
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "24px"
  label:
    fontFamily: "Geist, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "20px"
  annotation:
    fontFamily: "Geist, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "18px"
rounded:
  plate: "4px"
  marker: "50%"
spacing:
  tight: "4px"
  small: "8px"
  band: "12px"
  regular: "16px"
  roomy: "18px"
components:
  view-selected:
    backgroundColor: "{colors.blue}"
    textColor: "white"
    rounded: "{rounded.plate}"
    padding: "0 19px"
    height: "35px"
  view-unselected:
    backgroundColor: "{colors.control}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: "0 19px"
    height: "35px"
  quiet-button:
    backgroundColor: "{colors.control}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    typography: "{typography.label}"
    padding: "6px 13px"
  search-field:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: "6px 10px"
    height: "36px"
  navigation:
    backgroundColor: "{colors.navigation}"
    textColor: "{colors.ink}"
    height: "54px"
  benchmark-tabs:
    textColor: "{colors.ink}"
    padding: "0 13px"
    height: "50px"
  model-choice:
    textColor: "{colors.ink}"
    height: "32px"
  plate:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: "19px 18px 20px"
  result-table:
    textColor: "{colors.ink}"
    padding: "3px 16px"
---

# Design System: AI Benchmarks

## Overview

**Creative North Star: "Scientific research plate"**

The system feels professional, premium and precise. Cool flat paper supports navy typography, fine rules and a near-white reading field. Quality comes from alignment, clear hierarchy and inspectable evidence. There is no physical texture in this world.

Geist keeps interface labels, prose and data in one voice. Compact controls and dense tables coexist with an open chart field. Source conditions, missing data and exact values remain readable parts of the interface. The surface-specific composition and its approved mock belong in [the benchmark explorer brief](.impeccable/surfaces/index-html.md).

**Key Characteristics:**

- Cool flat paper and near-white figure plates.
- Navy ink, blue interaction states and labelled model colors.
- Compact Geist hierarchy with tabular table numbers.
- Thin rules, small corners and native controls.
- First-exposure chart drawing with reduced-motion support.

Recorded from `src/styles.css`, `src/App.tsx` and `src/BenchmarkChart.tsx`, with final desktop and mobile captures in `.impeccable/review/`. Frontmatter values are the normative extracted tokens; they do not imply matching CSS custom-property declarations exist for every entry. The five existing CSS variables are ink, secondary, blue, rule and paper. The sidecar's synthesized tonal ramps are panel visualization metadata, not additional shipping palette tokens.

## Colors

Cool low-chroma surfaces recede behind deep navy text and a clear blue interaction accent.

### Primary

- **Control blue** (`blue`): selected views, active navigation and tabs, links, focus outlines and native checkbox accents. It also identifies the Sonnet series.

### Secondary

- **Model series colors** (`series-*`): stable identity across chart strokes, markers, legends and table labels. Orange and green accompany blue in the initial figure; the remaining colors identify additional selectable models and systems.

### Neutral

- **Deep navy ink** (`ink`): headings, primary body text and result values.
- **Secondary slate** (`secondary`): source metadata, explanatory prose, ticks, labels and dates.
- **Cool paper ground** (`ground`): continuous page background.
- **Near-white plate** (`paper`): figures, ledgers and content sections.
- **Cool navigation and panel** (`navigation`, `panel`): quiet adjacent reading surfaces.
- **Fine rule and chart strokes** (`rule`, `chart-grid`, `chart-axis`): tables, boundaries, guides and axes.
- **Quiet controls and fields** (`control`, `control-border`, `field`, `field-border`): lightly differentiated native form surfaces.
- **Table heading wash** (`table-heading`): column-heading row.
- **Warm cost caution** (`cost-warning`): labelled limitations in reported cost scope; a local semantic treatment rather than another brand accent.

### Named Rules

**The Labelled Color Rule.** Model color always accompanies a readable name or an inspectable result; color alone does not identify evidence.

## Typography

**Display Font:** Geist (sans-serif fallback).
**Body Font:** Geist (sans-serif fallback).

**Character:** One self-hosted variable sans family carries the full interface. Compact bold headings and quieter regular prose establish hierarchy without a second display face. The official font file and provenance are under `public/fonts/`.

### Hierarchy

- **Display:** the frontmatter display role is used for the page headline. It becomes (34px / 40px) below the mobile breakpoint and (32px) at the smallest breakpoint.
- **Headline:** the figure heading uses the headline role on desktop, (25px) below the medium breakpoint, and (23px / 30px) at the smallest breakpoint.
- **Title:** repeated section headings use the title role. Mobile section headings use (22px / 28px); model/evidence headings use (24px / 31px) on wide screens.
- **Subheading:** the subheading role introduces methodology topics; table subsection headings use the same size and weight with (24px) leading.
- **Body:** the body role describes long-form methodology. Other (15px) explanatory text uses (22–23px) leading; mobile methodology is (14px / 23px). Introductory support text is (20px / 28px), becoming (18px / 24px) on mobile.
- **Label / annotation:** compact labels, notices and source dates use the smaller roles. Chart tick and axis text use (14px); minor axis notes use (11px).

**The Numeric Alignment Rule.** Tables use tabular numerals so score and cost columns stay visually comparable.

## Layout

The page and navigation are centered within a (1440px) maximum width. Wide page gutters total (94px), with navigation gutters totaling (120px). At (1100px) and below both total (48px); at (760px) and below they total (32px).

Repeated plates are separated by the band spacing token. Internal spacing favors tight label gaps, small state groups, and regular-to-roomy content padding. This is an observed rhythm, not a universal multiple-only grid: the build also uses component-specific geometry.

The benchmark explorer uses an open main column and a (310px) model/evidence column; the latter becomes (280px) below (1100px). Below (760px), it stacks in reading order: tabs, figure, model controls, evidence. Navigation wraps to a second link row, figure controls wrap, tables scroll horizontally, and content stays at readable font sizes.

Model controls use two columns on mobile, becoming one column below (430px). Filter controls wrap into two columns below (760px) and single columns below (430px). Explanatory prose is generally constrained to (75ch); secondary notes reach (95ch).

Chart geometry responds to its measured container width rather than scaling desktop text. Its SVG height is (432px), becoming (340px) when the chart width is below (600px). The mobile stylesheet uses the same smaller figure height. Long score-only result lists scroll within the figure. Wide-screen model panels scroll within their fixed height; mobile panels expand with their content.

## Elevation & Depth

The shipped interface has no box shadows. Near-white plates, pale adjacent surfaces, thin boundaries and open spacing establish depth. Hover treatments change color or brightness; they do not lift the component. Focus uses a blue (2px) outline with a (3px) offset, while chart focus uses a navy stroke.

**The Flat Plate Rule.** Use tonal separation and fine rules for hierarchy; retain the flat material of the research plate.

## Shapes

Repeated plates, fields and view controls use the small plate radius. Chart identity marks and legend dots are circular. Tables remain rectilinear with collapsed thin borders. Native checkboxes and select affordances retain recognizable platform shapes. Straight chart segments and thin strokes carry data; there are no decorative cutouts or textured surfaces.

## Components

### Buttons

Compact state controls match the figure's geometry. Selected view controls use blue with white text; unselected controls use a pale wash and a thin control border. They use the frontmatter view geometry, reduced horizontal padding below the medium breakpoint, and (33px) height on mobile. Hover dims brightness to (.95).

Quiet actions use the quiet-button token with a (34px) minimum height and a thin control border. Hover uses a slightly stronger cool wash. Disabled controls have subdued slate text, a quieter fill and a default cursor. Native buttons retain global keyboard focus outlines.

### Cards / Containers

Figure plates, ledgers and content sections share the near-white plate and small radius. They have no shadow. Figure padding is more compact than prose section padding; mobile content plates use (16px 14px 18px). The evidence area separates itself with a fine upper rule.

### Inputs / Fields

Search and filter controls are native inputs and selects with a pale field, thin field border and small radius. Wide-screen fields use the search-field geometry; mobile fields are (38px) high. Source and axis-scale selects remain transparent compact inline controls. All retain the global visible focus outline; checkbox accents use blue.

### Navigation

A pale full-width band holds a compact bold brand, plain text section links and an external source link. The current section is blue with a thin lower rule. Links underline on hover. Mobile places section links on their own row. External-link affordances are authored inline SVG.

### Benchmark tabs

A horizontally scrollable tab band uses text labels and a blue (2px) sliding selection rule. Selection also increases text weight to (650). Tab hover adds a cool wash. Keyboard navigation and selected states are semantic; the small-screen band keeps horizontal scrolling.

The rule moves with (220ms) duration and `cubic-bezier(.16,1,.3,1)`. Reduced motion disables transitions.

### Model choices

Native checkboxes, circular series dots and readable model names form compact rows. Unavailable models retain a visible missing-result label and disabled checkbox. Historical systems can include a second explanatory line. The (18px) desktop checkbox becomes (17px) on mobile; model rows adapt with the panel layout.

### Scientific figure and result ledger

SVG curves use straight (2px) strokes and circular (4.2px) markers with white separation. Pointer hover and keyboard focus enlarge markers to (6px) with a navy (2px) stroke. The text readout and result details share inspection state. Confidence intervals remain thin and subdued. Axis breaks are visibly labelled when a score range is zoomed; score-only bars begin at zero when cost is not reported.

On first benchmark/source exposure, lines draw over (700ms) with the same easing as tabs and a (120ms) series stagger. Markers fade over (300ms), beginning at (490ms) plus the series stagger and (40ms) per point. Revisits retain visibility. Reduced motion disables animation and smooth scrolling.

Result tables use collapsed fine borders, a pale heading row, left-aligned text and tabular numbers. Compact result rows are (30px) high; standard result rows are (31px). Longer catalog rows expand for wrapping source notes. Model-color dots accompany text labels and row inspection buttons. Missing cost remains written out.

## Do's and Don'ts

### Do:

- **Do** retain cool flat surfaces, navy reading text and thin table/grid rules.
- **Do** pair model colors with readable labels and inspection states.
- **Do** reuse Geist and tabular numerals in data tables.
- **Do** wrap controls and scroll wide tables while preserving readable mobile text.
- **Do** keep visible keyboard focus, native input affordances and reduced-motion behavior.

### Don't:

- **Don't** introduce physical texture, lifted cards or hard offset shadows into this flat scientific world.
- **Don't** use color alone to communicate model identity or missing evidence.
- **Don't** connect unlike sources or conditions into a single visual data series.
- **Don't** scale the entire desktop figure down to fit a mobile viewport.

Not canonized: capture overlays are review tooling, and generated mock labels or illustrative figures are not reusable interface rules. No craft-floor defects were promoted into this system.
