export interface Resume {
  id: number;
  user_id: number;
  title: string;
  template_id: string;
  font_scale: number;
  primary_color?: string;
  accent_color?: string;
  modules: Module[];
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: number;
  resume_id: number;
  type: string;
  sort_order: number;
  visible: boolean;
  data: string;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  config: string;
}

export type ModuleType =
  | 'personal_info'
  | 'education'
  | 'project'
  | 'research'
  | 'internship'
  | 'skills_certs'
  | 'personal_summary'
  | 'club_org'
  | 'honors_awards';

export const MODULE_LABELS: Record<ModuleType, string> = {
  personal_info: '个人信息',
  education: '教育经历',
  project: '项目经历',
  research: '研究经历',
  internship: '实习经历',
  skills_certs: '技能证书',
  personal_summary: '个人总结',
  club_org: '社团经历',
  honors_awards: '荣誉奖项',
};

export const ALL_MODULE_TYPES: ModuleType[] = [
  'personal_info',
  'education',
  'project',
  'research',
  'internship',
  'skills_certs',
  'personal_summary',
  'club_org',
  'honors_awards',
];

export interface PersonalInfoData {
  name: string;
  email: string;
  phone: string;
  city: string;
  job_title: string;
  website: string;
  github: string;
  linkedin: string;
}

export interface EducationEntry {
  school: string;
  degree: string;
  major: string;
  start: string;
  end: string;
  gpa: string;
}

export interface EducationData {
  entries: EducationEntry[];
}

export interface ProjectEntry {
  name: string;
  role: string;
  start: string;
  end: string;
  description: string;
  link: string;
}

export interface ProjectData {
  entries: ProjectEntry[];
}

export interface ResearchEntry {
  title: string;
  institution: string;
  role: string;
  start: string;
  end: string;
  description: string;
}

export interface ResearchData {
  entries: ResearchEntry[];
}

export interface InternshipEntry {
  company: string;
  position: string;
  start: string;
  end: string;
  description: string;
}

export interface InternshipData {
  entries: InternshipEntry[];
}

export interface CertificateEntry {
  name: string;
  date: string;
}

export interface LanguageEntry {
  name: string;
  level: string;
}

export interface SkillsCertsData {
  skills: string[];
  certificates: CertificateEntry[];
  languages: LanguageEntry[];
}

export interface PersonalSummaryData {
  content: string;
}

export interface ClubEntry {
  name: string;
  role: string;
  start: string;
  end: string;
  description: string;
}

export interface ClubOrgData {
  entries: ClubEntry[];
}

export interface HonorEntry {
  name: string;
  date: string;
  issuer: string;
}

export interface HonorsAwardsData {
  entries: HonorEntry[];
}
