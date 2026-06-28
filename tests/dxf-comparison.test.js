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

function rectangle(width, height) {
  return dxf(lwPolyline([
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
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
    scaleSignature: buildDxfScaleSignature(geometry.primitives),
    features: buildDxfFeatureSignatures(geometry.primitives),
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const tests = [
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
