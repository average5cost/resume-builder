import { useState, useEffect } from 'react';
import { IMEInput, IMETextarea } from '../Common/IMEInput';
import type { ClubOrgData, ClubEntry } from '../../types/resume';

interface Props { initialData: string; onSave: (data: ClubOrgData) => Promise<void>; }

const empty: ClubEntry = { name: '', role: '', start: '', end: '', description: '' };

export default function ClubForm({ initialData, onSave }: Props) {
  const [entries, setEntries] = useState<ClubEntry[]>([]);

  useEffect(() => {
    try { setEntries(JSON.parse(initialData).entries || []); } catch { /* empty */ }
  }, [initialData]);

  const save = (next: ClubEntry[]) => { setEntries(next); onSave({ entries: next }); };
  const update = (i: number, key: keyof ClubEntry, val: string) => {
    const next = [...entries]; next[i] = { ...next[i], [key]: val }; save(next);
  };
  const add = () => save([...entries, { ...empty }]);
  const remove = (i: number) => save(entries.filter((_, idx) => idx !== i));

  return (
    <div className="form-group">
      {entries.map((e, i) => (
        <div key={i} className="entry-card">
          <div className="entry-header">
            <span>社团经历 #{i + 1}</span>
            <button onClick={() => remove(i)} className="btn-sm btn-danger">删除</button>
          </div>
          <label>社团/组织</label><IMEInput value={e.name} onChange={(v) => update(i, 'name', v)} placeholder="学生会" />
          <label>角色</label><IMEInput value={e.role} onChange={(v) => update(i, 'role', v)} placeholder="宣传部部长" />
          <label>开始时间</label><IMEInput value={e.start} onChange={(v) => update(i, 'start', v)} placeholder="2021-09" />
          <label>结束时间</label><IMEInput value={e.end} onChange={(v) => update(i, 'end', v)} placeholder="2023-06" />
          <label>描述</label><IMETextarea value={e.description} onChange={(v) => update(i, 'description', v)} placeholder="负责的工作和成果..." rows={3} />
        </div>
      ))}
      <button onClick={add} className="btn-add">+ 添加社团经历</button>
    </div>
  );
}
