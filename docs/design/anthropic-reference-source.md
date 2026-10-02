# Anthropic benchmark chart: shipped source inspection

Inspected 2026-10-02. Reference: [Claude Sonnet 5.5](https://www.anthropic.com/claude-sonnet-5-5).

Evidence is HTTP-delivered HTML, CSS and JavaScript. No browser was used. These are source declarations and code behavior, **not `getComputedStyle` measurements**. Actual rendered sizes, cascading overrides, color-mix conversion, font loading and motion timing still need a browser check.

## Source assets

- [Font declarations](https://www.anthropic.com/_next/static/chunks/2gepcixj9k_19.css)
- [Global tokens](https://www.anthropic.com/_next/static/chunks/2pnrpp88lh_gg.css)
- [Chart, ViewSwitcher and OverflowTabs styles](https://www.anthropic.com/_next/static/chunks/1czqrpqf9krjf.css)
- [Chart and tab implementation](https://www.anthropic.com/_next/static/chunks/0zgp5us6zzclv.js)

Asset hashes can change on a later site deployment. Component class stems are `chart-module-scss-module__3ia3wq__`, `ViewSwitcher-module-scss-module__kN30kq__` and `OverflowTabs-module-scss-module__L6ovVW__`.

## Frame, typography and palette

| Source property | Declared value |
| --- | --- |
| Media max width | 880px |
| Reading-column max width | 640px |
| Panel | 1px ink border; paper background; 24px padding |
| Small panel, viewport ≤567px | 16px padding |
| Title | Anthropic Sans; 17px; 600; 140% leading |
| Subtitle | 15px; 140% leading; muted |
| Tabs | 15px; 600; 155% leading; 16px gap; no border or background |
| Tab-to-panel gap | 16px |
| Caption-to-legend gap | 24px; 12px at ≤567px |
| Legend-to-plot gap | 32px; 12px at ≤567px |
| Legend | 15px; 13px at ≤567px; 14px swatches; labels weight 600 |
| Footnote | 14px; 140% leading; 16px top margin; centered |
| SVG ticks | 14px; 11px at ≤567px |
| SVG axis labels | 15px; 12px at ≤567px |
| SVG point labels | 12px; 10px at ≤567px |
| SVG series | 3px strokes; 1px marker outlines; straight segments |

Light palette source tokens: ink `#141413`, paper `#faf9f5`, muted `#5e5d59`, inactive tabs `#87867f`, grid `#d1cfc5`, Sonnet 5.5 `#6a9bcc`, Opus 5.5 `#eb6834`, Sonnet 5 `#bcd1ca`, GPT-5.6 Sol `#d1cfc5`, GPT-6 Sol `#73726c`. Muted series strokes mix 10% ink into their fill using OKLab; this inspection does not claim an sRGB result for those mixes.

## Tab behavior and animation

The four benchmark panels remain mounted. Clicking a tab updates the active index and `hidden` attributes. There is no path morph or panel crossfade in this implementation.

The stage observes active panel height. Shrinkage transitions over 300ms; growth snaps immediately because `animateGrowth` defaults to false. During the height transition the stage clips overflow; a 450ms timeout clears its animating state as a fallback. The easing token resolves to `cubic-bezier(.165,.84,.44,1)`.

Chart exposure uses an intersection threshold of 0.25 with `triggerOnce: true`. Before exposure, the figure carries `data-armed`. Removing that attribute draws the series and reveals markers. Revisiting an already-exposed panel does not replay its drawing.

Relevant compact declarations:

```css
/* Normalized SVG path, with pathLength="1" */
stroke-dasharray: 1;
stroke-dashoffset: 0;
/* Armed state */
stroke-dashoffset: 1px;
```

Line draw duration is 700ms. Each series starts 120ms after the preceding series. Markers and point labels fade over 300ms, starting at series delay + point index ×40ms +490ms. `prefers-reduced-motion: reduce` disables chart and stage transitions; the JavaScript also bypasses arming.

## Plot structure and responsive behavior

Each panel contains a figure, bordered panel, caption, interactive legend and SVG; the explanatory footnote sits outside the border. The SVG contains axes/grid groups, normalized paths, circle-marker groups, point labels, separate focus targets and a tooltip group. Reverse drawing order puts the first series visually on top. Legend clicks isolate/toggle series; empty selection means all series visible.

The server HTML starts with a 960×538 SVG. A ResizeObserver replaces width with the plot's actual client width. Height is rounded width ×0.56; for plot widths below 500px, height becomes width ×0.98. This 500px **plot-width** condition is separate from the 567px CSS **viewport** breakpoint. Marker radius is 7px normally and 5px below that plot-width threshold. X values support logarithmic scales; truncated positive Y domains show an explicit axis break and a separate zero tick.

Tabs use ARIA tablist/tab/tabpanel relationships and roving tabindex, with Left/Right/Home/End keyboard navigation. Overflow is measured from actual labels after fonts load and on resize. Hidden tabs move into a 36×36px “More views” button/menu, while the current tab stays visible. This overflow behavior is based on available width, not a fixed media-query breakpoint.

## Pending live evidence

Record actual desktop/mobile chart dimensions, computed font metrics, converted color mixes, tab overflow and first/repeated tab animations once the user selects a browser. Keep those rendered measurements separate from this source inspection.
