<script lang="ts">
  const links = [
    { href: '#about', label: 'About' },
    { href: '#services', label: 'Services' },
    { href: '#experience', label: 'Experience' },
    { href: '#social-proof', label: 'Social Proof' },
    { href: '#tech-stack', label: 'Tech Stack' }
  ];
</script>

<header>
  <div class="inner">
    <a class="brand" href="#about">Israel López</a>

    <nav class="nav">
      {#each links as l}
        <a href={l.href}>{l.label}</a>
      {/each}
    </nav>

    <a class="cta" href="#contact">Book a call</a>
  </div>
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
  }
</style>
