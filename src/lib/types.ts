// ---------- Content model ----------
// Everything the public site shows lives in one `SiteData` document plus a
// table of `Entry` rows (blog posts, photo albums, poems, stories...).

export type ID = string;

export interface MediaItem {
  url: string;
  caption?: string;
}

export interface Attachment {
  label: string;
  url: string;
  kind: 'certificate' | 'document' | 'link';
}

export interface SocialLink {
  id: ID;
  label: string;
  url: string;
  icon: string; // github | linkedin | twitter | instagram | mail | globe | youtube | medium
}

export interface Profile {
  name: string;
  shortName: string;
  headline: string; // e.g. "Software Engineer"
  roles: string[]; // rotating words in the hero
  intro: string; // one-paragraph hero text (markdown)
  about: string; // longer about section (markdown)
  location: string;
  avatar: string;
  email: string;
  resumeUrl: string;
  availability?: string; // legacy single badge — migrated into `badges`
  badges: Badge[]; // status pills shown in the hero, e.g. "Open to interesting problems"
  socials: SocialLink[];
}

export type BadgeColor = 'emerald' | 'sky' | 'violet' | 'amber' | 'rose' | 'zinc';

export interface Badge {
  id: ID;
  label: string;
  color: BadgeColor;
  pulse: boolean; // animated "live" dot
  hidden?: boolean;
}

export interface Experience {
  id: ID;
  slug: string;
  company: string;
  role: string;
  type: 'Full-time' | 'Internship' | 'Research' | 'Part-time' | 'Freelance' | 'Contract' | 'Volunteer';
  location: string;
  start: string; // YYYY-MM
  end: string; // YYYY-MM or '' for present
  logo: string;
  cover: string;
  url: string;
  summary: string;
  body: string; // markdown for the detail page
  highlights: string[];
  skills: string[];
  gallery: MediaItem[];
  attachments: Attachment[];
  countsTowardTotal: boolean; // include in "years of experience"
  hidden?: boolean;
}

export interface Education {
  id: ID;
  school: string;
  degree: string;
  start: string; // YYYY
  end: string; // YYYY or ''
  grade: string;
  description: string;
  logo: string;
  hidden?: boolean;
}

export interface Project {
  id: ID;
  slug: string;
  title: string;
  summary: string;
  body: string;
  cover: string;
  tags: string[];
  github: string;
  live: string;
  date: string; // YYYY-MM
  featured: boolean;
  gallery: MediaItem[];
  hidden?: boolean;
}

export interface Publication {
  id: ID;
  title: string;
  venue: string;
  year: string;
  status: 'Published' | 'Accepted' | 'Under review' | 'Preprint';
  summary: string;
  url: string;
  cover: string;
  hidden?: boolean;
}

export interface SkillGroup {
  id: ID;
  name: string;
  items: string[];
}

export type PageTemplate = 'blog' | 'gallery' | 'poetry' | 'stories' | 'custom';

export interface Page {
  id: ID;
  slug: string;
  title: string;
  description: string;
  template: PageTemplate;
  cover: string;
  body: string; // used by the custom template, and as an intro for the others
  showInNav: boolean;
  visible: boolean;
}

export type SectionType =
  | 'hero'
  | 'stats'
  | 'about'
  | 'experience'
  | 'projects'
  | 'education'
  | 'publications'
  | 'skills'
  | 'feed'
  | 'cards'
  | 'markdown'
  | 'contact';

export interface Card {
  id: ID;
  title: string;
  body: string;
  image: string; // large cover image
  logo?: string; // small logo/icon shown next to the title (e.g. certificate issuer)
  meta?: string; // small line under the title (e.g. "Coursera · Apr 2023")
  url: string;
}

export interface HomeSection {
  id: ID;
  type: SectionType;
  visible: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
  showInNav: boolean;
  // type-specific config
  pageId?: ID; // feed
  limit?: number; // feed / projects
  body?: string; // markdown
  cards?: Card[]; // cards
}

export interface Settings {
  siteTitle: string;
  description: string;
  accent: string; // hex
  footerNote: string;
  experienceLabel: string; // e.g. "Years building software"
  showSkillIcons: boolean; // technology logos next to skills
}

export interface SiteData {
  version: number;
  profile: Profile;
  settings: Settings;
  sections: HomeSection[];
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  publications: Publication[];
  skills: SkillGroup[];
  pages: Page[];
}

export interface EntryExtra {
  location?: string;
  images?: MediaItem[];
  [k: string]: unknown;
}

export interface Entry {
  id: ID;
  page_id: ID;
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  published: boolean;
  body?: string; // loaded lazily on detail pages
  extra: EntryExtra;
  updated_at?: string;
}
