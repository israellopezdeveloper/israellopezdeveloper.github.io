<script lang="ts">
  import type { Project } from '$lib/data/types';
  import { onMount, onDestroy, tick } from 'svelte';

  export let p: Project;

  export let onSelect: (_p: Project) => void = (_p) => {};

  const formatPeriod = (p: Project) => {
    let time: number = 0;
    p.technologies?.forEach((t) => {
      time = Math.max(time, t.time);
    });
    return time + ' months';
  };

  let cardEl: HTMLElement | null = null;
  let tooltipEl: HTMLDivElement | null = null;

  let open = false;
  let x = 0;
  let y = 0;

  const GAP = 10;
  const MARGIN = 12;

  let isClient = false;

  function clamp(n: number, a: number, b: number) {
    return Math.max(a, Math.min(b, n));
  }

  async function updatePos() {
    if (!isClient || !cardEl) return;

    const r = cardEl.getBoundingClientRect();
    let desiredX = r.left + r.width / 2;
    let desiredY = r.bottom + GAP;

    await tick();

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const tw = tooltipEl?.offsetWidth ?? Math.min(520, vw * 0.92);
    const th = tooltipEl?.offsetHeight ?? 180;

    const minCenterX = MARGIN + tw / 2;
    const maxCenterX = vw - MARGIN - tw / 2;
    desiredX = clamp(desiredX, minCenterX, maxCenterX);

    const wouldOverflowBottom = desiredY + th + MARGIN > vh;
    if (wouldOverflowBottom) {
      desiredY = r.top - th - GAP;
      desiredY = clamp(desiredY, MARGIN, vh - th - MARGIN);
    }

    x = desiredX;
    y = desiredY;
  }

  function show() {
    if (!isClient) return;
    open = true;
    updatePos();
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
  }

  function hide() {
    if (!isClient) return;
    open = false;
    window.removeEventListener('scroll', updatePos, true);
    window.removeEventListener('resize', updatePos);
  }

  function select() {
    onSelect(p);
  }

  onMount(() => {
    isClient = true;
  });

  onDestroy(() => {
    if (isClient) hide();
  });
</script>

<article
  class="card"
  bind:this={cardEl}
  on:mouseenter={show}
  on:mouseleave={hide}
>
  <button
    class="card__hit"
    type="button"
    on:click={select}
    aria-label={`Open ${p.id}`}
  ></button>

  <div class="card__logoFrame">
    <img
      class="card__logo"
      src={p.thumbnail ?? '/images/github.webp '}
      alt={p.lang.en.name}
      loading="lazy"
    />
  </div>

  <div class="card__name" title={p.lang.en.name}>
    {p.lang.en.desc ?? p.lang.en.name}
  </div>
</article>

{#if open}
  <div
    class="tooltip-portal"
    bind:this={tooltipEl}
    style={`left:${x}px; top:${y}px;`}
  >
    <div class="tooltip__title">{p.lang.en.name}</div>

    {#if p.technologies}
      <div class="tooltip__meta">{formatPeriod(p)}</div>
    {/if}

    {#if p.lang.en.desc}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <div class="tooltip__desc">{@html p.lang.en.desc}</div>
    {/if}
  </div>
{/if}

<style>
  .card {
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    padding: 0.9rem;
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(8px);
    outline: none;

    display: grid;
    grid-template-rows: auto auto;
    gap: 0.65rem;
    justify-items: center;
    text-align: center;

    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .card__hit {
    position: absolute;
    inset: 0;
    border: 0;
    margin: 0;
    padding: 0;
    background: transparent;
    cursor: pointer;
    border-radius: 16px;
  }

  .card__hit:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.22);
    outline-offset: 2px;
  }

  .card__logoFrame {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.03);
    display: grid;
    place-items: center;
    overflow: hidden;
  }

  .card__logo {
    width: 70%;
    height: 70%;
    object-fit: contain;
  }

  .card__name {
    font-size: 0.98rem;
    line-height: 1.2;
    opacity: 0.92;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tooltip-portal {
    position: fixed;
    transform: translate(-50%, 0);
    width: min(520px, 92vw);
    padding: 0.9rem 1rem;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(10, 10, 12, 0.92);
    backdrop-filter: blur(10px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
    z-index: 99999;
    pointer-events: none;
  }

  .tooltip__title {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  .tooltip__meta {
    opacity: 0.8;
    font-size: 0.9rem;
    margin-bottom: 0.6rem;
  }
  .tooltip__desc {
    opacity: 0.92;
    font-size: 0.95rem;
  }

  .tooltip__desc :global(p) {
    margin: 0.35rem 0 0;
  }
  .tooltip__desc :global(ul) {
    margin: 0.35rem 0 0;
    padding-left: 1.1rem;
  }
</style>
