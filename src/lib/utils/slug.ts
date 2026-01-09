// Simple, deterministic slugifier for URLs.
// Keep it stable: changing this changes existing URLs.
export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      // Replace & with 'and' for nicer slugs.
      .replace(/&/g, 'and')
      // Remove anything that's not a letter/number/space/hyphen.
      .replace(/[^a-z0-9\s-]/g, '')
      // Collapse runs of whitespace/hyphen into a single hyphen.
      .replace(/[\s-]+/g, '-')
      // Trim leading/trailing hyphens.
      .replace(/^-+|-+$/g, '')
  );
}
