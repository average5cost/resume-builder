import { useState, useEffect } from 'react';
import { IMEInput } from '../Common/IMEInput';
import type { EducationData, EducationEntry } from '../../types/resume';

interface Props {
  initialData: string;
  onSave: (data: EducationData) => Promise<void>;
}

const emptyEntry: EducationEntry = { school: '', degree: '', major: '', start: '', end: '', gpa: '' };

export default function EducationForm({ initialData, onSave }: Props) {
  const [entries, setEntries] = useState<EducationEntry[]>([]);

  useEffect(() => {
    try { setEntries(JSON.parse(initialData).entries || []); } catch { /* empty */ }
  }, [initialData]);

  const save = (next: EducationEntry[]) => { setEntries(next); onSave({ entries: next }); };

  const update = (i: number, key: keyof EducationEntry, val: string) => {
    const next = [...entries];
    next[i] = { ...next[i], [key]: val };
    save(next);
  };

  const add = () => save([...entries, { ...emptyEntry }]);
  const remove = (i: number) => save(entries.filter((_, idx) => idx !== i));

  return (
    <div className="form-group">
      {entries.map((e, i) => (
        <div key={i} className="entry-card">
          <div className="entry-header">
            <span>教育经历 #{i + 1}</span>
            <button onClick={() => remove(i)} className="btn-sm btn-danger">删除</button>
          </div>
          <label>学校</label><IMEInput value={e.school} onChange={(v) => update(i, 'school', v)} placeholder="清华大学" />
          <label>学位</label><IMEInput value={e.degree} onChange={(v) => update(i, 'degree', v)} placeholder="本科" />
          <label>专业</label><IMEInput value={e.major} onChange={(v) => update(i, 'major', v)} placeholder="计算机科学与技术" />
          <label>开始时间</label><IMEInput value={e.start} onChange={(v) => update(i, 'start', v)} placeholder="2020-09" />
          <label>结束时间</label><IMEInput value={e.end} onChange={(v) => update(i, 'end', v)} placeholder="2024-06" />
          <label>GPA</label><IMEInput value={e.gpa} onChange={(v) => update(i, 'gpa', v)} placeholder="3.8/4.0" />
        </div>
      ))}
      <button onClick={add} className="btn-add">+ 添加教育经历</button>
    </div>
  );
}
