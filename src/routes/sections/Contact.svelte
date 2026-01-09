<script lang="ts">
  import Section from './Section.svelte';
</script>

<Section
  id="contact"
  title="Let’s talk"
  description="If you have a system in production and need senior-level clarity, execution, or a second opinion, we should talk."
>
  <div class="contact">
    <div class="left">
      <h3 class="headline">How I usually work</h3>

      <ul class="points">
        <li>Short call to understand context and constraints</li>
        <li>Clear proposal: scope, risks, and next steps</li>
        <li>No overengineering, no buzzwords, no surprises</li>
      </ul>

      <p class="note">
        Best fit for teams with a live product, real users, and non-trivial
        technical challenges.
      </p>

      <p class="note subtle">
        If you’re unsure whether your problem fits, that’s usually a good sign.
      </p>
    </div>

    <div class="right">
      <div class="card">
        <div class="label">Get in touch</div>

        <a
          class="cta primary with-icon"
          href="mailto:israel.lopez.developer@gmail.com"
        >
          <img
            src="/images/contact/email.svg"
            alt="email"
            class="icon"
            loading="lazy"
          />
          israel.lopez.developer@gmail.com →
        </a>

        <a
          class="cta with-icon"
          href="https://www.linkedin.com/in/israellopezmaiz/"
          target="_blank"
          rel="noopener"
        >
          <img
            src="/images/contact/linkedin.svg"
            alt="LinkedIn"
            class="icon"
            loading="lazy"
          />
          LinkedIn profile →
        </a>

        <a
          class="cta with-icon"
          href="https://calendly.com/israel-lopez-developer"
          target="_blank"
          rel="noopener"
        >
          <img
            src="/images/contact/calendly.svg"
            alt="Calendly"
            class="icon"
            loading="lazy"
          />
          Schedule a call →
        </a>

        <a
          class="cta with-icon"
          href="https://discord.com/users/714146726390530069"
          target="_blank"
          rel="noopener"
        >
          <img
            src="/images/contact/discord.svg"
            alt="Discord"
            class="icon"
            loading="lazy"
          />
          Discord (technical teams) →
        </a>

        <div class="divider"></div>

        <div class="footnote">Remote-first · English / Spanish / Chinese</div>
      </div>
    </div>
  </div>
</Section>

<style>
  .contact {
    display: grid;
    gap: 18px;
  }

  @media (min-width: 860px) {
    .contact {
      grid-template-columns: 1.2fr 0.8fr;
      gap: 22px;
      align-items: start;
    }
  }

  /* LEFT */

  .left {
    display: grid;
    gap: 14px;
  }

  .headline {
    margin: 0;
    font-size: 18px;
    line-height: 1.25;
  }

  .points {
    margin: 0;
    padding-left: 18px;
    color: rgba(255, 255, 255, 0.9);
  }

  .points li {
    margin: 8px 0;
  }

  .note {
    margin: 0;
    font-size: 14px;
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.8);
  }

  .note.subtle {
    color: rgba(255, 255, 255, 0.65);
  }

  /* RIGHT */

  .right {
    display: grid;
    margin-bottom: 100px;
  }

  .card {
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    padding: 16px;
    display: grid;
    gap: 12px;
  }

  .label {
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.6);
  }

  .cta {
    display: block;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.92);
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
  }

  .cta:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.22);
    color: white;
  }

  .cta.primary {
    font-weight: 700;
    background: rgba(255, 255, 255, 0.08);
  }

  .divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    margin: 6px 0;
  }

  .footnote {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.65);
  }

  .cta.with-icon {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .cta svg,
  .cta img {
    width: 18px;
    height: 18px;
    opacity: 0.9;
  }
</style>
