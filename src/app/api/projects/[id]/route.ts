import { NextResponse } from "next/server";
import { getProjectById, getTasks, getMilestones, getResources, getSCurve } from "@/lib/excel";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const idNum = Number(params.id);
  if (!params.id || Number.isNaN(idNum)) {
    return NextResponse.json({ error: "Valid project ID is required", code: "INVALID_ID" }, { status: 400 });
  }

  try {
    const project = getProjectById(idNum);
    if (!project) {
      return NextResponse.json({ error: "Project not found", code: "PROJECT_NOT_FOUND" }, { status: 404 });
    }

    const [tasks, milestones, resources, sCurve] = [
      getTasks(idNum),
      getMilestones(idNum),
      getResources(idNum),
      getSCurve(idNum),
    ];

    return NextResponse.json({ project, tasks, milestones, resources, sCurve });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}