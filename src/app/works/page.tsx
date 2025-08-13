"use client";

import {
  Container,
  SimpleGrid,
  Heading,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import WorkCard from "../components/WorkCard";
import ProjectGridItem from "../components/ProjectGridItem";
import TechFilterSidebar, {
  AggregatedTech,
} from "../components/TechFilterSidebar";
import { useLanguage } from "../components/context/LanguageContext";
import { useCvData } from "../hooks/useCvData";
import { usePersonalProjects } from "../hooks/usePersonalProjects";
import { getItemSlug } from "../lib/slug";
import { parsePeriodToMonths } from "../lib/period";
import * as React from "react";
import type { CVWork } from "../types/cv";

// Extrae el set de tecnologías de un trabajo del CV (une todos sus proyectos)
function collectWorkTechs(w: CVWork): string[] {
  const set = new Set<string>();
  for (const pj of w.projects ?? []) {
    for (const t of pj.technologies ?? []) set.add(t);
  }
  return Array.from(set);
}

export default function WorksPage() {
  const { lang, short } = useLanguage();
  const { data: cv, loading: loadingCv, error: errorCv } = useCvData(lang, short);
  const { data: repos, loading: loadingRepos, error: errorRepos } = usePersonalProjects();

  const companies = !loadingCv && !errorCv && cv?.works ? cv.works : [];
  const personal = !loadingRepos && !errorRepos ? repos : [];

  // ---- Agregación por tech (personal + experience) ----
  const aggregated: AggregatedTech[] = React.useMemo(() => {
    const acc = new Map<string, number>();

    // Personal projects
    for (const p of personal) {
      for (const t of p.technologies ?? []) {
        acc.set(t.tech, (acc.get(t.tech) ?? 0) + (t.time ?? 0));
      }
    }

    // Experience (period_time → meses)
    for (const w of companies) {
      const months = parsePeriodToMonths(w.period_time);
      if (!months) continue;
      const techs = collectWorkTechs(w);
      for (const t of techs) acc.set(t, (acc.get(t) ?? 0) + months);
    }

    return Array.from(acc.entries())
      .map(([tech, months]) => ({ tech, months }))
      .sort((a, b) => b.months - a.months);
  }, [personal, companies]);

  // ---- Estado: techs activas (todas al inicio) ----
  const [activeTechs, setActiveTechs] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    // Inicializa con todas activas cuando cambia la lista agregada
    setActiveTechs(new Set(aggregated.map((i) => i.tech)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(aggregated.map((i) => i.tech).sort())]);

  const toggleTech = (tech: string) =>
    setActiveTechs((prev) => {
      const next = new Set(prev);
      if (next.has(tech)) next.delete(tech);
      else next.add(tech);
      return next;
    });

  const activateAll = () =>
    setActiveTechs(new Set(aggregated.map((i) => i.tech)));

  const clearAll = () => setActiveTechs(new Set());

  // ---- Filtrado por tech activa (match por al menos 1 tecnología) ----
  const filteredCompanies = React.useMemo(() => {
    if (activeTechs.size === 0) return [] as CVWork[];
    return companies.filter((w) => {
      const techs = collectWorkTechs(w);
      return techs.some((t) => activeTechs.has(t));
    });
  }, [companies, activeTechs]);

  const filteredPersonal = React.useMemo(() => {
    if (activeTechs.size === 0) return [] as typeof repos;
    return personal.filter((p) =>
      (p.technologies ?? []).some((t) => activeTechs.has(t.tech))
    );
  }, [personal, activeTechs]);
  return (
    <Container maxW="container.lg" py={8}>
      <Grid templateColumns={{ base: "1fr", lg: "1fr 250px" }} gap={8} alignItems="start">
        {/* Columna principal */}
        <GridItem>
          <Heading mb={4}>Experience</Heading>
          {loadingCv ? (
            <Heading size="sm" opacity={0.6}>Cargando…</Heading>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 1, lg: 2 }} gap={8}>
              {filteredCompanies.map((w, idx) => {
                const id = getItemSlug(w);
                return (
                  <WorkCard
                    key={`w-${id}-${idx}`}
                    work={{
                      id,
                      title: w.name,
                      ...(w.short_description?.[0] && { description: w.short_description[0] }),
                      ...(w.period_time && { year: w.period_time }),
                      ...(w.thumbnail && { thumbnail: `/images/works/${w.thumbnail}` }),
                      // Si quieres mostrar techs en la card, puedes poner todas las del work:
                      ...(collectWorkTechs(w).length ? { techs: collectWorkTechs(w) } : {}),
                    }}
                  />
                );
              })}
            </SimpleGrid>
          )}

          <Heading mb={4}>Personal Projects</Heading>
          {loadingRepos ? (
            <Heading size="sm" opacity={0.6}>Cargando…</Heading>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
              {filteredPersonal.map((r) => (
                <ProjectGridItem key={`p-${r.id}`} project={r} lang={lang} />
              ))}
            </SimpleGrid>
          )}
        </GridItem>

        {/* Sidebar derecha con filtros */}
        <GridItem display={{ base: "none", lg: "block" }}>
          <TechFilterSidebar
            items={aggregated}
            active={activeTechs}
            onToggleAction={toggleTech}
            onActivateAllAction={activateAll}
            onClearAction={clearAll}
          />
        </GridItem>
      </Grid>
    </Container>
  );
}

