<script lang="ts">
  import { stack } from '$lib/data/stack';
  import Section from './Section.svelte';
</script>

<Section
  id="tech-stack"
  title="Tech stack"
  description="Focused tools I use to ship and maintain production systems."
>
  <div class="grid">
    {#each stack as g}
      <div class="group">
        <div class="label">{g.label}</div>
        <div class="chips">
          {#each g.items as item}
            <span
              class="chip has-tooltip"
              data-tooltip={`${item.experience} months`}
            >
              {item.name}
            </span>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</Section>

<style>
  .grid {
    display: grid;
    gap: 14px;
  }

  @media (min-width: 860px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }
  }

  .group {
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
    padding: 18px;
    display: grid;
    gap: 10px;
  }

  .label {
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.6);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  /* ============================
     Pills
     ============================ */

  .chip {
    position: relative;
    display: inline-flex;
    align-items: center;

    height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    white-space: nowrap;

    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.04);

    font-size: 13px;
    line-height: 1;
    color: rgba(255, 255, 255, 0.86);
  }

  /* ============================
     Tooltip (arriba + flecha)
     ============================ */

  .has-tooltip::after {
    content: attr(data-tooltip);
    position: absolute;
    left: 50%;
    bottom: calc(100% + 10px);

    transform: translateX(-50%) translateY(4px);
    opacity: 0;
    pointer-events: none;

    padding: 6px 10px;
    border-radius: 10px;
    font-size: 12px;
    line-height: 1;
    white-space: nowrap;

    color: rgba(255, 255, 255, 0.92);
    background: rgba(10, 10, 12, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);

    transition:
      opacity 120ms ease,
      transform 120ms ease;

    z-index: 50;
  }

  /* Flecha */
  .has-tooltip::before {
    content: '';
    position: absolute;
    left: 50%;
    bottom: calc(100% + 4px);

    width: 10px;
    height: 10px;

    background: rgba(10, 10, 12, 0.92);
    border-right: 1px solid rgba(255, 255, 255, 0.14);
    border-bottom: 1px solid rgba(255, 255, 255, 0.14);

    transform: translateX(-50%) rotate(45deg) translateY(4px);
    opacity: 0;
    pointer-events: none;

    transition:
      opacity 120ms ease,
      transform 120ms ease;

    z-index: 49;
  }

  .has-tooltip:hover::after,
  .has-tooltip:hover::before {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
</style>
