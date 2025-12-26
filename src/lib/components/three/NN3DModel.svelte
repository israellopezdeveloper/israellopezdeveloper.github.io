<script lang="ts">
  import ClientOnly from '$lib/components/ClientOnly.svelte';
  import { prefersReducedMotion } from '$lib/utils/motion';
  import {
    Nn3d,
    type LayerNode,
    type ModelNode,
    type NeuronNode
  } from '@israellopezdeveloper/nn3d';
  import { onDestroy } from 'svelte';
  import { nn_works } from '$lib/data/nn_works';
  import { nn_projects } from '$lib/data/nn_projects';

  const nn_data = [...nn_works, ...nn_projects];

  export let nn: Nn3d | null = null;

  export let onNothingSelect: (() => void) | undefined;
  export let onModelSelect: ((info: ModelNode) => void) | undefined;
  export let onLayerSelect:
    | ((modelId: string, info: LayerNode) => void)
    | undefined;
  export let onNeuronSelect:
    | ((modelId: string, layerId: string, info: NeuronNode) => void)
    | undefined;

  let reduced = false;
  let _nn: Nn3d | null = null;
  $: nn = _nn;
  const unsubMotion = prefersReducedMotion.subscribe((v) => (reduced = v));
  onDestroy(unsubMotion);

  let visible = false;

  function intersect(node: HTMLElement) {
    const obs = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting);
      },
      { root: null, rootMargin: '300px', threshold: 0.01 }
    );

    obs.observe(node);

    return {
      destroy() {
        obs.disconnect();
      }
    };
  }
</script>

<div class="wrap" use:intersect>
  {#if reduced}
    <div class="fallback">
      <div class="tag">STATIC</div>
      <div class="hint">Reduced motion enabled</div>
    </div>
  {:else if visible}
    <ClientOnly>
      <div class="runtime">
        <Nn3d
          bind:this={_nn}
          models={nn_data}
          {onNothingSelect}
          {onModelSelect}
          {onLayerSelect}
          {onNeuronSelect}
          neuronOutColor={0x7fb9ff}
          neuronInColor={0x4defff}
          lineColor={0x303055}
          neuronSpacing={1.5}
          layerSpacing={3.0}
        ></Nn3d>
      </div>
    </ClientOnly>
  {:else}
    <div class="fallback">
      <div class="tag">LAZY</div>
      <div class="hint">Waiting to enter viewport…</div>
    </div>
  {/if}
</div>

<style>
  .wrap {
    width: 100%;
    height: 100%;
  }

  .fallback,
  .runtime {
    min-height: 340px;
    height: 75vh;
    display: grid;
    place-items: center;
    text-align: center;
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
    color: rgba(255, 255, 255, 0.9);
  }

  .hint {
    color: rgba(255, 255, 255, 0.72);
    font-size: 14px;
  }
</style>
