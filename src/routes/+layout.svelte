<script lang="ts">
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import Footer from '$lib/components/Footer.svelte';
  import Header from '$lib/components/Header.svelte';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Israel Lopez</title>
</svelte:head>

<Header></Header>

{@render children()}

<Footer></Footer>
