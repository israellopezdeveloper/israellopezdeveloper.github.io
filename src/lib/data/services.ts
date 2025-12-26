export type Service = {
  title: string;
  subtitle: string;

  // Optional positioning helpers (rendered only if present)
  badge?: string; // e.g. "Most requested", "High impact"
  outcome?: string; // 1-liner tangible result

  when: string[];
  deliverables: string[];

  // Filter / qualify leads
  notFor?: string[];

  // Short label shown as pill at the bottom
  engagement: string; // e.g. "Fixed-scope", "Retainer", "Advisory"
};

export const services: Service[] = [
  {
    title: 'Architecture & Technical Leadership',
    badge: 'Most requested',
    subtitle:
      'Senior-level guidance to reduce risk, align the team, and build a roadmap you can execute.',
    outcome:
      'Leave with a clear plan: what to do next, what to stop doing, and where the real bottlenecks are.',
    when: [
      'You have a running product but architecture decisions are slowing delivery',
      'You need a pragmatic plan (not a rewrite) to scale or modernize',
      'Multiple services/teams are stepping on each other (ownership boundaries are unclear)',
      'You want a second opinion before committing to a big technical bet'
    ],
    deliverables: [
      'Architecture review + prioritized action plan (1–3 phases)',
      'System diagram(s) + dataflow / dependency notes',
      'Risks & tradeoffs documented (performance, cost, reliability, security)',
      'Implementation guidance: sequencing, ownership, and “definition of done”'
    ],
    notFor: [
      'Greenfield “build me an MVP fast” without constraints or product clarity',
      'Teams looking only for “more features” without addressing core reliability/performance'
    ],
    engagement: 'Advisory (1–2 weeks) or ongoing'
  },

  {
    title: 'Backend Execution (Production-grade)',
    badge: 'High impact',
    subtitle:
      'Hands-on development to ship robust backend capabilities without breaking what already works.',
    outcome:
      'New features delivered with production-quality engineering: tests, observability, and clean interfaces.',
    when: [
      'You need senior execution inside an existing codebase',
      'You’re shipping features but stability is starting to suffer',
      'You need clean APIs, integrations, and predictable delivery',
      'You want to reduce “tribal knowledge” in critical services'
    ],
    deliverables: [
      'Backend features shipped end-to-end (API, persistence, integration)',
      'Test coverage strategy (unit/integration) + CI improvements',
      'Refactors that reduce complexity without stopping delivery',
      'Documentation for the next engineer (runbooks / ADRs as needed)'
    ],
    notFor: [
      '“Just code it quickly” projects with no review/QA expectations',
      'Teams unwilling to allocate time for proper deployment and monitoring'
    ],
    engagement: 'Retainer or sprint-based delivery'
  },

  {
    title: 'Performance & Reliability',
    badge: 'Performance-first',
    subtitle:
      'Identify bottlenecks, eliminate hotspots, and make the system predictable under load.',
    outcome:
      'Lower latency, fewer incidents, and measurable improvements you can track over time.',
    when: [
      'P95/P99 latency is climbing or unpredictable',
      'You’re hitting scaling limits (CPU, DB, queues, GC, network)',
      'Incidents repeat and root causes never get fully fixed',
      'Cost is increasing faster than traffic'
    ],
    deliverables: [
      'Profiling / load test plan + findings (what matters, what doesn’t)',
      'Bottleneck fixes (query/index, caching, concurrency, payloads)',
      'Reliability improvements (timeouts, retries, idempotency, backpressure)',
      'KPIs + dashboards to keep gains from regressing'
    ],
    notFor: [
      'Teams not willing to measure (no metrics, no baseline, no acceptance criteria)',
      'Pure “lift-and-shift” efforts without addressing root causes'
    ],
    engagement: 'Fixed-scope (1–3 weeks) or ongoing'
  },

  {
    title: 'Cloud, DevOps & Observability',
    subtitle:
      'Make deployments boring: repeatable, visible, and safe—across Docker/Kubernetes and cloud.',
    outcome:
      'Faster releases with fewer surprises: clear telemetry, safer rollouts, and lower MTTR.',
    when: [
      'Deployments are fragile or too manual',
      'You’re adopting Kubernetes (or already have it) but operations feel chaotic',
      'You lack actionable monitoring/alerting',
      'You need to improve security posture and access boundaries'
    ],
    deliverables: [
      'CI/CD improvements (build/test/release), safer rollouts (blue/green or canary)',
      'K8s hardening: resources, probes, autoscaling, policies (as appropriate)',
      'Observability: metrics/logs/traces + alert rules that actually help',
      'Runbooks: incident response, deploy procedures, key system operations'
    ],
    notFor: [
      '“Just install Kubernetes” without product requirements or operational ownership',
      'Teams expecting 24/7 on-call coverage as part of a short engagement'
    ],
    engagement: 'Retainer or milestone-based'
  },

  {
    title: 'AI / LLM Integration (RAG, Agents, Inference)',
    badge: 'No hype',
    subtitle:
      'Integrate LLMs into real products with correct boundaries, evaluation, and cost control.',
    outcome:
      'AI features that are reliable, testable, and cost-aware—not a demo that breaks in production.',
    when: [
      'You want search + Q&A over private docs (RAG) with traceability',
      'You need structured outputs, tool calling, or workflows/agents',
      'You want to run inference locally / on GPU / in controlled infra',
      'You need to decide if AI is worth it (and how to avoid risky coupling)'
    ],
    deliverables: [
      'RAG pipeline: chunking/embeddings/vector store + retrieval strategy',
      'Evaluation plan: quality metrics, regression tests, prompt/version control',
      'Guardrails: PII boundaries, content controls, fallbacks and timeouts',
      'Cost/perf tuning: caching, batching, routing, model selection'
    ],
    notFor: [
      '“Add ChatGPT” requests with no product goal, user journey, or evaluation criteria',
      'Teams unwilling to treat AI as a production system (monitoring + testing)'
    ],
    engagement: 'Fixed-scope discovery + build'
  },

  {
    title: 'Legacy Modernization (Pragmatic)',
    subtitle:
      'Modernize safely: wrap legacy with service layers, reduce blast radius, and iterate with confidence.',
    outcome:
      'A modernization path that improves delivery speed without destabilizing the core.',
    when: [
      'Full rewrites are too risky but you need progress',
      'You need API/service layers to expose legacy functionality safely',
      'You need phased migration with clear checkpoints',
      'You have critical workflows that must remain stable'
    ],
    deliverables: [
      'Modernization strategy: phases, boundaries, and migration seams',
      'API/service layer design + contracts',
      'Data and integration plan (events/queues where it makes sense)',
      'Risk controls: rollout strategy, rollback points, observability'
    ],
    notFor: [
      '“Rewrite everything” mandates without budget/time to do it properly',
      'Projects where the legacy system has no tests/telemetry and no willingness to add them'
    ],
    engagement: 'Advisory + execution support'
  }
];
