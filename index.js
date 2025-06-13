// Funnel Pilot – Scrum Board Dashboard
//
// EXPECTED FIELDS IN THE DATA SOURCE
// • Task ID            (dimension – text)
// • Status             (dimension – text: Backlog, To Do, In Progress, Blocked, Review, Done)
// • Story Pts          (metric – number)
// • Due                (dimension – date YYYY-MM-DD)  ← optional for burndown
//
// -------------------------------------------------------------------

const dscc = require('@google/dscc');          // Looker Studio helper
const LOCAL = false;                           // flip to true for local testing

// Sample local data for quick preview inside the editor
const LOCAL_DATA = {
  tables: {
    DEFAULT: [
      { "Task ID": "STR-01", Status: "Done", "Story Pts": 3, Due: "2025-06-17" },
      { "Task ID": "CON-02", Status: "In Progress", "Story Pts": 8, Due: "2025-06-24" },
      { "Task ID": "QA-01",  Status: "Backlog", "Story Pts": 3, Due: "2025-07-15" }
    ]
  },
  style: {
    backgroundColor: "#ffffff",
    accentColor: "#1a73e8"
  }
};

// ------- helper: count tasks per status -----------------------------
function countByStatus(rows) {
  return rows.reduce((acc, row) => {
    const status = row.Status || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
}

// ------- helper: sum story points done vs total ---------------------
function storyPoints(rows) {
  let done = 0, total = 0;
  rows.forEach(r => {
    const pts = Number(r["Story Pts"]) || 0;
    total += pts;
    if (r.Status === "Done") done += pts;
  });
  return { done, total };
}

// ------- render KPI cards & progress bar ----------------------------
function drawViz(data) {
  // clear existing
  const container = document.getElementById("scrum-viz");
  container.innerHTML = "";

  // rows & style
  const rows = data.tables.DEFAULT;
  const style = data.style || {};
  const accent = style.accentColor || "#1a73e8";

  // counts
  const counts = countByStatus(rows);
  const points = storyPoints(rows);
  const pct = points.total ? Math.round((points.done / points.total) * 100) : 0;

  // KPI grid
  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(130px,1fr))";
  grid.style.gap = "12px";
  grid.style.fontFamily = "Arial, sans-serif";

  const statuses = ["Backlog","To Do","In Progress","Blocked","Review","Done"];
  statuses.forEach(s => {
    const card = document.createElement("div");
    card.style.border = `2px solid ${accent}`;
    card.style.borderRadius = "8px";
    card.style.padding = "8px";
    card.style.textAlign = "center";
    card.innerHTML = `<strong>${counts[s] || 0}</strong><br/><span style="font-size:12px">${s}</span>`;
    grid.appendChild(card);
  });

  // progress bar
  const barWrap = document.createElement("div");
  barWrap.style.marginTop = "20px";
  barWrap.innerHTML = `
    <div style="font-size:14px;margin-bottom:4px;">
      ${points.done} / ${points.total} Story Pts Done (${pct}%)
    </div>
    <div style="background:#e0e0e0;border-radius:8px;height:16px;overflow:hidden">
      <div style="width:${pct}%;background:${accent};height:100%"></div>
    </div>
  `;

  container.appendChild(grid);
  container.appendChild(barWrap);
}

// --------------------------- main -----------------------------------
if (LOCAL) {
  drawViz(LOCAL_DATA);            // local preview
} else {
  dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
}
