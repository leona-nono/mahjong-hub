import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { storeGameUpload, validateUploadFile } from '@/lib/admin-upload';
import { validateSlug } from '@/lib/admin-validators';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** POST /api/admin/upload — upload a game screenshot / cover image. */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const form = await req.formData();
  const slug = form.get('slug');
  const file = form.get('file');

  const slugErr = validateSlug(slug);
  if (slugErr) return slugErr;
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file 是必填项' }, { status: 400 });
  }

  const fileErr = validateUploadFile(file);
  if (fileErr) {
    return NextResponse.json({ error: fileErr }, { status: 400 });
  }

  try {
    const url = await storeGameUpload(String(slug), file);
    return NextResponse.json({ url });
  } catch (err) {
    console.error('[admin/upload]', err);
    return NextResponse.json(
      { error: (err as Error).message || '上传失败' },
      { status: 500 }
    );
  }
}
