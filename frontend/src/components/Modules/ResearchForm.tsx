import { useState, useEffect } from 'react';
import { IMEInput, IMETextarea } from '../Common/IMEInput';
import type { ResearchData, ResearchEntry } from '../../types/resume';

interface Props { initialData: string; onSave: (data: ResearchData) => Promise<void>; }

const empty: ResearchEntry = { title: '', institution: '', role: '', start: '', end: '', description: '' };

export default function ResearchForm({ initialData, onSave }: Props) {
  const [entries, setEntries] = useState<ResearchEntry[]>([]);

  useEffect(() => {
    try { setEntries(JSON.parse(initialData).entries || []); } catch { /* empty */ }
  }, [initialData]);

  const save = (next: ResearchEntry[]) => { setEntries(next); onSave({ entries: next }); };
  const update = (i: number, key: keyof ResearchEntry, val: string) => {
    const next = [...entries]; next[i] = { ...next[i], [key]: val }; save(next);
  };
  const add = () => save([...entries, { ...empty }]);
  const remove = (i: number) => save(entries.filter((_, idx) => idx !== i));

  return (
    <div className="form-group">
      {entries.map((e, i) => (
        <div key={i} className="entry-card">
          <div className="entry-header">
            <span>研究经历 #{i + 1}</span>
            <button onClick={() => remove(i)} className="btn-sm btn-danger">删除</button>
          </div>
          <label>研究课题</label><IMEInput value={e.title} onChange={(v) => update(i, 'title', v)} placeholder="深度学习在NLP中的应用" />
          <label>机构</label><IMEInput value={e.institution} onChange={(v) => update(i, 'institution', v)} placeholder="清华大学AI实验室" />
          <label>角色</label><IMEInput value={e.role} onChange={(v) => update(i, 'role', v)} placeholder="研究助理" />
          <label>开始时间</label><IMEInput value={e.start} onChange={(v) => update(i, 'start', v)} placeholder="2022-09" />
          <label>结束时间</label><IMEInput value={e.end} onChange={(v) => update(i, 'end', v)} placeholder="2023-06" />
          <label>描述</label><IMETextarea value={e.description} onChange={(v) => update(i, 'description', v)} placeholder="研究描述..." rows={3} />
        </div>
      ))}
      <button onClick={add} className="btn-add">+ 添加研究经历</button>
    </div>
  );
}
