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
    <div class="heroPages">
      <!-- PAGE 1 -->
      <div class="page page--intro">
        <div class="heroContent">
          <div class="kicker">Senior IC · Freelance · Global</div>

          <h1 class="headline">
            Senior Software Engineer
            <span class="headline__muted"
              >(AI Systems · High-Performance Backend)</span
            >
          </h1>
        </div>
      </div>

      <!-- PAGE 2 -->
      <div class="page page--details">
        <div class="heroContent">
          <p class="subheadline">
            Hands-on engineer (80%+ coding) helping teams build, scale, and fix
            complex production systems — especially where AI, performance,
            reliability, and cost control matter. More than 15 years of
            experience:
          </p>

          <ul class="bullets">
            <li>
              AI in production: LLM/RAG integrations, model deployment,
              observability
            </li>
            <li>
              Distributed backend at scale: latency, throughput, resilience
            </li>
            <li>
              AWS &amp; cloud optimization: pragmatic architecture, measurable
              cost control
            </li>
          </ul>

          <div class="ctaSticky" class:reduced>
            <div class="ctaRow">
              <a class="primary" href="#contact">
                Let’s talk about your system
              </a>
              <a class="secondary" href="#experience">View selected work</a>
              <a class="primary" href="/CV.pdf" target="_blank">
                Download my PDF 📝
              </a>
            </div>
            <p class="micro">Hourly preferred · Open to project/retainer</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</Section>

<style>
  .heroShell {
    position: relative;
    width: 100%;
    height: 200vh;

    /* clave: crea contexto de apilado para que el ::before quede detrás */
    isolation: isolate;
  }

  /* Parallax “fixed” consistente (incluye Safari iOS) */
  .heroShell::before {
    content: '';
    position: fixed;
    inset: 0;

    background-image: url('/images/hero-israel.webp');
    background-repeat: no-repeat;
    background-size: cover;
    background-position: 50% 8%;

    pointer-events: none;
    transform: translateZ(0);
    will-change: transform;
    clip-path: inset(0 0 0 0);
  }

  @supports (clip-path: inset(0)) {
    .heroShell {
      /* crea el área de recorte para el pseudo-elemento */
      clip-path: inset(0);
    }
  }

  .heroPages {
    position: relative;
    z-index: 1;
    margin-top: 0;
  }

  .page {
    min-height: calc(100vh - 88px);
    display: flex;
  }

  .page--intro,
  .page--details {
    align-items: end;
  }

  .heroContent {
    width: 100%;
    max-width: 820px;
    margin-left: clamp(18px, 6vw, 84px);
    margin-right: 18px;
    background: rgba(2, 6, 23, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 20px;
    border-radius: 14px;
    margin-bottom: 100px;
  }

  @media (max-width: 600px) {
    .heroShell {
      padding-top: 72px;
    }

    .heroShell::before {
      background-position: 70% 8%;
    }

    .page {
      min-height: calc(100vh - 72px);
    }
    .page--details {
      padding-top: 14px;
    }
  }

  /* Tipografía */
  .kicker {
    color: rgba(255, 255, 255, 0.65);
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .headline {
    margin: 10px 0 12px;
    font-size: 40px;
    line-height: 1.05;
  }

  .headline__muted {
    display: inline-block;
    margin-left: 10px;
    font-size: 0.55em;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.72);
    letter-spacing: 0.01em;
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
    max-width: 64ch;
    margin: 0 0 18px;
  }

  .bullets {
    margin: 0 0 18px;
    padding-left: 18px;
    color: rgba(255, 255, 255, 0.82);
    max-width: 70ch;
  }

  .bullets li {
    margin: 8px 0;
  }

  .micro {
    margin: 14px 0 0;
    font-size: 13px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.62);
    max-width: 70ch;
  }

  .ctaSticky {
    position: sticky;
    bottom: 16px;
    z-index: 2;

    width: fit-content;
    margin-left: clamp(18px, 6vw, 84px);

    padding: 10px;
    border-radius: 14px;
  }

  .ctaSticky.reduced {
    backdrop-filter: none;
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
    white-space: nowrap;
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
</style>
