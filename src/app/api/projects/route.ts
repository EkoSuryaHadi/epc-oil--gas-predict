import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects } from '@/db/schema';
import { like, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // Validate parameters
    if (isNaN(limit) || isNaN(offset)) {
      return NextResponse.json({ 
        error: "Invalid query parameters",
        code: "INVALID_PARAMETERS" 
      }, { status: 400 });
    }

    let query = db.select().from(projects);

    if (search) {
      query = query.where(like(projects.name, `%${search}%`));
    }

    const results = await query
      .orderBy(desc(projects.createdAt))
      .limit(limit)
      .offset(offset);

    const formattedResults = results.map(project => {
      // Calculate utilization percentage
      const utilizationPct = project.budgetMusd > 0 
        ? Math.round((project.spentMusd / project.budgetMusd) * 100)
        : 0;

      // Format duration text
      const formatMonthYear = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      };

      const startDateFormatted = formatMonthYear(project.startDate);
      const endDateFormatted = formatMonthYear(project.endDate);
      const durationText = `${startDateFormatted} – ${endDateFormatted}`;

      return {
        id: project.id,
        name: project.name,
        status: project.status,
        budgetMusd: project.budgetMusd,
        spentMusd: project.spentMusd,
        startDate: project.startDate,
        endDate: project.endDate,
        completionPct: project.completionPct,
        utilizationPct,
        durationText,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      };
    });

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error('GET projects error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      code: 'DATABASE_ERROR'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      name,
      status,
      budgetMusd,
      spentMusd,
      startDate,
      endDate,
      completionPct
    } = body;

    // Validate required fields
    if (!name || !status || budgetMusd === undefined || spentMusd === undefined || !startDate || !endDate || completionPct === undefined) {
      return NextResponse.json({ 
        error: "Missing required fields",
        code: "MISSING_REQUIRED_FIELDS" 
      }, { status: 400 });
    }

    // Validate field values
    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ 
        error: "Invalid project name",
        code: "INVALID_NAME" 
      }, { status: 400 });
    }

    if (!['On Track', 'At Risk', 'Delayed'].includes(status)) {
      return NextResponse.json({ 
        error: "Invalid status. Must be 'On Track', 'At Risk', or 'Delayed'",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    if (typeof budgetMusd !== 'number' || budgetMusd < 0) {
      return NextResponse.json({ 
        error: "Budget must be a non-negative number",
        code: "INVALID_BUDGET" 
      }, { status: 400 });
    }

    if (typeof spentMusd !== 'number' || spentMusd < 0) {
      return NextResponse.json({ 
        error: "Spent amount must be a non-negative number",
        code: "INVALID_SPENT" 
      }, { status: 400 });
    }

    if (typeof completionPct !== 'number' || completionPct < 0 || completionPct > 100) {
      return NextResponse.json({ 
        error: "Completion percentage must be between 0 and 100",
        code: "INVALID_COMPLETION" 
      }, { status: 400 });
    }

    const now = new Date().toISOString();

    const newProject = await db.insert(projects)
      .values({
        name: name.trim(),
        status,
        budgetMusd,
        spentMusd,
        startDate,
        endDate,
        completionPct,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    const project = newProject[0];
    
    // Calculate utilization percentage
    const utilizationPct = project.budgetMusd > 0 
      ? Math.round((project.spentMusd / project.budgetMusd) * 100)
      : 0;

    // Format duration text
    const formatMonthYear = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const startDateFormatted = formatMonthYear(project.startDate);
    const endDateFormatted = formatMonthYear(project.endDate);
    const durationText = `${startDateFormatted} – ${endDateFormatted}`;

    const responseProject = {
      id: project.id,
      name: project.name,
      status: project.status,
      budgetMusd: project.budgetMusd,
      spentMusd: project.spentMusd,
      startDate: project.startDate,
      endDate: project.endDate,
      completionPct: project.completionPct,
      utilizationPct,
      durationText,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    };

    return NextResponse.json(responseProject, { status: 201 });
  } catch (error) {
    console.error('POST projects error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      code: 'DATABASE_ERROR'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid project ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();
    const updates: any = {};
    
    // Validate and prepare updates
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return NextResponse.json({ 
          error: "Invalid project name",
          code: "INVALID_NAME" 
        }, { status: 400 });
      }
      updates.name = body.name.trim();
    }

    if (body.status !== undefined) {
      if (!['On Track', 'At Risk', 'Delayed'].includes(body.status)) {
        return NextResponse.json({ 
          error: "Invalid status. Must be 'On Track', 'At Risk', or 'Delayed'",
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }
      updates.status = body.status;
    }

    if (body.budgetMusd !== undefined) {
      if (typeof body.budgetMusd !== 'number' || body.budgetMusd < 0) {
        return NextResponse.json({ 
          error: "Budget must be a non-negative number",
          code: "INVALID_BUDGET" 
        }, { status: 400 });
      }
      updates.budgetMusd = body.budgetMusd;
    }

    if (body.spentMusd !== undefined) {
      if (typeof body.spentMusd !== 'number' || body.spentMusd < 0) {
        return NextResponse.json({ 
          error: "Spent amount must be a non-negative number",
          code: "INVALID_SPENT" 
        }, { status: 400 });
      }
      updates.spentMusd = body.spentMusd;
    }

    if (body.startDate !== undefined) {
      updates.startDate = body.startDate;
    }

    if (body.endDate !== undefined) {
      updates.endDate = body.endDate;
    }

    if (body.completionPct !== undefined) {
      if (typeof body.completionPct !== 'number' || body.completionPct < 0 || body.completionPct > 100) {
        return NextResponse.json({ 
          error: "Completion percentage must be between 0 and 100",
          code: "INVALID_COMPLETION" 
        }, { status: 400 });
      }
      updates.completionPct = body.completionPct;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        error: "No valid fields to update",
        code: "NO_FIELDS_TO_UPDATE" 
      }, { status: 400 });
    }

    updates.updatedAt = new Date().toISOString();

    const updated = await db.update(projects)
      .set(updates)
      .where(eq(projects.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: "Project not found",
        code: "PROJECT_NOT_FOUND" 
      }, { status: 404 });
    }

    const project = updated[0];
    
    // Calculate utilization percentage
    const utilizationPct = project.budgetMusd > 0 
      ? Math.round((project.spentMusd / project.budgetMusd) * 100)
      : 0;

    // Format duration text
    const formatMonthYear = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const startDateFormatted = formatMonthYear(project.startDate);
    const endDateFormatted = formatMonthYear(project.endDate);
    const durationText = `${startDateFormatted} – ${endDateFormatted}`;

    const responseProject = {
      id: project.id,
      name: project.name,
      status: project.status,
      budgetMusd: project.budgetMusd,
      spentMusd: project.spentMusd,
      startDate: project.startDate,
      endDate: project.endDate,
      completionPct: project.completionPct,
      utilizationPct,
      durationText,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    };

    return NextResponse.json(responseProject);
  } catch (error) {
    console.error('PUT projects error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      code: 'DATABASE_ERROR'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid project ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const deleted = await db.delete(projects)
      .where(eq(projects.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: "Project not found",
        code: "PROJECT_NOT_FOUND" 
      }, { status: 404 });
    }

    const project = deleted[0];
    
    // Calculate utilization percentage
    const utilizationPct = project.budgetMusd > 0 
      ? Math.round((project.spentMusd / project.budgetMusd) * 100)
      : 0;

    // Format duration text
    const formatMonthYear = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const startDateFormatted = formatMonthYear(project.startDate);
    const endDateFormatted = formatMonthYear(project.endDate);
    const durationText = `${startDateFormatted} – ${endDateFormatted}`;

    const responseProject = {
      id: project.id,
      name: project.name,
      status: project.status,
      budgetMusd: project.budgetMusd,
      spentMusd: project.spentMusd,
      startDate: project.startDate,
      endDate: project.endDate,
      completionPct: project.completionPct,
      utilizationPct,
      durationText,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    };

    return NextResponse.json({ 
      message: "Project deleted successfully",
      deleted: responseProject 
    });
  } catch (error) {
    console.error('DELETE projects error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      code: 'DATABASE_ERROR'
    }, { status: 500 });
  }
}