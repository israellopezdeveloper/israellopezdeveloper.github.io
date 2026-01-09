<script lang="ts">
  import { browser } from '$app/environment';
  import Section from './Section.svelte';
  import PostModal from '$lib/components/PostModal.svelte';

  const PORTFOLIO_TITLE = 'Israel Lopez';

  type PostMeta = {
    title: string;
    date: string;
    tags?: string[];
    summary?: string;
  };

  type PostModule = {
    default: any;
    metadata?: PostMeta;
  };

  const modules = import.meta.glob('$lib/data/posts/*.sveltex', {
    eager: true
  }) as Record<string, PostModule>;

  const posts = Object.entries(modules)
    .map(([path, mod]) => {
      const slug = path
        .split('/')
        .pop()!
        .replace(/\.sveltex$/, '');

      const meta = mod.metadata ?? {
        title: slug,
        date: '1970-01-01',
        tags: [],
        summary: ''
      };

      return { slug, meta, Component: mod.default };
    })
    .sort((a, b) => Date.parse(b.meta.date) - Date.parse(a.meta.date));

  let open = false;
  let selected: null | (typeof posts)[number] = null;

  function openPost(p: (typeof posts)[number]) {
    selected = p;
    open = true;
  }

  function close() {
    open = false;
    selected = null;
  }

  let titleObserver: MutationObserver | null = null;

  function ensureTitle() {
    if (!browser) return;
    if (document.title !== PORTFOLIO_TITLE) {
      document.title = PORTFOLIO_TITLE;
    }
  }

  function startTitleLock() {
    if (!browser) return;

    // fuerza inmediatamente
    ensureTitle();

    if (!titleObserver) {
      titleObserver = new MutationObserver(() => {
        ensureTitle();
      });
      titleObserver.observe(document.head, { childList: true, subtree: true });
    }
  }

  function stopTitleLock() {
    if (!browser) return;

    if (titleObserver) {
      titleObserver.disconnect();
      titleObserver = null;
    }

    ensureTitle();
  }

  $: if (browser) {
    if (open) startTitleLock();
    else stopTitleLock();
  }
</script>

<Section id="posts" title="Posts">
  {#if posts.length === 0}
    <p class="empty">Aún no hay posts.</p>
  {:else}
    <ul class="list">
      {#each posts as p (p.slug)}
        <li>
          <button class="card" type="button" on:click={() => openPost(p)}>
            <div class="top">
              <div class="date">{p.meta.date}</div>
              <div class="title">{p.meta.title}</div>
            </div>

            {#if p.meta.summary}
              <div class="summary">{p.meta.summary}</div>
            {/if}

            {#if p.meta.tags?.length}
              <div class="tags">
                {#each p.meta.tags as t (t)}
                  <span class="tag">#{t}</span>
                {/each}
              </div>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  <PostModal
    {open}
    title={selected?.meta.title ?? ''}
    date={selected?.meta.date ?? ''}
    tags={selected?.meta.tags ?? []}
    onClose={close}
  >
    {#if selected}
      <svelte:component this={selected.Component} />
    {/if}
  </PostModal>
</Section>

<style>
  .empty {
    opacity: 0.8;
    margin-top: 12px;
  }

  .list {
    list-style: none;
    padding: 0;
    margin: 16px 0 0;
    display: grid;
    gap: 12px;
  }

  .card {
    width: 100%;
    text-align: left;
    border: 1px solid #222;
    border-radius: 12px;
    padding: 14px;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }
  .top {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: baseline;
  }
  .date {
    opacity: 0.75;
    font-size: 0.9rem;
  }
  .title {
    font-weight: 600;
  }
  .summary {
    margin-top: 8px;
    opacity: 0.9;
    line-height: 1.5;
  }
  .tags {
    margin-top: 10px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    opacity: 0.85;
  }
  .tag {
    font-size: 0.85rem;
  }
</style>
