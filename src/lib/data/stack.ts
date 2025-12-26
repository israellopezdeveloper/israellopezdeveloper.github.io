export type StackGroup = {
  label: string;
  items: string[];
};

export const stack: StackGroup[] = [
  {
    label: 'Backend',
    items: [
      'Python',
      'FastAPI',
      'Node.js',
      'Java',
      'REST APIs',
      'Async systems'
    ]
  },
  {
    label: 'Cloud',
    items: [
      'AWS Lambda',
      'API Gateway',
      'CloudWatch',
      'ECS/EC2',
      'IaC (Terraform/CFN)'
    ]
  },
  {
    label: 'Data',
    items: ['PostgreSQL', 'MongoDB', 'Redis', 'Queues', 'Caching strategies']
  },
  {
    label: 'AI',
    items: ['LLMs', 'RAG', 'Embeddings', 'Evaluation hooks', 'Agent workflows']
  },
  {
    label: 'DevOps',
    items: ['Docker', 'CI/CD', 'Observability', 'Logging/metrics/tracing']
  }
];
