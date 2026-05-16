import type { Module, Template } from '../../types/resume';
import type {
  PersonalInfoData, EducationData, ProjectData, ResearchData,
  InternshipData, SkillsCertsData, PersonalSummaryData, ClubOrgData, HonorsAwardsData,
} from '../../types/resume';

interface Props {
  modules: Module[];
  template: Template | null;
  fontScale?: number;
  primaryColor?: string;
  accentColor?: string;
}

function safeParse<T extends object>(data: string, fallback: T): T {
  try {
    const parsed = JSON.parse(data);
    if (typeof parsed === 'object' && parsed !== null) {
      return { ...fallback, ...parsed };
    }
    return fallback;
  } catch {
    return fallback;
  }
}

function PersonalInfoRenderer({ data }: { data: string }) {
  const d = safeParse<PersonalInfoData>(data, { name: '', email: '', phone: '', city: '', job_title: '', website: '', github: '', linkedin: '' });
  if (!d.name && !d.email) return <p className="empty-hint">点击右侧编辑个人信息</p>;
  return (
    <div className="section personal-info">
      <h1 className="resume-name">{d.name || '姓名'}</h1>
      {d.job_title && <p className="resume-job-title">{d.job_title}</p>}
      <div className="contact-row">
        {d.email && <span>{d.email}</span>}
        {d.phone && <span>{d.phone}</span>}
        {d.city && <span>{d.city}</span>}
      </div>
      {(d.website || d.github || d.linkedin) && (
        <div className="contact-row">
          {d.website && <span>{d.website}</span>}
          {d.github && <span>{d.github}</span>}
          {d.linkedin && <span>{d.linkedin}</span>}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <div className="section-header"><h2>{title}</h2></div>;
}

function EducationRenderer({ data }: { data: string }) {
  const d = safeParse<EducationData>(data, { entries: [] });
  if (!d.entries.length) return <p className="empty-hint">暂无教育经历</p>;
  return (
    <div className="section">
      <SectionHeader title="教育经历" />
      {d.entries.map((e, i) => (
        <div key={i} className="entry">
          <div className="entry-title-row">
            <strong>{e.school}</strong>
            <span className="date">{e.start} - {e.end}</span>
          </div>
          <div className="entry-subtitle">{e.degree} · {e.major}{e.gpa ? ` · GPA ${e.gpa}` : ''}</div>
        </div>
      ))}
    </div>
  );
}

function ProjectRenderer({ data }: { data: string }) {
  const d = safeParse<ProjectData>(data, { entries: [] });
  if (!d.entries.length) return <p className="empty-hint">暂无项目经历</p>;
  return (
    <div className="section">
      <SectionHeader title="项目经历" />
      {d.entries.map((e, i) => (
        <div key={i} className="entry">
          <div className="entry-title-row">
            <strong>{e.name}</strong>
            <span className="date">{e.start} - {e.end}</span>
          </div>
          <div className="entry-subtitle">{e.role}</div>
          {e.description && <p className="entry-desc">{e.description}</p>}
          {e.link && <a href={e.link} className="entry-link" target="_blank" rel="noopener">{e.link}</a>}
        </div>
      ))}
    </div>
  );
}

function ResearchRenderer({ data }: { data: string }) {
  const d = safeParse<ResearchData>(data, { entries: [] });
  if (!d.entries.length) return <p className="empty-hint">暂无研究经历</p>;
  return (
    <div className="section">
      <SectionHeader title="研究经历" />
      {d.entries.map((e, i) => (
        <div key={i} className="entry">
          <div className="entry-title-row">
            <strong>{e.title}</strong>
            <span className="date">{e.start} - {e.end}</span>
          </div>
          <div className="entry-subtitle">{e.institution} · {e.role}</div>
          {e.description && <p className="entry-desc">{e.description}</p>}
        </div>
      ))}
    </div>
  );
}

function InternshipRenderer({ data }: { data: string }) {
  const d = safeParse<InternshipData>(data, { entries: [] });
  if (!d.entries.length) return <p className="empty-hint">暂无实习经历</p>;
  return (
    <div className="section">
      <SectionHeader title="实习经历" />
      {d.entries.map((e, i) => (
        <div key={i} className="entry">
          <div className="entry-title-row">
            <strong>{e.company}</strong>
            <span className="date">{e.start} - {e.end}</span>
          </div>
          <div className="entry-subtitle">{e.position}</div>
          {e.description && <p className="entry-desc">{e.description}</p>}
        </div>
      ))}
    </div>
  );
}

function SkillsRenderer({ data }: { data: string }) {
  const d = safeParse<SkillsCertsData>(data, { skills: [], certificates: [], languages: [] });
  const hasContent = d.skills.length > 0 || d.certificates.length > 0 || d.languages.length > 0;
  if (!hasContent) return <p className="empty-hint">暂无技能证书</p>;
  return (
    <div className="section">
      <SectionHeader title="技能证书" />
      {d.skills.length > 0 && (
        <div className="skills-row">
          <strong>技能：</strong>
          {d.skills.join('、')}
        </div>
      )}
      {d.certificates.length > 0 && (
        <div className="skills-row">
          <strong>证书：</strong>
          {d.certificates.map((c, i) => <span key={i}>{c.name}{c.date ? ` (${c.date})` : ''}{i < d.certificates.length - 1 ? '、' : ''}</span>)}
        </div>
      )}
      {d.languages.length > 0 && (
        <div className="skills-row">
          <strong>语言：</strong>
          {d.languages.map((l, i) => <span key={i}>{l.name} - {l.level}{i < d.languages.length - 1 ? '、' : ''}</span>)}
        </div>
      )}
    </div>
  );
}

function SummaryRenderer({ data }: { data: string }) {
  const d = safeParse<PersonalSummaryData>(data, { content: '' });
  if (!d.content) return <p className="empty-hint">暂无个人总结</p>;
  return (
    <div className="section">
      <SectionHeader title="个人总结" />
      <p className="entry-desc">{d.content}</p>
    </div>
  );
}

function ClubRenderer({ data }: { data: string }) {
  const d = safeParse<ClubOrgData>(data, { entries: [] });
  if (!d.entries.length) return <p className="empty-hint">暂无社团经历</p>;
  return (
    <div className="section">
      <SectionHeader title="社团经历" />
      {d.entries.map((e, i) => (
        <div key={i} className="entry">
          <div className="entry-title-row">
            <strong>{e.name}</strong>
            <span className="date">{e.start} - {e.end}</span>
          </div>
          <div className="entry-subtitle">{e.role}</div>
          {e.description && <p className="entry-desc">{e.description}</p>}
        </div>
      ))}
    </div>
  );
}

function HonorsRenderer({ data }: { data: string }) {
  const d = safeParse<HonorsAwardsData>(data, { entries: [] });
  if (!d.entries.length) return <p className="empty-hint">暂无荣誉奖项</p>;
  return (
    <div className="section">
      <SectionHeader title="荣誉奖项" />
      {d.entries.map((e, i) => (
        <div key={i} className="entry">
          <div className="entry-title-row">
            <strong>{e.name}</strong>
            <span className="date">{e.date}</span>
          </div>
          {e.issuer && <div className="entry-subtitle">{e.issuer}</div>}
        </div>
      ))}
    </div>
  );
}

function renderModule(m: Module) {
  switch (m.type) {
    case 'personal_info': return <PersonalInfoRenderer key={m.id} data={m.data} />;
    case 'education': return <EducationRenderer key={m.id} data={m.data} />;
    case 'project': return <ProjectRenderer key={m.id} data={m.data} />;
    case 'research': return <ResearchRenderer key={m.id} data={m.data} />;
    case 'internship': return <InternshipRenderer key={m.id} data={m.data} />;
    case 'skills_certs': return <SkillsRenderer key={m.id} data={m.data} />;
    case 'personal_summary': return <SummaryRenderer key={m.id} data={m.data} />;
    case 'club_org': return <ClubRenderer key={m.id} data={m.data} />;
    case 'honors_awards': return <HonorsRenderer key={m.id} data={m.data} />;
    default: return null;
  }
}

export default function ResumeRenderer({ modules, template, fontScale, primaryColor, accentColor }: Props) {
  if (!modules.length) {
    return <div className="resume-empty">从左侧添加模块开始制作简历</div>;
  }

  const config = template ? safeParse<Record<string, string>>(template.config, {}) : {};
  const style = {
    '--primary': primaryColor || config.primary || '#2c3e50',
    '--accent': accentColor || config.accent || '#2980b9',
    '--bg': config.bg || '#ffffff',
    '--text': config.text || '#333333',
    '--font-heading': config.fontHeading || 'Georgia, serif',
    '--font-body': config.fontBody || 'Microsoft YaHei, sans-serif',
    '--font-scale': String(fontScale ?? 1),
  } as React.CSSProperties;

  return (
    <div className="resume-document" style={style}>
      {modules.map(renderModule)}
    </div>
  );
}
