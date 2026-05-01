<script lang="ts">
  export let id: string | undefined = undefined;
  export let title: string | undefined = undefined;
  export let description: string | undefined = undefined;
  export let variant: 'default' | 'tight' | 'hero' = 'default';
</script>

<section {id} class={`section section--${variant}`}>
  {#if variant === 'hero'}
    <!-- Hero: full-bleed, sin inner -->
    <slot />
  {:else}
    <!-- Default sections: contenido centrado con max-width -->
    <div class="inner">
      {#if title || description}
        <div class="top">
          {#if title}<h2 class="title">{title}</h2>{/if}
          {#if description}<p class="desc">{description}</p>{/if}
        </div>
      {/if}

      <slot />
    </div>
  {/if}
</section>
