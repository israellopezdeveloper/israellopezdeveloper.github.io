export interface SocialProof {
  logos: string[];
  testimonial: {
    quote: string;
    author: string;
    role: string;
  };
  awards?: {
    title: string;
    org?: string;
    year?: string;
  }[];
  recommendations?: {
    org?: string;
    author?: string;
    role?: string;
    source?: string;
    url?: string;
  }[];
}

export const socialProof: SocialProof = {
  logos: ['Devo', 'BBVA', 'La Caixa', 'AWS', 'Startups'],

  testimonial: {
    quote:
      'Instrumental in production systems responsible for data storage and availability. Deep technical knowledge, strong problem-solving skills, and consistently reliable under real-world pressure.',
    author: 'Carlos Andreu Antoranz',
    role: 'Data Persistence Squad Lead, Devo'
  },

  awards: [
    {
      title: 'Employee of the Year',
      org: 'Devo',
      year: '2023'
    }
  ],

  recommendations: [
    {
      org: 'Devo',
      author: 'Carlos Andreu Antoranz',
      role: 'Technical Manager / Squad Lead',
      source: 'Formal recommendation letter'
    }
  ]
};
