<script lang="ts">
  import type { WorkProject } from '$lib/data/types';

  export let project: WorkProject;
  export let open = false;
  export let onToggle: () => void = () => {};
</script>

<button type="button" class="row" aria-expanded={open} on:click={onToggle}>
  <span class="title">{project.name}</span>
  <span class="chev" aria-hidden="true">{open ? '▾' : '▸'}</span>
</button>

{#if open}
  <div class="panel">
    {#if project.description}
      <div class="html">{@html project.description}</div>
    {/if}

    {#if project.technologies && project.technologies.length > 0}
      <div>
        <h4>Technologies</h4>
        <div class="pills">
          {#each project.technologies as t}
            <span class="pill">{t}</span>
          {/each}
        </div>
      </div>
    {/if}

    {#if project.links && project.links.length}
      <h4>Links</h4>
      <div class="links pills">
        {#each project.links as l}
          <a href={l.url} target="_blank">
            <span class="pill">{l.text}</span>
          </a>
        {/each}
      </div>
    {/if}

    {#if project.images && project.images.length > 0}
      <h4>Images</h4>
      {#each project.images as image}
        <img src="/images/works/{image}" alt={image} class="work-image" />
      {/each}
    {/if}
  </div>
{/if}

<style>
  .row {
    width: 100%;
    text-align: left;
    display: flex;
    justify-content: space-between;
    gap: 12px;

    padding: 10px 12px;
    margin: 10px 0px;
    border-radius: 12px;

    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.92);
    cursor: pointer;
  }
  .row:hover {
    border-color: rgba(255, 255, 255, 0.22);
    background: rgba(255, 255, 255, 0.06);
  }

  .title {
    font-weight: 650;
    font-size: 0.98rem;
    min-width: 0;
  }

  .chev {
    opacity: 0.85;
    flex: 0 0 auto;
  }

  .panel {
    margin-top: 8px;
    padding: 10px 12px 12px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
  }

  .html :global(p) {
    margin: 0.35rem 0 0;
    opacity: 0.92;
  }
  .html :global(ul) {
    margin: 0.35rem 0 0;
    padding-left: 1.1rem;
    opacity: 0.92;
  }

  .links {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 10px;
  }

  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .pill {
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.04);
    padding: 8px 10px;
    margin: 0px 0px 10px 0px;
    border-radius: 999px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.86);
    display: inline-block;
  }

  a {
    text-decoration: none;
  }
</style>
