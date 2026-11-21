import { useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Eye, ImagePlus, Loader2, Pencil, Plus, Trash2, Upload, X, Award, FileText, Link2 } from 'lucide-react';
import type { Attachment, MediaItem } from '../lib/types';
import { cx } from '../lib/utils';
import { Markdown } from '../components/ui';
import { useAdmin } from './state';

export function Field({ label, hint, children, className }: { label?: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      {children}
      {hint && <p className="mt-1.5 text-xs text-zinc-600">{hint}</p>}
    </div>
  );
}

export function Text({ label, hint, value, onChange, placeholder, type = 'text', className }: { label?: string; hint?: ReactNode; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <input className="input" type={type} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function Area({ label, hint, value, onChange, rows = 3, placeholder, className, mono }: { label?: string; hint?: ReactNode; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string; className?: string; mono?: boolean }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <textarea className={cx('input resize-y leading-relaxed', mono && 'font-mono text-[13px]')} rows={rows} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function Select<T extends string>({ label, value, options, onChange, className }: { label?: string; value: T; options: readonly (T | { value: T; label: string })[]; onChange: (v: T) => void; className?: string }) {
  return (
    <Field label={label} className={className}>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => {
          const v = typeof o === 'string' ? o : o.value;
          const l = typeof o === 'string' ? o : o.label;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </Field>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx('relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition', checked ? 'bg-accent' : 'bg-ink-600')}
      >
        <span className={cx('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', checked ? 'left-[18px]' : 'left-0.5')} />
      </button>
      <span>
        <span className="block text-sm text-zinc-200">{label}</span>
        {hint && <span className="block text-xs text-zinc-500">{hint}</span>}
      </span>
    </label>
  );
}

export function Month({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <Field label={label} hint={hint}>
      <input type="month" className="input [color-scheme:dark]" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function Tags({ label, value, onChange, placeholder = 'Type and press Enter', hint }: { label?: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string; hint?: string }) {
  const [t, setT] = useState('');
  const add = (raw: string) => {
    const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length) onChange([...value, ...parts.filter((p) => !value.includes(p))]);
    setT('');
  };
  return (
    <Field label={label} hint={hint}>
      <div className="input flex flex-wrap items-center gap-1.5 !py-1.5">
        {value.map((v, i) => (
          <span key={v + i} className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-0.5 text-xs text-zinc-200">
            {v}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-zinc-500 hover:text-zinc-100" aria-label={`Remove ${v}`}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          className="min-w-[8rem] flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-zinc-600"
          value={t}
          placeholder={value.length ? '' : placeholder}
          onChange={(e) => (e.target.value.endsWith(',') ? add(e.target.value) : setT(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(t);
            } else if (e.key === 'Backspace' && !t && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={() => t && add(t)}
        />
      </div>
    </Field>
  );
}

/** Hidden file input + uploading state, returns uploaded URLs. */
function useUploader(folder: string) {
  const { upload } = useAdmin();
  const [busy, setBusy] = useState(false);
  const run = async (files: FileList | File[]) => {
    setBusy(true);
    try {
      const out: string[] = [];
      for (const f of Array.from(files)) out.push(await upload(f, folder));
      return out;
    } finally {
      setBusy(false);
    }
  };
  return { busy, run };
}

export function ImageInput({ label, value, onChange, folder = 'images', hint, aspect = 'aspect-video', accept = 'image/*' }: { label?: string; value: string; onChange: (v: string) => void; folder?: string; hint?: string; aspect?: string; accept?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const { busy, run } = useUploader(folder);
  const [drag, setDrag] = useState(false);
  return (
    <Field label={label} hint={hint}>
      <div
        className={cx('group relative overflow-hidden rounded-xl border border-dashed bg-ink-950 transition', drag ? 'border-accent' : 'border-white/15', aspect)}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={async (e) => {
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files.length) onChange((await run([e.dataTransfer.files[0]]))[0]);
        }}
      >
        {value ? (
          <>
            <img src={value} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition group-hover:opacity-100">
              <button type="button" className="btn-ghost !bg-ink-900 !px-3 !py-1.5 text-xs" onClick={() => ref.current?.click()}>
                <Upload className="h-3.5 w-3.5" /> Replace
              </button>
              <button type="button" className="btn-ghost !bg-ink-900 !px-3 !py-1.5 text-xs" onClick={() => onChange('')}>
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          </>
        ) : (
          <button type="button" onClick={() => ref.current?.click()} className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-xs text-zinc-500 hover:text-zinc-300">
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            {busy ? 'Uploading…' : 'Click or drop an image'}
          </button>
        )}
        {busy && value && <div className="absolute inset-0 grid place-items-center bg-black/60"><Loader2 className="h-5 w-5 animate-spin" /></div>}
      </div>
      <input className="input mt-2 !py-1.5 text-xs" placeholder="…or paste an image URL" value={value?.startsWith('data:') ? '(uploaded image)' : value ?? ''} onChange={(e) => onChange(e.target.value)} />
      <input ref={ref} type="file" accept={accept} hidden onChange={async (e) => { if (e.target.files?.length) onChange((await run(e.target.files))[0]); e.target.value = ''; }} />
    </Field>
  );
}

function move<T>(arr: T[], i: number, d: number) {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const c = [...arr];
  [c[i], c[j]] = [c[j], c[i]];
  return c;
}

export function MediaList({ label, value, onChange, folder = 'gallery', hint }: { label?: string; value: MediaItem[]; onChange: (v: MediaItem[]) => void; folder?: string; hint?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const { busy, run } = useUploader(folder);
  const addFiles = async (files: FileList | File[]) => {
    const urls = await run(files);
    onChange([...value, ...urls.map((url) => ({ url, caption: '' }))]);
  };
  return (
    <Field label={label} hint={hint}>
      <div
        className="rounded-xl border border-dashed border-white/15 bg-ink-950 p-3"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }}
      >
        {value.length > 0 && (
          <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {value.map((m, i) => (
              <div key={m.url + i} className="overflow-hidden rounded-lg border border-white/10 bg-ink-900">
                <div className="group relative aspect-[4/3]">
                  <img src={m.url} alt="" className="h-full w-full object-cover" />
                  <div className="absolute right-1 top-1 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                    <IconBtn label="Move left" onClick={() => onChange(move(value, i, -1))}><ArrowUp className="h-3 w-3 -rotate-90" /></IconBtn>
                    <IconBtn label="Move right" onClick={() => onChange(move(value, i, 1))}><ArrowDown className="h-3 w-3 -rotate-90" /></IconBtn>
                    <IconBtn label="Delete" onClick={() => onChange(value.filter((_, j) => j !== i))}><Trash2 className="h-3 w-3" /></IconBtn>
                  </div>
                </div>
                <input className="w-full bg-transparent px-2 py-1.5 text-xs text-zinc-300 outline-none placeholder:text-zinc-600" placeholder="Caption" value={m.caption ?? ''} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))} />
              </div>
            ))}
          </div>
        )}
        <button type="button" onClick={() => ref.current?.click()} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-xs text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {busy ? 'Uploading…' : 'Add images (select or drop several at once)'}
        </button>
      </div>
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ''; }} />
    </Field>
  );
}

export function Attachments({ value, onChange, folder = 'documents' }: { value: Attachment[]; onChange: (v: Attachment[]) => void; folder?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const { busy, run } = useUploader(folder);
  const set = (i: number, patch: Partial<Attachment>) => onChange(value.map((a, j) => (j === i ? { ...a, ...patch } : a)));
  return (
    <Field label="Certificates, documents & links" hint="Upload certificates (images or PDFs) or paste links. Images open in a lightbox on the site.">
      <div className="space-y-2">
        {value.map((a, i) => {
          const Icon = a.kind === 'certificate' ? Award : a.kind === 'document' ? FileText : Link2;
          return (
            <div key={i} className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-lg border border-white/10 bg-ink-950 p-2 sm:grid-cols-[auto_1fr_1.3fr_auto_auto]">
              <Icon className="mx-1 h-4 w-4 text-accent" />
              <input className="input !py-1.5" placeholder="Label (e.g. Spot Award 2025)" value={a.label} onChange={(e) => set(i, { label: e.target.value })} />
              <input className="input col-span-3 !py-1.5 text-xs sm:col-span-1" placeholder="URL" value={a.url.startsWith('data:') ? '(uploaded file)' : a.url} onChange={(e) => set(i, { url: e.target.value })} />
              <select className="input col-span-2 !py-1.5 sm:col-span-1 sm:w-32" value={a.kind} onChange={(e) => set(i, { kind: e.target.value as Attachment['kind'] })}>
                <option value="certificate">Certificate</option>
                <option value="document">Document</option>
                <option value="link">Link</option>
              </select>
              <IconBtn label="Delete" onClick={() => onChange(value.filter((_, j) => j !== i))}><Trash2 className="h-3.5 w-3.5" /></IconBtn>
            </div>
          );
        })}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-ghost !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => ref.current?.click()}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload files
          </button>
          <button type="button" className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => onChange([...value, { label: '', url: '', kind: 'link' }])}>
            <Plus className="h-3.5 w-3.5" /> Add link
          </button>
        </div>
      </div>
      <input
        ref={ref}
        type="file"
        multiple
        accept="image/*,application/pdf"
        hidden
        onChange={async (e) => {
          const files = e.target.files ? Array.from(e.target.files) : [];
          e.target.value = '';
          if (!files.length) return;
          const urls = await run(files);
          onChange([...value, ...urls.map((url, k) => ({ label: files[k].name.replace(/\.[^.]+$/, ''), url, kind: files[k].type === 'application/pdf' ? ('document' as const) : ('certificate' as const) }))]);
        }}
      />
    </Field>
  );
}

export function IconBtn({ children, onClick, label, className }: { children: ReactNode; onClick: () => void; label: string; className?: string }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} className={cx('grid h-7 w-7 place-items-center rounded-md bg-ink-900/90 text-zinc-400 transition hover:bg-ink-700 hover:text-zinc-100', className)}>
      {children}
    </button>
  );
}

/** Markdown editor with write/preview tabs and inline image upload. */
export function MarkdownField({ label, value, onChange, rows = 12, hint, folder = 'content', verse }: { label?: string; value: string; onChange: (v: string) => void; rows?: number; hint?: ReactNode; folder?: string; verse?: boolean }) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const ta = useRef<HTMLTextAreaElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const { busy, run } = useUploader(folder);
  const insert = (text: string) => {
    const el = ta.current;
    const v = value ?? '';
    if (!el) return onChange(v + text);
    const s = el.selectionStart;
    onChange(v.slice(0, s) + text + v.slice(el.selectionEnd));
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = s + text.length;
    });
  };
  const wrap = (a: string, b = a) => {
    const el = ta.current;
    if (!el) return;
    const v = value ?? '';
    const sel = v.slice(el.selectionStart, el.selectionEnd) || 'text';
    insert(a + sel + b);
  };
  return (
    <Field label={label} hint={hint ?? (verse ? 'Line breaks are preserved exactly as typed.' : 'Markdown supported: **bold**, _italic_, ## headings, - lists, [links](url), > quotes, tables.')}>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-ink-950 focus-within:border-accent/50">
        <div className="flex items-center gap-1 border-b border-white/10 px-2 py-1.5">
          {(['write', 'preview'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={cx('flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs capitalize', tab === t ? 'bg-white/10 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300')}>
              {t === 'write' ? <Pencil className="h-3 w-3" /> : <Eye className="h-3 w-3" />} {t}
            </button>
          ))}
          {tab === 'write' && !verse && (
            <div className="ml-auto flex items-center gap-0.5 text-xs">
              <button type="button" className="rounded px-2 py-1 font-bold text-zinc-500 hover:bg-white/5 hover:text-zinc-200" onClick={() => wrap('**')}>B</button>
              <button type="button" className="rounded px-2 py-1 italic text-zinc-500 hover:bg-white/5 hover:text-zinc-200" onClick={() => wrap('_')}>I</button>
              <button type="button" className="rounded px-2 py-1 text-zinc-500 hover:bg-white/5 hover:text-zinc-200" onClick={() => insert('\n## ')}>H2</button>
              <button type="button" className="rounded px-2 py-1 text-zinc-500 hover:bg-white/5 hover:text-zinc-200" onClick={() => wrap('[', '](https://)')}>Link</button>
              <button type="button" className="flex items-center gap-1 rounded px-2 py-1 text-zinc-500 hover:bg-white/5 hover:text-zinc-200" onClick={() => file.current?.click()} disabled={busy}>
                {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImagePlus className="h-3 w-3" />} Image
              </button>
            </div>
          )}
        </div>
        {tab === 'write' ? (
          <textarea
            ref={ta}
            rows={rows}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={cx('block w-full resize-y bg-transparent px-4 py-3 text-sm leading-relaxed text-zinc-100 outline-none', verse ? 'font-verse text-lg' : 'font-mono text-[13px]')}
          />
        ) : (
          <div className="min-h-[12rem] px-5 py-4">
            {verse ? <div className="whitespace-pre-line font-verse text-lg leading-loose text-zinc-200">{value}</div> : value ? <Markdown>{value}</Markdown> : <p className="text-sm text-zinc-600">Nothing to preview.</p>}
          </div>
        )}
      </div>
      <input ref={file} type="file" accept="image/*" hidden onChange={async (e) => { if (e.target.files?.length) { const [u] = await run(e.target.files); insert(`\n![](${u})\n`); } e.target.value = ''; }} />
    </Field>
  );
}

export function Card({ title, description, children, actions }: { title?: string; description?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-ink-900/60">
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>}
            {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="space-y-5 p-5">{children}</div>
    </section>
  );
}
