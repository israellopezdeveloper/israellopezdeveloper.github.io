export type SocialProof = {
  logos: string[];
  testimonial: {
    quote: string;
    author: string;
    role: string;
  };
};

export const socialProof: SocialProof = {
  logos: ['Devo', 'BBVA', 'La Caixa', 'AWS', 'Startups'],
  testimonial: {
    quote:
      'Delivers senior-level execution: fast diagnosis, clean solutions, and measurable impact without drama in production.',
    author: 'Client / Lead Engineer',
    role: 'Confidential reference (available on request)'
  }
};
