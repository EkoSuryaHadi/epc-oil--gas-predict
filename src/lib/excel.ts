import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

// Types
export type Project = {
  id: number;
  name: string;
  status: "On Track" | "At Risk" | "Delayed";
  budget: number; // USD Millions
  spent: number; // USD Millions
  start: string; // ISO date
  end: string; // ISO date
  completion: number; // 0-100
};

export type Task = { id: string; project_id: number; name: string; start: string; end: string; progress: number };
export type Milestone = { project_id: number; name: string; date: string; status: string };
export type Resource = { project_id: number; role: string; allocation: number; fte: number };
export type SCurvePoint = { project_id: number; month: string; planned: number; actual: number };

// Default seed data mirrors current UI so app works without a physical Excel file present.
const DEFAULT_PROJECTS: Project[] = [
  { id: 1, name: "LNG Train 3 Expansion", status: "On Track", budget: 1200, spent: 610, start: "2024-11-15", end: "2027-06-30", completion: 55 },
  { id: 2, name: "Offshore Platform Delta", status: "At Risk", budget: 780, spent: 560, start: "2024-04-01", end: "2026-02-15", completion: 70 },
  { id: 3, name: "Subsea Tieback Aurora", status: "On Track", budget: 450, spent: 210, start: "2025-02-01", end: "2026-10-31", completion: 46 },
  { id: 4, name: "Crude Pipeline EPC", status: "Delayed", budget: 300, spent: 195, start: "2024-09-05", end: "2025-12-30", completion: 45 },
  { id: 5, name: "Refinery Upgrade Phase II", status: "On Track", budget: 950, spent: 440, start: "2025-03-01", end: "2027-01-30", completion: 25 },
  { id: 6, name: "Gas Processing Train 4", status: "On Track", budget: 420, spent: 225, start: "2025-01-10", end: "2026-08-20", completion: 54 },
  { id: 7, name: "Petchem PP Unit Revamp", status: "At Risk", budget: 1100, spent: 730, start: "2024-06-20", end: "2026-12-15", completion: 66 },
  { id: 8, name: "FPSO Conversion Orion", status: "Delayed", budget: 900, spent: 340, start: "2025-04-10", end: "2027-03-31", completion: 32 },
];

const FISCAL_MONTHS = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"] as const;

function defaultTasksFor(project_id: number): Task[] {
  const seed = project_id;
  const base = new Date("2025-01-01").getTime();
  const add = (d: number) => new Date(base + d * 86400000).toISOString();
  return [
    { id: `1-${project_id}`, project_id, name: "FEED", start: add(0 + seed), end: add(30 + seed), progress: 100 },
    { id: `2-${project_id}`, project_id, name: "Detail Design", start: add(35 + seed), end: add(120 + seed), progress: 85 },
    { id: `3-${project_id}`, project_id, name: "Procurement", start: add(60 + seed), end: add(220 + seed), progress: 60 },
    { id: `4-${project_id}`, project_id, name: "Fabrication", start: add(150 + seed), end: add(300 + seed), progress: 40 },
    { id: `5-${project_id}`, project_id, name: "Construction", start: add(220 + seed), end: add(420 + seed), progress: 30 },
    { id: `6-${project_id}`, project_id, name: "Commissioning", start: add(400 + seed), end: add(480 + seed), progress: 10 },
  ];
}

function defaultMilestonesFor(project_id: number): Milestone[] {
  return [
    { project_id, name: "IFC Issued", date: "2025-06-30", status: "Done" },
    { project_id, name: "Long Lead PO", date: "2025-09-15", status: "On Track" },
    { project_id, name: "Mechanical Completion", date: "2026-03-10", status: "At Risk" },
  ];
}

function defaultResourcesFor(project_id: number): Resource[] {
  return [
    { project_id, role: "Engineering", allocation: 72, fte: 48 },
    { project_id, role: "Procurement", allocation: 58, fte: 22 },
    { project_id, role: "Construction", allocation: 64, fte: 120 },
    { project_id, role: "QC / HSE", allocation: 45, fte: 18 },
  ];
}

function defaultSCurveFor(project_id: number, completion: number): SCurvePoint[] {
  const planned = [4,9,15,22,30,40,52,65,77,87,95,100];
  const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));
  const actual = planned.map((p) => clamp(Math.min(p - 2, (p / 100) * completion)));
  actual[11] = clamp(Math.min(planned[11], completion));
  return FISCAL_MONTHS.map((m, i) => ({ project_id, month: m, planned: planned[i], actual: actual[i] }));
}

const PUBLIC_XLSX = path.join(process.cwd(), "public", "data", "projects.xlsx");

function readSheet<T = any>(wb: XLSX.WorkBook, name: string): T[] {
  const sheet = wb.Sheets[name];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet) as T[];
}

export function loadWorkbookOrDefault() {
  try {
    if (fs.existsSync(PUBLIC_XLSX)) {
      const buf = fs.readFileSync(PUBLIC_XLSX);
      const wb = XLSX.read(buf, { type: "buffer" });
      return wb;
    }
  } catch {}

  // Build an in-memory workbook from defaults
  const wb = XLSX.utils.book_new();
  const projectsWS = XLSX.utils.json_to_sheet(DEFAULT_PROJECTS);
  XLSX.utils.book_append_sheet(wb, projectsWS, "Projects");

  const allTasks = DEFAULT_PROJECTS.flatMap((p) => defaultTasksFor(p.id));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allTasks), "Tasks");

  const allMilestones = DEFAULT_PROJECTS.flatMap((p) => defaultMilestonesFor(p.id));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allMilestones), "Milestones");

  const allResources = DEFAULT_PROJECTS.flatMap((p) => defaultResourcesFor(p.id));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allResources), "Resources");

  const allSCurve = DEFAULT_PROJECTS.flatMap((p) => defaultSCurveFor(p.id, p.completion));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allSCurve), "SCurve");

  return wb;
}

// Build a fresh default workbook (without checking for an existing file)
export function buildDefaultWorkbook() {
  const wb = XLSX.utils.book_new();
  const projectsWS = XLSX.utils.json_to_sheet(DEFAULT_PROJECTS);
  XLSX.utils.book_append_sheet(wb, projectsWS, "Projects");

  const allTasks = DEFAULT_PROJECTS.flatMap((p) => defaultTasksFor(p.id));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allTasks), "Tasks");

  const allMilestones = DEFAULT_PROJECTS.flatMap((p) => defaultMilestonesFor(p.id));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allMilestones), "Milestones");

  const allResources = DEFAULT_PROJECTS.flatMap((p) => defaultResourcesFor(p.id));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allResources), "Resources");

  const allSCurve = DEFAULT_PROJECTS.flatMap((p) => defaultSCurveFor(p.id, p.completion));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allSCurve), "SCurve");

  return wb;
}

export function getProjects(): Project[] {
  const wb = loadWorkbookOrDefault();
  const list = readSheet<Project>(wb, "Projects");
  return list;
}

export function getProjectById(id: number): Project | undefined {
  return getProjects().find((p) => p.id === id);
}

export function getTasks(project_id: number): Task[] {
  const wb = loadWorkbookOrDefault();
  const all = readSheet<Task>(wb, "Tasks");
  return all.filter((t) => Number(t.project_id) === Number(project_id));
}

export function getMilestones(project_id: number): Milestone[] {
  const wb = loadWorkbookOrDefault();
  const all = readSheet<Milestone>(wb, "Milestones");
  return all.filter((m) => Number(m.project_id) === Number(project_id));
}

export function getResources(project_id: number): Resource[] {
  const wb = loadWorkbookOrDefault();
  const all = readSheet<Resource>(wb, "Resources");
  return all.filter((r) => Number(r.project_id) === Number(project_id));
}

export function getSCurve(project_id: number): SCurvePoint[] {
  const wb = loadWorkbookOrDefault();
  const all = readSheet<SCurvePoint>(wb, "SCurve");
  let points = all.filter((p) => Number(p.project_id) === Number(project_id));
  if (!points.length) {
    const proj = getProjectById(project_id);
    if (proj) points = defaultSCurveFor(project_id, proj.completion);
  }
  return points;
}