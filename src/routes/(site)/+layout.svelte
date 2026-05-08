<script lang="ts">
  import '../../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import Footer from '$lib/components/Footer.svelte';
  import Header from '$lib/components/Header.svelte';

  let { children } = $props();

  const siteUrl = 'https://israellopezdeveloper.github.io';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Israel López',
    alternateName: 'Israel Lopez',
    url: siteUrl,
    image: `${siteUrl}/photo.webp`,
    jobTitle: 'Senior Backend & AI Engineer',
    email: 'mailto:israel.lopez.developer@gmail.com',
    sameAs: [
      'https://github.com/israellopezdeveloper',
      'https://www.linkedin.com/in/israellopezdeveloper'
    ],
    knowsAbout: [
      'Backend Engineering',
      'AI / LLM Integration',
      'RAG',
      'Cloud & DevOps',
      'System Architecture',
      'Performance & Reliability'
    ]
  };
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Israel López — Senior Backend & AI Engineer</title>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}<` +
    `/script>`}
</svelte:head>

<Header></Header>

{@render children()}

<Footer></Footer>
