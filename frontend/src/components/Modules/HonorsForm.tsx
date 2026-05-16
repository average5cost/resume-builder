import { useState, useEffect } from 'react';
import { IMEInput } from '../Common/IMEInput';
import type { HonorsAwardsData, HonorEntry } from '../../types/resume';

interface Props { initialData: string; onSave: (data: HonorsAwardsData) => Promise<void>; }

const empty: HonorEntry = { name: '', date: '', issuer: '' };

export default function HonorsForm({ initialData, onSave }: Props) {
  const [entries, setEntries] = useState<HonorEntry[]>([]);

  useEffect(() => {
    try { setEntries(JSON.parse(initialData).entries || []); } catch { /* empty */ }
  }, [initialData]);

  const save = (next: HonorEntry[]) => { setEntries(next); onSave({ entries: next }); };
  const update = (i: number, key: keyof HonorEntry, val: string) => {
    const next = [...entries]; next[i] = { ...next[i], [key]: val }; save(next);
  };
  const add = () => save([...entries, { ...empty }]);
  const remove = (i: number) => save(entries.filter((_, idx) => idx !== i));

  return (
    <div className="form-group">
      {entries.map((e, i) => (
        <div key={i} className="entry-card">
          <div className="entry-header">
            <span>荣誉奖项 #{i + 1}</span>
            <button onClick={() => remove(i)} className="btn-sm btn-danger">删除</button>
          </div>
          <label>奖项名称</label><IMEInput value={e.name} onChange={(v) => update(i, 'name', v)} placeholder="国家奖学金" />
          <label>颁发机构</label><IMEInput value={e.issuer} onChange={(v) => update(i, 'issuer', v)} placeholder="教育部" />
          <label>获得时间</label><IMEInput value={e.date} onChange={(v) => update(i, 'date', v)} placeholder="2023-10" />
        </div>
      ))}
      <button onClick={add} className="btn-add">+ 添加荣誉奖项</button>
    </div>
  );
}
