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
import { useI18n } from "../i18n/useI18n";

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
  const t = useI18n();

  // 1) Referencias estables
  const companies = React.useMemo<CVWork[]>(
    () => (!loadingCv && !errorCv && cv?.works) ? cv.works : [],
    [loadingCv, errorCv, cv?.works]
  );

  const personal = React.useMemo(
    () => (!loadingRepos && !errorRepos && repos) ? repos : [],
    [loadingRepos, errorRepos, repos]
  );

  // 2) Agregación por tech con deps estables
  const aggregated: AggregatedTech[] = React.useMemo(() => {
    const acc = new Map<string, number>();

    // Personal projects
    for (const p of personal) {
      for (const t of p.technologies ?? []) {
        acc.set(t.tech, (acc.get(t.tech) ?? 0) + (t.time ?? 0));
      }
    }

    // Experience
    for (const w of companies) {
      const months = parsePeriodToMonths(w.period_time);
      if (!months) continue;
      for (const t of collectWorkTechs(w)) {
        acc.set(t, (acc.get(t) ?? 0) + months);
      }
    }

    return Array.from(acc, ([tech, months]) => ({ tech, months }))
      .sort((a, b) => b.months - a.months);
  }, [personal, companies]);

  // 3) Estado filtros
  const [activeTechs, setActiveTechs] = React.useState<Set<string>>(new Set());

  // clave estable para saber si cambió el conjunto de techs agregadas
  const aggregatedKey = React.useMemo(
    () => aggregated.map(i => i.tech).sort().join("|"),
    [aggregated]
  );

  React.useEffect(() => {
    setActiveTechs(new Set(aggregated.map(i => i.tech)));
  }, [aggregatedKey, aggregated]);

  // 4) Handlers estables (opcional pero recomendable si los pasas a hijos)
  const toggleTech = React.useCallback((tech: string) => {
    setActiveTechs(prev => {
      const next = new Set(prev);
      if (next.has(tech)) {
        next.delete(tech);
      } else {
        next.add(tech);
      }
      return next;
    });
  }, []);

  const activateAll = React.useCallback(
    () => setActiveTechs(new Set(aggregated.map(i => i.tech))),
    [aggregated]
  );

  const clearAll = React.useCallback(() => setActiveTechs(new Set()), []);

  // 5) Filtros con deps estables
  const filteredCompanies = React.useMemo(() => {
    if (activeTechs.size === 0) return [] as CVWork[];
    return companies.filter(w => collectWorkTechs(w).some(t => activeTechs.has(t)));
  }, [companies, activeTechs]);

  const filteredPersonal = React.useMemo(() => {
    if (activeTechs.size === 0) return [] as typeof repos;
    return personal.filter(p => (p.technologies ?? []).some(t => activeTechs.has(t.tech)));
  }, [personal, activeTechs]);

  return (
    <Container maxW="container.lg" py={8}>
      <Grid templateColumns={{ base: "1fr", lg: "1fr 270px" }} gap={8} alignItems="start">
        {/* Columna principal */}
        <GridItem>
          <Heading mb={4} mt={"0px"} pt={"0px"}>{t("experience")}</Heading>
          {loadingCv ? (
            <Heading size="sm" opacity={0.6}>{t("loading")}</Heading>
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

          <Heading mb={4}>{t("personalProjects")}</Heading>
          {loadingRepos ? (
            <Heading size="sm" opacity={0.6}>{t("loading")}</Heading>
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

