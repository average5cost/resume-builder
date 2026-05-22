import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as resumesApi from '../api/resumes';
import * as templatesApi from '../api/templates';
import type { Resume, Module, Template } from '../types/resume';
import ModulePanel from '../components/Editor/ModulePanel';
import ResumePreview from '../components/Editor/ResumePreview';
import ModuleEditor from '../components/Editor/ModuleEditor';
import PDFImport from '../components/Editor/PDFImport';
import { isEmpty, type ParsedResumeData } from '../utils/resumeParser';

export default function EditorPage() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [fontScale, setFontScale] = useState(1.0);
  const [primaryColor, setPrimaryColor] = useState('');
  const [accentColor, setAccentColor] = useState('');
  const [showPDFImport, setShowPDFImport] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [resumeId]);

  const loadData = async () => {
    if (!resumeId) return;
    try {
      const [r, ts] = await Promise.all([
        resumesApi.getResume(Number(resumeId)),
        templatesApi.listTemplates(),
      ]);
      setResume(r);
      setModules(r.modules || []);
      setTemplates(ts);
      setFontScale(r.font_scale ?? 1.0);
      setPrimaryColor(r.primary_color || '');
      setAccentColor(r.accent_color || '');
      const ct = ts.find((t) => t.id === r.template_id) || ts[0];
      setCurrentTemplate(ct);
    } catch {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async (type: string) => {
    if (!resume) return;
    const mod = await resumesApi.createModule(resume.id, type);
    setModules((prev) => [...prev, mod]);
    setSelectedModule(mod);
  };

  const handleDeleteModule = async (modId: number) => {
    await resumesApi.deleteModule(modId);
    setModules((prev) => prev.filter((m) => m.id !== modId));
    if (selectedModule?.id === modId) setSelectedModule(null);
  };

  const handleReorder = useCallback(async (newModules: Module[]) => {
    if (!resume) return;
    setModules(newModules);
    const order = newModules.map((m) => m.id);
    const updated = await resumesApi.reorderModules(resume.id, order);
    setModules(updated);
  }, [resume]);

  const handleUpdateModule = async (modId: number, data: string, visible?: boolean) => {
    const updated = await resumesApi.updateModule(modId, { data, visible });
    setModules((prev) => prev.map((m) => (m.id === modId ? updated : m)));
    setSelectedModule(updated);
  };

  const handleToggleVisible = async (modId: number) => {
    const mod = modules.find((m) => m.id === modId);
    if (!mod) return;
    const updated = await resumesApi.updateModule(modId, { visible: !mod.visible });
    setModules((prev) => prev.map((m) => (m.id === modId ? updated : m)));
  };

  const handleTemplateChange = async (templateId: string) => {
    if (!resume) return;
    await resumesApi.updateResume(resume.id, { template_id: templateId });
    const ct = templates.find((t) => t.id === templateId) || null;
    setCurrentTemplate(ct);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handlePDFData = async (parsed: ParsedResumeData) => {
    if (!resume) return;
    setShowPDFImport(false);

    const moduleTypes: { type: string; data: any }[] = [
      { type: 'personal_info', data: parsed.personal_info },
      { type: 'education', data: parsed.education },
      { type: 'project', data: parsed.project },
      { type: 'research', data: parsed.research },
      { type: 'internship', data: parsed.internship },
      { type: 'skills_certs', data: parsed.skills_certs },
      { type: 'personal_summary', data: parsed.personal_summary },
      { type: 'club_org', data: parsed.club_org },
      { type: 'honors_awards', data: parsed.honors_awards },
    ];

    for (const { type, data } of moduleTypes) {
      if (isEmpty(data)) continue;
      const existing = modules.find((m) => m.type === type);
      if (existing) {
        const updated = await resumesApi.updateModule(existing.id, { data: JSON.stringify(data) });
        setModules((prev) => prev.map((m) => (m.id === existing.id ? updated : m)));
      } else {
        const mod = await resumesApi.createModule(resume.id, type);
        const updated = await resumesApi.updateModule(mod.id, { data: JSON.stringify(data) });
        setModules((prev) => prev.map((m) => (m.id === mod.id ? updated : m)));
      }
    }
  };

  if (loading) return <div className="loading-screen">加载中...</div>;
  if (!resume) return null;

  return (
    <div className="editor-page">
      <header className="editor-header">
        <button onClick={() => navigate('/dashboard')} className="btn-link">&larr; 返回</button>
        <input
          className="resume-title-input"
          value={resume.title}
          onChange={async (e) => {
            setResume({ ...resume, title: e.target.value });
            await resumesApi.updateResume(resume.id, { title: e.target.value });
          }}
        />
        <div className="editor-header-right">
          <select
            value={fontScale}
            onChange={async (e) => {
              const v = parseFloat(e.target.value);
              setFontScale(v);
              await resumesApi.updateResume(resume.id, { font_scale: v });
            }}
            className="template-select"
            title="字体大小"
          >
            <option value={0.75}>小号字体</option>
            <option value={1.0}>标准字体</option>
            <option value={1.25}>大号字体</option>
            <option value={1.5}>特大字体</option>
          </select>
          <input
            type="color"
            value={primaryColor || currentTemplate ? JSON.parse(currentTemplate?.config || '{}').primary || '#2c3e50' : '#2c3e50'}
            onChange={async (e) => {
              setPrimaryColor(e.target.value);
              await resumesApi.updateResume(resume.id, { primary_color: e.target.value });
            }}
            className="color-picker"
            title="主色调"
          />
          <input
            type="color"
            value={accentColor || currentTemplate ? JSON.parse(currentTemplate?.config || '{}').accent || '#2980b9' : '#2980b9'}
            onChange={async (e) => {
              setAccentColor(e.target.value);
              await resumesApi.updateResume(resume.id, { accent_color: e.target.value });
            }}
            className="color-picker"
            title="辅色调"
          />
          <select
            value={resume.template_id}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="template-select"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowPDFImport(true)}
            className="btn-sm"
            style={{ padding: '6px 10px', fontSize: '12px', whiteSpace: 'nowrap' }}
          >
            导入 PDF
          </button>
          <button onClick={handleExportPDF} className="btn-primary">导出 PDF</button>
        </div>
      </header>
      <div className="editor-body">
        <ModulePanel
          modules={modules}
          selectedId={selectedModule?.id || null}
          onSelect={setSelectedModule}
          onAdd={handleAddModule}
          onDelete={handleDeleteModule}
          onToggleVisible={handleToggleVisible}
          onReorder={handleReorder}
        />
        <ResumePreview
          modules={modules}
          template={currentTemplate}
          fontScale={fontScale}
          primaryColor={primaryColor}
          accentColor={accentColor}
        />
        <ModuleEditor
          module={selectedModule}
          onUpdate={handleUpdateModule}
        />
      </div>
      {showPDFImport && (
        <PDFImport
          onDataParsed={handlePDFData}
          onClose={() => setShowPDFImport(false)}
        />
      )}
    </div>
  );
}
