export function fromEn<T extends Record<string, string>>(
  obj: T,
  base: string,
): string | undefined {
  return obj[`${base}_en`] ?? obj[base];
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getItemSlug(item: {
  slug?: string;
  name: string;
  name_en?: string;
}) {
  if (item.slug) return item.slug;
  const base = fromEn(item, "name");
  return base ? slugify(base) : "item";
}

// ---- Educación ----
type Univ = {
  slug?: string;
  title?: string;
  title_en?: string;
  university_name?: string;
  university_name_en?: string;
};

type Comp = {
  slug?: string;
  title?: string;
  title_en?: string;
  institution?: string;
  institution_en?: string;
};

type Lang = {
  slug?: string;
  language?: string;
  language_en?: string;
};

export function getUniversitySlug(u: Univ) {
  if (u.slug) return u.slug;
  const base = fromEn(u, "title") ?? fromEn(u, "university_name");
  return base ? slugify(base) : "item";
}

export function getComplementarySlug(c: Comp) {
  if (c.slug) return c.slug;
  const base = fromEn(c, "title");
  return base ? slugify(base) : "item";
}

export function getLanguageSlug(l: Lang) {
  if (l.slug) return l.slug;
  const base = fromEn(l, "language");
  return base ? slugify(base) : "language";
}
