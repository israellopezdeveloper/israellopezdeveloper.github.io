import { error } from '@sveltejs/kit';
import { services } from '$lib/data/services';
import { slugify } from '$lib/utils/slug';

export type ServicePageData = {
  service: (typeof services)[number];
  slug: string;
  canonical: string;
  title: string;
  description: string;
};

export const load = ({ params }) => {
  const slug = params.slug;
  const service = services.find((s) => slugify(s.title) === slug);

  if (!service) {
    throw error(404, 'Service not found');
  }

  const canonical = `https://israellopezdeveloper.github.io/services/${slug}`;
  const title = `${service.title} · Israel Lopez`;
  const description = service.outcome ?? service.subtitle;

  return { service, slug, canonical, title, description } satisfies ServicePageData;
};
