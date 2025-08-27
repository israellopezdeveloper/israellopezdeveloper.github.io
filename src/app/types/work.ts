export type WorkLink = {
  tag: string;
  text: string;
  url: string;
};

type PeriodObj = {
  start?: string | null;
  end?: string | null;
  current?: boolean | null;
};

export type Work = {
  id: string;
  title: string;
  description?: string;
  year?: string | number | PeriodObj;
  thumbnail?: string;
  techs?: string[];
  links?: WorkLink[];
};
