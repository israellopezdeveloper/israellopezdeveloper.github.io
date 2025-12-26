import type { Url } from 'node:url';

export type WorkLink = {
  icon?: string;
  text: string;
  url: string;
};

export type WorkProject = {
  name: string;
  description?: string;
  technologies?: string[];
  links?: WorkLink[];
  images?: string[];
};

export type PeriodTime = {
  start?: string;
  end?: string;
  current?: boolean;
};

export type Work = {
  name: string;
  period_time?: PeriodTime;
  thumbnail?: string;

  short_description?: string;
  full_description?: string;
  contribution?: string;

  images?: string[];

  links?: WorkLink[];
  projects?: WorkProject[];
};

export type CV = {
  works: Work[];
};

export type Tech = {
  tech: string;
  time: number;
};

export type Project = {
  id: number;
  url: string;
  thumbnail?: string;
  lang: {
    en: {
      name: string;
      desc?: string;
    };
    es: {
      name: string;
      desc?: string;
    };
    zh: {
      name: string;
      desc?: string;
    };
  };
  technologies?: Tech[];
};
