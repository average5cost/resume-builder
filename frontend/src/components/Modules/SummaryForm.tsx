import { useState, useEffect } from 'react';
import { IMETextarea } from '../Common/IMEInput';
import type { PersonalSummaryData } from '../../types/resume';

interface Props { initialData: string; onSave: (data: PersonalSummaryData) => Promise<void>; }

export default function SummaryForm({ initialData, onSave }: Props) {
  const [content, setContent] = useState('');

  useEffect(() => {
    try { setContent(JSON.parse(initialData).content || ''); } catch { /* empty */ }
  }, [initialData]);

  return (
    <div className="form-group">
      <label>个人总结</label>
      <IMETextarea
        value={content}
        onChange={(v) => { setContent(v); onSave({ content: v }); }}
        placeholder="写一段简短的自我介绍和职业目标..."
        rows={6}
      />
    </div>
  );
}
