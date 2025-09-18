import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { buildDefaultWorkbook } from "@/lib/excel";

export async function GET() {
  try {
    const wb = buildDefaultWorkbook();
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "buffer" }) as Buffer;

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="projects-template.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to generate template" }, { status: 500 });
  }
}