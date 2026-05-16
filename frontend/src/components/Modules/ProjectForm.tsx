import { useState, useEffect } from 'react';
import { IMEInput, IMETextarea } from '../Common/IMEInput';
import type { ProjectData, ProjectEntry } from '../../types/resume';

interface Props { initialData: string; onSave: (data: ProjectData) => Promise<void>; }

const empty: ProjectEntry = { name: '', role: '', start: '', end: '', description: '', link: '' };

export default function ProjectForm({ initialData, onSave }: Props) {
  const [entries, setEntries] = useState<ProjectEntry[]>([]);

  useEffect(() => {
    try { setEntries(JSON.parse(initialData).entries || []); } catch { /* empty */ }
  }, [initialData]);

  const save = (next: ProjectEntry[]) => { setEntries(next); onSave({ entries: next }); };
  const update = (i: number, key: keyof ProjectEntry, val: string) => {
    const next = [...entries]; next[i] = { ...next[i], [key]: val }; save(next);
  };
  const add = () => save([...entries, { ...empty }]);
  const remove = (i: number) => save(entries.filter((_, idx) => idx !== i));

  return (
    <div className="form-group">
      {entries.map((e, i) => (
        <div key={i} className="entry-card">
          <div className="entry-header">
            <span>项目经历 #{i + 1}</span>
            <button onClick={() => remove(i)} className="btn-sm btn-danger">删除</button>
          </div>
          <label>项目名称</label><IMEInput value={e.name} onChange={(v) => update(i, 'name', v)} placeholder="电商平台" />
          <label>角色</label><IMEInput value={e.role} onChange={(v) => update(i, 'role', v)} placeholder="前端负责人" />
          <label>开始时间</label><IMEInput value={e.start} onChange={(v) => update(i, 'start', v)} placeholder="2023-03" />
          <label>结束时间</label><IMEInput value={e.end} onChange={(v) => update(i, 'end', v)} placeholder="2023-12" />
          <label>描述</label><IMETextarea value={e.description} onChange={(v) => update(i, 'description', v)} placeholder="项目描述..." rows={3} />
          <label>链接</label><IMEInput value={e.link} onChange={(v) => update(i, 'link', v)} placeholder="https://github.com/..." />
        </div>
      ))}
      <button onClick={add} className="btn-add">+ 添加项目经历</button>
    </div>
  );
}
