<script lang="ts">
  import { socialProof } from '$lib/data/socialProof';
  import Section from './Section.svelte';
</script>

<Section
  id="social-proof"
  title="Social proof"
  description="Teams I’ve worked with and the kind of outcomes they expect."
>
  <div class="grid">
    <div class="logos">
      {#each socialProof.logos as l}
        <div class="logo">{l}</div>
      {/each}
    </div>

    <figure class="quote">
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
