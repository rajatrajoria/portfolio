import { useEffect, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, Copy, EyeOff, Plus, Trash2 } from 'lucide-react';
import { cx } from '../lib/utils';
import { IconBtn } from './fields';

interface Props<T extends { id: string }> {
  items: T[];
  onChange: (items: T[]) => void;
  title: (t: T) => string;
  subtitle?: (t: T) => ReactNode;
  thumb?: (t: T) => ReactNode;
  muted?: (t: T) => boolean;
  create: () => T;
  duplicate?: (t: T) => T;
  addLabel: string;
  empty?: string;
  children: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
  confirmDelete?: (t: T) => string;
  addMenu?: ReactNode; // optional custom add UI (replaces button)
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
}

/** Two-pane list editor: pick an item on the left, edit it on the right. Stacks on mobile. */
export default function ListDetail<T extends { id: string }>(p: Props<T>) {
  const [localSel, setLocalSel] = useState<string | null>(p.items[0]?.id ?? null);
  const sel = p.selectedId !== undefined ? p.selectedId : localSel;
  const setSel = (id: string | null) => (p.onSelect ? p.onSelect(id) : setLocalSel(id));
  const [mobileEditing, setMobileEditing] = useState(false);
  const current = p.items.find((i) => i.id === sel) ?? null;

  useEffect(() => {
    if (!current && p.items.length && p.selectedId === undefined) setLocalSel(p.items[0].id);
  }, [current, p.items, p.selectedId]);

  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= p.items.length) return;
    const c = [...p.items];
    [c[i], c[j]] = [c[j], c[i]];
    p.onChange(c);
  };
  const add = () => {
    const n = p.create();
    p.onChange([n, ...p.items]);
    setSel(n.id);
    setMobileEditing(true);
  };
  const remove = (t: T) => {
    if (!confirm(p.confirmDelete?.(t) ?? `Delete “${p.title(t) || 'this item'}”? You can still undo by clicking “Discard” before saving.`)) return;
    const rest = p.items.filter((x) => x.id !== t.id);
    p.onChange(rest);
    setSel(rest[0]?.id ?? null);
    setMobileEditing(false);
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
      <div className={cx('space-y-3', mobileEditing && 'hidden lg:block')}>
        {p.addMenu ?? (
          <button onClick={add} className="btn w-full justify-center rounded-xl border border-dashed border-white/15 py-3 text-zinc-300 hover:border-accent/50 hover:text-zinc-50">
            <Plus className="h-4 w-4" /> {p.addLabel}
          </button>
        )}
        {p.items.length === 0 && <p className="py-8 text-center text-sm text-zinc-600">{p.empty ?? 'Nothing here yet.'}</p>}
        <ul className="space-y-1.5">
          {p.items.map((t, i) => (
            <li key={t.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => { setSel(t.id); setMobileEditing(true); }}
                onKeyDown={(e) => e.key === 'Enter' && (setSel(t.id), setMobileEditing(true))}
                className={cx(
                  'group flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 transition',
                  sel === t.id ? 'border-accent/40 bg-accent/[0.08]' : 'border-white/[0.06] bg-ink-900/60 hover:border-white/15',
                )}
              >
                {p.thumb?.(t)}
                <div className={cx('min-w-0 flex-1', p.muted?.(t) && 'opacity-50')}>
                  <p className="flex items-center gap-1.5 truncate text-sm font-medium text-zinc-100">
                    {p.muted?.(t) && <EyeOff className="h-3 w-3 shrink-0" />}
                    <span className="truncate">{p.title(t) || 'Untitled'}</span>
                  </p>
                  {p.subtitle && <p className="truncate text-xs text-zinc-500">{p.subtitle(t)}</p>}
                </div>
                <div className="flex shrink-0 flex-col opacity-100 lg:opacity-0 lg:group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                  <button aria-label="Move up" className="p-0.5 text-zinc-500 hover:text-zinc-100" onClick={() => move(i, -1)}><ArrowUp className="h-3.5 w-3.5" /></button>
                  <button aria-label="Move down" className="p-0.5 text-zinc-500 hover:text-zinc-100" onClick={() => move(i, 1)}><ArrowDown className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className={cx('min-w-0', !mobileEditing && 'hidden lg:block')}>
        {current ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <button className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 lg:hidden" onClick={() => setMobileEditing(false)}>
                <ArrowLeft className="h-4 w-4" /> Back to list
              </button>
              <div className="ml-auto flex gap-1.5">
                {p.duplicate && (
                  <IconBtn label="Duplicate" onClick={() => { const d = p.duplicate!(current); const idx = p.items.indexOf(current); const c = [...p.items]; c.splice(idx + 1, 0, d); p.onChange(c); setSel(d.id); }} className="h-8 w-8 border border-white/10">
                    <Copy className="h-3.5 w-3.5" />
                  </IconBtn>
                )}
                <IconBtn label="Delete" onClick={() => remove(current)} className="h-8 w-8 border border-white/10 hover:!bg-red-500/20 hover:!text-red-300">
                  <Trash2 className="h-3.5 w-3.5" />
                </IconBtn>
              </div>
            </div>
            {p.children(current, (patch) => p.onChange(p.items.map((x) => (x.id === current.id ? { ...x, ...patch } : x))))}
          </div>
        ) : (
          <div className="grid h-64 place-items-center rounded-2xl border border-dashed border-white/10 text-sm text-zinc-600">Select an item to edit</div>
        )}
      </div>
    </div>
  );
}
