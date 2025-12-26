export type Service = {
  title: string;
  subtitle: string;
  when: string[];
  deliverables: string[];
  engagement: string;
};

export const services: Service[] = [
  {
    title: 'Architecture & Performance Audit',
    subtitle: 'Fast clarity on bottlenecks, risks, and the highest-ROI fixes.',
    when: [
      'Production system feels slow or fragile',
      'Cloud costs are growing without clear reason',
      'You need a plan before hiring a bigger team'
    ],
    deliverables: [
      'System map + bottleneck analysis',
      'Prioritized roadmap (impact vs effort)',
      'Quick wins + longer-term architecture options'
    ],
    engagement: '1–2 weeks · fixed scope'
  },
  {
    title: 'Backend Development (Production Systems)',
    subtitle:
      'Ship features, improve reliability, and keep the system maintainable.',
    when: [
      'You have an existing codebase and need a senior to extend it safely',
      'You need performance work without breaking production',
      'You want clean boundaries, tests, and observability'
    ],
    deliverables: [
      'Feature delivery end-to-end',
      'Refactors with safety nets (tests, rollout)',
      'Performance improvements + monitoring'
    ],
    engagement: 'Hourly or retainer'
  },
  {
    title: 'Cloud / Serverless Optimization (AWS)',
    subtitle: 'Improve latency and reduce cost with measurable outcomes.',
    when: [
      'Lambda/API Gateway performance issues',
      'Cold starts, timeouts, or scaling surprises',
      'Observability gaps across services'
    ],
    deliverables: [
      'Latency & cost analysis',
      'Infra improvements (IaC, alarms, dashboards)',
      'Stability patterns (retries, DLQ, idempotency)'
    ],
    engagement: '1–4 weeks · focused execution'
  },
  {
    title: 'AI / LLM Integration (Existing Systems)',
    subtitle: 'Add AI features without rewriting your platform.',
    when: [
      'You want AI features on top of current workflows',
      'You need safe orchestration + guardrails',
      'You need cost control and reliability for AI calls'
    ],
    deliverables: [
      'Integration architecture (API-first)',
      'Prompt/agent workflow + caching',
      'Monitoring, fallbacks, and evaluation strategy'
    ],
    engagement: 'Consulting + implementation'
  }
];
