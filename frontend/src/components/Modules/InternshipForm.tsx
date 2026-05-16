import { useState, useEffect } from 'react';
import { IMEInput, IMETextarea } from '../Common/IMEInput';
import type { InternshipData, InternshipEntry } from '../../types/resume';

interface Props { initialData: string; onSave: (data: InternshipData) => Promise<void>; }

const empty: InternshipEntry = { company: '', position: '', start: '', end: '', description: '' };

export default function InternshipForm({ initialData, onSave }: Props) {
  const [entries, setEntries] = useState<InternshipEntry[]>([]);

  useEffect(() => {
    try { setEntries(JSON.parse(initialData).entries || []); } catch { /* empty */ }
  }, [initialData]);

  const save = (next: InternshipEntry[]) => { setEntries(next); onSave({ entries: next }); };
  const update = (i: number, key: keyof InternshipEntry, val: string) => {
    const next = [...entries]; next[i] = { ...next[i], [key]: val }; save(next);
  };
  const add = () => save([...entries, { ...empty }]);
  const remove = (i: number) => save(entries.filter((_, idx) => idx !== i));

  return (
    <div className="form-group">
      {entries.map((e, i) => (
        <div key={i} className="entry-card">
          <div className="entry-header">
            <span>实习经历 #{i + 1}</span>
            <button onClick={() => remove(i)} className="btn-sm btn-danger">删除</button>
          </div>
          <label>公司</label><IMEInput value={e.company} onChange={(v) => update(i, 'company', v)} placeholder="字节跳动" />
          <label>职位</label><IMEInput value={e.position} onChange={(v) => update(i, 'position', v)} placeholder="前端开发实习生" />
          <label>开始时间</label><IMEInput value={e.start} onChange={(v) => update(i, 'start', v)} placeholder="2023-06" />
          <label>结束时间</label><IMEInput value={e.end} onChange={(v) => update(i, 'end', v)} placeholder="2023-09" />
          <label>工作内容</label><IMETextarea value={e.description} onChange={(v) => update(i, 'description', v)} placeholder="工作内容描述..." rows={3} />
        </div>
      ))}
      <button onClick={add} className="btn-add">+ 添加实习经历</button>
    </div>
  );
}
