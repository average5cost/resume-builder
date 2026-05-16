import { useState, useEffect } from 'react';
import { IMEInput } from '../Common/IMEInput';
import type { SkillsCertsData, CertificateEntry, LanguageEntry } from '../../types/resume';

interface Props { initialData: string; onSave: (data: SkillsCertsData) => Promise<void>; }

export default function SkillsForm({ initialData, onSave }: Props) {
  const [skills, setSkills] = useState<string[]>([]);
  const [certificates, setCertificates] = useState<CertificateEntry[]>([]);
  const [languages, setLanguages] = useState<LanguageEntry[]>([]);

  useEffect(() => {
    try {
      const d = JSON.parse(initialData);
      if (d.skills) setSkills(d.skills);
      if (d.certificates) setCertificates(d.certificates);
      if (d.languages) setLanguages(d.languages);
    } catch { /* empty */ }
  }, [initialData]);

  const save = (s: string[], c: CertificateEntry[], l: LanguageEntry[]) => {
    setSkills(s); setCertificates(c); setLanguages(l);
    onSave({ skills: s, certificates: c, languages: l });
  };

  return (
    <div className="form-group">
      <label>技能（逗号分隔）</label>
      <input
        value={skills.join(', ')}
        onChange={(e) => {
          const arr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
          save(arr, certificates, languages);
        }}
        placeholder="React, TypeScript, Go, Python"
      />

      <h4>证书</h4>
      {certificates.map((c, i) => (
        <div key={i} className="entry-card">
          <div className="entry-header">
            <span>证书 #{i + 1}</span>
            <button onClick={() => save(skills, certificates.filter((_, idx) => idx !== i), languages)} className="btn-sm btn-danger">删除</button>
          </div>
          <label>证书名称</label><IMEInput value={c.name} onChange={(v) => {
            const next = [...certificates]; next[i] = { ...next[i], name: v }; save(skills, next, languages);
          }} placeholder="CET-6" />
          <label>获得时间</label><IMEInput value={c.date} onChange={(v) => {
            const next = [...certificates]; next[i] = { ...next[i], date: v }; save(skills, next, languages);
          }} placeholder="2023-06" />
        </div>
      ))}
      <button onClick={() => save(skills, [...certificates, { name: '', date: '' }], languages)} className="btn-add">+ 添加证书</button>

      <h4>语言能力</h4>
      {languages.map((l, i) => (
        <div key={i} className="entry-card">
          <div className="entry-header">
            <span>语言 #{i + 1}</span>
            <button onClick={() => save(skills, certificates, languages.filter((_, idx) => idx !== i))} className="btn-sm btn-danger">删除</button>
          </div>
          <label>语言</label><IMEInput value={l.name} onChange={(v) => {
            const next = [...languages]; next[i] = { ...next[i], name: v }; save(skills, certificates, next);
          }} placeholder="英语" />
          <label>水平</label><IMEInput value={l.level} onChange={(v) => {
            const next = [...languages]; next[i] = { ...next[i], level: v }; save(skills, certificates, next);
          }} placeholder="CET-6 / 流利" />
        </div>
      ))}
      <button onClick={() => save(skills, certificates, [...languages, { name: '', level: '' }])} className="btn-add">+ 添加语言</button>
    </div>
  );
}
