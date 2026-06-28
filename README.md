# Fabricated Part Reuse Prototype

This is a first-version prototype for finding duplicate and near-duplicate fabricated parts before a real EPDM/ERP dataset is available.

The app uses synthetic data today, but the structure is intentionally shaped around the expected EPDM/ERP export fields:

- part number
- description
- part family
- material
- thickness
- bounding box
- length
- weight
- hole pattern signature
- preview image
- release state
- ERP active/obsolete state
- where-used count
- usage volume

## Run

Open `index.html` directly in a browser, or run:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Test

Run the DXF comparison regression suite:

```bash
node tests/dxf-comparison.test.js
```

The suite uses synthetic DXF parts with known outcomes. It covers origin shifts, entity order, polyline-vs-line exports, rotation, mirroring, holes, hole-size variants, hole-location variants, rounded/arc edges, arc-vs-segmented-line exports, ellipse entities, dimensional tolerance, scaled gusset families, same-size square plates, unsupported entities, and inch/mm unit normalization.

## What This Proves

- Engineers can search for existing fabricated parts before creating/copying a new one.
- CI/admin users can review likely exact duplicates and standardization opportunities.
- DXF folders can be compared client-side to find exact flat profile matches where DXFs exist.
- DXF folders can also surface near-profile candidates, such as the same gusset shape at 2 x 2 and 2.25 x 2.25.
- The matching logic is transparent and rule-based so it can be tuned with real engineering feedback.
- The synthetic dataset can be replaced with an EPDM/ERP export mapper next week.

## DXF Comparison

The `DXF Comparison` tab accepts a dropped folder or selected folder of `.dxf` files.

The first version parses common cut-profile entities:

- `LINE`
- `LWPOLYLINE`
- `CIRCLE`
- `ARC`

It ignores non-profile information such as text, dimensions, layer names, entity order, file origin, 90-degree rotations, and mirroring. Matching groups should be treated as "same flat profile" evidence, not automatic interchangeability across material, thickness, bend state, or manufacturing notes.

The near-match pass normalizes profiles by scale so similar shapes at different sizes can be reviewed as standardization candidates. These are intentionally lower-confidence than exact DXF matches.

The hole-variant pass groups files with the same outer profile but different hole size, location, count, or pattern. These are intentionally advisory: they indicate likely design variants, not interchangeable parts.

Known limitations before production DXF testing:

- `ELLIPSE` is parsed by tessellating to line segments for comparison.
- `SPLINE`, `INSERT`, block expansion, and hatches are not fully parsed yet; they lower confidence or appear as ignored entities.
- Arc-to-many-lines equivalence is supported for clean segmented approximations, but unusual segment spacing may still need tuning.
- Layer intent is reported only indirectly today; production use should add configurable cut-layer filtering.

## Next Data Mapping Step

When the real export is available, map its columns into the `parts` shape in `app.js`, then replace the synthetic records with imported records.
