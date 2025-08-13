export type CVLink = { icon?: string; url: string; text: string; tag?: string };

export type CVIntro = {
  greeting: string;
  profile_image?: string;
  name: string;
  title: string;
  summary?: string[];
  bio?: { dates: string; text: string }[];
  hobbies?: string[];
  links?: CVLink[];
};

export type CVProject = {
  name: string;
  description?: string[];
  technologies?: string[];
  links?: CVLink[];
  images?: string[];
};

export type CVWork = {
  name: string;
  short_description?: string[];
  thumbnail?: string;
  period_time?: string;
  full_description?: string[];
  contribution?: string[];
  links?: CVLink[];
  projects?: CVProject[];
  images?: string[];
};

export type CVUniversity = {
  university_name: string;
  title: string;
  period_time?: string;
  summary?: string[];
  images?: string[];
  thumbnail?: string;
};

export type CVComplementary = {
  institution: string;
  title: string;
  period_time?: string;
  summary?: string[];
  images?: string[];
  thumbnail?: string;
};

export type CVLang = {
  language: string;
  spoken?: string;
  writen?: string;
  read?: string;
  acreditations?: {
    institution: string;
    title: string;
    period_time?: string;
  }[];
  thumbnail?: string;
};

export type CV = {
  intro: CVIntro;
  works: CVWork[];
  educations: {
    university: CVUniversity[];
    complementary: CVComplementary[];
    languages: CVLang[];
  };
};
