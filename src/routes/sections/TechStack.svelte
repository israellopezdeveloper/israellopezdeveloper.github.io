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
            <span class="chip">{item}</span>
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
  }

  .chip {
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.04);
    padding: 8px 10px;
    border-radius: 999px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.86);
  }
</style>
