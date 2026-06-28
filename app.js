const parts = [
  {
    id: "P-10482",
    description: "GUSSET 5 X 5 X 1/4 A36",
    rawFamily: "GUSSET",
    material: "A36 Steel",
    thickness: 0.25,
    boundingBox: { x: 5, y: 5, z: 0.25 },
    length: null,
    weight: 1.82,
    holes: "none",
    releaseState: "Released",
    whereUsed: 14,
    annualVolume: 320,
    erpStatus: "Active",
    shape: "gusset",
  },
  {
    id: "P-21944",
    description: "GST 5X5 1/4 PL",
    rawFamily: "GST",
    material: "ASTM A36",
    thickness: 0.25,
    boundingBox: { x: 5, y: 5, z: 0.25 },
    length: null,
    weight: 1.81,
    holes: "none",
    releaseState: "Released",
    whereUsed: 3,
    annualVolume: 48,
    erpStatus: "Active",
    shape: "gusset",
  },
  {
    id: "P-15820",
    description: "GSST 5 X 5 X 3/16",
    rawFamily: "GSST",
    material: "A36",
    thickness: 0.1875,
    boundingBox: { x: 5, y: 5, z: 0.1875 },
    length: null,
    weight: 1.36,
    holes: "none",
    releaseState: "Released",
    whereUsed: 6,
    annualVolume: 92,
    erpStatus: "Active",
    shape: "gusset",
  },
  {
    id: "P-16202",
    description: "GUSSET 5 X 5 X 3/8",
    rawFamily: "GUSSET",
    material: "Mild Steel",
    thickness: 0.375,
    boundingBox: { x: 5, y: 5, z: 0.375 },
    length: null,
    weight: 2.73,
    holes: "none",
    releaseState: "Released",
    whereUsed: 2,
    annualVolume: 16,
    erpStatus: "Active",
    shape: "gusset",
  },
  {
    id: "P-30117",
    description: "GUSSET 2.5 X 2.5 X 1/4",
    rawFamily: "GUSSET",
    material: "A36 Steel",
    thickness: 0.25,
    boundingBox: { x: 2.5, y: 2.5, z: 0.25 },
    length: null,
    weight: 0.46,
    holes: "none",
    releaseState: "Released",
    whereUsed: 18,
    annualVolume: 410,
    erpStatus: "Active",
    shape: "gusset",
  },
  {
    id: "P-40891",
    description: "BRACKET 4 X 6 X 1/4 2-HOLE",
    rawFamily: "BRKT",
    material: "A36",
    thickness: 0.25,
    boundingBox: { x: 4, y: 6, z: 0.25 },
    length: null,
    weight: 2.12,
    holes: "2x 0.531 at 1.00,5.00",
    releaseState: "Released",
    whereUsed: 11,
    annualVolume: 128,
    erpStatus: "Active",
    shape: "bracket",
  },
  {
    id: "P-41222",
    description: "BRKT 4X6X.25 TWO HOLE",
    rawFamily: "BRKT",
    material: "A36 Steel",
    thickness: 0.25,
    boundingBox: { x: 4, y: 6, z: 0.25 },
    length: null,
    weight: 2.11,
    holes: "2x 0.531 at 1.00,5.00",
    releaseState: "Released",
    whereUsed: 1,
    annualVolume: 8,
    erpStatus: "Active",
    shape: "bracket",
  },
  {
    id: "P-51009",
    description: "TUBE 2 X 2 X .188 X 36",
    rawFamily: "TUBE",
    material: "A500",
    thickness: 0.188,
    boundingBox: { x: 2, y: 2, z: 36 },
    length: 36,
    weight: 8.24,
    holes: "unknown",
    releaseState: "Released",
    whereUsed: 9,
    annualVolume: 96,
    erpStatus: "Active",
    shape: "tube",
    profile: "2x2 square tube",
  },
  {
    id: "P-53312",
    description: "TB 2X2X3/16 36 LG",
    rawFamily: "TB",
    material: "A500 Steel",
    thickness: 0.1875,
    boundingBox: { x: 2, y: 2, z: 36 },
    length: 36,
    weight: 8.18,
    holes: "unknown",
    releaseState: "Released",
    whereUsed: 4,
    annualVolume: 44,
    erpStatus: "Active",
    shape: "tube",
    profile: "2x2 square tube",
  },
  {
    id: "P-62015",
    description: "PLATE 2 X 8 X 1/4 4-HOLE",
    rawFamily: "PL",
    material: "A36",
    thickness: 0.25,
    boundingBox: { x: 2, y: 8, z: 0.25 },
    length: null,
    weight: 1.37,
    holes: "4x 0.375 linear",
    releaseState: "Released",
    whereUsed: 7,
    annualVolume: 74,
    erpStatus: "Active",
    shape: "plate",
  },
];

const familySynonyms = {
  gusset: ["GUSSET", "GST", "GSST"],
  bracket: ["BRACKET", "BRKT", "BKT"],
  tube: ["TUBE", "TB", "TUB"],
  plate: ["PLATE", "PL"],
};

const materialSynonyms = {
  "A36 Steel": ["A36 STEEL", "ASTM A36", "A36", "MILD STEEL"],
  "A500 Steel": ["A500", "A500 STEEL"],
};

const decisions = [];
const dxfState = {
  files: [],
  groups: [],
  nearMatches: [],
  holeVariants: [],
  uniqueFiles: [],
  errors: [],
};
const state = {
  view: "engineer",
  query: "",
  family: "",
  material: "",
  thickness: "",
};

const normalizedParts = parts
  .filter((part) => part.erpStatus !== "Obsolete")
  .map((part) => ({
    ...part,
    family: normalizeFamily(part.rawFamily, part.description),
    normalizedMaterial: normalizeMaterial(part.material),
    thicknessKey: canonicalThickness(part.thickness),
    geometryKey: geometryKey(part),
  }));

function normalizeFamily(rawFamily, description) {
  const source = `${rawFamily} ${description}`.toUpperCase();
  for (const [family, tokens] of Object.entries(familySynonyms)) {
    if (tokens.some((token) => source.includes(token))) return family;
  }
  return "unknown";
}

function normalizeMaterial(material) {
  const source = material.toUpperCase();
  for (const [normalized, tokens] of Object.entries(materialSynonyms)) {
    if (tokens.some((token) => source === token || source.includes(token))) return normalized;
  }
  return material;
}

function rounded(value) {
  if (value === null || value === undefined) return "";
  return Number(value).toFixed(3).replace(/\.?0+$/, "");
}

function canonicalThickness(value) {
  const standards = [0.1875, 0.25, 0.375];
  const match = standards.find((standard) => Math.abs(standard - value) < 0.01);
  return match || value;
}

function geometryKey(part) {
  const box = part.boundingBox;
  const depth = part.shape === "tube" ? part.length || box.z : "";
  return [
    rounded(Math.min(box.x, box.y)),
    rounded(Math.max(box.x, box.y)),
    rounded(depth),
    part.holes.toLowerCase().replace(/\s+/g, " "),
  ].join("|");
}

function formatThickness(value) {
  const fractions = {
    0.1875: "3/16 in",
    0.188: "3/16 in",
    0.25: "1/4 in",
    0.375: "3/8 in",
  };
  return fractions[value] || `${rounded(value)} in`;
}

function formatBox(part) {
  const box = part.boundingBox;
  return `${rounded(box.x)} x ${rounded(box.y)} x ${rounded(box.z)}`;
}

function getMatches(part) {
  return normalizedParts
    .filter((candidate) => candidate.id !== part.id)
    .map((candidate) => ({
      candidate,
      score: scorePair(part, candidate),
    }))
    .filter((match) => match.score.value >= 55)
    .sort((a, b) => b.score.value - a.score.value);
}

function scorePair(a, b) {
  let value = 0;
  const reasons = [];

  if (a.family === b.family) {
    value += 20;
    reasons.push("same family");
  }
  if (a.normalizedMaterial === b.normalizedMaterial) {
    value += 15;
    reasons.push("same material");
  }
  if (Math.abs(a.thicknessKey - b.thicknessKey) < 0.01) {
    value += 20;
    reasons.push("same thickness");
  }
  if (a.geometryKey === b.geometryKey) {
    if (a.holes === "unknown" || b.holes === "unknown") {
      value += 22;
      reasons.push("same profile/size, missing hole or cut detail");
    } else {
      value += 35;
      reasons.push("same geometry and hole signature");
    }
  } else if (sameFootprint(a, b)) {
    value += 20;
    reasons.push("same footprint");
  }
  if (relativeDelta(a.weight, b.weight) < 0.03) {
    value += 10;
    reasons.push("similar weight");
  }

  if (a.shape === "tube" && b.shape === "tube" && (a.holes === "unknown" || b.holes === "unknown")) {
    value = Math.min(value, 82);
  }

  const type =
    a.shape === "tube" && b.shape === "tube" && (a.holes === "unknown" || b.holes === "unknown")
      ? "Tube/profile candidate"
      : value >= 90
        ? "Exact duplicate"
        : value >= 70
          ? "Likely duplicate"
          : "Standardization candidate";
  return { value, type, reasons };
}

function sameFootprint(a, b) {
  const ax = [a.boundingBox.x, a.boundingBox.y].sort((x, y) => x - y);
  const bx = [b.boundingBox.x, b.boundingBox.y].sort((x, y) => x - y);
  const sameLength = a.shape === "tube" || b.shape === "tube" ? Math.abs((a.length || 0) - (b.length || 0)) < 0.05 : true;
  return Math.abs(ax[0] - bx[0]) < 0.05 && Math.abs(ax[1] - bx[1]) < 0.05 && sameLength && a.holes === b.holes;
}

function relativeDelta(a, b) {
  return Math.abs(a - b) / Math.max(a, b);
}

function buildClusters() {
  const seen = new Set();
  const clusters = [];

  normalizedParts.forEach((part) => {
    if (seen.has(part.id)) return;
    const matches = getMatches(part).filter((match) => match.score.value >= 70);
    if (!matches.length) return;

    const clusterParts = [part, ...matches.map((match) => match.candidate)];
    clusterParts.forEach((clusterPart) => seen.add(clusterPart.id));
    const topScore = matches[0].score;
    const totalImpact = clusterParts.reduce((sum, clusterPart) => sum + clusterPart.whereUsed + clusterPart.annualVolume / 25, 0);
    clusters.push({
      type: topScore.type,
      title: clusterTitle(clusterParts),
      reason: topScore.reasons.join(", "),
      confidence: topScore.value,
      impact: totalImpact,
      parts: clusterParts.sort((a, b) => b.annualVolume - a.annualVolume),
    });
  });

  return clusters.sort((a, b) => b.confidence + b.impact - (a.confidence + a.impact));
}

function clusterTitle(clusterParts) {
  const first = clusterParts[0];
  const thicknesses = new Set(clusterParts.map((part) => formatThickness(part.thickness)));
  if (thicknesses.size > 1) {
    return `${capitalize(first.family)} family across ${thicknesses.size} thicknesses`;
  }
  return `${capitalize(first.family)} ${formatBox(first)}`;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function filteredParts() {
  const query = state.query.trim().toLowerCase();
  return normalizedParts
    .filter((part) => {
      const haystack = [
        part.id,
        part.description,
        part.family,
        part.rawFamily,
        part.normalizedMaterial,
        formatBox(part),
        formatThickness(part.thickness),
      ]
        .join(" ")
        .toLowerCase();
      const compactHaystack = haystack.replace(/\s+/g, "");
      const compactQuery = query.replace(/\s+/g, "");

      return (
        (!query || haystack.includes(query) || compactHaystack.includes(compactQuery) || querySynonymHit(query, part)) &&
        (!state.family || part.family === state.family) &&
        (!state.material || part.normalizedMaterial === state.material) &&
        (!state.thickness || String(part.thicknessKey) === state.thickness)
      );
    })
    .sort((a, b) => b.annualVolume - a.annualVolume);
}

function querySynonymHit(query, part) {
  const tokens = familySynonyms[part.family] || [];
  return tokens.some((token) => token.toLowerCase().includes(query) || query.includes(token.toLowerCase()));
}

function render() {
  renderStats();
  renderFilters();
  renderParts();
  renderClusters();
}

function renderStats() {
  const clusters = buildClusters();
  const exact = clusters.filter((cluster) => cluster.confidence >= 90).length;
  const stats = [
    ["Parts", normalizedParts.length],
    ["Review Clusters", clusters.length],
    ["Exact Groups", exact],
    ["Decisions", decisions.length],
  ];
  document.querySelector("#headerStats").innerHTML = stats
    .map(([label, value]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`)
    .join("");
}

function renderFilters() {
  setOptions("#familyFilter", unique(normalizedParts.map((part) => part.family)), state.family);
  setOptions("#materialFilter", unique(normalizedParts.map((part) => part.normalizedMaterial)), state.material);
  setOptions("#thicknessFilter", unique(normalizedParts.map((part) => part.thicknessKey)), state.thickness, formatThickness);
}

function setOptions(selector, values, selected, formatter = (value) => capitalize(String(value))) {
  const element = document.querySelector(selector);
  const existing = Array.from(element.options).slice(1).map((option) => option.value).join("|");
  const next = values.join("|");
  if (existing === next) return;

  element.innerHTML = `<option value="">All</option>${values
    .map((value) => `<option value="${value}">${formatter(value)}</option>`)
    .join("")}`;
  element.value = selected;
}

function unique(values) {
  return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
}

function renderParts() {
  const container = document.querySelector("#partResults");
  const results = filteredParts();
  if (!results.length) {
    container.innerHTML = `<div class="empty">No matching parts found.</div>`;
    return;
  }

  container.innerHTML = "";
  results.forEach((part) => {
    const template = document.querySelector("#partCardTemplate").content.cloneNode(true);
    const matches = getMatches(part);
    const topMatch = matches[0];
    template.querySelector(".preview").innerHTML = previewSvg(part);
    template.querySelector("h3").textContent = part.id;
    template.querySelector(".description").textContent = part.description;
    const badge = template.querySelector(".badge");
    badge.textContent = topMatch ? `${topMatch.score.type}: ${topMatch.score.value}%` : "No close match";
    badge.classList.toggle("warn", topMatch && topMatch.score.value < 90);
    template.querySelector(".metrics").innerHTML = metricsHtml(part);
    template.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => recordDecision(button.textContent, part));
    });
    container.appendChild(template);
  });
}

function renderClusters() {
  const container = document.querySelector("#clusterResults");
  const clusters = buildClusters();
  if (!clusters.length) {
    container.innerHTML = `<div class="empty">No review clusters found.</div>`;
    return;
  }

  container.innerHTML = "";
  clusters.forEach((cluster) => {
    const template = document.querySelector("#clusterTemplate").content.cloneNode(true);
    template.querySelector(".cluster-type").textContent = cluster.type;
    template.querySelector("h3").textContent = cluster.title;
    template.querySelector(".cluster-reason").textContent = `Matched on ${cluster.reason}.`;
    const confidence = template.querySelector(".confidence");
    confidence.textContent = `${cluster.confidence}% confidence`;
    confidence.classList.toggle("warn", cluster.confidence < 90);
    template.querySelector(".cluster-parts").innerHTML = cluster.parts.map(miniPartHtml).join("");
    template.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        decisions.push({ action: button.textContent, ids: cluster.parts.map((part) => part.id), at: new Date().toISOString() });
        renderStats();
      });
    });
    container.appendChild(template);
  });
}

function metricsHtml(part) {
  const metrics = [
    ["Family", capitalize(part.family)],
    ["Material", part.normalizedMaterial],
    ["Thickness", formatThickness(part.thickness)],
    ["Size", formatBox(part)],
    ["Where-used", part.whereUsed],
    ["Volume", part.annualVolume],
  ];
  return metrics.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("");
}

function miniPartHtml(part) {
  return `
    <div class="mini-part">
      <div class="preview">${previewSvg(part)}</div>
      <div>
        <strong>${part.id}</strong>
        <span>${part.normalizedMaterial}, ${formatThickness(part.thickness)}</span>
        <span>${part.whereUsed} where-used, ${part.annualVolume}/yr</span>
      </div>
    </div>
  `;
}

function recordDecision(action, part) {
  decisions.push({ action, id: part.id, at: new Date().toISOString() });
  renderStats();
}

function previewSvg(part) {
  if (part.shape === "tube") {
    return `
      <svg viewBox="0 0 140 100" role="img" aria-label="${part.description}">
        <rect x="25" y="35" width="88" height="28" rx="2" fill="#dfe8e5" stroke="#287767" stroke-width="3"/>
        <rect x="37" y="42" width="64" height="14" rx="1" fill="#f7faf9" stroke="#287767" stroke-width="2"/>
        <line x1="25" y1="35" x2="38" y2="24" stroke="#287767" stroke-width="2"/>
        <line x1="113" y1="35" x2="125" y2="24" stroke="#287767" stroke-width="2"/>
        <line x1="38" y1="24" x2="125" y2="24" stroke="#287767" stroke-width="2"/>
      </svg>
    `;
  }

  if (part.shape === "gusset") {
    return `
      <svg viewBox="0 0 140 100" role="img" aria-label="${part.description}">
        <path d="M26 76 L108 76 L26 18 Z" fill="#e8eceb" stroke="#287767" stroke-width="4" stroke-linejoin="round"/>
        <text x="30" y="90" fill="#60706a" font-size="11">${formatThickness(part.thickness)}</text>
      </svg>
    `;
  }

  const hasFour = part.holes.includes("4x");
  return `
    <svg viewBox="0 0 140 100" role="img" aria-label="${part.description}">
      <rect x="24" y="22" width="92" height="56" rx="2" fill="#e8eceb" stroke="#287767" stroke-width="4"/>
      <circle cx="48" cy="50" r="7" fill="#f7faf9" stroke="#287767" stroke-width="3"/>
      <circle cx="92" cy="50" r="7" fill="#f7faf9" stroke="#287767" stroke-width="3"/>
      ${hasFour ? '<circle cx="48" cy="34" r="5" fill="#f7faf9" stroke="#287767" stroke-width="2"/><circle cx="92" cy="66" r="5" fill="#f7faf9" stroke="#287767" stroke-width="2"/>' : ""}
    </svg>
  `;
}

function dxfText(entities, header = "") {
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

function dxfPolyline(points, closed = true) {
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

function dxfLine(x1, y1, x2, y2) {
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

function dxfArc(x, y, radius, start, end) {
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

function dxfCircle(x, y, radius) {
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

function dxfRightTriangle(size) {
  return dxfText(dxfPolyline([
    [0, 0],
    [size, 0],
    [0, size],
  ]));
}

function dxfSquare(size) {
  return dxfText(dxfPolyline([
    [0, 0],
    [size, 0],
    [size, size],
    [0, size],
  ]));
}

function dxfRectangle(width, height) {
  return dxfText(dxfPolyline([
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ]));
}

function dxfRoundedRectangle(width, height, radius) {
  return dxfText([
    dxfLine(radius, 0, width - radius, 0),
    dxfArc(width - radius, radius, radius, 270, 0),
    dxfLine(width, radius, width, height - radius),
    dxfArc(width - radius, height - radius, radius, 0, 90),
    dxfLine(width - radius, height, radius, height),
    dxfArc(radius, height - radius, radius, 90, 180),
    dxfLine(0, height - radius, 0, radius),
    dxfArc(radius, radius, radius, 180, 270),
  ].join(""));
}

function dxfTriangleWithHole(size, x, y, radius) {
  return dxfText(`${dxfPolyline([
    [0, 0],
    [size, 0],
    [0, size],
  ])}${dxfCircle(x, y, radius)}`);
}

function makeSampleDxfFiles() {
  const files = [
    ["01-target-2x2-right-triangle-gusset.dxf", dxfRightTriangle(2)],
    ["02-same-shape-3x3-right-triangle-gusset.dxf", dxfRightTriangle(3)],
    ["03-same-size-2x2-square-plate.dxf", dxfSquare(2)],
    ["04-close-size-2p25x2p25-right-triangle-gusset.dxf", dxfRightTriangle(2.25)],
    ["05-different-shape-2x3-rectangle-plate.dxf", dxfRectangle(3, 2)],
    ["06-rounded-3x2-plate-r0p25.dxf", dxfRoundedRectangle(3, 2, 0.25)],
    ["07-rounded-3x2-plate-r0p375.dxf", dxfRoundedRectangle(3, 2, 0.375)],
    ["08-rounded-3x2-plate-r0p25-center-hole.dxf", `${dxfRoundedRectangle(3, 2, 0.25).replace("0\nENDSEC\n0\nEOF", "")}${dxfCircle(1.5, 1, 0.2)}0\nENDSEC\n0\nEOF`],
    ["09-rounded-3x2-plate-r0p25-moved-hole.dxf", `${dxfRoundedRectangle(3, 2, 0.25).replace("0\nENDSEC\n0\nEOF", "")}${dxfCircle(1.75, 1, 0.2)}0\nENDSEC\n0\nEOF`],
    ["10-gusset-3x3-hole-0p25.dxf", dxfTriangleWithHole(3, 0.75, 0.75, 0.25)],
    ["11-gusset-3x3-hole-0p3125.dxf", dxfTriangleWithHole(3, 0.75, 0.75, 0.3125)],
  ];

  for (let size = 2; size <= 3.0001; size += 0.125) {
    const label = size.toFixed(3).replace(".", "p").replace(/0+$/, "").replace(/p$/, "");
    files.push([`ladder-gusset-${label}x${label}.dxf`, dxfRightTriangle(Number(size.toFixed(3)))]);
  }

  return files.map(([name, text]) => ({
    name,
    size: text.length,
    text: () => text,
  }));
}

async function handleDxfFiles(fileList) {
  const files = [...fileList].filter((file) => file.name.toLowerCase().endsWith(".dxf"));
  dxfState.files = [];
  dxfState.groups = [];
  dxfState.nearMatches = [];
  dxfState.holeVariants = [];
  dxfState.uniqueFiles = [];
  dxfState.errors = [];
  renderDxfResults(true);

  const parsed = await Promise.all(
    files.map(async (file) => {
      try {
        const text = await file.text();
        const geometry = parseDxf(text);
        const signature = buildDxfSignature(geometry.primitives);
        const scaleSignature = buildDxfScaleSignature(geometry.primitives);
        const features = buildDxfFeatureSignatures(geometry.primitives);
        return {
          name: file.name,
          path: file.webkitRelativePath || file.relativePath || file.name,
          size: file.size,
          geometry,
          signature,
          scaleSignature,
          features,
        };
      } catch (error) {
        dxfState.errors.push(`${file.name}: ${error.message}`);
        return null;
      }
    }),
  );

  dxfState.files = parsed.filter(Boolean);
  dxfState.groups = groupDxfFiles(dxfState.files);
  dxfState.nearMatches = findDxfNearMatches(dxfState.files);
  dxfState.holeVariants = findDxfHoleVariants(dxfState.files);
  dxfState.uniqueFiles = findDxfUniqueFiles(dxfState.files, dxfState.groups, dxfState.nearMatches, dxfState.holeVariants);
  renderDxfResults(false);
}

function parseDxf(text) {
  const lines = text.replace(/\r/g, "").split("\n");
  const pairs = [];
  for (let index = 0; index < lines.length - 1; index += 2) {
    pairs.push({ code: lines[index].trim(), value: lines[index + 1].trim() });
  }

  const unitScale = dxfUnitScale(pairs);
  const entities = [];
  let current = null;
  pairs.forEach((pair) => {
    if (pair.code === "0") {
      if (current) entities.push(current);
      current = { type: pair.value.toUpperCase(), pairs: [] };
      return;
    }
    if (current) current.pairs.push(pair);
  });
  if (current) entities.push(current);

  const primitives = [];
  const ignored = {};
  entities.forEach((entity) => {
    if (entity.type === "LINE") primitives.push(parseDxfLine(entity));
    else if (entity.type === "CIRCLE") primitives.push(parseDxfCircle(entity));
    else if (entity.type === "ARC") primitives.push(parseDxfArc(entity));
    else if (entity.type === "ELLIPSE") primitives.push(...parseDxfEllipse(entity));
    else if (entity.type === "LWPOLYLINE") primitives.push(...parseDxfLwPolyline(entity));
    else ignored[entity.type] = (ignored[entity.type] || 0) + 1;
  });

  const validPrimitives = primitives.filter(Boolean);
  if (!validPrimitives.length) {
    throw new Error("No supported cut geometry found");
  }
  const scaledPrimitives = validPrimitives.map((primitive) => scalePrimitive(primitive, unitScale));

  return {
    primitives: scaledPrimitives,
    entityCount: scaledPrimitives.length,
    ignored,
    bounds: primitiveBounds(scaledPrimitives),
    unitScale,
  };
}

function dxfUnitScale(pairs) {
  const unitIndex = pairs.findIndex((pair) => pair.code === "9" && pair.value.toUpperCase() === "$INSUNITS");
  if (unitIndex === -1) return 1;
  const unitPair = pairs.slice(unitIndex + 1).find((pair) => pair.code === "70");
  if (!unitPair) return 1;

  const unitCode = Number(unitPair.value);
  const toInches = {
    1: 1,
    2: 12,
    4: 1 / 25.4,
    5: 1 / 2.54,
    6: 39.3700787402,
  };
  return toInches[unitCode] || 1;
}

function parseDxfLine(entity) {
  return {
    type: "line",
    a: { x: numberCode(entity, "10"), y: numberCode(entity, "20") },
    b: { x: numberCode(entity, "11"), y: numberCode(entity, "21") },
  };
}

function parseDxfCircle(entity) {
  return {
    type: "circle",
    center: { x: numberCode(entity, "10"), y: numberCode(entity, "20") },
    radius: numberCode(entity, "40"),
  };
}

function parseDxfArc(entity) {
  return {
    type: "arc",
    center: { x: numberCode(entity, "10"), y: numberCode(entity, "20") },
    radius: numberCode(entity, "40"),
    start: numberCode(entity, "50"),
    end: numberCode(entity, "51"),
  };
}

function parseDxfEllipse(entity) {
  const center = { x: numberCode(entity, "10"), y: numberCode(entity, "20") };
  const major = { x: numberCode(entity, "11"), y: numberCode(entity, "21") };
  const ratio = numberCode(entity, "40");
  const start = optionalNumberCode(entity, "41", 0);
  const end = optionalNumberCode(entity, "42", Math.PI * 2);
  const sweep = normalizedRadians(end - start);
  const steps = Math.max(16, Math.ceil((sweep / (Math.PI * 2)) * 96));
  const points = [];

  for (let index = 0; index <= steps; index += 1) {
    const parameter = start + (sweep * index) / steps;
    points.push(pointOnEllipse(center, major, ratio, parameter));
  }

  const lines = [];
  for (let index = 0; index < points.length - 1; index += 1) {
    lines.push({ type: "line", a: points[index], b: points[index + 1] });
  }
  return lines;
}

function parseDxfLwPolyline(entity) {
  const vertices = [];
  let pendingX = null;
  let closed = false;
  entity.pairs.forEach((pair) => {
    if (pair.code === "70") closed = (Number(pair.value) & 1) === 1;
    if (pair.code === "10") pendingX = Number(pair.value);
    if (pair.code === "20" && pendingX !== null) {
      vertices.push({ x: pendingX, y: Number(pair.value) });
      pendingX = null;
    }
  });

  const lines = [];
  for (let index = 0; index < vertices.length - 1; index += 1) {
    lines.push({ type: "line", a: vertices[index], b: vertices[index + 1] });
  }
  if (closed && vertices.length > 2) {
    lines.push({ type: "line", a: vertices[vertices.length - 1], b: vertices[0] });
  }
  return lines;
}

function numberCode(entity, code) {
  const pair = entity.pairs.find((candidate) => candidate.code === code);
  if (!pair || Number.isNaN(Number(pair.value))) {
    throw new Error(`${entity.type} missing numeric group code ${code}`);
  }
  return Number(pair.value);
}

function optionalNumberCode(entity, code, fallback) {
  const pair = entity.pairs.find((candidate) => candidate.code === code);
  if (!pair || Number.isNaN(Number(pair.value))) return fallback;
  return Number(pair.value);
}

function buildDxfSignature(primitives) {
  const signatures = transformVariants(primitives).map((variant) => {
    const bounds = primitiveBounds(variant);
    const normalized = variant.map((primitive) => offsetPrimitive(primitive, -bounds.minX, -bounds.minY));
    return tessellatedSignature(normalized);
  });
  return signatures.sort()[0];
}

function buildDxfScaleSignature(primitives) {
  const signatures = transformVariants(primitives).map((variant) => {
    const bounds = primitiveBounds(variant);
    const width = Math.max(bounds.maxX - bounds.minX, 0.0001);
    const height = Math.max(bounds.maxY - bounds.minY, 0.0001);
    const scale = Math.max(width, height);
    const normalized = variant.map((primitive) => offsetPrimitive(primitive, -bounds.minX, -bounds.minY)).map((primitive) => scalePrimitive(primitive, 1 / scale));
    return tessellatedSignature(normalized);
  });
  return signatures.sort()[0];
}

function buildDxfFeatureSignatures(primitives) {
  const variants = transformVariants(primitives).map((variant) => {
    const bounds = primitiveBounds(variant);
    const normalized = variant.map((primitive) => offsetPrimitive(primitive, -bounds.minX, -bounds.minY));
    const holes = normalized.filter((primitive) => primitive.type === "circle");
    const outer = normalized.filter((primitive) => primitive.type !== "circle");
    return {
      outerSignature: tessellatedSignature(outer),
      holeSignature: holes.map(primitiveSignature).sort().join(";"),
      holeCenterSignature: holes.map((hole) => pointSignature(hole.center)).sort().join(";"),
      holeRadiiSignature: holes.map((hole) => dxfRound(hole.radius)).sort().join(";"),
      holeCount: holes.length,
    };
  });

  return variants.sort((a, b) => {
    const left = `${a.outerSignature}|${a.holeSignature}`;
    const right = `${b.outerSignature}|${b.holeSignature}`;
    return left.localeCompare(right);
  })[0];
}

function transformVariants(primitives) {
  const variants = [];
  [false, true].forEach((mirror) => {
    [0, 90, 180, 270].forEach((rotation) => {
      variants.push(primitives.map((primitive) => transformPrimitive(primitive, rotation, mirror)));
    });
  });
  return variants;
}

function transformPrimitive(primitive, rotation, mirror) {
  if (primitive.type === "line") {
    return { type: "line", a: transformPoint(primitive.a, rotation, mirror), b: transformPoint(primitive.b, rotation, mirror) };
  }
  if (primitive.type === "circle") {
    return { type: "circle", center: transformPoint(primitive.center, rotation, mirror), radius: primitive.radius };
  }

  const startPoint = transformPoint(pointOnArc(primitive, primitive.start), rotation, mirror);
  const endPoint = transformPoint(pointOnArc(primitive, primitive.end), rotation, mirror);
  return {
    type: "arc",
    center: transformPoint(primitive.center, rotation, mirror),
    radius: primitive.radius,
    startPoint,
    endPoint,
  };
}

function transformPoint(point, rotation, mirror) {
  const source = mirror ? { x: -point.x, y: point.y } : point;
  if (rotation === 90) return { x: -source.y, y: source.x };
  if (rotation === 180) return { x: -source.x, y: -source.y };
  if (rotation === 270) return { x: source.y, y: -source.x };
  return { x: source.x, y: source.y };
}

function pointOnArc(primitive, angle) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: primitive.center.x + Math.cos(radians) * primitive.radius,
    y: primitive.center.y + Math.sin(radians) * primitive.radius,
  };
}

function normalizedRadians(value) {
  let normalized = value;
  while (normalized <= 0) normalized += Math.PI * 2;
  while (normalized > Math.PI * 2) normalized -= Math.PI * 2;
  return normalized;
}

function pointOnEllipse(center, major, ratio, parameter) {
  const minor = { x: -major.y * ratio, y: major.x * ratio };
  return {
    x: center.x + Math.cos(parameter) * major.x + Math.sin(parameter) * minor.x,
    y: center.y + Math.cos(parameter) * major.y + Math.sin(parameter) * minor.y,
  };
}

function offsetPrimitive(primitive, x, y) {
  if (primitive.type === "line") {
    return { type: "line", a: offsetPoint(primitive.a, x, y), b: offsetPoint(primitive.b, x, y) };
  }
  if (primitive.type === "circle") {
    return { type: "circle", center: offsetPoint(primitive.center, x, y), radius: primitive.radius };
  }
  return {
    type: "arc",
    center: offsetPoint(primitive.center, x, y),
    radius: primitive.radius,
    startPoint: offsetPoint(primitive.startPoint, x, y),
    endPoint: offsetPoint(primitive.endPoint, x, y),
  };
}

function offsetPoint(point, x, y) {
  return { x: point.x + x, y: point.y + y };
}

function scalePrimitive(primitive, scale) {
  if (primitive.type === "line") {
    return { type: "line", a: scalePoint(primitive.a, scale), b: scalePoint(primitive.b, scale) };
  }
  if (primitive.type === "circle") {
    return { type: "circle", center: scalePoint(primitive.center, scale), radius: primitive.radius * scale };
  }
  if (!primitive.startPoint || !primitive.endPoint) {
    return {
      type: "arc",
      center: scalePoint(primitive.center, scale),
      radius: primitive.radius * scale,
      start: primitive.start,
      end: primitive.end,
    };
  }
  return {
    type: "arc",
    center: scalePoint(primitive.center, scale),
    radius: primitive.radius * scale,
    startPoint: scalePoint(primitive.startPoint, scale),
    endPoint: scalePoint(primitive.endPoint, scale),
  };
}

function scalePoint(point, scale) {
  return { x: point.x * scale, y: point.y * scale };
}

function primitiveSignature(primitive) {
  if (primitive.type === "line") {
    const points = [pointSignature(primitive.a), pointSignature(primitive.b)].sort();
    return `L:${points.join(">")}`;
  }
  if (primitive.type === "circle") {
    return `C:${pointSignature(primitive.center)}:R${dxfRound(primitive.radius)}`;
  }
  const points = [pointSignature(primitive.startPoint), pointSignature(primitive.endPoint)].sort();
  return `A:${pointSignature(primitive.center)}:R${dxfRound(primitive.radius)}:${points.join(">")}`;
}

function tessellatedSignature(primitives) {
  return primitives.flatMap(tessellatedSegments).map(primitiveSignature).sort().join(";");
}

function tessellatedSegments(primitive) {
  if (primitive.type === "line") return sameSignaturePoint(primitive.a, primitive.b) ? [] : [primitive];
  if (primitive.type === "circle") {
    const points = [];
    const steps = 96;
    for (let index = 0; index <= steps; index += 1) {
      const angle = (Math.PI * 2 * index) / steps;
      points.push({
        x: primitive.center.x + Math.cos(angle) * primitive.radius,
        y: primitive.center.y + Math.sin(angle) * primitive.radius,
      });
    }
    return pointsToSegments(points);
  }

  const start = primitive.startPoint ? angleFromCenter(primitive.center, primitive.startPoint) : primitive.start;
  const end = primitive.endPoint ? angleFromCenter(primitive.center, primitive.endPoint) : primitive.end;
  const sweep = normalizedDegrees(end - start);
  const steps = Math.max(4, Math.ceil(sweep / 15));
  const points = [];
  for (let index = 0; index <= steps; index += 1) {
    points.push(pointOnArc(primitive, start + (sweep * index) / steps));
  }
  return pointsToSegments(points);
}

function pointsToSegments(points) {
  const segments = [];
  for (let index = 0; index < points.length - 1; index += 1) {
    if (!sameSignaturePoint(points[index], points[index + 1])) {
      segments.push({ type: "line", a: points[index], b: points[index + 1] });
    }
  }
  return segments;
}

function sameSignaturePoint(a, b) {
  return pointSignature(a) === pointSignature(b);
}

function angleFromCenter(center, point) {
  const angle = (Math.atan2(point.y - center.y, point.x - center.x) * 180) / Math.PI;
  return angle < 0 ? angle + 360 : angle;
}

function normalizedDegrees(value) {
  let normalized = value;
  while (normalized <= 0) normalized += 360;
  while (normalized > 360) normalized -= 360;
  return normalized;
}

function pointSignature(point) {
  return `${dxfRound(point.x)},${dxfRound(point.y)}`;
}

function dxfRound(value) {
  return Number(value).toFixed(4).replace(/\.?0+$/, "");
}

function primitiveBounds(primitives) {
  const points = primitives.flatMap(primitivePoints);
  return {
    minX: Math.min(...points.map((point) => point.x)),
    minY: Math.min(...points.map((point) => point.y)),
    maxX: Math.max(...points.map((point) => point.x)),
    maxY: Math.max(...points.map((point) => point.y)),
  };
}

function primitivePoints(primitive) {
  if (primitive.type === "line") return [primitive.a, primitive.b];
  if (primitive.type === "circle") {
    return [
      { x: primitive.center.x - primitive.radius, y: primitive.center.y - primitive.radius },
      { x: primitive.center.x + primitive.radius, y: primitive.center.y + primitive.radius },
    ];
  }

  const startPoint = primitive.startPoint || pointOnArc(primitive, primitive.start);
  const endPoint = primitive.endPoint || pointOnArc(primitive, primitive.end);
  return [
    { x: primitive.center.x - primitive.radius, y: primitive.center.y - primitive.radius },
    { x: primitive.center.x + primitive.radius, y: primitive.center.y + primitive.radius },
    startPoint,
    endPoint,
  ];
}

function groupDxfFiles(files) {
  const bySignature = new Map();
  files.forEach((file) => {
    if (!bySignature.has(file.signature)) bySignature.set(file.signature, []);
    bySignature.get(file.signature).push(file);
  });

  return [...bySignature.values()]
    .map((group) => ({
      files: group.sort((a, b) => a.path.localeCompare(b.path)),
      signature: group[0].signature,
      bounds: group[0].geometry.bounds,
      primitives: group[0].geometry.primitives,
      confidence: scoreDxfExactGroup(group),
    }))
    .sort((a, b) => b.files.length - a.files.length || a.files[0].path.localeCompare(b.files[0].path));
}

function scoreDxfExactGroup(files) {
  let confidence = 100;
  if (files.some((file) => riskyIgnoredEntities(file).length)) confidence -= 20;
  if (files.some((file) => ignoredEntityCount(file) > 0)) confidence -= 5;
  if (new Set(files.map((file) => file.geometry.unitScale)).size > 1) confidence -= 5;
  return Math.max(confidence, 50);
}

function findDxfNearMatches(files) {
  const byScaleSignature = new Map();
  files.forEach((file) => {
    if (!byScaleSignature.has(file.scaleSignature)) byScaleSignature.set(file.scaleSignature, []);
    byScaleSignature.get(file.scaleSignature).push(file);
  });

  return [...byScaleSignature.values()]
    .filter((group) => {
      const exactSignatures = new Set(group.map((file) => file.signature));
      const sizes = new Set(group.map((file) => dxfSizeKey(file.geometry.bounds)));
      return group.length > 1 && exactSignatures.size > 1 && sizes.size > 1;
    })
    .map((group) => ({
      files: group.sort((a, b) => profileSize(a) - profileSize(b)),
      scaleSignature: group[0].scaleSignature,
      confidence: scoreDxfNearMatch(group),
    }))
    .sort((a, b) => b.confidence - a.confidence || b.files.length - a.files.length);
}

function findDxfHoleVariants(files) {
  const byOuterProfile = new Map();
  files.forEach((file) => {
    if (!file.features?.outerSignature || file.features.holeCount === 0) return;
    if (!byOuterProfile.has(file.features.outerSignature)) byOuterProfile.set(file.features.outerSignature, []);
    byOuterProfile.get(file.features.outerSignature).push(file);
  });

  return [...byOuterProfile.values()]
    .filter((group) => {
      const exactSignatures = new Set(group.map((file) => file.signature));
      const holeSignatures = new Set(group.map((file) => file.features.holeSignature));
      return group.length > 1 && exactSignatures.size > 1 && holeSignatures.size > 1;
    })
    .map((group) => ({
      files: group.sort((a, b) => a.path.localeCompare(b.path)),
      type: classifyDxfHoleVariant(group),
      confidence: scoreDxfHoleVariant(group),
      outerSignature: group[0].features.outerSignature,
    }))
    .sort((a, b) => b.confidence - a.confidence || b.files.length - a.files.length);
}

function findDxfUniqueFiles(files, exactGroups, nearMatches, holeVariants) {
  const matched = new Set();
  exactGroups.filter((group) => group.files.length > 1).forEach((group) => group.files.forEach((file) => matched.add(file)));
  nearMatches.forEach((group) => group.files.forEach((file) => matched.add(file)));
  holeVariants.forEach((group) => group.files.forEach((file) => matched.add(file)));
  return files.filter((file) => !matched.has(file)).sort((a, b) => a.path.localeCompare(b.path));
}

function classifyDxfHoleVariant(files) {
  const counts = new Set(files.map((file) => file.features.holeCount));
  const centers = new Set(files.map((file) => file.features.holeCenterSignature));
  const radii = new Set(files.map((file) => file.features.holeRadiiSignature));

  if (counts.size > 1) return "Hole count variant";
  if (centers.size === 1 && radii.size > 1) return "Hole size variant";
  if (centers.size > 1 && radii.size === 1) return "Hole location variant";
  return "Hole pattern variant";
}

function scoreDxfHoleVariant(files) {
  let confidence = 84;
  if (files.some((file) => riskyIgnoredEntities(file).length)) confidence -= 18;
  if (new Set(files.map((file) => file.features.holeCount)).size > 1) confidence -= 8;
  return Math.max(confidence, 55);
}

function scoreDxfNearMatch(files) {
  let confidence = 88;
  const riskyIgnored = files.some((file) => riskyIgnoredEntities(file).length);
  const entityCounts = new Set(files.map((file) => file.geometry.entityCount));
  if (riskyIgnored) confidence -= 18;
  if (entityCounts.size > 1) confidence -= 10;
  return Math.max(confidence, 55);
}

function riskyIgnoredEntities(file) {
  return Object.keys(file.geometry.ignored).filter((type) => ["SPLINE", "ELLIPSE", "INSERT", "HATCH", "BLOCK"].includes(type));
}

function ignoredEntityCount(file) {
  return Object.values(file.geometry.ignored).reduce((sum, count) => sum + count, 0);
}

function dxfSizeKey(bounds) {
  return `${dxfRound(bounds.maxX - bounds.minX)}x${dxfRound(bounds.maxY - bounds.minY)}`;
}

function profileSize(file) {
  const bounds = file.geometry.bounds;
  return Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
}

function renderDxfResults(isLoading) {
  const summary = document.querySelector("#dxfSummary");
  const results = document.querySelector("#dxfResults");
  if (!summary || !results) return;

  const matchGroups = dxfState.groups.filter((group) => group.files.length > 1).length;
  summary.innerHTML = [
    ["DXFs", dxfState.files.length],
    ["Unique Parts", dxfState.uniqueFiles.length],
    ["Exact Matches", matchGroups],
    ["Near Matches", dxfState.nearMatches.length],
    ["Hole Variants", dxfState.holeVariants.length],
  ]
    .map(([label, value]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`)
    .join("");

  if (isLoading) {
    results.innerHTML = `<div class="empty">Reading DXFs...</div>`;
    return;
  }
  if (!dxfState.files.length) {
    const errorHtml = dxfState.errors.length ? `<p class="dxf-warning">${escapeHtml(dxfState.errors.join(" | "))}</p>` : "";
    results.innerHTML = `<div class="empty">No DXFs loaded yet.${errorHtml}</div>`;
    return;
  }

  const nearMatchHtml = dxfState.nearMatches.length
    ? `
      <section class="dxf-section-block">
        <div class="section-heading compact">
          <h2>Near Profile Matches</h2>
          <p>Same normalized profile shape at different sizes, such as 2 x 2 and 2.25 x 2.25 gussets.</p>
        </div>
        ${dxfState.nearMatches.map(dxfNearMatchHtml).join("")}
      </section>
    `
    : "";
  const holeVariantHtml = dxfState.holeVariants.length
    ? `
      <section class="dxf-section-block">
        <div class="section-heading compact">
          <h2>Hole Variants</h2>
          <p>Same outer profile with changed hole size, location, count, or pattern.</p>
        </div>
        ${dxfState.holeVariants.map(dxfHoleVariantHtml).join("")}
      </section>
    `
    : "";
  const exactHtml = `
    <section class="dxf-section-block">
      <div class="section-heading compact">
        <h2>Exact Profile Groups</h2>
        <p>Same normalized DXF profile signature.</p>
      </div>
      ${dxfState.groups.filter((group) => group.files.length > 1).map(dxfGroupHtml).join("") || '<div class="empty">No exact profile matches found.</div>'}
    </section>
  `;
  const uniqueHtml = `
    <section class="dxf-section-block">
      <div class="section-heading compact">
        <h2>Unique Parts</h2>
        <p>Files with no exact, near-profile, or hole-variant match in the loaded set.</p>
      </div>
      ${dxfUniqueFilesHtml(dxfState.uniqueFiles)}
    </section>
  `;
  results.innerHTML = holeVariantHtml + nearMatchHtml + exactHtml + uniqueHtml;
}

function dxfGroupHtml(group, index) {
  const isMatch = group.files.length > 1;
  const bounds = group.bounds;
  const size = `${dxfRound(bounds.maxX - bounds.minX)} x ${dxfRound(bounds.maxY - bounds.minY)}`;
  const fileList = group.files
    .map((file) => `<li><strong>${escapeHtml(file.path)}</strong><span>${formatBytes(file.size)}</span></li>`)
    .join("");
  const ignoredWarnings = dxfIgnoredWarnings(group.files);
  const warning = ignoredWarnings.length ? `<p class="dxf-warning">${escapeHtml(ignoredWarnings.join(" "))}</p>` : "";

  return `
    <article class="dxf-group">
      <div class="dxf-group-preview">${dxfPreviewSvg(group.primitives)}</div>
      <div>
        <div class="dxf-group-head">
          <div>
            <p class="cluster-type">${isMatch ? "Exact profile match" : "Unique profile"}</p>
            <h3>Profile Group ${index + 1}</h3>
          </div>
          <span class="confidence ${group.confidence < 95 ? "warn" : ""}">${group.confidence}% confidence</span>
        </div>
        <dl class="metrics">
          <div><dt>Profile Size</dt><dd>${size}</dd></div>
          <div><dt>Entities</dt><dd>${group.primitives.length}</dd></div>
          <div><dt>Files</dt><dd>${group.files.length}</dd></div>
          <div><dt>Signature</dt><dd>${shortSignature(group.signature)}</dd></div>
        </dl>
        <ul class="dxf-file-list">${fileList}</ul>
        ${warning}
      </div>
    </article>
  `;
}

function dxfIgnoredWarnings(files) {
  const risky = unique(files.flatMap(riskyIgnoredEntities));
  const ignored = unique(files.flatMap((file) => Object.keys(file.geometry.ignored)));
  const warnings = [];
  if (risky.length) warnings.push(`Risky unsupported entities ignored: ${risky.join(", ")}.`);
  else if (ignored.length) warnings.push(`Non-profile entities ignored: ${ignored.join(", ")}.`);
  return warnings;
}

function dxfNearMatchHtml(group, index) {
  const files = group.files;
  const fileList = files
    .map((file) => {
      const bounds = file.geometry.bounds;
      const size = `${dxfRound(bounds.maxX - bounds.minX)} x ${dxfRound(bounds.maxY - bounds.minY)}`;
      return `<li><strong>${escapeHtml(file.path)}</strong><span>${size}</span></li>`;
    })
    .join("");

  return `
    <article class="dxf-group near-match">
      <div class="dxf-group-preview">${dxfPreviewSvg(files[0].geometry.primitives)}</div>
      <div>
        <div class="dxf-group-head">
          <div>
            <p class="cluster-type">Near profile match</p>
            <h3>Similar Profile ${index + 1}</h3>
          </div>
          <span class="confidence warn">${group.confidence}% confidence</span>
        </div>
        <p class="cluster-reason">Same normalized shape at different profile sizes. Review for possible standardization.</p>
        <dl class="metrics">
          <div><dt>Files</dt><dd>${files.length}</dd></div>
          <div><dt>Smallest</dt><dd>${dxfSizeKey(files[0].geometry.bounds)}</dd></div>
          <div><dt>Largest</dt><dd>${dxfSizeKey(files[files.length - 1].geometry.bounds)}</dd></div>
        </dl>
        <ul class="dxf-file-list">${fileList}</ul>
      </div>
    </article>
  `;
}

function dxfHoleVariantHtml(group, index) {
  const files = group.files;
  const fileList = files
    .map((file) => {
      const detail = `${file.features.holeCount} hole${file.features.holeCount === 1 ? "" : "s"} | ${shortSignature(file.features.holeSignature || "none")}`;
      return `<li><strong>${escapeHtml(file.path)}</strong><span>${detail}</span></li>`;
    })
    .join("");

  return `
    <article class="dxf-group hole-variant">
      <div class="dxf-group-preview">${dxfPreviewSvg(files[0].geometry.primitives)}</div>
      <div>
        <div class="dxf-group-head">
          <div>
            <p class="cluster-type">${group.type}</p>
            <h3>Hole Variant ${index + 1}</h3>
          </div>
          <span class="confidence warn">${group.confidence}% confidence</span>
        </div>
        <p class="cluster-reason">Outer profile matches, but the hole pattern differs. Review before creating another part.</p>
        <dl class="metrics">
          <div><dt>Files</dt><dd>${files.length}</dd></div>
          <div><dt>Variant</dt><dd>${group.type}</dd></div>
          <div><dt>Outer</dt><dd>${shortSignature(group.outerSignature)}</dd></div>
        </dl>
        <ul class="dxf-file-list">${fileList}</ul>
      </div>
    </article>
  `;
}

function dxfUniqueFilesHtml(files) {
  if (!files.length) return '<div class="empty">No unique parts found.</div>';
  const fileList = files
    .map((file) => {
      const bounds = file.geometry.bounds;
      const size = `${dxfRound(bounds.maxX - bounds.minX)} x ${dxfRound(bounds.maxY - bounds.minY)}`;
      return `<li><strong>${escapeHtml(file.path)}</strong><span>${size}</span></li>`;
    })
    .join("");
  return `<ul class="dxf-file-list unique-list">${fileList}</ul>`;
}

function dxfPreviewSvg(primitives) {
  const bounds = primitiveBounds(primitives);
  const width = Math.max(bounds.maxX - bounds.minX, 0.001);
  const height = Math.max(bounds.maxY - bounds.minY, 0.001);
  const viewBox = `${bounds.minX - width * 0.08} ${bounds.minY - height * 0.08} ${width * 1.16} ${height * 1.16}`;
  const elements = primitives.map(dxfPrimitiveSvg).join("");
  return `<svg viewBox="${viewBox}" role="img" aria-label="DXF profile preview"><g transform="scale(1,-1) translate(0,${-(bounds.minY + bounds.maxY)})">${elements}</g></svg>`;
}

function dxfPrimitiveSvg(primitive) {
  const stroke = `stroke="#287767" stroke-width="0.04" vector-effect="non-scaling-stroke" fill="none"`;
  if (primitive.type === "line") {
    return `<line x1="${primitive.a.x}" y1="${primitive.a.y}" x2="${primitive.b.x}" y2="${primitive.b.y}" ${stroke}/>`;
  }
  if (primitive.type === "circle") {
    return `<circle cx="${primitive.center.x}" cy="${primitive.center.y}" r="${primitive.radius}" ${stroke}/>`;
  }

  const start = pointOnArc(primitive, primitive.start);
  const end = pointOnArc(primitive, primitive.end);
  const largeArc = Math.abs(primitive.end - primitive.start) > 180 ? 1 : 0;
  return `<path d="M ${start.x} ${start.y} A ${primitive.radius} ${primitive.radius} 0 ${largeArc} 1 ${end.x} ${end.y}" ${stroke}/>`;
}

function shortSignature(signature) {
  let hash = 0;
  for (let index = 0; index < signature.length; index += 1) {
    hash = (hash * 31 + signature.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).toUpperCase().padStart(8, "0");
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const replacements = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return replacements[character];
  });
}

async function filesFromDrop(event) {
  const items = [...event.dataTransfer.items];
  if (!items.length) return [...event.dataTransfer.files];
  const entries = items.map((item) => item.webkitGetAsEntry?.()).filter(Boolean);
  if (!entries.length) return [...event.dataTransfer.files];
  const files = await Promise.all(entries.map(readEntryFiles));
  return files.flat();
}

function readEntryFiles(entry) {
  if (entry.isFile) {
    return new Promise((resolve) => {
      entry.file((file) => {
        file.relativePath = entry.fullPath.replace(/^\//, "");
        resolve([file]);
      });
    });
  }
  if (!entry.isDirectory) return Promise.resolve([]);

  const reader = entry.createReader();
  return new Promise((resolve) => {
    const entries = [];
    const readBatch = () => {
      reader.readEntries(async (batch) => {
        if (!batch.length) {
          const files = await Promise.all(entries.map(readEntryFiles));
          resolve(files.flat());
          return;
        }
        entries.push(...batch);
        readBatch();
      });
    };
    readBatch();
  });
}

document.querySelector("#query").addEventListener("input", (event) => {
  state.query = event.target.value;
  renderParts();
});

document.querySelector("#familyFilter").addEventListener("change", (event) => {
  state.family = event.target.value;
  renderParts();
});

document.querySelector("#materialFilter").addEventListener("change", (event) => {
  state.material = event.target.value;
  renderParts();
});

document.querySelector("#thicknessFilter").addEventListener("change", (event) => {
  state.thickness = event.target.value;
  renderParts();
});

document.querySelector("#chooseDxfFolder").addEventListener("click", () => {
  document.querySelector("#dxfFolderInput").click();
});

document.querySelector("#dxfFolderInput").addEventListener("change", (event) => {
  handleDxfFiles(event.target.files);
});

document.querySelector("#loadSampleDxfSet").addEventListener("click", () => {
  handleDxfFiles(makeSampleDxfFiles());
});

const dxfDropZone = document.querySelector("#dxfDropZone");
dxfDropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dxfDropZone.classList.add("is-dragging");
});
dxfDropZone.addEventListener("dragleave", () => {
  dxfDropZone.classList.remove("is-dragging");
});
dxfDropZone.addEventListener("drop", async (event) => {
  event.preventDefault();
  dxfDropZone.classList.remove("is-dragging");
  handleDxfFiles(await filesFromDrop(event));
});

window.dxfTools = {
  parseDxf,
  buildDxfSignature,
  buildDxfScaleSignature,
  groupDxfFiles,
  findDxfNearMatches,
  shortSignature,
};

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    state.view = tab.dataset.view;
    document.querySelectorAll(".tab").forEach((candidate) => candidate.classList.toggle("is-active", candidate === tab));
    document.querySelectorAll(".view").forEach((view) => view.classList.remove("is-active"));
    document.querySelector(`#${state.view}View`).classList.add("is-active");
  });
});

render();
renderDxfResults(false);
