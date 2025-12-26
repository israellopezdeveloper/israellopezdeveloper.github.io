<script lang="ts">
  import Panel from '$lib/components/Panel.svelte';
  import { services } from '$lib/data/services';
  import Section from './Section.svelte';
</script>

<Section
  id="services"
  title="Services"
  description="Senior-level engagements for teams with a live product—focused on performance, reliability, scalability, and clear delivery."
>
  <div class="topCtas">
    <div class="pricing">
      <div class="pricing__label">Typical engagement</div>
      <div class="pricing__value">
        <span class="chip">Consulting / Architecture</span>
        <span class="muted">from</span>
        <strong>€90–€120/h</strong>
        <span class="muted">·</span>
        <span class="chip">Project</span>
        <strong>€3k+</strong>
        <span class="muted">·</span>
        <span class="chip">Monthly retainer</span>
        <strong>€2k+</strong>
      </div>
      <div class="pricing__note">
        Rates vary with scope and complexity. I’ll always propose a clear plan
        before we start.
      </div>
    </div>

    <div class="primaryCta">
      <a class="btn" href="#contact">Talk through your situation →</a>
      <p class="hint">
        Best fit: systems in production, high-impact work, minimal hand-holding
        needed.
      </p>
    </div>
  </div>

  <div class="grid">
    {#each services as s}
      <Panel as="aside">
        <div class="cardTop">
          <div class="titleRow">
            <h3 class="cardTitle">{s.title}</h3>
            {#if s.badge}
              <span class="badge">{s.badge}</span>
            {/if}
          </div>

          <p class="cardSub">{s.subtitle}</p>

          {#if s.outcome}
            <p class="outcome">{s.outcome}</p>
          {/if}
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

        {#if s.notFor}
          <div class="block soft">
            <div class="label">Not a fit for</div>
            <ul class="list subtle">
              {#each s.notFor as n}
                <li>{n}</li>
              {/each}
            </ul>
          </div>
        {/if}

        <div class="bottom">
          <span class="pill">{s.engagement}</span>
          <a class="link" href="#contact">Discuss this →</a>
        </div>
      </Panel>
    {/each}
  </div>
</Section>

<style>
  .topCtas {
    display: grid;
    gap: 14px;
    margin-bottom: 16px;
  }
  @media (min-width: 860px) {
    .topCtas {
      grid-template-columns: 1.2fr 0.8fr;
      align-items: start;
      gap: 18px;
      margin-bottom: 18px;
    }
  }

  .pricing {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
    border-radius: 14px;
    padding: 14px 14px;
    display: grid;
    gap: 10px;
  }
  .pricing__label {
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.6);
  }
  .pricing__value {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    color: rgba(255, 255, 255, 0.92);
    line-height: 1.4;
    font-size: 14px;
  }
  .pricing__note {
    color: rgba(255, 255, 255, 0.68);
    font-size: 13px;
    line-height: 1.5;
  }
  .chip {
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.04);
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.86);
    white-space: nowrap;
  }
  .muted {
    color: rgba(255, 255, 255, 0.62);
    font-size: 13px;
  }

  .primaryCta {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.02);
    border-radius: 14px;
    padding: 14px 14px;
    display: grid;
    gap: 10px;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.96);
    text-decoration: none;
    font-weight: 750;
    font-size: 14px;
  }
  .btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.22);
    color: white;
  }
  .hint {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.68);
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
