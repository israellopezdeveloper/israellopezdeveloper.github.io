<script lang="ts">
  export let as: 'div' | 'article' | 'aside' | 'section' | 'figure' = 'div';
  export let padded: boolean = true;
  export let radius: 'md' | 'lg' = 'lg';
</script>

<svelte:element
  this={as}
  class={`panel ${padded ? 'panel--padded' : ''} ${radius === 'md' ? 'panel--md' : 'panel--lg'}`}
>
  <slot />
</svelte:element>
