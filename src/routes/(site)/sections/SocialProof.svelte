<script lang="ts">
  import { socialProof } from '$lib/data/socialProof';
  import Section from './Section.svelte';

  // Optional safety defaults (in case fields are missing)
  const awards = socialProof.awards ?? [];
  const recommendations = socialProof.recommendations ?? [];
</script>

<Section
  id="social-proof"
  title="Social proof"
  description="Teams I’ve worked with and the kind of outcomes they expect."
>
  <div class="grid">
    <div class="logos">
      {#each socialProof.logos as l (l)}
        <div class="logo">{l}</div>
      {/each}
    </div>

    <figure class="quote">
      {#if awards.length || recommendations.length}
        <div class="proof">
          {#each awards as a (a.title)}
            <div class="chip">
              <span class="chip__label">Award</span>
              <span class="chip__text">{a.title}</span>
              {#if a.org}<span class="chip__meta">· {a.org}</span>{/if}
              {#if a.year}<span class="chip__meta">· {a.year}</span>{/if}
            </div>
          {/each}

          {#each recommendations as r (r.role)}
            {#if r.url}
              <a
                class="chip chip--link"
                href={r.url}
                target="_blank"
                rel="noreferrer"
              >
                <span class="chip__label">Recommendation</span>
                <span class="chip__text">{r.org ?? 'Devo'}</span>
                {#if r.author}<span class="chip__meta">· {r.author}</span>{/if}
              </a>
            {:else}
              <div class="chip">
                <span class="chip__label">Recommendation</span>
                <span class="chip__text">{r.org ?? 'Devo'}</span>
                {#if r.author}<span class="chip__meta">· {r.author}</span>{/if}
              </div>
            {/if}
          {/each}
        </div>
      {/if}

      <blockquote>“{socialProof.testimonial.quote}”</blockquote>

      <figcaption>
        <div class="author">{socialProof.testimonial.author}</div>
        <div class="role">{socialProof.testimonial.role}</div>
      </figcaption>
    </figure>
  </div>
</Section>

<style>
  .grid {
    display: grid;
    gap: 16px;
  }
  @media (min-width: 960px) {
    .grid {
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      align-items: stretch;
    }
  }

  .logos {
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
    padding: 18px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    align-content: start;
  }
  @media (min-width: 540px) {
    .logos {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  .logo {
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.22);
    padding: 12px 10px;
    text-align: center;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 650;
    font-size: 13px;
    letter-spacing: 0.01em;
  }

  .quote {
    margin: 0;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
    padding: 18px;
    display: grid;
    gap: 14px;
  }

  /* NEW: proof chips */
  .proof {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(0, 0, 0, 0.18);
    color: rgba(255, 255, 255, 0.86);
    font-size: 12.5px;
    line-height: 1;
    white-space: nowrap;
  }

  .chip--link {
    text-decoration: none;
    transition:
      transform 120ms ease,
      border-color 120ms ease;
  }
  .chip--link:hover {
    transform: translateY(-1px);
    border-color: rgba(255, 255, 255, 0.22);
  }

  .chip__label {
    font-weight: 800;
    letter-spacing: 0.02em;
    color: rgba(255, 255, 255, 0.95);
  }
  .chip__text {
    font-weight: 650;
  }
  .chip__meta {
    color: rgba(255, 255, 255, 0.65);
  }

  blockquote {
    margin: 0;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.65;
    font-size: 15px;
  }

  .author {
    font-weight: 750;
    color: white;
  }
  .role {
    color: rgba(255, 255, 255, 0.65);
    font-size: 13px;
    margin-top: 4px;
  }
</style>
