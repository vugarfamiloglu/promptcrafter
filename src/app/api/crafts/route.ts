/* GET /api/crafts — list the most recent crafts (history library) */
import { NextResponse } from 'next/server';
import { listCrafts } from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get('limit') || '100'), 200);
  const rows = listCrafts(limit).map((r) => ({
    id:         r.id,
    kind:       r.kind,
    domain:     r.domain,
    task:       r.task,
    provider:   r.provider,
    model:      r.model,
    starred:    !!r.starred,
    created_at: r.created_at,
    preview:    r.output.length > 200 ? r.output.slice(0, 200) + '…' : r.output,
  }));
  return NextResponse.json({ crafts: rows });
}
