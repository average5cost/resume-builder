import type {
  PersonalInfoData, EducationData, EducationEntry,
  ProjectData, ProjectEntry, ResearchData, ResearchEntry,
  InternshipData, InternshipEntry, SkillsCertsData, CertificateEntry, LanguageEntry,
  PersonalSummaryData, ClubOrgData, ClubEntry, HonorsAwardsData, HonorEntry,
} from '../types/resume';

export interface ParsedResumeData {
  personal_info: PersonalInfoData;
  education: EducationData;
  project: ProjectData;
  research: ResearchData;
  internship: InternshipData;
  skills_certs: SkillsCertsData;
  personal_summary: PersonalSummaryData;
  club_org: ClubOrgData;
  honors_awards: HonorsAwardsData;
}

const SECTION_PATTERNS: [string, RegExp[]][] = [
  ['personal_info', [/个人(?:信息|资料)|基本信息|个人信息|联系方式|Contact|Profile/i]],
  ['education', [/教育(?:经历|背景|信息)?|学历|Education|Academic/i]],
  ['project', [/项目(?:经历|经验)?|在校项目|Projects?/i]],
  ['research', [/研究(?:经历|经验|成果|课题)?|科研(?:经历)?|学术(?:经历)?|Research/i]],
  ['internship', [/实习(?:经历|经验)?|工作(?:经历|经验)?|Intern(?:ship)?s?|Work\s*Experience|Professional\s*Experience|Employment/i]],
  ['skills_certs', [/技能(?:证书|特长)?|证书(?:资质)?|语言(?:能力|水平)?|Skills|Certifications?|Languages?/i]],
  ['personal_summary', [/个人(?:总结|简介|评价|介绍)|自我(?:评价|介绍|描述)|求职意向|Summary|Objective|Profile|About\s*Me/i]],
  ['club_org', [/社团(?:经历|活动|组织)?|课外活动|校园活动|学生(?:组织|工作)|Activities|Extracurricular|Leadership/i]],
  ['honors_awards', [/荣誉(?:奖项|证书)?|(?:获奖|奖项)(?:情况)?|Honors?|Awards?|Achievements/i]],
];

function identifySection(line: string): string | null {
  for (const [type, patterns] of SECTION_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(line)) return type;
    }
  }
  return null;
}

function splitSections(lines: string[]): Record<string, string[]> {
  const sections: Record<string, string[]> = {};
  let currentSection = 'unknown';
  const buffer: string[] = [];

  for (const line of lines) {
    const section = identifySection(line);
    if (section) {
      if (buffer.length > 0) {
        if (!sections[currentSection]) sections[currentSection] = [];
        sections[currentSection].push(...buffer);
        buffer.length = 0;
      }
      currentSection = section;
      continue;
    }
    buffer.push(line);
  }
  if (buffer.length > 0) {
    if (!sections[currentSection]) sections[currentSection] = [];
    sections[currentSection].push(...buffer);
  }
  return sections;
}

function parsePersonalInfo(lines: string[]): PersonalInfoData {
  const text = lines.join(' ');
  const result: PersonalInfoData = {
    name: '', email: '', phone: '', city: '',
    job_title: '', website: '', github: '', linkedin: '',
  };

  if (lines.length > 0) result.name = lines[0].trim();

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) result.email = emailMatch[0];

  const phoneMatch = text.match(/(?:\+86[\s-]?)?1[3-9]\d{9}/);
  if (phoneMatch) result.phone = phoneMatch[0];

  const cityMatch = text.match(/(?:城市|所在地?|地址)[：:\s]*(\S+)/i);
  if (cityMatch) result.city = cityMatch[1];

  const jobMatch = text.match(/(?:求职意向|期望职位|岗位|职位)[：:\s]*(\S+)/i);
  if (jobMatch) result.job_title = jobMatch[1];

  const siteMatch = text.match(/(?:个人网站|主页|博客|Website|Blog)[：:\s]*(\S+)/i);
  if (siteMatch) result.website = siteMatch[1];

  const ghMatch = text.match(/(?:github|GitHub)[：:\s]*(\S+)/i);
  if (ghMatch) result.github = ghMatch[1];

  const liMatch = text.match(/(?:linkedin|LinkedIn)[：:\s]*(\S+)/i);
  if (liMatch) result.linkedin = liMatch[1];

  return result;
}

function parseEntries<T>(lines: string[], type: string): T[] {
  const text = lines.join('\n');
  const entries: any[] = [];

  // Split by date ranges
  const datePattern = /(\d{4})(?:[.\-/年]\s*(\d{1,2}))?\s*[-–—至到]\s*(\d{4})(?:[.\-/年]\s*(\d{1,2}))?|(\d{4})(?:[.\-/年]\s*(\d{1,2}))?\s*[-–—至到]\s*(?:至今|现在|Present|Now)/g;
  const dates: { index: number; match: string; start: string; end: string }[] = [];
  let m;
  while ((m = datePattern.exec(text)) !== null) {
    const start = m[1] + (m[2] ? '.' + m[2] : '');
    const isOngoing = m[0].match(/至今|现在|Present|Now/);
    const end = isOngoing ? '' : (m[3] + (m[4] ? '.' + m[4] : ''));
    dates.push({ index: m.index, match: m[0], start, end });
  }

  if (dates.length === 0) {
    // Try to extract at least one entry from the raw text
    const firstLine = lines.find((l) => l.trim().length > 3);
    if (firstLine) {
      const entry: any = {};
      if (type === 'education') entry.school = firstLine.trim();
      else if (type === 'project') entry.name = firstLine.trim();
      else if (type === 'research') entry.title = firstLine.trim();
      else if (type === 'internship') entry.company = firstLine.trim();
      else if (type === 'club_org') entry.name = firstLine.trim();
      else if (type === 'honors_awards') entry.name = firstLine.trim();
      entries.push(entry);
    }
    return entries;
  }

  // For each date range, extract surrounding context as an entry
  for (let i = 0; i < dates.length; i++) {
    const start = i === 0 ? 0 : dates[i - 1].index + dates[i - 1].match.length;
    const end = dates[i].index + dates[i].match.length;
    const block = text.substring(start, end).trim();

    const entry: any = {};
    if (type === 'honors_awards') {
      entry.name = block.split('\n')[0].replace(dates[i].match, '').trim() || '奖项';
      entry.date = dates[i].start;
    } else {
      const lines_block = block.split('\n').filter(Boolean);
      if (lines_block.length >= 1) {
        const titleLine = lines_block[0].replace(dates[i].match, '').trim();
        if (type === 'education') entry.school = titleLine;
        else if (type === 'project') entry.name = titleLine;
        else if (type === 'research') entry.title = titleLine;
        else if (type === 'internship') entry.company = titleLine;
        else if (type === 'club_org') entry.name = titleLine;
        if (lines_block.length >= 2) {
          const subLine = lines_block[1].trim();
          if (type === 'education') { entry.degree = subLine; }
          else if (type === 'project' || type === 'research' || type === 'internship' || type === 'club_org') {
            entry.role = subLine;
          }
        }
        entry.start = dates[i].start;
        entry.end = dates[i].end;
        entry.description = lines_block.slice(2).join('\n').trim();
      }
    }
    entries.push(entry);
  }

  return entries;
}

function parseSkillsCerts(lines: string[]): SkillsCertsData {
  const text = lines.join('\n');
  const result: SkillsCertsData = { skills: [], certificates: [], languages: [] };

  // Parse skills - look for comma/semicolon/newline separated lists
  const skillLine = text.match(/(?:技能|技术栈|Skills)[：:\s]*(.+)/i);
  if (skillLine) {
    result.skills = skillLine[1].split(/[,，;；、\s]+/).filter((s) => s.length > 1);
  } else {
    // Take first line as skills
    const firstLine = lines.find((l) => l.trim().length > 2);
    if (firstLine) {
      result.skills = firstLine.split(/[,，;；、\s]+/).filter((s) => s.length > 1);
    }
  }

  // Parse languages
  const langPattern = /(英语|汉语|中文|普通话|日语|韩语|法语|德语|English|Chinese|Japanese|Korean|French|German)[：:\s]*[-–—]?\s*(.+)?/gi;
  let langMatch;
  while ((langMatch = langPattern.exec(text)) !== null) {
    result.languages.push({
      name: langMatch[1],
      level: (langMatch[2] || '').trim(),
    });
  }

  return result;
}

export function parseResumeFromText(text: string): ParsedResumeData {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const sections = splitSections(lines);

  const personalLines = sections['personal_info'] || (sections['unknown'] || lines).slice(0, 6);

  return {
    personal_info: parsePersonalInfo(personalLines),
    education: { entries: parseEntries<EducationEntry>(sections['education'] || [], 'education') },
    project: { entries: parseEntries<ProjectEntry>(sections['project'] || [], 'project') },
    research: { entries: parseEntries<ResearchEntry>(sections['research'] || [], 'research') },
    internship: { entries: parseEntries<InternshipEntry>(sections['internship'] || [], 'internship') },
    skills_certs: parseSkillsCerts(sections['skills_certs'] || []),
    personal_summary: { content: (sections['personal_summary'] || []).join('\n') },
    club_org: { entries: parseEntries<ClubEntry>(sections['club_org'] || [], 'club_org') },
    honors_awards: { entries: parseEntries<HonorEntry>(sections['honors_awards'] || [], 'honors_awards') },
  };
}

export function isEmpty(data: any): boolean {
  if (!data) return true;
  if (typeof data === 'object' && !Array.isArray(data)) {
    if ('entries' in data) return (data.entries || []).length === 0 && !data.content;
    if ('content' in data) return !data.content;
    if ('skills' in data) return data.skills.length === 0 && data.certificates.length === 0 && data.languages.length === 0;
    return Object.values(data).every((v) => !v || (Array.isArray(v) && v.length === 0) || v === '');
  }
  return !data;
}
