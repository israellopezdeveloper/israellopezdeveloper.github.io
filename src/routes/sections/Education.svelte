<script lang="ts">
  import Section from './Section.svelte';
  import cv from '$lib/data/data_CV.json';

  type PeriodTime = {
    start?: string;
    end?: string;
    current?: boolean;
  };

  type UniversityEdu = {
    title: string;
    university_name: string;
    summary?: string;
    thumbnail?: string;
    images?: string[];
    period_time?: PeriodTime;
  };

  type ComplementaryEdu = {
    title: string;
    institution: string;
    summary?: string;
    thumbnail?: string;
    images?: string[];
    certificate?: string;
    validation?: string;
    period_time?: PeriodTime;
  };

  type LanguageAccreditation = {
    institution: string;
    title: string;
    period_time?: PeriodTime;
  };

  type Language = {
    language: string;
    read: string;
    spoken: string;
    writen: string;
    thumbnail?: string;
    acreditation?: LanguageAccreditation[];
  };

  const educations = (cv as any)?.educations ?? {};
  const university: UniversityEdu[] = educations.university ?? [];
  const complementary: ComplementaryEdu[] = educations.complementary ?? [];
  const languages: Language[] = educations.languages ?? [];

  // Ajusta esta ruta si tus imágenes viven en otro sitio
  const IMG_BASE = '/images/educations';

  function formatPeriod(p?: PeriodTime) {
    if (!p) return '';
    const start = p.start ?? '';
    const end = p.current ? 'Present' : (p.end ?? '');
    return [start, end].filter(Boolean).join(' – ');
  }

  function pickLogo(item: { thumbnail?: string; images?: string[] }) {
    return item.thumbnail ?? item.images?.[0] ?? '';
  }
</script>

<Section id="education" title="Education & certifications">
  <div class="edu">
    <!-- UNIVERSITY -->
    <div class="block">
      <div class="block__label">University</div>

      <div class="grid">
        {#each university as e, i (e.title)}
          <article class="card">
            <input
              type="checkbox"
              id="toggle-input-u{i}"
              class="toggle-input"
            />
            <label for="toggle-input-u{i}" class="toggle-label how__title">
              <div class="head">
                {#if pickLogo(e)}
                  <div class="logoFrame" aria-hidden="true">
                    <img
                      class="logo"
                      src={`${IMG_BASE}/${pickLogo(e)}`}
                      alt=""
                      loading="lazy"
                    />
                  </div>
                {/if}

                <div class="headText">
                  <div class="title">{e.title}</div>
                  <div class="meta">
                    <span class="org">{e.university_name}</span>
                    {#if formatPeriod(e.period_time)}
                      <span class="dot">·</span>
                      <span class="period">{formatPeriod(e.period_time)}</span>
                    {/if}
                  </div>
                </div>
              </div>
            </label>

            {#if e.summary}
              <div class="summary content">{@html e.summary}</div>
            {/if}
          </article>
        {/each}
      </div>
    </div>

    <!-- CERTIFICATIONS / COURSES -->
    <div class="block">
      <div class="block__label">Certifications & courses</div>

      <div class="grid">
        {#each complementary as c, i (c.title)}
          <article class="card">
            <input
              type="checkbox"
              id="toggle-input-c{i}"
              class="toggle-input"
            />
            <label for="toggle-input-c{i}" class="toggle-label how__title">
              <div class="head">
                {#if pickLogo(c)}
                  <div class="logoFrame" aria-hidden="true">
                    <img
                      class="logo"
                      src={`${IMG_BASE}/${pickLogo(c)}`}
                      alt=""
                      loading="lazy"
                    />
                  </div>
                {/if}

                <div class="headText">
                  <div class="title">{c.title}</div>

                  <div class="meta">
                    <span class="org">{c.institution}</span>
                    {#if formatPeriod(c.period_time)}
                      <span class="dot">·</span>
                      <span class="period">{formatPeriod(c.period_time)}</span>
                    {/if}
                  </div>

                  {#if c.validation}
                    <div class="actions">
                      <a
                        class="link"
                        href={c.validation}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Verify →
                      </a>
                    </div>
                  {/if}
                </div>
              </div>
            </label>

            {#if c.summary}
              <div class="summary content">{@html c.summary}</div>
            {/if}
          </article>
        {/each}
      </div>
    </div>

    <!-- LANGUAGES -->
    <div class="block">
      <div class="block__label">Languages</div>

      <div class="grid grid--langs">
        {#each languages as l (l.language)}
          <article class="card card--lang">
            <div class="head">
              {#if l.thumbnail}
                <div class="logoFrame" aria-hidden="true">
                  <img
                    class="logo"
                    src={`${IMG_BASE}/${l.thumbnail}`}
                    alt=""
                    loading="lazy"
                  />
                </div>
              {/if}

              <div class="headText">
                <div class="title">{l.language}</div>
                <div class="meta">
                  <span class="chip">Spoken: {l.spoken}</span>
                  <span class="chip">Written: {l.writen}</span>
                  <span class="chip">Read: {l.read}</span>
                </div>

                {#if l.acreditation?.length}
                  <div class="accred">
                    {#each l.acreditation as a (a.title)}
                      <div class="accred__item">
                        <span class="org">{a.institution}</span>
                        <span class="dot">·</span>
                        <span class="period">{a.title}</span>
                        {#if formatPeriod(a.period_time)}
                          <span class="dot">·</span>
                          <span class="period"
                            >{formatPeriod(a.period_time)}</span
                          >
                        {/if}
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
          </article>
        {/each}
      </div>
    </div>
  </div>
</Section>

<style>
  .edu {
    display: grid;
    gap: 16px;
  }

  .block {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.02);
    border-radius: 14px;
    padding: 14px;
    display: grid;
    gap: 12px;
  }

  .block__label {
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.6);
  }

  .grid {
    display: grid;
    gap: 12px;
  }

  @media (min-width: 720px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px 14px;
    }
  }

  .grid--langs {
    grid-template-columns: 1fr;
  }

  @media (min-width: 860px) {
    .grid--langs {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .card {
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);
    border-radius: 14px;
    padding: 12px;
    display: grid;
    gap: 10px;
    min-width: 0;
  }

  .head {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 10px;
    align-items: start;
  }

  .logoFrame {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.03);
    display: grid;
    place-items: center;
    overflow: hidden;
    flex: 0 0 auto;
  }

  .logo {
    width: 70%;
    height: 70%;
    object-fit: contain;
    opacity: 0.95;
  }

  .headText {
    min-width: 0;
    display: grid;
    gap: 6px;
  }

  .title {
    font-weight: 750;
    font-size: 20px;
    color: rgba(255, 255, 255, 0.92);
    line-height: 1.25;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.72);
    line-height: 1.4;
  }

  .org {
    color: rgba(255, 255, 255, 0.82);
    font-weight: 650;
  }

  .dot {
    color: rgba(255, 255, 255, 0.45);
  }

  .period {
    color: rgba(255, 255, 255, 0.68);
  }

  .summary {
    font-size: 13px;
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.72);
  }

  .actions {
    margin-top: 2px;
  }

  .link {
    color: rgba(255, 255, 255, 0.85);
    text-decoration: none;
    font-weight: 650;
    font-size: 13px;
  }

  .link:hover {
    color: white;
  }

  .chip {
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.04);
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.78);
    white-space: nowrap;
  }

  .accred {
    display: grid;
    gap: 6px;
    margin-top: 2px;
  }

  .accred__item {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.72);
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

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
</style>
