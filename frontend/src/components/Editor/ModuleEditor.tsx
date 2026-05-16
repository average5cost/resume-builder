import type { Module, ModuleType } from '../../types/resume';
import { MODULE_LABELS } from '../../types/resume';
import PersonalInfoForm from '../Modules/PersonalInfoForm';
import EducationForm from '../Modules/EducationForm';
import ProjectForm from '../Modules/ProjectForm';
import ResearchForm from '../Modules/ResearchForm';
import InternshipForm from '../Modules/InternshipForm';
import SkillsForm from '../Modules/SkillsForm';
import SummaryForm from '../Modules/SummaryForm';
import ClubForm from '../Modules/ClubForm';
import HonorsForm from '../Modules/HonorsForm';

interface Props {
  module: Module | null;
  onUpdate: (modId: number, data: string) => Promise<void>;
}

export default function ModuleEditor({ module: mod, onUpdate }: Props) {
  if (!mod) {
    return (
      <aside className="module-editor">
        <div className="editor-empty">
          <p>选择一个模块开始编辑</p>
        </div>
      </aside>
    );
  }

  const label = MODULE_LABELS[mod.type as ModuleType] || mod.type;

  const handleSave = async (data: unknown) => {
    await onUpdate(mod.id, JSON.stringify(data));
  };

  const renderForm = () => {
    const props = { initialData: mod.data, onSave: handleSave };
    switch (mod.type) {
      case 'personal_info': return <PersonalInfoForm {...props} />;
      case 'education': return <EducationForm {...props} />;
      case 'project': return <ProjectForm {...props} />;
      case 'research': return <ResearchForm {...props} />;
      case 'internship': return <InternshipForm {...props} />;
      case 'skills_certs': return <SkillsForm {...props} />;
      case 'personal_summary': return <SummaryForm {...props} />;
      case 'club_org': return <ClubForm {...props} />;
      case 'honors_awards': return <HonorsForm {...props} />;
      default: return <p>未知模块类型</p>;
    }
  };

  return (
    <aside className="module-editor">
      <h3>编辑：{label}</h3>
      {renderForm()}
    </aside>
  );
}
