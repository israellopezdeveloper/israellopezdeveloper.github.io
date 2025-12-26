<script lang="ts">
  import Panel from '$lib/components/Panel.svelte';
  import { services } from '$lib/data/services';
  import Section from './Section.svelte';
</script>

<Section
  id="services"
  title="Services"
  description="Clear engagements designed for teams that already have a running product and need senior-level execution."
>
  <div class="grid">
    {#each services as s}
      <Panel as="article">
        <div class="cardTop">
          <h3 class="cardTitle">{s.title}</h3>
          <p class="cardSub">{s.subtitle}</p>
        </div>

        <div class="block">
          <div class="label">When it fits</div>
          <ul class="list">
            {#each s.when as w}
              <li>{w}</li>
            {/each}
          </ul>
        </div>

        <div class="block">
          <div class="label">Deliverables</div>
          <ul class="list">
            {#each s.deliverables as d}
              <li>{d}</li>
            {/each}
          </ul>
        </div>

        <div class="bottom">
          <span class="pill">{s.engagement}</span>
          <a class="link" href="#contact">Discuss this →</a>
        </div>
      </Panel>
    {/each}
  </div>
</Section>

<style>
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
  .cardTitle {
    margin: 0;
    font-size: 18px;
    line-height: 1.2;
  }
  .cardSub {
    margin: 0;
    color: rgba(255, 255, 255, 0.74);
    line-height: 1.55;
    font-size: 14px;
  }

  .block {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 12px;
    display: grid;
    gap: 8px;
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
    color: rgba(255, 255, 255, 0.86);
  }
  .list li {
    margin: 8px 0;
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
