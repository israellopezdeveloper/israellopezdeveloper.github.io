<script lang="ts">
  import { browser } from '$app/environment';
  import { onDestroy, onMount, tick } from 'svelte';

  export let open = false;
  export let title = '';
  export let date = '';
  export let tags: string[] = [];
  export let onClose: () => void = () => {};

  let dialogEl: HTMLDivElement | null = null;

  // para restaurar foco y overflow
  let prevOverflow: string | null = null;
  let prevActiveEl: Element | null = null;

  function close() {
    onClose();
  }

  function onBackdropKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      close();
    }
  }

  function onGlobalKeydown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'Escape') close();
  }

  $: if (browser) {
    if (open) {
      if (prevOverflow === null) prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      prevActiveEl = document.activeElement;
      (async () => {
        await tick();
        dialogEl?.focus();
      })();
    } else {
      if (prevOverflow !== null) {
        document.body.style.overflow = prevOverflow;
        prevOverflow = null;
      }
      if (prevActiveEl instanceof HTMLElement) {
        prevActiveEl.focus();
      }
      prevActiveEl = null;
    }
  }

  onMount(() => {
    if (!browser) return;
    window.addEventListener('keydown', onGlobalKeydown);
    return () => window.removeEventListener('keydown', onGlobalKeydown);
  });

  onDestroy(() => {
    if (!browser) return;
    if (prevOverflow !== null) document.body.style.overflow = prevOverflow;
  });
</script>

{#if open}
  <div
    class="backdrop"
    role="button"
    tabindex="0"
    aria-label="Cerrar modal"
    on:click={close}
    on:keydown={onBackdropKeydown}
  >
    <div
      bind:this={dialogEl}
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabindex="-1"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <header class="header">
        <div>
          <h3>{title}</h3>
          <div class="meta">
            {#if date}<span>{date}</span>{/if}
            {#if tags?.length}
              <span class="dot">·</span>
              {#each tags as t}
                <span class="tag">#{t}</span>
              {/each}
            {/if}
          </div>
        </div>

        <button class="close" type="button" aria-label="Cerrar" on:click={close}
          >✕</button
        >
      </header>

      <div class="body">
        <slot />
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    display: grid;
    place-items: center;
    z-index: 1000;
    padding: 16px;
  }

  .modal {
    width: min(980px, 100%);
    max-height: min(82vh, 860px);
    overflow: hidden;
    border: 1px solid #222;
    border-radius: 14px;
    background: #0b0b0b;
    display: flex;
    flex-direction: column;
  }

  .modal:focus {
    outline: 2px solid rgba(255, 255, 255, 0.15);
    outline-offset: 2px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid #222;
  }

  h3 {
    margin: 0;
    font-size: 1.05rem;
  }

  .meta {
    margin-top: 6px;
    opacity: 0.75;
    font-size: 0.9rem;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .dot {
    opacity: 0.6;
  }

  .tag {
    opacity: 0.9;
    font-size: 0.85rem;
  }

  .close {
    border: 1px solid #222;
    background: transparent;
    color: inherit;
    border-radius: 10px;
    padding: 8px 10px;
    cursor: pointer;
  }

  .body {
    padding: 16px;
    overflow: auto;
  }
</style>
