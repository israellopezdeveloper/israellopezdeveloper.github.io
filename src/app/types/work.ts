export type WorkLink = {
  tag: string;
  text: string;
  url: string;
};

export type Work = {
  id: string;
  title: string;
  description?: string;
  year?: string;
  thumbnail?: string;
  techs?: string[];
  links?: WorkLink[];
};
