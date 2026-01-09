<script lang="ts">
  const links = [
    { href: '/#about', label: 'About me' },
    { href: '/#how-i-work', label: 'How I Work' },
    { href: '/#services', label: 'Services' },
    { href: '/#experience', label: 'Case estudies' },
    { href: '/#tech-stack', label: 'Tech Stack' },
    { href: '/#education', label: 'Education' },
    { href: '/#posts', label: 'Posts' },
    { href: '/#contact', label: 'Contact' }
  ];

  let open = false;

  function toggle() {
    open = !open;
  }

  function close() {
    open = false;
  }
</script>

<header>
  <div class="inner">
    <a class="brand" href="/#about" on:click={close}>Israel López</a>

    <!-- Desktop nav -->
    <nav class="nav desktop">
      {#each links as l (l.href)}
        <a href={l.href}>{l.label}</a>
      {/each}
    </nav>

    <!-- Desktop CTA -->
    <a class="cta desktop" href="#contact">Book a call</a>

    <!-- Mobile hamburger -->
    <button
      class="hamburger mobile"
      type="button"
      aria-label="Open menu"
      aria-expanded={open}
      on:click={toggle}
    >
      <span class="bar"></span>
      <span class="bar"></span>
      <span class="bar"></span>
    </button>
  </div>

  <!-- Mobile dropdown -->
  {#if open}
    <div class="mobileMenu">
      <nav class="mobileNav">
        {#each links as l (l.href)}
          <a href={l.href} on:click={close}>{l.label}</a>
        {/each}
      </nav>

      <a class="cta mobileCta" href="#contact" on:click={close}>Book a call</a>
    </div>
  {/if}
</header>

<style>
  header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9999;

    backdrop-filter: blur(10px);
    background: rgba(10, 10, 12, 0.7);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 10px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .brand {
    font-weight: 700;
    text-decoration: none;
    color: white;
    white-space: nowrap;
  }

  .nav {
    display: flex;
    gap: 14px;
  }
  .nav a {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-size: 14px;
  }
  .nav a:hover {
    color: white;
  }

  .cta {
    text-decoration: none;
    color: black;
    background: white;
    padding: 8px 12px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 14px;
    white-space: nowrap;
  }

  /* Hamburger button */
  .hamburger {
    background: transparent;
    border: 0;
    padding: 8px;
    border-radius: 10px;
    display: inline-flex;
    flex-direction: column;
    gap: 5px;
    cursor: pointer;
  }
  .hamburger:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.35);
    outline-offset: 2px;
  }
  .bar {
    width: 22px;
    height: 2px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 999px;
  }

  /* Mobile dropdown panel */
  .mobileMenu {
    max-width: 1200px;
    margin: 0 auto;
    padding: 10px 18px 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .mobileNav {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px 0 14px;
  }

  .mobileNav a {
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    font-size: 15px;
    padding: 10px 10px;
    border-radius: 10px;
  }
  .mobileNav a:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .mobileCta {
    display: inline-block;
    width: 100%;
    text-align: center;
    padding: 10px 12px;
  }

  /* Responsive rules */
  .mobile {
    display: none;
  }

  @media (max-width: 768px) {
    .desktop {
      display: none;
    }
    .mobile {
      display: inline-flex;
    }
  }
</style>
