import WorkClient from './WorkClient';
import { collectWorkIds } from '../../lib/cv-server';

import type { JSX } from 'react';

export const dynamicParams = false; // con export, obligatorio

export async function generateStaticParams(): Promise<
  {
    id: string;
  }[]
> {
  const ids = await collectWorkIds();
  return ids.map((id) => ({ id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params; // Next 15: hay que await
  return <WorkClient id={id} key={'work'} />;
}
