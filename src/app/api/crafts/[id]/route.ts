/* GET /api/crafts/:id      — fetch one craft (full output)
 * PATCH /api/crafts/:id    — { starred?: boolean }
 * DELETE /api/crafts/:id   — remove */
import { NextResponse } from 'next/server';
import { deleteCraft, getCraft, setCraftStar } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = getCraft(id);
  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({
    id: row.id, kind: row.kind, domain: row.domain, task: row.task,
    output: row.output, usage: row.guidance,
    provider: row.provider, model: row.model,
    starred: !!row.starred, created_at: row.created_at,
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (typeof body.starred === 'boolean') setCraftStar(id, body.starred);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getCraft(id)) return NextResponse.json({ error: 'not found' }, { status: 404 });
  deleteCraft(id);
  return NextResponse.json({ ok: true });
}
