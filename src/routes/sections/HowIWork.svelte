<script lang="ts">
  import Section from './Section.svelte';
</script>

<Section id="how-i-work" title="How I Work">
  <div class="topCtas">
    <div class="how">
      <div class="how__label">How I work</div>

      <div class="how__grid">
        <div class="how__item collapse-container">
          <input type="checkbox" id="toggle-input-how" class="toggle-input" />
          <label for="toggle-input-how" class="toggle-label how__title">
            Embedded senior IC
          </label>
          <div class="how__text content">
            I take ownership of a subsystem and ship improvements end-to-end
            (design → code → deploy → observe).
          </div>
        </div>

        <div class="how__item">
          <input type="checkbox" id="toggle-input-code" class="toggle-input" />
          <label for="toggle-input-code" class="toggle-label how__title">
            80%+ coding
          </label>
          <div class="how__text content">
            Minimal ceremony. Clear technical decisions and measurable outcomes.
          </div>
        </div>

        <div class="how__item">
          <input type="checkbox" id="toggle-input-ai" class="toggle-input" />
          <label for="toggle-input-ai" class="toggle-label how__title">
            AI in production
          </label>
          <div class="how__text content">
            LLM/RAG integrations, model deployment & observability — without
            risky rewrites.
          </div>
        </div>

        <div class="how__item">
          <input type="checkbox" id="toggle-input-fit" class="toggle-input" />
          <label for="toggle-input-fit" class="toggle-label how__title">
            Best fit
          </label>
          <div class="how__text content">
            Long-term work (6+ months) where I can run 2–3 parallel projects and
            drive sustained impact.
          </div>
        </div>
      </div>

      <div class="how__note">
        Typical outcomes: lower latency, higher reliability, clearer
        architecture, and predictable cost at scale.
      </div>
    </div>

    <div class="rightCol">
      <div class="pricing">
        <div class="pricing__label">Typical engagement</div>
        <div class="pricing__value">
          <span class="chip">Hourly</span>
          <strong>$100–$130/h</strong>
        </div>
        <div class="pricing__value">
          <span class="chip">Project</span>
          <strong>$3.6k+</strong>
          <span class="chip">Monthly retainer</span>
          <strong>$2.4k+</strong>
        </div>
        <div class="pricing__note">
          Global clients. Rates vary by scope and complexity — I’ll propose a
          clear plan before we start.
        </div>
      </div>

      <div class="primaryCta">
        <a class="btn" href="#contact">Let’s talk about your system →</a>
        <p class="hint">
          Best fit: production systems, high-impact work, minimal hand-holding.
          Prefer long-term engagements.
        </p>
        <div class="chipsRow">
          <span class="miniChip">80%+ coding</span>
          <span class="miniChip">6+ months</span>
          <span class="miniChip">2–3 parallel</span>
        </div>
      </div>
    </div>
  </div>
</Section>

<style>
  /* Ocultamos el checkbox real */
  .toggle-input {
    display: none;
  }

  /* Estilo básico del botón */
  .toggle-label {
    display: block;
    cursor: pointer;
    font-size: 20px;
    font-weight: 750;
    user-select: none;
  }

  /* El contenido está oculto por defecto */
  .content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-out; /* Animación suave */
  }

  /* Cuando el checkbox está marcado, mostramos el contenido */
  .toggle-input:checked ~ .content {
    max-height: 200px; /* Un valor lo suficientemente alto */
    padding: 10px;
  }

  .topCtas {
    display: grid;
    gap: 14px;
    margin-bottom: 16px;
  }

  @media (min-width: 860px) {
    .topCtas {
      grid-template-columns: 1.15fr 0.85fr;
      align-items: start;
      gap: 18px;
      margin-bottom: 18px;
    }
  }

  /* =========================
     HOW I WORK
     ========================= */
  .how {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
    border-radius: 14px;
    padding: 14px 14px;
    display: grid;
    gap: 10px;
  }

  .how__label {
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.6);
  }

  .how__grid {
    display: grid;
    gap: 12px;
  }

  @media (min-width: 640px) {
    .how__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px 14px;
    }
  }

  .how__item {
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
    padding: 12px 12px;
    display: grid;
    gap: 6px;
  }

  .how__title {
    color: rgba(255, 255, 255, 0.92);
  }

  .how__text {
    font-size: 13px;
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.72);
  }

  .how__note {
    color: rgba(255, 255, 255, 0.68);
    font-size: 13px;
    line-height: 1.5;
  }

  .rightCol {
    display: grid;
    gap: 14px;
  }

  /* =========================
     PRICING
     ========================= */
  .pricing {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
    border-radius: 14px;
    padding: 14px 14px;
    display: grid;
    gap: 10px;
  }

  .pricing__label {
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.6);
  }

  .pricing__value {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    color: rgba(255, 255, 255, 0.92);
    line-height: 1.4;
    font-size: 14px;
  }

  .pricing__note {
    color: rgba(255, 255, 255, 0.68);
    font-size: 13px;
    line-height: 1.5;
  }

  .chip {
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.04);
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.86);
    white-space: nowrap;
  }

  .muted {
    color: rgba(255, 255, 255, 0.62);
    font-size: 13px;
  }

  /* =========================
     CTA
     ========================= */
  .primaryCta {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.02);
    border-radius: 14px;
    padding: 14px 14px;
    display: grid;
    gap: 10px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.96);
    text-decoration: none;
    font-weight: 750;
    font-size: 14px;
  }

  .btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.22);
    color: white;
  }

  .hint {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.68);
  }

  .chipsRow {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .miniChip {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.78);
    white-space: nowrap;
  }

  /* =========================
   MOBILE: full width
   ========================= */
  @media (max-width: 859px) {
    .how,
    .pricing,
    .primaryCta {
      width: 100%;
    }
  }
</style>
