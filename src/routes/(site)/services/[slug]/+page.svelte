<script lang="ts">
  import Panel from '$lib/components/Panel.svelte';
  import type { ServicePageData } from './+page';

  let { data }: { data: ServicePageData } = $props();
  const service = $derived(data.service);

  const mailTo = $derived(
    'mailto:israellopezdeveloper@gmail.com?subject=' +
      encodeURIComponent(`[Service Inquiry] ${service.title}`)
  );
</script>

<svelte:head>
  <title>{data.title}</title>
  <link rel="canonical" href={data.canonical} />

  <meta property="og:type" content="website" />
  <meta property="og:title" content={service.title} />
  <meta property="og:url" content={data.canonical} />

  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<main class="wrap">
  <nav class="crumbs">
    <a href="/">Home</a>
    <span class="sep">/</span>
    <a href="/services">Services</a>
    <span class="sep">/</span>
    <span aria-current="page">{service.title}</span>
  </nav>

  <header class="hero">
    <div class="kicker">
      {#if service.badge}
        <span class="badge">{service.badge}</span>
      {/if}
      <span class="pill">{service.engagement}</span>
    </div>

    <h1>{service.title}</h1>
    <p class="sub">{service.subtitle}</p>
    {#if service.outcome}
      <p class="outcome">{service.outcome}</p>
    {/if}

    <div class="actions">
      <a class="primary" href="/#contact">Discuss this</a>
      <a class="ghost" href={mailTo}>Email</a>
    </div>
  </header>

  <section class="grid">
    <Panel as="section">
      <h2>When it fits</h2>
      <ul>
        {#each service.when as w (w)}
          <li>{w}</li>
        {/each}
      </ul>
    </Panel>

    <Panel as="section">
      <h2>Deliverables</h2>
      <ul>
        {#each service.deliverables as d (d)}
          <li>{d}</li>
        {/each}
      </ul>
    </Panel>
  </section>

  {#if service.notFor}
    <section class="notfit">
      <Panel as="section">
        <h2>Not a fit for</h2>
        <ul class="muted">
          {#each service.notFor as n (n)}
            <li>{n}</li>
          {/each}
        </ul>
      </Panel>
    </section>
  {/if}

  <section id="contact" class="contact">
    <Panel as="section">
      <h2>Contact</h2>
      <p class="muted">
        Tell me a bit about your context (stack, constraints, timeline) and what
        outcome you want.
      </p>

      <div class="contactGrid">
        <div>
          <div class="label">Recommended info</div>
          <ul class="muted">
            <li>Current architecture + biggest pain</li>
            <li>
              Success metric (latency, cost, delivery speed, reliability…)
            </li>
            <li>Constraints (team size, deadlines, infra, compliance)</li>
          </ul>
        </div>

        <div>
          <div class="label">Fastest way</div>
          <a class="mail" href={mailTo}>israellopezdeveloper@gmail.com →</a>
          <div class="hint">
            (opens your email client with a pre-filled subject)
          </div>
        </div>
      </div>
    </Panel>
  </section>
</main>

<style>
  .wrap {
    max-width: 1100px;
    margin: 0 auto;
    padding: 96px 16px 64px;
  }

  .crumbs {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 14px;
    color: rgba(255, 255, 255, 0.65);
    font-size: 13px;
  }

  .crumbs a {
    color: rgba(255, 255, 255, 0.75);
    text-decoration: none;
  }

  .crumbs a:hover {
    color: #fff;
  }

  .sep {
    opacity: 0.5;
  }

  .hero {
    display: grid;
    gap: 10px;
    margin-bottom: 18px;
  }

  .kicker {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
  }

  h1 {
    margin: 0;
    font-size: 28px;
    line-height: 1.15;
  }

  .sub {
    margin: 0;
    color: rgba(255, 255, 255, 0.74);
    line-height: 1.55;
  }

  .outcome {
    margin: 0;
    color: rgba(255, 255, 255, 0.88);
    line-height: 1.55;
  }

  .badge {
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.04);
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.82);
    white-space: nowrap;
  }

  .pill {
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.04);
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.86);
    white-space: nowrap;
  }

  .actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 4px;
  }

  .primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 14px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.16);
    color: #fff;
    text-decoration: none;
    font-weight: 650;
  }

  .primary:hover {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.28);
  }

  .ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 14px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.92);
    text-decoration: none;
    font-weight: 650;
  }

  .ghost:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.22);
    color: #fff;
  }

  .grid {
    display: grid;
    gap: 16px;
  }

  @media (min-width: 860px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
    }
  }

  h2 {
    margin: 0 0 10px;
    font-size: 16px;
  }

  ul {
    margin: 0;
    padding-left: 18px;
    color: rgba(255, 255, 255, 0.88);
  }

  li {
    margin: 8px 0;
  }

  .muted {
    color: rgba(255, 255, 255, 0.72);
  }

  .notfit {
    margin-top: 16px;
  }

  .contact {
    margin-top: 16px;
  }

  .label {
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 8px;
  }

  .contactGrid {
    display: grid;
    gap: 14px;
    margin-top: 12px;
  }

  @media (min-width: 860px) {
    .contactGrid {
      grid-template-columns: 1.4fr 0.6fr;
      align-items: start;
    }
  }

  .mail {
    display: inline-flex;
    margin-top: 2px;
    color: rgba(255, 255, 255, 0.92);
    text-decoration: none;
    font-weight: 650;
  }

  .mail:hover {
    color: #fff;
  }

  .hint {
    margin-top: 6px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }
</style>
