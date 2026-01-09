<script lang="ts">
  import Panel from '$lib/components/Panel.svelte';
  import { services } from '$lib/data/services';
  import { SvelteSet } from 'svelte/reactivity';
  import Section from './Section.svelte';
  import { slide } from 'svelte/transition'; // Importamos la transición de Svelte

  let expandedIndices = new SvelteSet<number>();

  function toggle(idx: number) {
    if (expandedIndices.has(idx)) {
      expandedIndices.delete(idx);
    } else {
      expandedIndices.add(idx);
    }
    expandedIndices = expandedIndices; // Forzamos la reactividad en Svelte
  }
</script>

<Section
  id="services"
  title="Services"
  description="Senior IC engagements for teams with a live product — hands-on engineering (80%+ coding), performance-first delivery, and AI in production."
>
  <div class="grid">
    <a href="/services" id="viewmore">
      <button type="button" class="badge">Service details</button>
    </a>
  </div>
  <div class="grid">
    {#each services as s, i (s.title)}
      <Panel as="aside">
        <div class="cardTop">
          <div class="titleRow">
            <h3 class="cardTitle">{s.title}</h3>
            <div class="titleActions">
              {#if s.badge}
                <span class="badge">{s.badge}</span>
              {/if}
              <button
                class="toggleBtn"
                on:click={() => toggle(i)}
                aria-expanded={expandedIndices.has(i)}
              >
                {expandedIndices.has(i) ? '−' : '+'}
              </button>
            </div>
          </div>

          <p class="cardSub">{s.subtitle}</p>

          {#if s.outcome}
            <p class="outcome">{s.outcome}</p>
          {/if}
        </div>

        {#if expandedIndices.has(i)}
          <div transition:slide={{ duration: 300 }}>
            <div class="block">
              <div class="label">When it fits</div>
              <ul class="list">
                {#each s.when as w (w)}
                  <li>{w}</li>
                {/each}
              </ul>
            </div>

            <div class="block">
              <div class="label">Deliverables</div>
              <ul class="list">
                {#each s.deliverables as d (d)}
                  <li>{d}</li>
                {/each}
              </ul>
            </div>

            {#if s.notFor}
              <div class="block soft">
                <div class="label">Not a fit for</div>
                <ul class="list subtle">
                  {#each s.notFor as n (n)}
                    <li>{n}</li>
                  {/each}
                </ul>
              </div>
            {/if}

            <div class="bottom">
              <span class="pill">{s.engagement}</span>
              <a class="link" href="#contact">Discuss this →</a>
            </div>
          </div>
        {/if}
      </Panel>
    {/each}
  </div>
</Section>

<style>
  a#viewmore {
    margin-bottom: 30px;
    cursor: pointer;
  }

  a#viewmore button {
    height: 40px;
    width: 100px;
    cursor: pointer;
  }

  .titleActions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .toggleBtn {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: white;
    border-radius: 6px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-family: monospace;
    font-size: 18px;
    transition: all 0.2s;
  }

  .toggleBtn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .grid {
    align-items: start;
  }

  /* =========================
     SERVICES GRID
     ========================= */
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

  .cardTop {
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

  .cardSub {
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

  .block {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 12px;
    display: grid;
    gap: 8px;
  }

  .block.soft {
    border-top-color: rgba(255, 255, 255, 0.06);
  }

  .label {
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.6);
  }

  .list {
    margin: 0;
    padding-left: 18px;
    color: rgba(255, 255, 255, 0.88);
  }

  .list li {
    margin: 8px 0;
  }

  .list.subtle {
    color: rgba(255, 255, 255, 0.72);
  }

  .bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 12px;
  }

  .pill {
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.04);
    padding: 8px 10px;
    border-radius: 999px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.86);
    white-space: nowrap;
  }

  .link {
    color: rgba(255, 255, 255, 0.92);
    text-decoration: none;
    font-weight: 650;
    font-size: 14px;
  }

  .link:hover {
    color: white;
  }
</style>
