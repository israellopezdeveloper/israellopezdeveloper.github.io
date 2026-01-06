<script lang="ts">
  import Panel from '$lib/components/Panel.svelte';
  import { services } from '$lib/data/services';
  import { slugify } from '$lib/utils/slug';

  const title = 'Services';
  const description =
    'Senior IC engagements for teams with a live product — hands-on engineering (80%+ coding), performance-first delivery, and AI in production.';
</script>

<svelte:head>
  <title>{title} · Israel Lopez</title>
  <meta name="description" content={description} />
  <link rel="canonical" href="https://israellopezdeveloper.github.io/services" />
</svelte:head>

<main class="wrap">
  <header class="hero">
    <h1>{title}</h1>
    <p>{description}</p>
  </header>

  <div class="grid">
    {#each services as s}
      <a class="cardLink" href={`/services/${slugify(s.title)}`} aria-label={`Open ${s.title}`}>
        <Panel as="article">
          <div class="top">
            <div class="titleRow">
              <h2 class="cardTitle">{s.title}</h2>
              {#if s.badge}
                <span class="badge">{s.badge}</span>
              {/if}
            </div>
            <p class="sub">{s.subtitle}</p>
            {#if s.outcome}
              <p class="outcome">{s.outcome}</p>
            {/if}
          </div>

          <div class="cta">View details →</div>
        </Panel>
      </a>
    {/each}
  </div>
</main>

<style>
  .wrap {
    max-width: 1100px;
    margin: 0 auto;
    padding: 96px 16px 64px;
  }

  .hero {
    display: grid;
    gap: 10px;
    margin-bottom: 18px;
  }

  h1 {
    margin: 0;
    font-size: 28px;
    line-height: 1.15;
  }

  .hero p {
    margin: 0;
    color: rgba(255, 255, 255, 0.76);
    line-height: 1.55;
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

  .cardLink {
    text-decoration: none;
    color: inherit;
    display: block;
  }

  .top {
    display: grid;
    gap: 8px;
  }

  .titleRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .cardTitle {
    margin: 0;
    font-size: 18px;
    line-height: 1.2;
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

  .sub {
    margin: 0;
    color: rgba(255, 255, 255, 0.74);
    line-height: 1.55;
    font-size: 14px;
  }

  .outcome {
    margin: 0;
    color: rgba(255, 255, 255, 0.86);
    line-height: 1.55;
    font-size: 14px;
  }

  .cta {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    font-weight: 650;
    color: rgba(255, 255, 255, 0.92);
    font-size: 14px;
  }

  .cardLink:hover .cta {
    color: #fff;
  }
</style>
