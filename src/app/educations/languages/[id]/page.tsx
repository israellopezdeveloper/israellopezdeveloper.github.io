import { collectLanguageIds } from '../../../lib/cv-server';
import EducationDetailClient from '../../EducationDetailClient';

import type { JSX } from 'react';

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ id: string }[]> {
  const ids = await collectLanguageIds();
  return ids.map((id) => ({ id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  return <EducationDetailClient category="languages" id={id} />;
}
