/* DELETE /api/providers/:id — remove a stored key
 * PATCH  /api/providers/:id — mark as default for its provider */
import { NextResponse } from 'next/server';
import { deleteProviderKey, getProviderKey, setDefaultProviderKey } from '@/lib/db';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getProviderKey(id)) return NextResponse.json({ error: 'not found' }, { status: 404 });
  deleteProviderKey(id);
  return NextResponse.json({ ok: true });
}

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getProviderKey(id)) return NextResponse.json({ error: 'not found' }, { status: 404 });
  setDefaultProviderKey(id);
  return NextResponse.json({ ok: true });
}
