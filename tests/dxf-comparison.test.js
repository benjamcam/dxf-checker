const fs = require("fs");

const appSource = fs.readFileSync("app.js", "utf8");
const coreSource = appSource.slice(0, appSource.indexOf('\ndocument.querySelector("#query"'));
eval(coreSource);

function dxf(entities, header = "") {
  return `0
SECTION
2
HEADER
${header}0
ENDSEC
0
SECTION
2
ENTITIES
${entities}0
ENDSEC
0
EOF`;
}

function insunits(code) {
  return `9
$INSUNITS
70
${code}
`;
}

function lwPolyline(points, closed = true) {
  const pointText = points.map(([x, y]) => `10
${x}
20
${y}
`).join("");
  return `0
LWPOLYLINE
70
${closed ? 1 : 0}
${pointText}`;
}

function line(x1, y1, x2, y2) {
  return `0
LINE
10
${x1}
20
${y1}
11
${x2}
21
${y2}
`;
}

function circle(x, y, radius) {
  return `0
CIRCLE
10
${x}
20
${y}
40
${radius}
`;
}

function arc(x, y, radius, start, end) {
  return `0
ARC
10
${x}
20
${y}
40
${radius}
50
${start}
51
${end}
`;
}

function ellipse(cx, cy, majorX, majorY, ratio, start = 0, end = Math.PI * 2) {
  return `0
ELLIPSE
10
${cx}
20
${cy}
11
${majorX}
21
${majorY}
40
${ratio}
41
${start}
42
${end}
`;
}

function splineStub() {
  return `0
SPLINE
8
CUT
`;
}

function rightTriangle(size, offsetX = 0, offsetY = 0) {
  return dxf(lwPolyline([
    [offsetX, offsetY],
    [offsetX + size, offsetY],
    [offsetX, offsetY + size],
  ]));
}

function rightTriangleLines(size, reverse = false) {
  const lines = [
    line(0, 0, size, 0),
    line(size, 0, 0, size),
    line(0, size, 0, 0),
  ];
  return dxf((reverse ? lines.reverse() : lines).join(""));
}

function square(size) {
  return dxf(lwPolyline([
    [0, 0],
    [size, 0],
    [size, size],
    [0, size],
  ]));
}

function disk(diameter) {
  const radius = diameter / 2;
  return dxf(circle(radius, radius, radius));
}

function rectangle(width, height) {
  return dxf(lwPolyline([
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ]));
}

function segmentedRectangle(width, height) {
  return dxf(lwPolyline([
    [0, 0],
    [width / 2, 0],
    [width, 0],
    [width, height / 2],
    [width, height],
    [width / 2, height],
    [0, height],
    [0, height / 2],
  ]));
}

function roundedRectangle(width, height, radius, offsetX = 0, offsetY = 0) {
  const left = offsetX;
  const right = offsetX + width;
  const bottom = offsetY;
  const top = offsetY + height;
  const r = radius;

  return dxf([
    line(left + r, bottom, right - r, bottom),
    arc(right - r, bottom + r, r, 270, 0),
    line(right, bottom + r, right, top - r),
    arc(right - r, top - r, r, 0, 90),
    line(right - r, top, left + r, top),
    arc(left + r, top - r, r, 90, 180),
    line(left, top - r, left, bottom + r),
    arc(left + r, bottom + r, r, 180, 270),
  ].join(""));
}

function roundedRectangleSegmented(width, height, radius, segmentDegrees = 15) {
  const points = [];
  const addLinePoints = (items) => items.forEach((point) => points.push(point));
  const addArcPoints = (cx, cy, start, end) => {
    for (let angle = start; angle <= end; angle += segmentDegrees) {
      const radians = (angle * Math.PI) / 180;
      points.push([cx + Math.cos(radians) * radius, cy + Math.sin(radians) * radius]);
    }
  };

  addLinePoints([[radius, 0], [width - radius, 0]]);
  addArcPoints(width - radius, radius, 270, 360);
  addLinePoints([[width, height - radius]]);
  addArcPoints(width - radius, height - radius, 0, 90);
  addLinePoints([[radius, height]]);
  addArcPoints(radius, height - radius, 90, 180);
  addLinePoints([[0, radius]]);
  addArcPoints(radius, radius, 180, 270);

  const cleaned = points.filter((point, index) => index === 0 || point[0] !== points[index - 1][0] || point[1] !== points[index - 1][1]);
  return dxf(lwPolyline(cleaned));
}

function roundedRectangleWithHole(width, height, radius, holeX, holeY, holeRadius) {
  return dxf(`${[
    line(radius, 0, width - radius, 0),
    arc(width - radius, radius, radius, 270, 0),
    line(width, radius, width, height - radius),
    arc(width - radius, height - radius, radius, 0, 90),
    line(width - radius, height, radius, height),
    arc(radius, height - radius, radius, 90, 180),
    line(0, height - radius, 0, radius),
    arc(radius, radius, radius, 180, 270),
  ].join("")}${circle(holeX, holeY, holeRadius)}`);
}

function triangleWithHole(size, x, y, radius) {
  return dxf(`${lwPolyline([
    [0, 0],
    [size, 0],
    [0, size],
  ])}${circle(x, y, radius)}`);
}

function triangleWithSpline(size) {
  return dxf(`${lwPolyline([
    [0, 0],
    [size, 0],
    [0, size],
  ])}${splineStub()}`);
}

function signature(text) {
  return buildDxfSignature(parseDxf(text).primitives);
}

function familySignature(text) {
  return buildDxfScaleSignature(parseDxf(text).primitives);
}

function makeFile(name, text) {
  const geometry = parseDxf(text);
  return {
    name,
    path: name,
    size: text.length,
    geometry,
    signature: buildDxfSignature(geometry.primitives),
    flatSignature: buildDxfFlatSignature(geometry.primitives),
    scaleSignature: buildDxfScaleSignature(geometry.primitives),
    features: buildDxfFeatureSignatures(geometry.primitives),
  };
}

function makeFileFromPath(path) {
  const text = fs.readFileSync(path, "utf8");
  const geometry = parseDxf(text);
  return {
    name: path.split("/").pop(),
    path,
    size: text.length,
    geometry,
    signature: buildDxfSignature(geometry.primitives),
    flatSignature: buildDxfFlatSignature(geometry.primitives),
    scaleSignature: buildDxfScaleSignature(geometry.primitives),
    features: buildDxfFeatureSignatures(geometry.primitives),
  };
}

function fakeDxfFile(name) {
  return { name, webkitRelativePath: name };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const tests = [
  {
    name: "latest 9-digit part revision is selected before DXF comparison",
    run() {
      const { files, skipped } = filterLatestDxfRevisions([
        fakeDxfFile("123456789.DXF"),
        fakeDxfFile("123456789B.DXF"),
        fakeDxfFile("123456789C.DXF"),
        fakeDxfFile("987654321C.DXF"),
        fakeDxfFile("987654321D.DXF"),
        fakeDxfFile("misc-profile.DXF"),
      ]);
      const names = files.map((file) => file.name);
      assert(names.includes("123456789C.DXF"), "expected C revision to be kept");
      assert(names.includes("987654321D.DXF"), "expected D revision to be kept");
      assert(names.includes("misc-profile.DXF"), "expected non-PN file to pass through");
      assert(!names.includes("123456789.DXF") && !names.includes("123456789B.DXF"), "older revisions were not filtered");
      assert(!names.includes("987654321C.DXF"), "C revision was not filtered when D exists");
      assert(skipped.length === 3, `expected 3 skipped revisions, found ${skipped.length}`);
    },
  },
  {
    name: "same part matches across origin shifts",
    run() {
      assert(signature(rightTriangle(2)) === signature(rightTriangle(2, 100, -40)), "origin-shifted triangle did not exact-match");
    },
  },
  {
    name: "same part matches across entity order",
    run() {
      assert(signature(rightTriangleLines(2)) === signature(rightTriangleLines(2, true)), "reordered line entities did not exact-match");
    },
  },
  {
    name: "polyline and separate lines match",
    run() {
      assert(signature(rightTriangle(2)) === signature(rightTriangleLines(2)), "polyline triangle and line triangle did not exact-match");
    },
  },
  {
    name: "same part matches when rotated by 90 degrees",
    run() {
      const rotated = dxf(lwPolyline([
        [0, 0],
        [0, 2],
        [-2, 0],
      ]));
      assert(signature(rightTriangle(2)) === signature(rotated), "rotated triangle did not exact-match");
    },
  },
  {
    name: "same part matches when mirrored",
    run() {
      const mirrored = dxf(lwPolyline([
        [0, 0],
        [-2, 0],
        [0, 2],
      ]));
      assert(signature(rightTriangle(2)) === signature(mirrored), "mirrored triangle did not exact-match");
    },
  },
  {
    name: "flat equivalent check groups mirrored rounded profiles",
    run() {
      const base = makeFile("rounded base", roundedRectangleWithHole(4, 2, 0.25, 1, 1, 0.25));
      const mirroredShifted = makeFile("rounded mirrored", roundedRectangleWithHole(4, 2, 0.25, 3, 1, 0.25));
      mirroredShifted.geometry.primitives = mirroredShifted.geometry.primitives.map((primitive) => transformPrimitive(primitive, 180, true));
      mirroredShifted.signature = buildDxfSignature(mirroredShifted.geometry.primitives);
      mirroredShifted.flatSignature = buildDxfFlatSignature(mirroredShifted.geometry.primitives);
      assert(areDxfFlatEquivalent(base, mirroredShifted), "flat-equivalent check did not match noisy mirrored profile");
      const groups = groupDxfFiles([base, mirroredShifted]);
      assert(groups.length === 1 && groups[0].files.length === 2, "flat-equivalent files were not grouped as exact");
    },
  },
  {
    name: "same hole matches exactly",
    run() {
      assert(signature(triangleWithHole(3, 0.75, 0.75, 0.25)) === signature(triangleWithHole(3, 0.75, 0.75, 0.25)), "identical hole pattern did not match");
    },
  },
  {
    name: "moved hole does not exact-match",
    run() {
      assert(signature(triangleWithHole(3, 0.75, 0.75, 0.25)) !== signature(triangleWithHole(3, 0.9, 0.75, 0.25)), "moved hole incorrectly exact-matched");
    },
  },
  {
    name: "resized hole does not exact-match",
    run() {
      assert(signature(triangleWithHole(3, 0.75, 0.75, 0.25)) !== signature(triangleWithHole(3, 0.75, 0.75, 0.3)), "resized hole incorrectly exact-matched");
    },
  },
  {
    name: "same outer profile with 1/16 inch larger hole is surfaced as hole size variant",
    run() {
      const files = [
        makeFile("3x3 gusset 1/4 hole", triangleWithHole(3, 0.75, 0.75, 0.25)),
        makeFile("3x3 gusset 5/16 hole", triangleWithHole(3, 0.75, 0.75, 0.3125)),
      ];
      const variants = findDxfHoleVariants(files);
      assert(variants.length === 1, `expected 1 hole variant group, found ${variants.length}`);
      assert(variants[0].type === "Hole size variant", `expected hole size variant, found ${variants[0].type}`);
    },
  },
  {
    name: "same outer profile with moved hole is surfaced as hole location variant",
    run() {
      const files = [
        makeFile("3x3 gusset centered hole", triangleWithHole(3, 0.75, 0.75, 0.25)),
        makeFile("3x3 gusset moved hole", triangleWithHole(3, 0.9, 0.75, 0.25)),
      ];
      const variants = findDxfHoleVariants(files);
      assert(variants.length === 1, `expected 1 hole variant group, found ${variants.length}`);
      assert(variants[0].type === "Hole location variant", `expected hole location variant, found ${variants[0].type}`);
    },
  },
  {
    name: "local sample pair is grouped before hole-variant review when present",
    run() {
      const leftPath = "DXF Test Folder 2/100200037A.dxf";
      const rightPath = "DXF Test Folder 2/100200038A.dxf";
      if (!fs.existsSync(leftPath) || !fs.existsSync(rightPath)) return;
      const files = [makeFileFromPath(leftPath), makeFileFromPath(rightPath)];
      const groups = groupDxfFiles(files);
      const variants = findDxfHoleVariants(files);
      assert(groups.length === 1 && groups[0].files.length === 2, "sample pair was not grouped as flat-equivalent exact geometry");
      assert(variants.length === 0, "sample pair was incorrectly surfaced as a hole variant");
    },
  },
  {
    name: "rounded edge profiles exact-match across origin shifts",
    run() {
      assert(signature(roundedRectangle(3, 2, 0.25)) === signature(roundedRectangle(3, 2, 0.25, 25, -15)), "origin-shifted rounded rectangle did not exact-match");
    },
  },
  {
    name: "changed round radius does not exact-match",
    run() {
      assert(signature(roundedRectangle(3, 2, 0.25)) !== signature(roundedRectangle(3, 2, 0.375)), "changed corner radius incorrectly exact-matched");
    },
  },
  {
    name: "rounded edge profile with same hole exact-matches",
    run() {
      assert(signature(roundedRectangleWithHole(3, 2, 0.25, 1.5, 1, 0.2)) === signature(roundedRectangleWithHole(3, 2, 0.25, 1.5, 1, 0.2)), "rounded rectangle with same hole did not exact-match");
    },
  },
  {
    name: "rounded edge profile with moved hole does not exact-match",
    run() {
      assert(signature(roundedRectangleWithHole(3, 2, 0.25, 1.5, 1, 0.2)) !== signature(roundedRectangleWithHole(3, 2, 0.25, 1.75, 1, 0.2)), "rounded rectangle with moved hole incorrectly exact-matched");
    },
  },
  {
    name: "arc profile matches segmented-line approximation",
    run() {
      assert(signature(roundedRectangle(3, 2, 0.25)) === signature(roundedRectangleSegmented(3, 2, 0.25)), "true arcs did not match segmented approximation");
    },
  },
  {
    name: "ellipse entity is parsed and matches itself across origin shifts",
    run() {
      const base = dxf(ellipse(1.5, 1, 1, 0, 0.5));
      const shifted = dxf(ellipse(11.5, -4, 1, 0, 0.5));
      assert(signature(base) === signature(shifted), "ellipse did not exact-match across origin shift");
    },
  },
  {
    name: "changed ellipse ratio does not exact-match",
    run() {
      assert(signature(dxf(ellipse(1.5, 1, 1, 0, 0.5))) !== signature(dxf(ellipse(1.5, 1, 1, 0, 0.6))), "changed ellipse ratio incorrectly exact-matched");
    },
  },
  {
    name: "small numeric noise matches",
    run() {
      assert(signature(rightTriangle(2)) === signature(rightTriangle(2.0000001)), "tiny numeric noise did not match");
    },
  },
  {
    name: "larger dimensional difference does not exact-match",
    run() {
      assert(signature(rightTriangle(2)) !== signature(rightTriangle(2.01)), "meaningful size difference incorrectly exact-matched");
    },
  },
  {
    name: "scaled gussets share a family signature",
    run() {
      assert(familySignature(rightTriangle(2)) === familySignature(rightTriangle(3)), "scaled gussets did not share family signature");
    },
  },
  {
    name: "1.13 x 1.13 gusset and 1 x 1 gusset are surfaced as near profile match",
    run() {
      const files = [
        makeFile("1x1 gusset", rightTriangle(1)),
        makeFile("1.13x1.13 gusset", rightTriangle(1.13)),
      ];
      const nearMatches = findDxfNearMatches(files);
      assert(nearMatches.length === 1, `expected 1 near-match group, found ${nearMatches.length}`);
      assert(nearMatches[0].files.length === 2, "expected both gussets in near-match group");
    },
  },
  {
    name: "built-in sample set surfaces 2-to-3 gusset ladder",
    run() {
      const sampleFiles = makeSampleDxfFiles().map((file) => {
        const text = file.text();
        const geometry = parseDxf(typeof text === "string" ? text : "");
        return {
          name: file.name,
          path: file.name,
          size: file.size,
          geometry,
          signature: buildDxfSignature(geometry.primitives),
          flatSignature: buildDxfFlatSignature(geometry.primitives),
          scaleSignature: buildDxfScaleSignature(geometry.primitives),
          features: buildDxfFeatureSignatures(geometry.primitives),
        };
      });
      const ladderFiles = sampleFiles.filter((file) => file.name.startsWith("ladder-gusset-"));
      const nearMatches = findDxfNearMatches(sampleFiles);
      const ladderGroup = nearMatches.find((group) => ladderFiles.every((file) => group.files.includes(file)));
      assert(ladderFiles.length === 9, `expected 9 ladder files, found ${ladderFiles.length}`);
      assert(Boolean(ladderGroup), "ladder files were not surfaced in a near-profile match group");
    },
  },
  {
    name: "unique files exclude exact near and hole-variant matches",
    run() {
      const files = [
        makeFile("2x2 gusset A", rightTriangle(2)),
        makeFile("2x2 gusset B", rightTriangle(2)),
        makeFile("3x3 gusset", rightTriangle(3)),
        makeFile("3x3 gusset 1/4 hole", triangleWithHole(3, 0.75, 0.75, 0.25)),
        makeFile("3x3 gusset 5/16 hole", triangleWithHole(3, 0.75, 0.75, 0.3125)),
        makeFile("unique rectangle", rectangle(4, 2)),
      ];
      const exact = groupDxfFiles(files);
      const near = findDxfNearMatches(files);
      const holes = findDxfHoleVariants(files);
      const unique = findDxfUniqueFiles(files, exact, near, holes);
      assert(unique.length === 1, `expected 1 unique file, found ${unique.length}`);
      assert(unique[0].name === "unique rectangle", `expected unique rectangle, found ${unique[0].name}`);
    },
  },
  {
    name: "same-size square is not closer than scaled gusset",
    run() {
      const target = makeFile("2x2 gusset", rightTriangle(2));
      const squarePlate = makeFile("2x2 square", square(2));
      const largerGusset = makeFile("3x3 gusset", rightTriangle(3));
      assert(largerGusset.scaleSignature === target.scaleSignature, "larger gusset was not in same family");
      assert(squarePlate.scaleSignature !== target.scaleSignature, "square plate incorrectly shared gusset family");
    },
  },
  {
    name: "near-match groups keep square plate out",
    run() {
      const files = [
        makeFile("2x2 gusset", rightTriangle(2)),
        makeFile("2.25x2.25 gusset", rightTriangle(2.25)),
        makeFile("3x3 gusset", rightTriangle(3)),
        makeFile("2x2 square", square(2)),
        makeFile("2x3 rectangle", rectangle(3, 2)),
      ];
      const nearMatches = findDxfNearMatches(files);
      assert(nearMatches.length === 1, `expected 1 near-match group, found ${nearMatches.length}`);
      const names = nearMatches[0].files.map((file) => file.name);
      assert(names.includes("2x2 gusset") && names.includes("3x3 gusset"), "gussets missing from near-match group");
      assert(!names.includes("2x2 square"), "square plate incorrectly included in gusset near-match group");
    },
  },
  {
    name: "same-size same-hole segmented outlines are promoted to exact matches",
    run() {
      const files = [
        makeFile("4x2 rectangle", rectangle(4, 2)),
        makeFile("4x2 segmented rectangle", segmentedRectangle(4, 2)),
        makeFile("unrelated narrow plate", rectangle(1, 8)),
      ];
      const exact = groupDxfFiles(files);
      const near = findDxfNearMatches(files);
      const holes = findDxfHoleVariants(files);
      const variants = findDxfReviewCandidates(files, exact, near, holes);
      const exactGroup = exact.find((group) => group.files.length === 2);
      assert(Boolean(exactGroup), "segmented equivalent was not promoted to exact match");
      assert(variants.length === 0, `expected no recommendation after exact grouping, found ${variants.length}`);
    },
  },
  {
    name: "dimension variants are surfaced as suggested variants",
    run() {
      const files = [
        makeFile("6x12 plate", rectangle(6, 12)),
        makeFile("6x13 plate", rectangle(6, 13)),
        makeFile("unrelated long plate", rectangle(2, 20)),
      ];
      const exact = groupDxfFiles(files);
      const near = findDxfNearMatches(files);
      const holes = findDxfHoleVariants(files);
      const review = findDxfReviewCandidates(files, exact, near, holes);
      const reviewNames = review.flatMap((group) => group.files.map((file) => file.name));
      assert(review.length === 1, `expected 1 suggested variant group, found ${review.length}`);
      assert(reviewNames.includes("6x12 plate") && reviewNames.includes("6x13 plate"), "similar plates missing from suggested variant group");
      assert(!reviewNames.includes("unrelated long plate"), "unrelated plate incorrectly included in suggested variant group");
    },
  },
  {
    name: "suggested variants use partial hole pattern evidence",
    run() {
      const fiveHolePlate = (width, firstChangedRadius = 0.25, secondChangedRadius = 0.25) => dxf(`${lwPolyline([[0, 0], [width, 0], [width, 4], [0, 4]])}${circle(0.75, 1, 0.25)}${circle(1.5, 1, 0.25)}${circle(2.25, 1, 0.25)}${circle(3, 1, firstChangedRadius)}${circle(3.75, 1, secondChangedRadius)}`);
      const files = [
        makeFile("4x4 five-hole plate", fiveHolePlate(4)),
        makeFile("4.13x4 five-hole plate with two larger holes", fiveHolePlate(4.125, 0.28125, 0.28125)),
        makeFile("unrelated narrow plate", rectangle(1, 8)),
      ];
      const exact = groupDxfFiles(files);
      const near = findDxfNearMatches(files);
      const holes = findDxfHoleVariants(files);
      const variants = findDxfReviewCandidates(files, exact, near, holes);
      assert(variants.length === 1, `expected 1 suggested variant, found ${variants.length}`);
      assert(variants[0].type === "Profile dimension + hole pattern variant", `expected combined variant type, found ${variants[0].type}`);
      assert(variants[0].comparisons[0].holePattern.differences.join(" ").includes("diameter"), "partial hole-size evidence was not included");
    },
  },
  {
    name: "suggested variants require compatible outline families",
    run() {
      const files = [
        makeFile("2in disk", disk(2)),
        makeFile("2x2 square", square(2)),
        makeFile("2x2 gusset", rightTriangle(2)),
      ];
      const exact = groupDxfFiles(files);
      const near = findDxfNearMatches(files);
      const holes = findDxfHoleVariants(files);
      const review = findDxfReviewCandidates(files, exact, near, holes);
      assert(review.length === 0, `expected no cross-family suggested variants, found ${review.length}`);
    },
  },
  {
    name: "suggested variants do not chain into indirect groups",
    run() {
      const files = [
        makeFile("6x10 plate", rectangle(6, 10)),
        makeFile("6x10.7 plate", rectangle(6, 10.7)),
        makeFile("6x11.45 plate", rectangle(6, 11.45)),
      ];
      const exact = groupDxfFiles(files);
      const near = findDxfNearMatches(files);
      const holes = findDxfHoleVariants(files);
      const review = findDxfReviewCandidates(files, exact, near, holes);
      assert(review.length >= 1, "expected direct suggested variant pairs");
      assert(review.every((group) => group.files.length === 2), "suggested variants were incorrectly merged into multi-file chain groups");
    },
  },
  {
    name: "circle-only DXFs are treated as round outer profiles",
    run() {
      const file = makeFile("2in disk", disk(2));
      assert(file.features.outline.family === "round", `expected round outline, found ${file.features.outline.family}`);
      assert(file.features.holeCount === 0, `expected disk to have 0 holes, found ${file.features.holeCount}`);
    },
  },
  {
    name: "suggested variants are not listed as no-match parts",
    run() {
      const files = [
        makeFile("6x12 plate", rectangle(6, 12)),
        makeFile("6x13 plate", rectangle(6, 13)),
        makeFile("unrelated long plate", rectangle(2, 20)),
      ];
      const exact = groupDxfFiles(files);
      const near = findDxfNearMatches(files);
      const holes = findDxfHoleVariants(files);
      const review = findDxfReviewCandidates(files, exact, near, holes);
      const unique = findDxfUniqueFiles(files, exact, near, holes, review);
      const uniqueNames = unique.map((file) => file.name);
      assert(unique.length === 1, `expected 1 truly unique file, found ${unique.length}`);
      assert(uniqueNames.includes("unrelated long plate"), "unrelated plate missing from unique list");
      assert(!uniqueNames.includes("6x12 plate") && !uniqueNames.includes("6x13 plate"), "suggested variants incorrectly listed as no-match");
    },
  },
  {
    name: "closest lookup returns ranked qualifying candidates",
    run() {
      const files = [
        makeFile("target 6x12 plate", rectangle(6, 12)),
        makeFile("exact copy", rectangle(6, 12)),
        makeFile("close 6x13 plate", rectangle(6, 13)),
        makeFile("close 6x14 plate", rectangle(6, 14)),
        makeFile("same shape larger", rectangle(9, 18)),
        makeFile("square plate", square(6)),
        makeFile("long narrow plate", rectangle(2, 20)),
      ];
      const target = findDxfFileByQuery(files, "target");
      const closest = findDxfClosestFiles(target, files, 5);
      assert(closest.length === 3, `expected 3 qualifying files, found ${closest.length}`);
      assert(closest[0].file.name === "exact copy", `expected exact copy first, found ${closest[0].file.name}`);
      assert(closest[0].score === 100, `expected exact copy score 100, found ${closest[0].score}`);
      assert(!closest.some((match) => match.file.name === "close 6x14 plate"), "dimension-only loose variant was incorrectly included");
      assert(!closest.some((match) => match.file.name === "long narrow plate"), "low-similarity part was incorrectly included");
      assert(closest.every((match, index) => index === 0 || closest[index - 1].score >= match.score), "closest matches were not score-sorted");
    },
  },
  {
    name: "closest lookup uses same suggested-variant family criteria",
    run() {
      const files = [
        makeFile("2in disk", disk(2)),
        makeFile("2x2 square", square(2)),
        makeFile("2x2 gusset", rightTriangle(2)),
      ];
      const target = findDxfFileByQuery(files, "disk");
      const closest = findDxfClosestFiles(target, files, 5);
      assert(closest.length === 0, `expected no cross-family closest matches, found ${closest.length}`);
    },
  },
  {
    name: "closest lookup uses hole size and spacing details",
    run() {
      const twoHolePlate = (secondHoleX, secondHoleRadius = 0.25) => dxf(`${lwPolyline([[0, 0], [4, 0], [4, 4], [0, 4]])}${circle(1, 1, 0.25)}${circle(secondHoleX, 1, secondHoleRadius)}`);
      const files = [
        makeFile("target 4x4 two-hole", twoHolePlate(3)),
        makeFile("same holes", twoHolePlate(3)),
        makeFile("moved hole", twoHolePlate(3.25)),
        makeFile("resized hole", twoHolePlate(3, 0.3125)),
      ];
      const target = findDxfFileByQuery(files, "target");
      const closest = findDxfClosestFiles(target, files, 3);
      const moved = closest.find((match) => match.file.name === "moved hole");
      const resized = closest.find((match) => match.file.name === "resized hole");
      assert(closest[0].file.name === "same holes", `expected same holes first, found ${closest[0].file.name}`);
      assert(moved.reasons.join(" ").includes("center") || moved.reasons.join(" ").includes("spacing"), "moved hole result did not explain location/spacing difference");
      assert(resized.reasons.join(" ").includes("diameter"), "resized hole result did not explain diameter difference");
    },
  },
  {
    name: "unsupported spline is recorded as ignored risk",
    run() {
      const parsed = parseDxf(triangleWithSpline(2));
      assert(parsed.ignored.SPLINE === 1, "spline was not recorded as ignored");
    },
  },
  {
    name: "inch and millimeter DXFs of same physical part match",
    run() {
      const inch = dxf(lwPolyline([
        [0, 0],
        [2, 0],
        [0, 2],
      ]), insunits(1));
      const mm = dxf(lwPolyline([
        [0, 0],
        [50.8, 0],
        [0, 50.8],
      ]), insunits(4));
      assert(signature(inch) === signature(mm), "inch and equivalent mm triangle did not exact-match");
    },
  },
  {
    name: "metric units normalize bounds to inches",
    run() {
      const parsed = parseDxf(dxf(lwPolyline([
        [0, 0],
        [25.4, 0],
        [0, 25.4],
      ]), insunits(4)));
      assert(dxfRound(parsed.bounds.maxX - parsed.bounds.minX) === "1", "25.4 mm width did not normalize to 1 inch");
    },
  },
  {
    name: "risky ignored entities lower exact group confidence",
    run() {
      const files = [
        makeFile("clean gusset", rightTriangle(2)),
        makeFile("spline-risk gusset", triangleWithSpline(2)),
      ];
      const groups = groupDxfFiles(files);
      assert(groups.length === 1, "expected one exact profile group");
      assert(groups[0].confidence < 100, "risky ignored entity did not lower confidence");
    },
  },
];

let passed = 0;
const failures = [];

tests.forEach((test) => {
  try {
    test.run();
    passed += 1;
    console.log(`PASS ${test.name}`);
  } catch (error) {
    failures.push({ name: test.name, message: error.message });
    console.log(`FAIL ${test.name}: ${error.message}`);
  }
});

console.log("");
console.log(`${passed}/${tests.length} tests passed`);

if (failures.length) {
  process.exitCode = 1;
}
