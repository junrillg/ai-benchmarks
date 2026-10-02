# Anthropic chart reference specification

Measured 2026-10-02 in the approved Chrome Personal browser at **1920 × 873 CSS pixels**. Source: [Claude Sonnet 5.5](https://www.anthropic.com/claude-sonnet-5-5). Raw read-only `getComputedStyle` output is preserved in [anthropic-reference-measurements.json](anthropic-reference-measurements.json); implementation declarations and motion are in [anthropic-reference-source.md](anthropic-reference-source.md).

## Composition

The chart module has four benchmark tabs, one visible figure, a caption, four model legend controls, one dominant SVG plot and a short explanatory footnote. No chart-module testimonials or invented statistic bands are needed. The target app will replace the surrounding release narrative with the requested model and benchmark selection workflow.

At the measured width the figure is 880px wide, with a 615.796875px bordered chart panel and a roughly 67px footnote. The plot is 830 × 465px. The panel uses 24px padding, a square 1px border and no shadow. The graph takes most of the module's area; copy stays outside its plotting field. The four tab labels are respectively 172.796875, 213.3125, 211.625 and 224.03125px wide, all 23.25px high, separated by 16px.

## Computed visual values

| Role | Value |
| --- | --- |
| Body/panel ground | `#faf9f5` (computed `rgb(250, 249, 245)`) |
| Ink/border | `#141413` (computed `rgb(20, 20, 19)`) |
| Secondary explanatory text | `#5e5d59` |
| Inactive tabs | `#87867f` |
| Tabs | Anthropic Sans, 15px/23.25px, weight 600, normal tracking |
| Legend controls | Anthropic Sans, 15px/21px, weight 400, normal tracking; labels use nested bold text |
| Figure footnote | Anthropic Sans, 14px/19.6px, weight 400, -0.16px tracking |
| Chart title source role | 17px/23.8px, weight 600 |
| Chart subtitle source role | 15px/21px, weight 400 |
| Point lines | 3px straight segments, circles, no smoothed curve interpolation |

The role-level JSON records the caption, axes and ticks without rounding; the title/subtitle declarations above also appear in the source specification.

## Motion observed and traced

Changing FrontierCode to CursorBench selected the new ARIA tab and replaced the visible panel immediately. A capture during first exposure showed the lines drawing before the markers appeared. The delivered implementation specifies a 700ms line draw, 120ms series stagger, 300ms marker/label fade after 490ms plus 40ms per point. Already-exposed tabs do not replay. Stage shrinkage animates for 300ms with `cubic-bezier(.165,.84,.44,1)`; growth snaps. Reduced-motion users receive the finished chart without drawing transitions.

## Measurement limits and pending checks

The browser viewport override returned success but `innerWidth` remained 1920, so no measurement is represented as being at 1440px or a mobile width. The override was reset. A separate, correctly verified mobile viewport remains required before app completion.

The read-only browser evaluation surface exposes computed styles but does not expose `document.createElement`, so canvas conversion of OKLab mixes was unavailable. No hand-written conversion was substituted. Mixed series colors remain source declarations; the app should use explicit sRGB tokens and verify contrast. Inactive source tab gray is unsuitable for small normal-weight body text on white; the app will use a darker secondary text token.

Acceptance is the approved app mockup's own composition with the reference's readable plotting format and meaningful motion. Source screenshot evidence is `.impeccable/reference/anthropic-desktop.png`.
