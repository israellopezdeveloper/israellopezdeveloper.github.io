import { collectComplementaryIds } from "../../../lib/cv-server";
import EducationDetailClient from "../../EducationDetailClient";

export const dynamicParams = false;

export async function generateStaticParams() {
  const ids = await collectComplementaryIds();
  return ids.map((id) => ({ id }));
}

export default async function Page({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EducationDetailClient category="complementary" id={id} />;
}

