export type CVLink = {
  icon?: string;
  url: string;
  text: string;
  tag?: string;
};

export type CVPeriod = {
  start: string;
  end: string;
  current: boolean;
};

export type CVBio = {
  dates: string;
  text: string;
};

export type CVIntro = {
  greeting: string;
  profile_image?: string;
  name: string;
  title: string;
  summary: string;
  bio: CVBio[];
  hobbies: string;
  links: CVLink[];
};

export type CVProject = {
  name: string;
  description: string;
  technologies: string[];
  links: CVLink[];
  images: string[];
};

export type CVWork = {
  slug?: string;
  name: string;
  short_description: string;
  thumbnail?: string;
  period_time: CVPeriod;
  full_description: string;
  contribution: string;
  links: CVLink[];
  projects: CVProject[];
  images: string[];
};

export type CVUniversity = {
  slug?: string;
  university_name: string;
  title: string;
  period_time: CVPeriod;
  summary: string;
  images: string[];
  thumbnail?: string;
};

export type CVComplementary = {
  slug?: string;
  institution: string;
  title: string;
  period_time: CVPeriod;
  summary: string;
  images: string[];
  thumbnail?: string;
};

export type CVAcreditation = {
  institution: string;
  title: string;
  period_time: CVPeriod;
};

export type CVLang = {
  slug?: string;
  language: string;
  spoken?: string;
  writen?: string;
  read?: string;
  acreditation: CVAcreditation[];
  thumbnail?: string;
};

export type CVEducations = {
  university: CVUniversity[];
  complementary: CVComplementary[];
  languages: CVLang[];
};

export type CV = {
  intro: CVIntro;
  works: CVWork[];
  personal_projects?: CVWork[];
  educations: CVEducations;
};
