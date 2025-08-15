import { collectComplementaryIds } from '../../../lib/cv-server';
import EducationDetailClient from '../../EducationDetailClient';

import type { JSX } from 'react';

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ id: string }[]> {
  const ids = await collectComplementaryIds();
  return ids.map((id) => ({ id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  return <EducationDetailClient category="complementary" id={id} />;
}
