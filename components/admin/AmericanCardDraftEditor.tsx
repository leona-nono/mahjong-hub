'use client';

import { useEffect, useState } from 'react';

const SAMPLE = JSON.stringify({ id: 'my-original-card-v1', version: '1.0.0', title: 'My Original Card', difficulty: 'beginner', points: 20, description: 'Product-owned practice card.', status: 'draft', seasonIds: ['foundation-2026'], groups: [{ kind: 'pair', matcher: { type: 'flower' }, label: 'any 2 flowers' }, { kind: 'kong', matcher: { type: 'face', face: 'm1' }, jokerAllowed: true, label: '1111 characters' }, { kind: 'kong', matcher: { type: 'face', face: 'p2' }, jokerAllowed: true, label: '2222 dots' }, { kind: 'quint', matcher: { type: 'face', face: 's3' }, jokerAllowed: true, label: '33333 bams' }, { kind: 'single', matcher: { type: 'face', face: 'z1' }, label: 'East' }] }, null, 2);

export default function AmericanCardDraftEditor() {
  const [value, setValue] = useState(SAMPLE);
  const [result, setResult] = useState<string>('');
  const [drafts, setDrafts] = useState<{ id: string; title: string; status: string; updatedAt: string; [key: string]: unknown }[]>([]);
  const [persistenceAvailable, setPersistenceAvailable] = useState(true);
  useEffect(() => {
    void fetch('/api/admin/american-cards').then(async (response) => {
      if (!response.ok) return;
      const body = await response.json() as { drafts?: { id: string; title: string; status: string; updatedAt: string; [key: string]: unknown }[]; persistenceAvailable?: boolean };
      setDrafts(body.drafts ?? []); setPersistenceAvailable(body.persistenceAvailable !== false);
    }).catch(() => setPersistenceAvailable(false));
  }, []);
  const validate = async () => {
    try {
      const response = await fetch('/api/admin/american-cards', { method: 'POST', headers: { 'content-type': 'application/json' }, body: value });
      const body = await response.json() as { valid?: boolean; errors?: string[]; total?: number; error?: string };
      setResult(body.valid ? `Valid original-card draft · ${body.total} tiles. Persistence is not enabled until review.` : (body.errors ?? [body.error ?? 'Validation failed']).join(' · '));
    } catch { setResult('Unable to validate draft.'); }
  };
  const save = async () => {
    try {
      const draft = JSON.parse(value);
      const response = await fetch('/api/admin/american-cards', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'save', draft }) });
      const body = await response.json() as { saved?: { id: string; title: string; status: string; updatedAt: string; [key: string]: unknown }; errors?: string[]; message?: string };
      if (!response.ok) { setResult((body.errors ?? [body.message ?? 'Unable to save draft.']).join(' · ')); return; }
      if (body.saved) setDrafts((current) => [body.saved!, ...current.filter((item) => item.id !== body.saved!.id)]);
      setResult(`Saved ${body.saved?.id ?? 'draft'} as ${body.saved?.status ?? 'draft'}.`);
    } catch { setResult('Draft must be valid JSON before saving.'); }
  };
  return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h1 className="text-2xl font-black text-slate-900">American Mahjong original-card editor</h1><p className="mt-2 max-w-2xl text-sm text-slate-600">Only original practice cards are accepted. NMJL annual cards and copyrighted card text must not be entered. Saved cards are an editorial catalog: a reviewed release still promotes a card into the playable static season manifest.</p><textarea value={value} onChange={(event) => setValue(event.target.value)} spellCheck={false} className="mt-5 h-96 w-full rounded-xl border border-slate-300 bg-slate-950 p-4 font-mono text-xs text-emerald-100" aria-label="Original American Mahjong card JSON" /><div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={validate} className="rounded-xl bg-emerald-700 px-4 py-2 font-black text-white">Validate draft</button><button type="button" onClick={save} disabled={!persistenceAvailable} className="rounded-xl bg-slate-900 px-4 py-2 font-black text-white disabled:cursor-not-allowed disabled:opacity-40">Save draft</button>{result && <p className="text-sm font-bold text-slate-700">{result}</p>}</div>{!persistenceAvailable && <p className="mt-3 text-sm font-bold text-amber-700">Database migration is not applied yet; validation remains available but saving is disabled.</p>}{drafts.length > 0 && <div className="mt-6 border-t border-slate-200 pt-4"><h2 className="text-sm font-black uppercase tracking-wide text-slate-700">Saved drafts</h2><div className="mt-2 space-y-2">{drafts.map((draft) => <button type="button" key={draft.id} onClick={() => { const { createdAt: _createdAt, updatedAt: _updatedAt, ...editable } = draft; setValue(JSON.stringify(editable, null, 2)); }} className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-left text-sm hover:bg-emerald-50"><span><strong>{draft.title}</strong> <span className="text-slate-500">{draft.id}</span></span><span className="font-bold text-emerald-700">{draft.status}</span></button>)}</div></div>}</section>;
}
