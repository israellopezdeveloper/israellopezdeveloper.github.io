<svelte:head>
  <title>Privacy Policy for AIPublisher</title>
  <meta name="robots" content="noindex, nofollow" />
  <meta name="description" content="Privacy Policy for AIPublisher" />
</svelte:head>

<main>
  <article>
    <h1>Privacy Policy for AIPublisher</h1>
    <p><strong>Last updated: May 2026</strong></p>

    <p>
      AIPublisher is committed to protecting your privacy. This policy explains
      how we handle your data when using our Google Drive to LinkedIn automation
      service.
    </p>

    <h2>1. Information We Access</h2>
    <p>
      AIPublisher requests access to your Google Drive via OAuth. We
      specifically access:
    </p>
    <ul>
      <li>
        <strong>Google Drive Files:</strong> We only read specific folders or documents
        containing "topics" that you explicitly select within the application.
      </li>
    </ul>

    <h2>2. How We Use Your Data</h2>
    <p>The data accessed from Google Drive is used exclusively for:</p>
    <ul>
      <li>
        <strong>Content Analysis:</strong> Processing your selected topics through
        our LangGraph orchestration workflow.
      </li>
      <li>
        <strong>LinkedIn Automation:</strong> Generating social media posts based
        on the themes found in your documents.
      </li>
    </ul>
    <p>
      We <strong>do not</strong> store, copy, or share your Google Drive content with
      third parties. All processing is transient and used only to deliver the final
      output to LinkedIn.
    </p>

    <h2>3. Data Security and Third Parties</h2>
    <p>
      Your data is never sold or used for advertising. We only transfer data
      between Google (source) and LinkedIn (destination) as per your request. No
      persistent storage of your file content is maintained on our servers.
    </p>

    <h2>4. Contact</h2>
    <p>
      For any questions regarding this policy or the use of your data, please
      contact the developer at:<br />
      <strong>israel.lopez.developer@gmail.com</strong>
    </p>
  </article>
</main>

<style>
  :global(html),
  :global(body) {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #000000;
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
      sans-serif;
  }

  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 3rem 1.5rem;
    line-height: 1.7;
    background: #ffffff;
    color: #000000;
  }

  h1,
  h2,
  p,
  li,
  strong {
    color: #000000;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 1.25rem;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
  }

  ul {
    padding-left: 1.5rem;
  }

  li {
    margin-bottom: 0.5rem;
  }

  p {
    margin: 0.75rem 0;
  }
</style>
