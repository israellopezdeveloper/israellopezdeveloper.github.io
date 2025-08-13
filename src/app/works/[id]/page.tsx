import { collectWorkIds } from "../../lib/cv-server";
import WorkClient from "./WorkClient";

export const dynamicParams = false; // con export, obligatorio

export async function generateStaticParams() {
  const ids = await collectWorkIds();
  return ids.map((id) => ({ id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Next 15: hay que await
  return <WorkClient id={id} />;
}

