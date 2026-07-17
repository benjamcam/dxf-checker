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
  reviewCandidates: [],
  uniqueFiles: [],
  errors: [],
  skippedRevisions: [],
  lookupQuery: "",
  activeResultTab: "exact",
  loadingProgress: null,
};
const state = {
  view: "dxf",
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
  renderFilters();
  renderParts();
  renderClusters();
}

function renderFilters() {
  if (!document.querySelector("#familyFilter")) return;
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

function uniqueInOrder(values) {
  return [...new Set(values)];
}

function renderParts() {
  const container = document.querySelector("#partResults");
  if (!container) return;
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
  if (!container) return;
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

function filterLatestDxfRevisions(files) {
  const byPartNumber = new Map();
  const passthrough = [];

  files.forEach((file) => {
    const revision = dxfRevisionInfo(file.name);
    if (!revision) {
      passthrough.push(file);
      return;
    }

    if (!byPartNumber.has(revision.partNumber)) byPartNumber.set(revision.partNumber, []);
    byPartNumber.get(revision.partNumber).push({ file, revision });
  });

  const selected = [...passthrough];
  const skipped = [];

  byPartNumber.forEach((entries, partNumber) => {
    const latestRank = Math.max(...entries.map((entry) => entry.revision.rank));
    const latest = entries.filter((entry) => entry.revision.rank === latestRank);
    latest.forEach((entry) => selected.push(entry.file));
    entries
      .filter((entry) => entry.revision.rank < latestRank)
      .forEach((entry) => {
        skipped.push({
          name: entry.file.name,
          partNumber,
          revision: entry.revision.revision || "base",
          keptRevision: latest[0].revision.revision || "base",
        });
      });
  });

  return {
    files: selected.sort((a, b) => dxfFilePath(a).localeCompare(dxfFilePath(b))),
    skipped: skipped.sort((a, b) => a.name.localeCompare(b.name)),
  };
}

function dxfRevisionInfo(filename) {
  const baseName = filename.split(/[\\/]/).pop() || filename;
  const match = baseName.match(/^(\d{9})([A-Za-z]?)/);
  if (!match) return null;
  const revision = match[2] ? match[2].toUpperCase() : "";
  return {
    partNumber: match[1],
    revision,
    rank: revision ? revision.charCodeAt(0) - 64 : 0,
  };
}

function dxfFilePath(file) {
  return file.webkitRelativePath || file.relativePath || file.name;
}

async function handleDxfFiles(fileList) {
  const allDxfFiles = [...fileList].filter((file) => file.name.toLowerCase().endsWith(".dxf"));
  const { files, skipped } = filterLatestDxfRevisions(allDxfFiles);
  dxfState.files = [];
  dxfState.groups = [];
  dxfState.nearMatches = [];
  dxfState.holeVariants = [];
  dxfState.reviewCandidates = [];
  dxfState.uniqueFiles = [];
  dxfState.errors = [];
  dxfState.skippedRevisions = skipped;
  dxfState.lookupQuery = "";
  dxfState.loadingProgress = { done: 0, total: files.length, label: "Reading DXFs" };
  renderDxfResults(true);

  const parsed = [];
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    try {
      const text = await file.text();
      const geometry = parseDxf(text);
      const signature = buildDxfSignature(geometry.primitives);
      const scaleSignature = buildDxfScaleSignature(geometry.primitives);
      const features = buildDxfFeatureSignatures(geometry.primitives);
      parsed.push({
        name: file.name,
        path: dxfFilePath(file),
        size: file.size,
        geometry,
        signature,
        scaleSignature,
        features,
      });
    } catch (error) {
      dxfState.errors.push(`${file.name}: ${error.message}`);
    }

    if ((index + 1) % 10 === 0 || index === files.length - 1) {
      dxfState.loadingProgress = { done: index + 1, total: files.length, label: "Reading DXFs" };
      renderDxfResults(true);
      await nextBrowserFrame();
    }
  }

  dxfState.loadingProgress = { done: files.length, total: files.length, label: "Comparing profiles" };
  renderDxfResults(true);
  await nextBrowserFrame();

  dxfState.files = parsed;
  dxfState.groups = groupDxfFiles(dxfState.files);
  await nextBrowserFrame();
  dxfState.nearMatches = findDxfNearMatches(dxfState.files);
  await nextBrowserFrame();
  dxfState.holeVariants = findDxfHoleVariants(dxfState.files);
  await nextBrowserFrame();
  dxfState.reviewCandidates = findDxfReviewCandidates(dxfState.files, dxfState.groups, dxfState.nearMatches, dxfState.holeVariants);
  await nextBrowserFrame();
  dxfState.uniqueFiles = findDxfUniqueFiles(dxfState.files, dxfState.groups, dxfState.nearMatches, dxfState.holeVariants, dxfState.reviewCandidates);
  dxfState.loadingProgress = null;
  renderDxfResults(false);
}

function nextBrowserFrame() {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => resolve());
    else setTimeout(resolve, 0);
  });
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

function buildDxfFlatSignature(primitives) {
  const signatures = transformVariants(primitives).map((variant) => {
    const bounds = primitiveBounds(variant);
    const normalized = variant.map((primitive) => offsetPrimitive(primitive, -bounds.minX, -bounds.minY));
    return tessellatedSignature(normalized, 3);
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
    const { outer, holes } = splitDxfOuterAndHoles(normalized);
    const outline = dxfOutlineFeatures(outer);
    return {
      outerSignature: tessellatedSignature(outer),
      holeSignature: holes.map((hole) => primitiveSignature(hole)).sort().join(";"),
      holeCenterSignature: holes.map((hole) => pointSignature(hole.center)).sort().join(";"),
      holeRadiiSignature: holes.map((hole) => dxfRound(hole.radius)).sort().join(";"),
      holes: holes.map((hole) => ({ center: hole.center, radius: hole.radius })).sort(compareDxfHoles),
      holeCount: holes.length,
      outline,
    };
  });

  return variants.sort((a, b) => {
    const left = `${a.outerSignature}|${a.holeSignature}`;
    const right = `${b.outerSignature}|${b.holeSignature}`;
    return left.localeCompare(right);
  })[0];
}

function splitDxfOuterAndHoles(primitives) {
  const nonCircles = primitives.filter((primitive) => primitive.type !== "circle");
  const circles = primitives.filter((primitive) => primitive.type === "circle");
  if (nonCircles.length || !circles.length) return { outer: nonCircles, holes: circles };

  const sortedCircles = [...circles].sort((a, b) => b.radius - a.radius);
  return { outer: [sortedCircles[0]], holes: sortedCircles.slice(1) };
}

function dxfOutlineFeatures(outer) {
  const lineCount = outer.filter((primitive) => primitive.type === "line").length;
  const arcCount = outer.filter((primitive) => primitive.type === "arc").length;
  const circleCount = outer.filter((primitive) => primitive.type === "circle").length;
  const segmentCount = lineCount + arcCount + circleCount;
  let family = "complex";

  if (circleCount && !lineCount && !arcCount) family = "round";
  else if (arcCount) family = "rounded";
  else if (lineCount === 3) family = "triangle";
  else if (lineCount === 4) family = "quadrilateral";
  else if (lineCount >= 5 && lineCount <= 8) family = "simple-polygon";

  return { family, lineCount, arcCount, circleCount, segmentCount };
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

  const start = transformArcAngle(primitive.start, rotation, mirror);
  const end = transformArcAngle(primitive.end, rotation, mirror);
  return {
    type: "arc",
    center: transformPoint(primitive.center, rotation, mirror),
    radius: primitive.radius,
    start: mirror ? end : start,
    end: mirror ? start : end,
  };
}

function transformPoint(point, rotation, mirror) {
  const source = mirror ? { x: -point.x, y: point.y } : point;
  if (rotation === 90) return { x: -source.y, y: source.x };
  if (rotation === 180) return { x: -source.x, y: -source.y };
  if (rotation === 270) return { x: source.y, y: -source.x };
  return { x: source.x, y: source.y };
}

function transformArcAngle(angle, rotation, mirror) {
  const mirrored = mirror ? 180 - angle : angle;
  return normalizedDegrees(mirrored + rotation);
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
  const offset = {
    type: "arc",
    center: offsetPoint(primitive.center, x, y),
    radius: primitive.radius,
  };
  if (primitive.startPoint && primitive.endPoint) {
    return {
      ...offset,
      startPoint: offsetPoint(primitive.startPoint, x, y),
      endPoint: offsetPoint(primitive.endPoint, x, y),
    };
  }
  return { ...offset, start: primitive.start, end: primitive.end };
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

function primitiveSignature(primitive, precision = 4) {
  if (primitive.type === "line") {
    const points = [pointSignature(primitive.a, precision), pointSignature(primitive.b, precision)].sort();
    return `L:${points.join(">")}`;
  }
  if (primitive.type === "circle") {
    return `C:${pointSignature(primitive.center, precision)}:R${dxfRound(primitive.radius, precision)}`;
  }
  const startPoint = primitive.startPoint || pointOnArc(primitive, primitive.start);
  const endPoint = primitive.endPoint || pointOnArc(primitive, primitive.end);
  const points = [pointSignature(startPoint, precision), pointSignature(endPoint, precision)].sort();
  return `A:${pointSignature(primitive.center, precision)}:R${dxfRound(primitive.radius, precision)}:${points.join(">")}`;
}

function tessellatedSignature(primitives, precision = 4) {
  return tessellatedSignatureItems(primitives, precision).join(";");
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

function pointSignature(point, precision = 4) {
  return `${dxfRound(point.x, precision)},${dxfRound(point.y, precision)}`;
}

function compareDxfHoles(a, b) {
  return a.center.x - b.center.x || a.center.y - b.center.y || a.radius - b.radius;
}

function dxfRound(value, precision = 4) {
  return Number(value).toFixed(precision).replace(/\.?0+$/, "");
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

function closedLineProfileArea(primitives) {
  const lines = primitives.filter((primitive) => primitive.type === "line");
  if (!lines.length || lines.length !== primitives.filter((primitive) => primitive.type !== "circle").length) return null;

  const points = new Map();
  const neighbors = new Map();
  const addPoint = (point) => {
    const key = pointSignature(point);
    if (!points.has(key)) points.set(key, point);
    if (!neighbors.has(key)) neighbors.set(key, []);
    return key;
  };

  lines.forEach((line) => {
    const a = addPoint(line.a);
    const b = addPoint(line.b);
    neighbors.get(a).push(b);
    neighbors.get(b).push(a);
  });

  if ([...neighbors.values()].some((items) => items.length !== 2)) return null;

  const start = addPoint(lines[0].a);
  const path = [start];
  let previous = null;
  let current = start;
  for (let step = 0; step < lines.length; step += 1) {
    const next = neighbors.get(current).find((candidate) => candidate !== previous);
    if (!next) return null;
    previous = current;
    current = next;
    path.push(current);
    if (current === start) break;
  }

  if (path[path.length - 1] !== start || path.length !== lines.length + 1) return null;

  let area = 0;
  for (let index = 0; index < path.length - 1; index += 1) {
    const left = points.get(path[index]);
    const right = points.get(path[index + 1]);
    area += left.x * right.y - right.x * left.y;
  }
  return Math.abs(area) / 2;
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
  const parents = new Map(files.map((file) => [file, file]));
  const find = (file) => {
    let parent = parents.get(file);
    while (parent !== parents.get(parent)) parent = parents.get(parent);
    parents.set(file, parent);
    return parent;
  };
  const union = (a, b) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parents.set(rootB, rootA);
  };

  const bySignature = new Map();
  files.forEach((file) => {
    if (!bySignature.has(file.signature)) bySignature.set(file.signature, []);
    bySignature.get(file.signature).push(file);
  });
  bySignature.forEach((group) => {
    for (let index = 1; index < group.length; index += 1) union(group[0], group[index]);
  });

  const byFlatCandidate = new Map();
  files.forEach((file) => {
    const key = dxfFlatCandidateKey(file);
    if (!byFlatCandidate.has(key)) byFlatCandidate.set(key, []);
    byFlatCandidate.get(key).push(file);
  });
  byFlatCandidate.forEach((candidates) => {
    if (candidates.length > 30) return;
    for (let leftIndex = 0; leftIndex < candidates.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < candidates.length; rightIndex += 1) {
        if (areDxfFlatEquivalent(candidates[leftIndex], candidates[rightIndex])) union(candidates[leftIndex], candidates[rightIndex]);
      }
    }
  });

  const byRoot = new Map();
  files.forEach((file) => {
    const root = find(file);
    if (!byRoot.has(root)) byRoot.set(root, []);
    byRoot.get(root).push(file);
  });

  return [...byRoot.values()]
    .map((group) => ({
      files: group.sort((a, b) => a.path.localeCompare(b.path)),
      signature: group[0].signature,
      bounds: group[0].geometry.bounds,
      primitives: group[0].geometry.primitives,
      confidence: scoreDxfExactGroup(group),
    }))
    .sort((a, b) => b.files.length - a.files.length || a.files[0].path.localeCompare(b.files[0].path));
}

function dxfFlatCandidateKey(file) {
  const dimensions = sortedDxfDimensions(file.geometry.bounds);
  const profileArea = closedLineProfileArea(file.geometry.primitives);
  return [
    dxfRound(dimensions.width, 3),
    dxfRound(dimensions.height, 3),
    file.features?.holeCount || 0,
    file.features?.holeRadiiSignature || "",
    file.features?.holeCenterSignature || "",
    profileArea === null ? "area:unknown" : `area:${dxfRound(profileArea, 3)}`,
  ].join("|");
}

function areDxfFlatEquivalent(a, b) {
  if (a.signature === b.signature) return true;
  if (dxfFlatCandidateKey(a) !== dxfFlatCandidateKey(b)) return false;

  const holePattern = compareDxfHolePattern(a, b);
  if (
    (holePattern.maxDiameterDelta || 0) > 0.005 ||
    (holePattern.maxCenterDelta || 0) > 0.01 ||
    (holePattern.maxSpacingDelta || 0) > 0.01
  ) {
    return false;
  }

  if (getDxfFlatSignature(a) === getDxfFlatSignature(b)) return true;
  return bestDxfSegmentCoverage(a.geometry.primitives, b.geometry.primitives) >= 0.985;
}

function getDxfFlatSignature(file) {
  if (!file.flatSignature) file.flatSignature = buildDxfFlatSignature(file.geometry.primitives);
  return file.flatSignature;
}

function bestDxfSegmentCoverage(aPrimitives, bPrimitives) {
  const bSegments = lineSegmentsForCoverage(bPrimitives);
  if (!bSegments.length) return 0;

  return Math.max(...transformVariants(aPrimitives).map((variant) => {
    const aBounds = primitiveBounds(variant);
    const bBounds = primitiveBounds(bPrimitives);
    const aligned = variant.map((primitive) => offsetPrimitive(primitive, bBounds.minX - aBounds.minX, bBounds.minY - aBounds.minY));
    const aSegments = lineSegmentsForCoverage(aligned);
    return Math.min(dxfSegmentCoverage(aSegments, bSegments), dxfSegmentCoverage(bSegments, aSegments));
  }));
}

function lineSegmentsForCoverage(primitives) {
  return primitives.flatMap(tessellatedSegments).filter((segment) => segment.type === "line");
}

function dxfSegmentCoverage(sourceSegments, targetSegments) {
  if (!sourceSegments.length || !targetSegments.length) return 0;
  const covered = sourceSegments.filter((segment) => dxfSegmentCoveredBy(segment, targetSegments)).length;
  return covered / sourceSegments.length;
}

function dxfSegmentCoveredBy(segment, targetSegments) {
  const midpoint = {
    x: (segment.a.x + segment.b.x) / 2,
    y: (segment.a.y + segment.b.y) / 2,
  };
  return [segment.a, midpoint, segment.b].every((point) => targetSegments.some((target) => pointToSegmentDistance(point, target) <= 0.003));
}

function pointToSegmentDistance(point, segment) {
  const dx = segment.b.x - segment.a.x;
  const dy = segment.b.y - segment.a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (!lengthSquared) return Math.hypot(point.x - segment.a.x, point.y - segment.a.y);
  const t = Math.max(0, Math.min(1, ((point.x - segment.a.x) * dx + (point.y - segment.a.y) * dy) / lengthSquared));
  const projected = { x: segment.a.x + t * dx, y: segment.a.y + t * dy };
  return Math.hypot(point.x - projected.x, point.y - projected.y);
}

function tessellatedSignatureItems(primitives, precision = 4) {
  return primitives.flatMap(tessellatedSegments).map((primitive) => primitiveSignature(primitive, precision)).sort();
}

function dxfSignatureOverlap(left, right) {
  const counts = new Map();
  right.forEach((signature) => counts.set(signature, (counts.get(signature) || 0) + 1));
  let matches = 0;
  left.forEach((signature) => {
    const count = counts.get(signature) || 0;
    if (!count) return;
    matches += 1;
    counts.set(signature, count - 1);
  });
  return matches;
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

function findDxfReviewCandidates(files, exactGroups, nearMatches, holeVariants) {
  const uniqueFiles = findDxfUniqueFiles(files, exactGroups, nearMatches, holeVariants);
  const links = [];
  const minimumConfidence = 74;

  for (let leftIndex = 0; leftIndex < uniqueFiles.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < uniqueFiles.length; rightIndex += 1) {
      const comparison = compareDxfReviewCandidate(uniqueFiles[leftIndex], uniqueFiles[rightIndex]);
      if (comparison.confidence >= minimumConfidence && hasDxfReviewCue(comparison)) links.push(comparison);
    }
  }

  return links
    .sort((a, b) => b.confidence - a.confidence || a.a.path.localeCompare(b.a.path) || a.b.path.localeCompare(b.b.path))
    .map((link) => ({
      files: [link.a, link.b].sort((a, b) => profileSize(a) - profileSize(b) || a.path.localeCompare(b.path)),
      confidence: Math.round(link.confidence),
      type: classifyDxfReviewCandidate(link),
      reasons: uniqueInOrder(link.reasons),
      comparisons: [link],
    }));
}

function compareDxfReviewCandidate(a, b) {
  const aDimensions = sortedDxfDimensions(a.geometry.bounds);
  const bDimensions = sortedDxfDimensions(b.geometry.bounds);
  const outline = compareDxfOutlineFamily(a, b);
  const holePattern = compareDxfHolePattern(a, b);
  const widthDelta = relativeDelta(aDimensions.width, bDimensions.width);
  const heightDelta = relativeDelta(aDimensions.height, bDimensions.height);
  const aspectDelta = relativeDelta(aDimensions.aspect, bDimensions.aspect);
  const areaDelta = relativeDelta(aDimensions.area, bDimensions.area);
  const entityDelta = relativeDelta(a.geometry.entityCount, b.geometry.entityCount);
  const leftProfileArea = closedLineProfileArea(a.geometry.primitives);
  const rightProfileArea = closedLineProfileArea(b.geometry.primitives);
  const profileAreaDelta = leftProfileArea !== null && rightProfileArea !== null ? relativeDelta(leftProfileArea, rightProfileArea) : null;
  const reasons = [];
  let confidence = 38;

  if (outline.compatible) {
    confidence += outline.score;
    reasons.push(outline.reason);
  } else {
    confidence -= 30;
    reasons.push(outline.reason);
  }

  if (widthDelta <= 0.03) {
    confidence += 18;
    reasons.push("matching short-side dimension");
  } else if (widthDelta <= 0.08) {
    confidence += 11;
    reasons.push("close short-side dimension");
  }

  if (heightDelta <= 0.05) {
    confidence += 18;
    reasons.push("matching long-side dimension");
  } else if (heightDelta <= 0.18) {
    confidence += 11;
    reasons.push("close long-side dimension");
  }

  if (aspectDelta <= 0.06) {
    confidence += 12;
    reasons.push("similar aspect ratio");
  } else if (aspectDelta <= 0.14) {
    confidence += 7;
    reasons.push("related aspect ratio");
  }

  if (a.features.holeCount === b.features.holeCount) {
    confidence += 5;
    reasons.push("same hole count");
  } else if (Math.abs(a.features.holeCount - b.features.holeCount) <= 1) {
    confidence += 1;
    reasons.push("similar hole count");
  } else {
    confidence -= 7;
  }

  if (holePattern.score >= 88) {
    confidence += 14;
    reasons.push(...holePattern.reasons.slice(0, 3));
  } else if (holePattern.score >= 72) {
    confidence += 8;
    reasons.push(...holePattern.reasons.slice(0, 3));
  } else if (holePattern.score < 45) {
    confidence -= 8;
  }

  const provisionalComparison = { a, b, deltas: { widthDelta, heightDelta, aspectDelta, areaDelta, profileAreaDelta }, holePattern, outline };
  if (hasPossibleExactDxfMiss(provisionalComparison)) {
    confidence += 22;
    reasons.push("same overall dimensions and hole pattern");
    if (profileAreaDelta !== null && profileAreaDelta <= 0.002) reasons.push("matching enclosed profile area");
  }

  if (a.geometry.entityCount === b.geometry.entityCount) {
    confidence += 5;
    reasons.push("same entity count");
  } else if (entityDelta <= 0.25) {
    confidence += 2;
    reasons.push("similar entity count");
  } else {
    confidence -= 8;
  }

  if (areaDelta > 0.4) confidence -= 10;
  if (Math.max(widthDelta, heightDelta) > 0.28 && aspectDelta > 0.12) confidence -= 18;
  if (riskyIgnoredEntities(a).length || riskyIgnoredEntities(b).length) confidence -= 10;

  return {
    a,
    b,
    confidence: Math.max(0, Math.min(92, confidence)),
    reasons,
    deltas: { widthDelta, heightDelta, aspectDelta, areaDelta, profileAreaDelta },
    outline,
    holePattern,
  };
}

function compareDxfOutlineFamily(a, b) {
  const left = a.features.outline || {};
  const right = b.features.outline || {};
  if (!left.family || !right.family) return { compatible: false, score: 0, reason: "missing outline family" };
  if (left.family !== right.family) {
    return { compatible: false, score: 0, reason: `${left.family} outline vs ${right.family} outline` };
  }

  const lineDelta = Math.abs((left.lineCount || 0) - (right.lineCount || 0));
  const arcDelta = Math.abs((left.arcCount || 0) - (right.arcCount || 0));
  const segmentDelta = Math.abs((left.segmentCount || 0) - (right.segmentCount || 0));
  let score = 16;
  const reasons = [`same ${left.family} outline family`];

  if (lineDelta === 0 && arcDelta === 0) {
    score += 10;
    reasons.push("same outline entity mix");
  } else if (segmentDelta <= 2) {
    score += 4;
    reasons.push("similar outline entity count");
  } else {
    score -= 12;
    reasons.push("different outline complexity");
  }

  return {
    compatible: segmentDelta <= Math.max(2, Math.ceil(Math.max(left.segmentCount || 0, right.segmentCount || 0) * 0.25)),
    sameEntityMix: lineDelta === 0 && arcDelta === 0,
    score,
    reason: reasons.join(", "),
  };
}

function compareDxfHolePattern(a, b) {
  const aHoles = a.features.holes || [];
  const bHoles = b.features.holes || [];
  const countDelta = Math.abs(aHoles.length - bHoles.length);
  const comparableCount = Math.min(aHoles.length, bHoles.length);
  const reasons = [];
  let score = 42;

  if (!aHoles.length && !bHoles.length) {
    return { score: 78, reasons: ["both have no holes"], differences: ["No hole pattern differences."] };
  }
  if (!comparableCount) {
    return {
      score: 18,
      reasons: [`${aHoles.length} holes vs ${bHoles.length} holes`],
      differences: [`Hole count differs: ${aHoles.length} vs ${bHoles.length}.`],
    };
  }

  if (countDelta === 0) {
    score += 16;
    reasons.push(`same hole count (${aHoles.length})`);
  } else {
    score -= Math.min(24, countDelta * 8);
    reasons.push(`hole count differs by ${countDelta}`);
  }

  const aRadii = aHoles.map((hole) => hole.radius).sort((left, right) => left - right);
  const bRadii = bHoles.map((hole) => hole.radius).sort((left, right) => left - right);
  const radiusDeltas = [];
  for (let index = 0; index < comparableCount; index += 1) {
    radiusDeltas.push(Math.abs(aRadii[index] - bRadii[index]));
  }
  const maxRadiusDelta = Math.max(...radiusDeltas);
  const maxDiameterDelta = maxRadiusDelta * 2;
  if (maxDiameterDelta <= 0.005) {
    score += 16;
    reasons.push("hole diameters match");
  } else if (maxDiameterDelta <= 0.0625) {
    score += 8;
    reasons.push(`hole diameters within ${formatInches(maxDiameterDelta)}`);
  } else {
    score -= 8;
    reasons.push(`hole diameters differ up to ${formatInches(maxDiameterDelta)}`);
  }

  const centerDeltas = [];
  for (let index = 0; index < comparableCount; index += 1) {
    const deltaX = Math.abs(aHoles[index].center.x - bHoles[index].center.x);
    const deltaY = Math.abs(aHoles[index].center.y - bHoles[index].center.y);
    centerDeltas.push(Math.hypot(deltaX, deltaY));
  }
  const maxCenterDelta = Math.max(...centerDeltas);
  if (maxCenterDelta <= 0.01) {
    score += 16;
    reasons.push("hole centers match");
  } else if (maxCenterDelta <= 0.125) {
    score += 8;
    reasons.push(`hole centers within ${formatInches(maxCenterDelta)}`);
  } else {
    score -= 8;
    reasons.push(`hole centers shift up to ${formatInches(maxCenterDelta)}`);
  }

  const aSpacing = holeSpacingDistances(aHoles);
  const bSpacing = holeSpacingDistances(bHoles);
  const spacingCount = Math.min(aSpacing.length, bSpacing.length);
  let maxSpacingDelta = null;
  if (spacingCount) {
    const spacingDeltas = [];
    for (let index = 0; index < spacingCount; index += 1) {
      spacingDeltas.push(Math.abs(aSpacing[index] - bSpacing[index]));
    }
    maxSpacingDelta = Math.max(...spacingDeltas);
    if (maxSpacingDelta <= 0.01) {
      score += 14;
      reasons.push("hole spacing matches");
    } else if (maxSpacingDelta <= 0.125) {
      score += 7;
      reasons.push(`hole spacing within ${formatInches(maxSpacingDelta)}`);
    } else {
      score -= 6;
      reasons.push(`hole spacing differs up to ${formatInches(maxSpacingDelta)}`);
    }
  }

  const differences = [`Hole count: ${aHoles.length} vs ${bHoles.length}.`];
  differences.push(maxDiameterDelta <= 0.005 ? "Hole diameters match." : `Max hole diameter difference: ${formatInches(maxDiameterDelta)}.`);
  differences.push(maxCenterDelta <= 0.01 ? "Hole centers match." : `Max hole center shift: ${formatInches(maxCenterDelta)}.`);
  if (maxSpacingDelta !== null) {
    differences.push(maxSpacingDelta <= 0.01 ? "Hole spacing matches." : `Max hole spacing difference: ${formatInches(maxSpacingDelta)}.`);
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons,
    differences,
    maxDiameterDelta,
    maxCenterDelta,
    maxSpacingDelta,
  };
}

function holeSpacingDistances(holes) {
  const distances = [];
  for (let leftIndex = 0; leftIndex < holes.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < holes.length; rightIndex += 1) {
      distances.push(Math.hypot(holes[leftIndex].center.x - holes[rightIndex].center.x, holes[leftIndex].center.y - holes[rightIndex].center.y));
    }
  }
  return distances.sort((a, b) => a - b);
}

function formatInches(value) {
  return `${dxfRound(value)} in`;
}

function hasMatchingDxfDimensions(comparison, tolerance = 0.002) {
  const { widthDelta, heightDelta, aspectDelta } = comparison.deltas;
  return widthDelta <= tolerance && heightDelta <= tolerance && aspectDelta <= tolerance;
}

function hasMatchingDxfHolePattern(comparison) {
  const leftCount = comparison.a.features.holeCount;
  const rightCount = comparison.b.features.holeCount;
  if (leftCount !== rightCount) return false;
  if (!leftCount && !rightCount) return true;
  return (
    (comparison.holePattern?.maxDiameterDelta || 0) <= 0.005 &&
    (comparison.holePattern?.maxCenterDelta || 0) <= 0.01 &&
    (comparison.holePattern?.maxSpacingDelta || 0) <= 0.01
  );
}

function hasPossibleExactDxfMiss(comparison) {
  const matchingLineProfileArea = comparison.deltas.profileAreaDelta !== null && comparison.deltas.profileAreaDelta <= 0.002;
  const matchingOutline = comparison.outline.compatible && comparison.outline.sameEntityMix;
  return hasMatchingDxfDimensions(comparison) && hasMatchingDxfHolePattern(comparison) && (matchingLineProfileArea || matchingOutline);
}

function hasDxfReviewCue(comparison) {
  const { widthDelta, heightDelta, aspectDelta } = comparison.deltas;
  const strongDimensions = widthDelta <= 0.08 && heightDelta <= 0.08 && aspectDelta <= 0.08;
  const relatedDimensions = widthDelta <= 0.12 && heightDelta <= 0.18 && aspectDelta <= 0.12;
  const strongHolePattern = comparison.holePattern?.score >= 82;
  const partialHolePattern = comparison.holePattern?.score >= 68 && Math.min(comparison.a.features.holeCount, comparison.b.features.holeCount) >= 2;

  if (hasPossibleExactDxfMiss(comparison)) return true;
  if (!comparison.outline.compatible || !comparison.outline.sameEntityMix) return false;
  return strongDimensions || (relatedDimensions && strongHolePattern) || (strongDimensions && partialHolePattern);
}

function classifyDxfReviewCandidate(comparison) {
  const { widthDelta, heightDelta, aspectDelta } = comparison.deltas;
  const dimensionsDiffer = Math.max(widthDelta, heightDelta) > 0.015 || aspectDelta > 0.015;
  const holeScore = comparison.holePattern?.score || 0;
  const holesDiffer = !hasMatchingDxfHolePattern(comparison);

  if (hasPossibleExactDxfMiss(comparison)) return "Possible exact profile match";
  if (dimensionsDiffer && holesDiffer && holeScore >= 68) return "Profile dimension + hole pattern variant";
  if (dimensionsDiffer) return "Profile dimension variant";
  if (holeScore >= 68 && holesDiffer) return "Partial hole pattern variant";
  return "Profile dimension variant";
}

function findDxfUniqueFiles(files, exactGroups, nearMatches, holeVariants, reviewCandidates = []) {
  const matched = new Set();
  exactGroups.filter((group) => group.files.length > 1).forEach((group) => group.files.forEach((file) => matched.add(file)));
  nearMatches.forEach((group) => group.files.forEach((file) => matched.add(file)));
  holeVariants.forEach((group) => group.files.forEach((file) => matched.add(file)));
  reviewCandidates.forEach((group) => group.files.forEach((file) => matched.add(file)));
  return files.filter((file) => !matched.has(file)).sort((a, b) => a.path.localeCompare(b.path));
}

function findDxfFileByQuery(files, query) {
  const normalizedQuery = normalizeLookupText(query);
  if (!normalizedQuery) return null;
  return (
    files.find((file) => normalizeLookupText(file.name) === normalizedQuery) ||
    files.find((file) => normalizeLookupText(file.path) === normalizedQuery) ||
    files.find((file) => normalizeLookupText(file.name).includes(normalizedQuery)) ||
    files.find((file) => normalizeLookupText(file.path).includes(normalizedQuery)) ||
    null
  );
}

function findDxfClosestFiles(target, files, limit = 5) {
  return files
    .filter((file) => file !== target)
    .map((file) => compareDxfSimilarity(target, file))
    .filter((match) => match.type !== "Low similarity")
    .sort((a, b) => b.score - a.score || a.file.path.localeCompare(b.file.path))
    .slice(0, limit);
}

function compareDxfSimilarity(a, b) {
  const holePattern = compareDxfHolePattern(a, b);
  const exactProfile = areDxfFlatEquivalent(a, b);
  if (exactProfile) {
    return { file: b, score: 100, type: "Exact profile", reasons: ["same flat-part geometry across orientation", ...holePattern.differences], holePattern };
  }

  if (a.features.outerSignature && a.features.outerSignature === b.features.outerSignature) {
    const type = classifyDxfHoleVariant([a, b]);
    const score = Math.round(scoreDxfHoleVariant([a, b]) * 0.75 + holePattern.score * 0.25);
    return { file: b, score, type, reasons: ["same outer profile", ...holePattern.differences], holePattern };
  }

  if (a.scaleSignature === b.scaleSignature) {
    const score = Math.round(scoreDxfNearMatch([a, b]) * 0.8 + holePattern.score * 0.2);
    return { file: b, score, type: "Near profile", reasons: ["same normalized shape at different size", ...holePattern.differences], holePattern };
  }

  const review = compareDxfReviewCandidate(a, b);
  const hasComparableHoles = a.features.holeCount > 0 || b.features.holeCount > 0;
  const score = hasComparableHoles ? Math.round(review.confidence * 0.7 + holePattern.score * 0.3) : Math.round(review.confidence);
  return {
    file: b,
    score,
    type: hasDxfReviewCue(review) ? classifyDxfReviewCandidate(review) : "Low similarity",
    reasons: [...(review.reasons.length ? review.reasons : ["nearest available dimensional comparison"]), ...holePattern.differences],
    holePattern,
  };
}

function normalizeLookupText(value) {
  return String(value).toLowerCase().replace(/\.dxf$/i, "").replace(/[^a-z0-9]/g, "");
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
  return Object.keys(file.geometry.ignored).filter((type) => ["SPLINE", "INSERT", "HATCH"].includes(type));
}

function ignoredEntityCount(file) {
  return nonProfileIgnoredEntities(file).reduce((sum, type) => sum + file.geometry.ignored[type], 0);
}

function nonProfileIgnoredEntities(file) {
  const benign = new Set([
    "ACDBDICTIONARYWDFLT",
    "ACDBPLACEHOLDER",
    "APPID",
    "BLOCK",
    "BLOCK_RECORD",
    "CLASS",
    "DICTIONARY",
    "DIMSTYLE",
    "ENDBLK",
    "ENDSEC",
    "ENDTAB",
    "EOF",
    "LAYER",
    "LAYOUT",
    "LTYPE",
    "MLINESTYLE",
    "SCALE",
    "SECTION",
    "STYLE",
    "TABLE",
    "VPORT",
    "XRECORD",
  ]);
  return Object.keys(file.geometry.ignored).filter((type) => !benign.has(type));
}

function dxfSizeKey(bounds) {
  return `${dxfRound(bounds.maxX - bounds.minX)}x${dxfRound(bounds.maxY - bounds.minY)}`;
}

function profileSize(file) {
  const bounds = file.geometry.bounds;
  return Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
}

function sortedDxfDimensions(bounds) {
  const dimensions = [bounds.maxX - bounds.minX, bounds.maxY - bounds.minY].sort((a, b) => a - b);
  const width = Math.max(dimensions[0], 0.0001);
  const height = Math.max(dimensions[1], 0.0001);
  return {
    width,
    height,
    aspect: width / height,
    area: width * height,
  };
}

function renderDxfResults(isLoading) {
  const summary = document.querySelector("#dxfSummary");
  const results = document.querySelector("#dxfResults");
  if (!summary || !results) return;

  const matchGroups = dxfState.groups.filter((group) => group.files.length > 1).length;
  renderDxfLookup();
  summary.innerHTML = [
    ["DXFs", dxfState.files.length],
    ["No Match Found", dxfState.uniqueFiles.length],
    ["Exact Matches", matchGroups],
    ["Near Matches", dxfState.nearMatches.length],
    ["Hole Variants", dxfState.holeVariants.length],
    ["Suggested Variants", dxfState.reviewCandidates.length],
  ]
    .map(([label, value]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`)
    .join("");

  if (isLoading) {
    const progress = dxfState.loadingProgress;
    const progressText = progress
      ? `${progress.label}: ${progress.done} / ${progress.total}`
      : "Reading DXFs...";
    results.innerHTML = `<div class="empty">${escapeHtml(progressText)}</div>`;
    return;
  }
  if (!dxfState.files.length) {
    const errorHtml = dxfState.errors.length ? `<p class="dxf-warning">${escapeHtml(dxfState.errors.join(" | "))}</p>` : "";
    results.innerHTML = `<div class="empty">No DXFs loaded yet.${errorHtml}</div>`;
    return;
  }

  const skippedRevisionHtml = dxfState.skippedRevisions.length
    ? `
      <section class="dxf-section-block">
        <div class="dxf-revision-note">
          <strong>${dxfState.skippedRevisions.length} older revision${dxfState.skippedRevisions.length === 1 ? "" : "s"} skipped.</strong>
          <span>When files share the same 9-digit part number, only the furthest letter revision is compared.</span>
        </div>
      </section>
    `
    : "";
  results.innerHTML = skippedRevisionHtml + dxfResultTabsHtml();
}

function dxfResultTabsHtml() {
  const exactGroups = dxfState.groups.filter((group) => group.files.length > 1);
  const tabs = [
    {
      id: "exact",
      label: "Exact Matches",
      count: exactGroups.length,
      title: "Exact Profile Groups",
      description: "Same flat-part geometry after origin, rotation, and mirror normalization.",
      content: exactGroups.map(dxfGroupHtml).join("") || '<div class="empty">No exact profile matches found.</div>',
    },
    {
      id: "recommendations",
      label: "Recommendations",
      count: dxfState.reviewCandidates.length,
      title: "Suggested Variants",
      description: "Higher-quality recommendations triggered by close overall dimensions, strong hole-pattern evidence, or both.",
      content: dxfState.reviewCandidates.map(dxfReviewCandidateHtml).join("") || '<div class="empty">No suggested variants found.</div>',
    },
    {
      id: "hole",
      label: "Hole Variants",
      count: dxfState.holeVariants.length,
      title: "Hole Variants",
      description: "Same outer profile with changed hole size, location, count, or pattern.",
      content: dxfState.holeVariants.map(dxfHoleVariantHtml).join("") || '<div class="empty">No hole variants found.</div>',
    },
    {
      id: "near",
      label: "Near Matches",
      count: dxfState.nearMatches.length,
      title: "Near Profile Matches",
      description: "Same normalized profile shape at different sizes, such as 2 x 2 and 2.25 x 2.25 gussets.",
      content: dxfState.nearMatches.map(dxfNearMatchHtml).join("") || '<div class="empty">No near profile matches found.</div>',
    },
    {
      id: "unique",
      label: "No Match Found",
      count: dxfState.uniqueFiles.length,
      title: "No Match Found",
      description: "Files that did not meet the exact, near-profile, hole-variant, or suggested-variant criteria.",
      content: dxfUniqueFilesHtml(dxfState.uniqueFiles),
    },
  ];
  if (!tabs.some((tab) => tab.id === dxfState.activeResultTab)) dxfState.activeResultTab = "exact";
  const active = tabs.find((tab) => tab.id === dxfState.activeResultTab) || tabs[0];

  return `
    <section class="dxf-result-tabs" aria-label="DXF result categories">
      <div class="dxf-subtabs" role="tablist" aria-label="DXF result categories">
        ${tabs.map((tab) => `
          <button
            class="dxf-subtab ${tab.id === active.id ? "is-active" : ""}"
            type="button"
            role="tab"
            aria-selected="${tab.id === active.id ? "true" : "false"}"
            data-dxf-result-tab="${tab.id}"
          >
            <span>${escapeHtml(tab.label)}</span>
            <b>${tab.count}</b>
          </button>
        `).join("")}
      </div>
      <section class="dxf-section-block dxf-result-panel" role="tabpanel">
        <div class="section-heading compact">
          <h2>${escapeHtml(active.title)}</h2>
          <p>${escapeHtml(active.description)}</p>
        </div>
        ${active.content}
      </section>
    </section>
  `;
}

function renderDxfLookup() {
  const input = document.querySelector("#dxfLookupInput");
  const options = document.querySelector("#dxfLookupOptions");
  const results = document.querySelector("#dxfLookupResults");
  if (!input || !options || !results) return;

  input.value = dxfState.lookupQuery;
  input.disabled = !dxfState.files.length;
  options.innerHTML = dxfState.files
    .map((file) => `<option value="${escapeHtml(file.name)}">${escapeHtml(file.path)}</option>`)
    .join("");

  if (!dxfState.files.length) {
    results.innerHTML = '<div class="empty compact">Load DXFs, then search a part to see qualifying candidates.</div>';
    return;
  }

  const target = findDxfFileByQuery(dxfState.files, dxfState.lookupQuery);
  if (!dxfState.lookupQuery.trim()) {
    results.innerHTML = '<div class="empty compact">Type a loaded DXF filename or part number.</div>';
    return;
  }
  if (!target) {
    results.innerHTML = '<div class="empty compact">No loaded DXF matched that search.</div>';
    return;
  }

  const matches = findDxfClosestFiles(target, dxfState.files, 5);
  results.innerHTML = dxfClosestMatchesHtml(target, matches);
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
  const ignored = unique(files.flatMap(nonProfileIgnoredEntities));
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

function dxfReviewCandidateHtml(group, index) {
  const files = group.files;
  const fileList = files
    .map((file) => {
      const bounds = file.geometry.bounds;
      const size = `${dxfRound(bounds.maxX - bounds.minX)} x ${dxfRound(bounds.maxY - bounds.minY)}`;
      return `<li><strong>${escapeHtml(file.path)}</strong><span>${size} | ${file.features.holeCount} hole${file.features.holeCount === 1 ? "" : "s"}</span></li>`;
    })
    .join("");
  const comparisons = group.comparisons
    .map((comparison) => `<li><strong>${escapeHtml(comparison.a.name)} vs ${escapeHtml(comparison.b.name)}</strong><span>${comparison.confidence}%</span></li>`)
    .join("");

  return `
    <article class="dxf-group review-candidate">
      <div class="dxf-group-preview">${dxfPreviewSvg(files[0].geometry.primitives)}</div>
      <div>
        <div class="dxf-group-head">
          <div>
            <p class="cluster-type">${escapeHtml(group.type || "Suggested variant")}</p>
            <h3>Recommendation ${index + 1}</h3>
          </div>
          <span class="confidence warn">${group.confidence}% confidence</span>
        </div>
        <p class="cluster-reason">${escapeHtml(group.reasons.slice(0, 5).join(", "))}. This pair has enough dimensional, hole-pattern, or signature-mismatch evidence for a second look.</p>
        <dl class="metrics">
          <div><dt>Files</dt><dd>${files.length}</dd></div>
          <div><dt>Smallest</dt><dd>${dxfSizeKey(files[0].geometry.bounds)}</dd></div>
          <div><dt>Largest</dt><dd>${dxfSizeKey(files[files.length - 1].geometry.bounds)}</dd></div>
        </dl>
        <ul class="dxf-file-list">${fileList}</ul>
        <ul class="dxf-file-list comparison-list">${comparisons}</ul>
      </div>
    </article>
  `;
}

function dxfClosestMatchesHtml(target, matches) {
  const targetSize = dxfSizeKey(target.geometry.bounds);
  const matchItems = matches.length
    ? matches
      .map((match, index) => {
        const file = match.file;
        const size = dxfSizeKey(file.geometry.bounds);
        const reasons = dxfClosestMatchReasons(match).join(", ");
        return `
          <li>
            <div>
              <strong>${index + 1}. ${escapeHtml(file.path)}</strong>
              <span>${escapeHtml(match.type)} | ${size} | ${file.features.holeCount} hole${file.features.holeCount === 1 ? "" : "s"}</span>
              <small>${escapeHtml(reasons)}</small>
            </div>
            <b>${match.score}%</b>
          </li>
        `;
      })
      .join("")
    : '<li><div><strong>No match found.</strong><span>This part does not meet exact, near-profile, hole-variant, or suggested-variant criteria with any loaded DXF.</span></div></li>';

  return `
    <article class="dxf-lookup-card">
      <div>
        <p class="cluster-type">Matching parts for</p>
        <h3>${escapeHtml(target.path)}</h3>
        <span>${targetSize} | ${target.features.holeCount} hole${target.features.holeCount === 1 ? "" : "s"}</span>
      </div>
      <ul class="dxf-match-list">${matchItems}</ul>
    </article>
  `;
}

function dxfClosestMatchReasons(match) {
  const holeDifferences = match.holePattern?.differences || [];
  const hasHoleData = match.holePattern && (match.file.features.holeCount > 0 || holeDifferences.some((reason) => !reason.includes("No hole")));
  if (hasHoleData) {
    const shapeReasons = match.reasons.filter((reason) => !holeDifferences.includes(reason)).slice(0, 2);
    return [...shapeReasons, ...holeDifferences.slice(0, 4)].slice(0, 6);
  }
  return match.reasons.slice(0, 4);
}

function dxfUniqueFilesHtml(files) {
  if (!files.length) return '<div class="empty">Every loaded part has at least one match or suggested variant.</div>';
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
  return `<svg viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="DXF profile preview"><g transform="scale(1,-1) translate(0,${-(bounds.minY + bounds.maxY)})">${elements}</g></svg>`;
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

document.querySelector("#query")?.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderParts();
});

document.querySelector("#familyFilter")?.addEventListener("change", (event) => {
  state.family = event.target.value;
  renderParts();
});

document.querySelector("#materialFilter")?.addEventListener("change", (event) => {
  state.material = event.target.value;
  renderParts();
});

document.querySelector("#thicknessFilter")?.addEventListener("change", (event) => {
  state.thickness = event.target.value;
  renderParts();
});

document.querySelector("#chooseDxfFolder")?.addEventListener("click", () => {
  document.querySelector("#dxfFolderInput").click();
});

document.querySelector("#dxfFolderInput")?.addEventListener("change", (event) => {
  handleDxfFiles(event.target.files);
});

document.querySelector("#dxfLookupInput")?.addEventListener("input", (event) => {
  dxfState.lookupQuery = event.target.value;
  renderDxfLookup();
});

document.querySelector("#dxfResults")?.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-dxf-result-tab]");
  if (!tab) return;
  dxfState.activeResultTab = tab.dataset.dxfResultTab;
  renderDxfResults(false);
});

const dxfDropZone = document.querySelector("#dxfDropZone");
if (dxfDropZone) {
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
}

window.dxfTools = {
  parseDxf,
  buildDxfSignature,
  buildDxfScaleSignature,
  groupDxfFiles,
  findDxfNearMatches,
  findDxfClosestFiles,
  findDxfFileByQuery,
  shortSignature,
};

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    state.view = tab.dataset.view;
    document.querySelectorAll(".tab").forEach((candidate) => candidate.classList.toggle("is-active", candidate === tab));
    document.querySelectorAll(".view").forEach((view) => view.classList.remove("is-active"));
    document.querySelector(`#${state.view}View`)?.classList.add("is-active");
  });
});

render();
renderDxfResults(false);
