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

function DescriptionList({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split('\n').filter((l) => l.trim());
  if (lines.length === 0) return null;
  return (
    <ul className="entry-desc-list">
      {lines.map((line, i) => (
        <li key={i} data-desc-item>{line.trim()}</li>
      ))}
    </ul>
  );
}

function PersonalInfoRenderer({ data }: { data: string }) {
  const d = safeParse<PersonalInfoData>(data, { name: '', email: '', phone: '', city: '', job_title: '', website: '', github: '', linkedin: '' });
  if (!d.name && !d.email) return null;

  const contactItems = [d.email, d.phone, d.city, d.website, d.github, d.linkedin].filter(Boolean);

  return (
    <div className="section personal-info" data-section="personal_info">
      <h1 className="resume-name" data-name>{d.name || '姓名'}</h1>
      {d.job_title && <p className="resume-job-title" data-job-title>{d.job_title}</p>}
      {contactItems.length > 0 && (
        <div className="contact-row" data-contact>
          {contactItems.map((item, i) => (
            <span key={i}>
              {item}
              {i < contactItems.length - 1 && <span className="contact-sep">|</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="section-header" data-section-header>
      <h2>{title}</h2>
    </div>
  );
}

function EducationRenderer({ data, continuation }: { data: string; continuation?: boolean }) {
  const d = safeParse<EducationData>(data, { entries: [] });
  if (!d.entries.length) return null;
  return (
    <div className="section" data-section>
      {!continuation && <SectionHeader title="教育经历" />}
      {d.entries.map((e, i) => (
        <div key={i} className="entry" data-entry>
          {!e._continuation && (
            <>
              <div className="entry-title-row" data-entry-title>
                <strong>{e.school}</strong>
                <span className="date">{e.start} - {e.end}</span>
              </div>
              <div className="entry-subtitle" data-entry-subtitle>{e.degree}{e.major ? ` · ${e.major}` : ''}{e.gpa ? ` · GPA ${e.gpa}` : ''}</div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function ProjectRenderer({ data, continuation }: { data: string; continuation?: boolean }) {
  const d = safeParse<ProjectData>(data, { entries: [] });
  if (!d.entries.length) return null;
  return (
    <div className="section" data-section>
      {!continuation && <SectionHeader title="项目经历" />}
      {d.entries.map((e, i) => (
        <div key={i} className="entry" data-entry>
          {!e._continuation && (
            <>
              <div className="entry-title-row" data-entry-title>
                <strong>{e.name}</strong>
                <span className="date">{e.start} - {e.end}</span>
              </div>
              {e.role && <div className="entry-subtitle" data-entry-subtitle>{e.role}</div>}
            </>
          )}
          <DescriptionList text={e.description} />
          {e.link && <a href={e.link} className="entry-link" target="_blank" rel="noopener">{e.link}</a>}
        </div>
      ))}
    </div>
  );
}

function ResearchRenderer({ data, continuation }: { data: string; continuation?: boolean }) {
  const d = safeParse<ResearchData>(data, { entries: [] });
  if (!d.entries.length) return null;
  return (
    <div className="section" data-section>
      {!continuation && <SectionHeader title="研究经历" />}
      {d.entries.map((e, i) => (
        <div key={i} className="entry" data-entry>
          {!e._continuation && (
            <>
              <div className="entry-title-row" data-entry-title>
                <strong>{e.title}</strong>
                <span className="date">{e.start} - {e.end}</span>
              </div>
              <div className="entry-subtitle" data-entry-subtitle>{e.institution}{e.role ? ` · ${e.role}` : ''}</div>
            </>
          )}
          <DescriptionList text={e.description} />
        </div>
      ))}
    </div>
  );
}

function InternshipRenderer({ data, continuation }: { data: string; continuation?: boolean }) {
  const d = safeParse<InternshipData>(data, { entries: [] });
  if (!d.entries.length) return null;
  return (
    <div className="section" data-section>
      {!continuation && <SectionHeader title="实习经历" />}
      {d.entries.map((e, i) => (
        <div key={i} className="entry" data-entry>
          {!e._continuation && (
            <>
              <div className="entry-title-row" data-entry-title>
                <strong>{e.company}</strong>
                <span className="date">{e.start} - {e.end}</span>
              </div>
              {e.position && <div className="entry-subtitle" data-entry-subtitle>{e.position}</div>}
            </>
          )}
          <DescriptionList text={e.description} />
        </div>
      ))}
    </div>
  );
}

function SkillsRenderer({ data, continuation }: { data: string; continuation?: boolean }) {
  const d = safeParse<SkillsCertsData>(data, { skills: [], certificates: [], languages: [] });
  const hasContent = d.skills.length > 0 || d.certificates.length > 0 || d.languages.length > 0;
  if (!hasContent) return null;
  return (
    <div className="section" data-section>
      {!continuation && <SectionHeader title="技能证书" />}
      {d.skills.length > 0 && (
        <div className="skills-row" data-skills-row>
          <strong>技能：</strong>
          {d.skills.join('、')}
        </div>
      )}
      {d.certificates.length > 0 && (
        <div className="skills-row" data-skills-row>
          <strong>证书：</strong>
          {d.certificates.map((c, i) => <span key={i}>{c.name}{c.date ? ` (${c.date})` : ''}{i < d.certificates.length - 1 ? '、' : ''}</span>)}
        </div>
      )}
      {d.languages.length > 0 && (
        <div className="skills-row" data-skills-row>
          <strong>语言：</strong>
          {d.languages.map((l, i) => <span key={i}>{l.name} - {l.level}{i < d.languages.length - 1 ? '、' : ''}</span>)}
        </div>
      )}
    </div>
  );
}

function SummaryRenderer({ data, continuation }: { data: string; continuation?: boolean }) {
  const d = safeParse<PersonalSummaryData>(data, { content: '' });
  if (!d.content) return null;
  return (
    <div className="section" data-section>
      {!continuation && <SectionHeader title="个人总结" />}
      <DescriptionList text={d.content} />
    </div>
  );
}

function ClubRenderer({ data, continuation }: { data: string; continuation?: boolean }) {
  const d = safeParse<ClubOrgData>(data, { entries: [] });
  if (!d.entries.length) return null;
  return (
    <div className="section" data-section>
      {!continuation && <SectionHeader title="社团经历" />}
      {d.entries.map((e, i) => (
        <div key={i} className="entry" data-entry>
          {!e._continuation && (
            <>
              <div className="entry-title-row" data-entry-title>
                <strong>{e.name}</strong>
                <span className="date">{e.start} - {e.end}</span>
              </div>
              {e.role && <div className="entry-subtitle" data-entry-subtitle>{e.role}</div>}
            </>
          )}
          <DescriptionList text={e.description} />
        </div>
      ))}
    </div>
  );
}

function HonorsRenderer({ data, continuation }: { data: string; continuation?: boolean }) {
  const d = safeParse<HonorsAwardsData>(data, { entries: [] });
  if (!d.entries.length) return null;
  return (
    <div className="section" data-section>
      {!continuation && <SectionHeader title="荣誉奖项" />}
      {d.entries.map((e, i) => (
        <div key={i} className="entry" data-entry>
          {!e._continuation && (
            <>
              <div className="entry-title-row" data-entry-title>
                <strong>{e.name}</strong>
                <span className="date">{e.date}</span>
              </div>
              {e.issuer && <div className="entry-subtitle" data-entry-subtitle>{e.issuer}</div>}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function renderModule(m: Module) {
  switch (m.type) {
    case 'personal_info': return <PersonalInfoRenderer key={m.id} data={m.data} />;
    case 'education': return <EducationRenderer key={m.id} data={m.data} continuation={m._continuation} />;
    case 'project': return <ProjectRenderer key={m.id} data={m.data} continuation={m._continuation} />;
    case 'research': return <ResearchRenderer key={m.id} data={m.data} continuation={m._continuation} />;
    case 'internship': return <InternshipRenderer key={m.id} data={m.data} continuation={m._continuation} />;
    case 'skills_certs': return <SkillsRenderer key={m.id} data={m.data} continuation={m._continuation} />;
    case 'personal_summary': return <SummaryRenderer key={m.id} data={m.data} continuation={m._continuation} />;
    case 'club_org': return <ClubRenderer key={m.id} data={m.data} continuation={m._continuation} />;
    case 'honors_awards': return <HonorsRenderer key={m.id} data={m.data} continuation={m._continuation} />;
    default: return null;
  }
}

export default function ResumeRenderer({ modules, template, fontScale, primaryColor, accentColor }: Props) {
  if (!modules.length) {
    return <div className="resume-empty">从左侧添加模块开始制作简历</div>;
  }

  const config = template ? safeParse<Record<string, string>>(template.config, {}) : {};
  const style = {
    '--primary': primaryColor || config.primary || '#222222',
    '--accent': accentColor || config.accent || '#555555',
    '--bg': config.bg || '#ffffff',
    '--text': config.text || '#222222',
    '--font-heading': config.fontHeading || 'var(--font-heading)',
    '--font-body': config.fontBody || 'var(--font-sans)',
    '--font-scale': String(fontScale ?? 1),
  } as React.CSSProperties;

  return (
    <div className="resume-document" style={style}>
      {modules.map(renderModule)}
    </div>
  );
}
