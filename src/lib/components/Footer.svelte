<footer id="contact">
  <div class="inner">
    <div>
      <div class="title">Let’s work together</div>
      <div class="subtitle">
        Backend & Cloud · Performance-first · Freelance
      </div>
    </div>

    <div class="links">
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
      </a>

      <a
        class="cta with-icon"
        href="https://www.upwork.com/freelancers/~01d29eab7db9abdaf8"
        target="_blank"
        rel="noopener"
      >
        <img
          src="/images/contact/upwork.svg"
          alt="Upwork"
          class="icon"
          loading="lazy"
        />
      </a>
    </div>
  </div>
</footer>

<style>
  footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    margin-top: 80px;
    padding: 10px 0;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    background: #0b0b0f;
    color: rgba(255, 255, 255, 0.8);
  }
  .inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;
  }
  .title {
    color: white;
    font-weight: 700;
  }
  .subtitle {
    font-size: 14px;
    margin-top: 6px;
  }
  .links {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }
  a {
    color: rgba(255, 255, 255, 0.85);
    text-decoration: none;
  }
  a:hover {
    color: white;
  }

  .cta img {
    width: 18px;
    height: 18px;
    opacity: 0.9;
    filter: brightness(0.5) invert(0.5);
  }
  .cta:hover img {
    opacity: 1;
    filter: brightness(1) invert(0);
  }

  /* Mobile only */
  @media (max-width: 768px) {
    .links {
      justify-content: center;
    }

    .subtitle {
      display: none;
    }
  }
</style>
