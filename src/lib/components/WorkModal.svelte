<script lang="ts">
  import type { Project, Work } from '$lib/data/types';
  import { onMount, onDestroy, tick } from 'svelte';
  import ProjectCollapsible from './ProjectCollapsible.svelte';
  import { slugify } from './three/NN3DModel';

  export let open = false;
  export let selected: Work | Project | null = null;
  export let project: string | null = null;
  export let onClose: () => void = () => {};
  export let onProjectClick: (
    layerName: string,
    projectName?: string
  ) => void = () => {};

  let dialogEl: HTMLDivElement | null = null;
  let prevActive: Element | null = null;

  let openProjectIdx: number | null = null;

  /* ===============================
     UI / ACCESIBILIDAD
     =============================== */

  const formatPeriod = (w: Work) => {
    const start = w?.period_time?.start ?? '';
    const end = w?.period_time?.current
      ? 'Actualidad'
      : (w?.period_time?.end ?? '');
    return [start, end].filter(Boolean).join(' – ');
  };

  function close() {
    openProjectIdx = null;
    onClose();
  }

  function onOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) close();
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'Escape') close();
  }

  $: if (typeof document !== 'undefined') {
    document.body.style.overflow = open ? 'hidden' : '';
  }

  onMount(() => {
    if (typeof document !== 'undefined') {
      prevActive = document.activeElement;
    }
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  });

  $: if (open) {
    tick().then(() => dialogEl?.focus());
  }

  $: selected;
  $: project;

  $: if (
    !open &&
    prevActive &&
    typeof (prevActive as HTMLElement).focus === 'function'
  ) {
    queueMicrotask(() => (prevActive as HTMLElement).focus());
  }
</script>

<svelte:window on:keydown={onKeyDown} />

{#if open && selected}
  <div class="overlay" role="presentation" on:click={onOverlayClick}>
    {#if selected && (selected as Work).period_time}
      <div
        class="dialog"
        role="dialog"
        aria-modal="true"
        tabindex="0"
        bind:this={dialogEl}
      >
        <header class="header">
          <div class="head-left">
            {#if (selected as Work).thumbnail}
              <div class="logoFrame">
                <img
                  class="logo"
                  src={`/images/works/${(selected as Work).thumbnail}`}
                  alt={(selected as Work).name}
                />
              </div>
            {/if}

            <div class="title">
              <div class="name">{(selected as Work).name}</div>
              {#if (selected as Work).period_time}
                <div class="meta">{formatPeriod(selected as Work)}</div>
              {/if}
            </div>
          </div>

          <button class="close" type="button" on:click={close}>✕</button>
        </header>

        <div class="content">
          {#if (selected as Work).full_description}
            <section class="block">
              <div class="html">
                {@html (selected as Work).full_description}
              </div>
            </section>
          {/if}

          {#if (selected as Work).projects?.length}
            <section class="block">
              <h4>Projects</h4>

              <div class="projects">
                {#each (selected as Work).projects as p, idx (p.name)}
                  <div data-project-idx={idx}>
                    <ProjectCollapsible
                      project={p}
                      open={openProjectIdx === idx ||
                        slugify(p.name) === project}
                      onToggle={() => {
                        const isOpen = openProjectIdx === idx;
                        openProjectIdx = isOpen ? null : idx;

                        onProjectClick(
                          slugify((selected as Work).name),
                          isOpen ? undefined : slugify(p.name)
                        );
                      }}
                    />
                  </div>
                {/each}
              </div>
            </section>
          {/if}
        </div>
      </div>
    {:else}
      <div
        class="dialog"
        role="dialog"
        aria-modal="true"
        tabindex="0"
        bind:this={dialogEl}
      >
        <header class="header">
          <div class="head-left">
            {#if (selected as Project).thumbnail}
              <div class="logoFrame">
                <img
                  class="logo"
                  src={(selected as Project).thumbnail}
                  alt={(selected as Project).lang.en.name}
                />
              </div>
            {/if}

            <div class="title">
              <div class="name">{(selected as Project).lang.en.name}</div>

              {#if selected && 'technologies' in selected}
                {#if selected.technologies && selected.technologies.length > 0}
                  <div class="meta">
                    {selected.technologies[0].time} months
                  </div>
                {/if}
              {/if}
            </div>
          </div>

          <button class="close" type="button" on:click={close}>✕</button>
        </header>

        <div class="content">
          {#if (selected as Project).lang.en.desc}
            <section class="block">
              <h4>Summary</h4>
              <div class="html">
                {@html (selected as Project).lang.en.desc}
              </div>
            </section>
          {/if}
          {#if selected && 'technologies' in selected}
            {#if selected.technologies && selected.technologies.length > 0}
              <div>
                <h4>Technologies</h4>
                <div class="pills">
                  {#each selected.technologies as t}
                    <span class="pill">{t.tech}</span>
                  {/each}
                </div>
              </div>
            {/if}
          {/if}
          {#if (selected as Project).url}
            <section class="block">
              <h4>URL</h4>
              <div class="html">
                <a href={(selected as Project).url} target="_blank">
                  <span class="pill"
                    >GitHub {(selected as Project).lang.en.name}</span
                  >
                </a>
              </div>
            </section>
          {/if}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .overlay {
    position: absolute;
    inset: 0;
    z-index: 2000;

    background: rgba(0, 0, 0, 0);
    backdrop-filter: blur(6px);

    display: grid;
    place-items: start center;
    padding: 12px;
    height: 70vh;
  }

  .dialog {
    max-height: 85vh;
    height: 65vh;
    width: 100%;
    overflow: auto;

    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(10, 10, 12, 0.98);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);

    margin-top: 0;
    outline: none;
  }

  .header {
    position: sticky;
    top: 0;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 16px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(10, 10, 12, 0.9);
    backdrop-filter: blur(10px);
    z-index: 2;
  }

  .head-left {
    display: flex;
    gap: 12px;
    align-items: center;
    min-width: 0;
  }

  .logoFrame {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.04);
    display: grid;
    place-items: center;
    overflow: hidden;
    flex: 0 0 auto;
  }

  .logo {
    width: 76%;
    height: 76%;
    object-fit: contain;
    display: block;
  }

  .title {
    min-width: 0;
  }

  .name {
    font-weight: 700;
    font-size: 1.05rem;
    line-height: 1.2;
  }

  .meta {
    opacity: 0.75;
    font-size: 0.92rem;
    margin-top: 2px;
  }

  .close {
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.9);
    width: 36px;
    height: 36px;
    cursor: pointer;
  }
  .close:hover {
    color: white;
    border-color: rgba(255, 255, 255, 0.24);
  }

  .content {
    padding: 14px 16px 18px;
    display: grid;
    gap: 14px;
  }

  .block h4 {
    margin: 0 0 6px;
    font-size: 0.95rem;
    opacity: 0.9;
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

  h4 {
    padding: 10px 0px;
  }

  div.html {
    text-align: justify;
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
</style>
