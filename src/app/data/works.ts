import type { Work } from "../types/work";

export const works: Work[] = [
  {
    id: "sample-project",
    title: "Sample Project",
    description: "Pequeña demo migrada a Chakra v3",
    year: "2024",
    thumbnail: "/images/works/sample.png",
    techs: ["Next.js", "Chakra UI", "TypeScript"],
    links: [
      { tag: "GitHub", text: "Repo", url: "https://github.com/..." },
      { tag: "Demo", text: "Live", url: "https://..." },
    ],
  },
  // ⬅️ añade tus works aquí
];

export function getWorkById(id: string) {
  return works.find((w) => w.id === id);
}

export function getAllWorkIds() {
  return works.map((w) => w.id);
}
