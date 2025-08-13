export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getItemSlug(item: { slug?: string; name: string }) {
  return item.slug ? item.slug : slugify(item.name);
}

// ---- Educación ----
type Univ = { slug?: string; title?: string; university_name?: string };
type Comp = { slug?: string; title?: string; institution?: string };
type Lang = { slug?: string; language?: string };

export function getUniversitySlug(u: Univ) {
  if (u.slug) return u.slug;
  if (u.title) return slugify(u.title);
  if (u.university_name) return slugify(u.university_name);
  return "item";
}

export function getComplementarySlug(c: Comp) {
  if (c.slug) return c.slug;
  const base = [c.institution, c.title].filter(Boolean).join(" ");
  return base ? slugify(base) : "item";
}

export function getLanguageSlug(l: Lang) {
  if (l.slug) return l.slug;
  return l.language ? slugify(l.language) : "language";
}
