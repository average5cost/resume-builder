import { useState, useEffect } from 'react';
import { IMEInput } from '../Common/IMEInput';
import type { PersonalInfoData } from '../../types/resume';

interface Props {
  initialData: string;
  onSave: (data: PersonalInfoData) => Promise<void>;
}

export default function PersonalInfoForm({ initialData, onSave }: Props) {
  const [form, setForm] = useState<PersonalInfoData>({
    name: '', email: '', phone: '', city: '', job_title: '',
    website: '', github: '', linkedin: '',
  });

  useEffect(() => {
    try { setForm((prev) => ({ ...prev, ...JSON.parse(initialData) })); } catch { /* empty */ }
  }, [initialData]);

  const update = (key: keyof PersonalInfoData, value: string) => {
    const next = { ...form, [key]: value };
    setForm(next);
    onSave(next);
  };

  return (
    <div className="form-group">
      <label>姓名</label><IMEInput value={form.name} onChange={(v) => update('name', v)} placeholder="张三" />
      <label>求职岗位</label><IMEInput value={form.job_title} onChange={(v) => update('job_title', v)} placeholder="前端工程师" />
      <label>邮箱</label><IMEInput value={form.email} onChange={(v) => update('email', v)} placeholder="zhangsan@example.com" />
      <label>电话</label><IMEInput value={form.phone} onChange={(v) => update('phone', v)} placeholder="13800138000" />
      <label>城市</label><IMEInput value={form.city} onChange={(v) => update('city', v)} placeholder="北京" />
      <label>个人网站</label><IMEInput value={form.website} onChange={(v) => update('website', v)} placeholder="https://example.com" />
      <label>GitHub</label><IMEInput value={form.github} onChange={(v) => update('github', v)} placeholder="github.com/zhangsan" />
      <label>LinkedIn</label><IMEInput value={form.linkedin} onChange={(v) => update('linkedin', v)} placeholder="linkedin.com/in/zhangsan" />
    </div>
  );
}
