<script lang="ts">
  import { prefersReducedMotion } from '$lib/utils/motion';
  import { onDestroy } from 'svelte';
  import Section from './Section.svelte';

  let reduced = false;

  const unsub = prefersReducedMotion.subscribe((v) => (reduced = v));
  onDestroy(unsub);
</script>

<Section id="about" variant="hero">
  <div class="heroShell">
    <!-- Media layer -->
    <div class="heroMedia" aria-hidden="true">
      <img
        class="heroImg"
        src="/images/hero-israel.png"
        alt=""
        loading="eager"
        decoding="async"
      />
      <div class="heroOverlay"></div>
    </div>

    <!-- Content layer -->
    <div class="heroContent" class:reduced>
      <div class="kicker">Freelance · Senior</div>
      <h1 class="headline">Backend &amp; Cloud Engineer</h1>

      <p class="subheadline">
        I build and scale production systems with a performance-first mindset:
        reliability, cost control, and clean architecture you can evolve.
      </p>

      <ul class="bullets">
        <li>Scale backend systems and reduce latency under real traffic</li>
        <li>Cloud/serverless optimization (AWS) with strong observability</li>
        <li>AI/LLM integration on top of existing systems (no rewrites)</li>
      </ul>

      <div class="proof">
        <span class="pill">15+ years</span>
        <span class="pill">Production systems</span>
        <span class="pill">Async / distributed</span>
      </div>

      <div class="ctaRow">
        <a class="primary" href="#contact">Book a call</a>
        <a class="secondary" href="#experience">View selected work</a>
      </div>
    </div>
  </div>
</Section>

<style>
  /* Contenedor real del hero: referencia para el absolute + 100vh */
  .heroShell {
    position: relative;
    width: 100%;
    min-height: 100vh;

    /* para que el contenido no quede debajo del header sticky */
    padding-top: 88px;

    display: flex;
    align-items: center;
    overflow: hidden;
  }

  /* =========================
     MEDIA (IMAGE + OVERLAY)
     ========================= */
  .heroMedia {
    position: absolute;
    inset: 0;
  }

  .heroImg {
    width: 100%;
    height: 100%;
    object-fit: cover;

    /* 🔑 IMPORTANTE: foto vertical => en desktop hay que subir el encuadre */
    object-position: 50% 8%;

    filter: saturate(1.05) contrast(1.05);
    transform: scale(1.02);
  }

  /* Si la pantalla es MUY panorámica, todavía sube más la cara */
  @media (min-aspect-ratio: 16/9) {
    .heroImg {
      object-position: 50% 6%;
    }
  }

  .heroOverlay {
    position: absolute;
    inset: 0;

    /* Más oscuro en la izquierda para que el texto NO compita con la cara */
    background: linear-gradient(
      to right,
      rgba(2, 6, 23, 0.92) 0%,
      rgba(2, 6, 23, 0.75) 38%,
      rgba(2, 6, 23, 0.22) 72%,
      rgba(2, 6, 23, 0.08) 100%
    );
  }

  /* =========================
     CONTENT LAYER
     ========================= */
  .heroContent {
    position: relative;
    z-index: 1;

    width: 100%;
    max-width: 760px;

    /* texto a la izquierda, no centrado en la cara */
    margin-left: clamp(18px, 6vw, 84px);
    margin-right: 18px;
  }

  @media (max-width: 600px) {
    .heroShell {
      padding-top: 72px;
    }
    .heroImg {
      object-position: 50% 10%;
    }
  }

  /* =========================
     TYPOGRAPHY & UI
     ========================= */
  .kicker {
    color: rgba(255, 255, 255, 0.65);
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .headline {
    margin: 10px 0 12px;
    font-size: 44px;
    line-height: 1.05;
  }

  @media (min-width: 960px) {
    .headline {
      font-size: 56px;
    }
  }

  .subheadline {
    color: rgba(255, 255, 255, 0.78);
    font-size: 16px;
    line-height: 1.6;
    max-width: 58ch;
    margin: 0 0 18px;
  }

  .bullets {
    margin: 0 0 18px;
    padding-left: 18px;
    color: rgba(255, 255, 255, 0.82);
  }

  .bullets li {
    margin: 8px 0;
  }

  .proof {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 18px 0 22px;
  }

  .pill {
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.04);
    padding: 8px 10px;
    border-radius: 999px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.86);
  }

  .ctaRow {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .primary,
  .secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    padding: 10px 14px;
    font-weight: 650;
    text-decoration: none;
    font-size: 14px;
  }

  .primary {
    background: white;
    color: black;
  }

  .secondary {
    border: 1px solid rgba(255, 255, 255, 0.16);
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.92);
  }

  .secondary:hover {
    color: white;
  }

  /* =========================
     INTRO ANIMATION
     ========================= */
  .heroContent {
    animation: fadeUp 0.8s ease-out both;
  }

  .reduced.heroContent {
    animation: none;
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
