export interface WorkLink {
  icon?: string;
  text: string;
  url: string;
}

export interface WorkProject {
  name: string;
  description?: string;
  technologies?: string[];
  links?: WorkLink[];
  images?: string[];
}

export interface PeriodTime {
  start?: string;
  end?: string;
  current?: boolean;
}

export interface Work {
  name: string;
  period_time?: PeriodTime;
  thumbnail?: string;

  short_description?: string;
  full_description?: string;
  contribution?: string;

  images?: string[];

  links?: WorkLink[];
  projects?: WorkProject[];
}

export interface CV {
  works: Work[];
}

export interface Tech {
  tech: string;
  time: number;
}

export interface Project {
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
}
