<script lang="ts">
  import ClientOnly from '$lib/components/ClientOnly.svelte';
  import Panel from '$lib/components/Panel.svelte';
  import { prefersReducedMotion } from '$lib/utils/motion';
  import { onDestroy, onMount } from 'svelte';

  let host: HTMLDivElement | null = null;

  let reduced = false;
  const unsubMotion = prefersReducedMotion.subscribe((v) => (reduced = v));
  onDestroy(unsubMotion);

  let visible = false;
  let obs: IntersectionObserver | null = null;

  onMount(() => {
    if (!host) return;

    obs = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting);
      },
      { root: null, rootMargin: '300px', threshold: 0.01 }
    );

    obs.observe(host);

    return () => obs?.disconnect();
  });

  // TODO: montar renderer 3D cuando visible && !reduced
</script>

<ClientOnly>
  <div class="wrap" bind:this={host}>
    <Panel padded={false}>
      {#if reduced}
        <div class="fallback">
          <div class="tag">STATIC</div>
          <div class="hint">Reduced motion enabled</div>
        </div>
      {:else if visible}
        <div class="runtime">
          <div class="tag">3D</div>
          <div class="hint">Mount 3D renderer here (visible)</div>
        </div>
      {:else}
        <div class="fallback">
          <div class="tag">LAZY</div>
          <div class="hint">Waiting to enter viewport…</div>
        </div>
      {/if}
    </Panel>
  </div>

  <svelte:fragment slot="fallback">
    <Panel padded={false}>
      <div class="fallback">
        <div class="tag">SSR</div>
        <div class="hint">Static placeholder during SSR</div>
      </div>
    </Panel>
  </svelte:fragment>
</ClientOnly>

<style>
  .wrap {
    width: 100%;
  }
  :global(.panel) {
    overflow: hidden;
  }

  .fallback,
  .runtime {
    min-height: 320px;
    display: grid;
    place-items: center;
    text-align: center;
    padding: 18px;
  }
  @media (min-width: 960px) {
    .fallback,
    .runtime {
      min-height: 420px;
    }
  }

  .tag {
    display: inline-block;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    background: rgba(255, 255, 255, 0.06);
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 10px;
    color: rgba(255, 255, 255, 0.9);
  }
  .hint {
    color: rgba(255, 255, 255, 0.72);
    font-size: 14px;
  }
</style>
