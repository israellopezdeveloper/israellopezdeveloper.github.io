# 🧱 WIREFRAME EXACTO – PORTFOLIO FREELANCER SENIOR

## 🔝 GLOBAL

- **Max width:** 1200–1280px
- **Grid:** 12 columnas (desktop)
- **Spacing:** generoso (no compacto)
- **Sticky header:** sí
- **Dark mode:** default (opcional toggle)

## 🧭 HEADER (sticky)

```
┌──────────────────────────────────────────────────────────────────┐
│ [Israel López]   About   Experience   Services     [Book a call] │
└──────────────────────────────────────────────────────────────────┘
```

- Altura: ~64px
- CTA siempre visible
- En móvil → burger + CTA visible

## 🟦 SECTION 1 — ABOUT / HERO

### Desktop (2 columnas)

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  ┌───────────────┐   Senior Backend & Cloud Engineer       │
│  │               │   I design and scale high-performance   │
│  │   3D MODEL    │   backend systems for production        │
│  │   (idle)      │   products                              │
│  │               │                                         │
│  └───────────────┘   • Scale & performance                 │
│                      • Cloud & serverless optimization     │
│                      • AI/LLM integration on existing sys  │
│                                                            │
│                      15+ years · Production systems only   │
│                                                            │
│               [ Book a call ]  [ View selected work ]      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Mobile

```
[Headline]
[Subheadline]
[Bullets]

[Book a call]
[View selected work]

[3D thumbnail / collapsed model]
```

📌 **Notas**

- El 3D **no debe empujar el texto abajo**.
- Botón “Disable animation” discreto.
- `prefers-reduced-motion` → imagen estática.

## 🟨 SECTION 2 — SERVICES

```
┌────────────────────────────────────────────────────────────┐
│ SERVICES                                                   │
│                                                            │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌───────────┐ │
│ │ Audit &    │ │ Backend    │ │ Cloud &    │ │ AI / LLM  │ │
│ │Architecture│ │ Development│ │ Serverless │ │Integration│ │
│ │            │ │            │ │Optimization│ │           │ │
│ │ When to use│ │ Scope      │ │Deliverables│ │ Use cases │ │
│ │Deliverables│ │ Engagement │ │ Timeline   │ │ Output    │ │
│ └────────────┘ └────────────┘ └────────────┘ └───────────┘ │
│                                                            │
│ Typical engagements: audits (1–2 weeks) · retainers ·      │
│ targeted consulting                                        │
└────────────────────────────────────────────────────────────┘
```

📌 Cards **clickables** → modal o anchor con más detalle (opcional).

## 🟩 SECTION 3 — EXPERIENCE

### Desktop (3 columnas asimétricas)

```
┌────────────────────────────────────────────────────────────┐
│ EXPERIENCE                                                 │
│                                                            │
│ ┌───────────────┐ ┌────────────────────────────────────┐   │
│ │               │ │ Selected Projects                  │   │
│ │   NN3D VIEW   │ │                                    │   │
│ │               │ │ ▸ Project A (Company)              │   │
│ │ Layers = proj │ │   - Problem                        │   │
│ │ Neurons =     │ │   - Solution                       │   │
│ │ achievements  │ │   - Impact                         │   │
│ │               │ │                                    │   │
│ │               │ │ ▸ Project B                        │   │
│ │               │ │                                    │   │
│ └───────────────┘ └────────────────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### NN3D Behavior

- Default: idle overview
- Hover / click on layer → highlights project
- Click neuron → scrolls / updates right panel content

📌 **Key**: el panel derecho es el que vende.
NN3D es navegación + contexto visual.

## 🟪 SECTION 4 — SOCIAL PROOF

```
┌────────────────────────────────────────────────────────────┐
│ TRUSTED BY                                                 │
│                                                            │
│ [Logo] [Logo] [Logo] [Logo]                                │
│                                                            │
│ “Israel helped us scale X without downtime.”               │
│ — Role / Company                                           │
└────────────────────────────────────────────────────────────┘
```

📌 No más de 1–2 frases. Nada largo.

## 🟧 SECTION 5 — TECH STACK

```
┌────────────────────────────────────────────────────────────┐
│ TECH STACK                                                 │
│                                                            │
│ Backend: Python · Node · FastAPI · Java                    │
│ Cloud: AWS (Lambda, API GW, ECS, Terraform)                │
│ Data: MongoDB · Redis · PostgreSQL                         │
│ AI: LLMs · RAG · Embeddings · Inference pipelines          │
│ DevOps: Docker · CI/CD · Observability                     │
└────────────────────────────────────────────────────────────┘
```

📌 Agrupado, limpio, **no una sopa de logos**.

## 🔚 FOOTER

```
┌────────────────────────────────────────────────────────────┐
│ Let’s work together                                        │
│                                                            │
│ israel@email.com · Calendly · LinkedIn · Upwork            │
│                                                            │
│ © Israel López — Freelance Backend & Cloud Engineer        │
└────────────────────────────────────────────────────────────┘
```

## 📐 SCROLL FLOW RESUMEN

1. **Qué haces + CTA** (10s)
2. **Cómo puedes ayudarme** (services)
3. **Demuestras que sabes hacerlo** (NN3D + projects)
4. **Validación externa**
5. **Contacto inmediato**

## ⚙️ BONUS: implementación rápida

- **Next.js + Tailwind**
- Secciones como componentes independientes
- 3D en `dynamic(import, { ssr:false })`
- IntersectionObserver para pausar 3D
- Fallback `<img>` automático

## Análisis 1

Vale, Israel. Te lo analizo como si yo fuese un cliente que entra 60–90s, escanea y decide si te escribe.

### Lo que está muy bien (ya “vende”)

- **Posicionamiento claro y senior**: “Backend & Cloud / performance-first / production systems” se entiende rápido y está alineado con lo que tú quieres vender. ([Israel López Developer][1])
- **Servicios bien enfocados a “producto en producción”** (no “hazme un MVP”), eso filtra bien y sube el valor percibido. ([Israel López Developer][1])
- **CTA fuerte y repetido** (Book a call + email + calendly + linkedin). Estás optimizando conversión, no solo “bonito”. ([Israel López Developer][1])
- **La sección Experience + modal** es buena idea: logos + detalle + visual (3D) te diferencia de portfolios típicos.

### Lo que te está frenando (y cómo lo arreglaría)

#### 1) Hero: demasiado “genérico” para tu nicho (y la foto puede jugar en contra)

Ahora mismo el titular cambia entre “Senior Software Engineer” y “Backend & Cloud Engineer” según la vista/versión, y el hero se siente un poco “perfil generalista”. ([Israel López Developer][1])
**Ajuste recomendado (alto impacto):**

- Un solo titular consistente: **“Performance-first Backend & Cloud Engineer”**.
- Una línea ultra concreta tipo:
  - “I reduce P99 latency, stabilize distributed systems, and cut cloud cost—without rewrites.”

- Si mantienes la foto a pantalla completa: en desktop **asegura que se vea tu cara completa** (ahora el encuadre puede taparla según resolución). Si no, usa foto más pequeña + fondo/gradient limpio.

#### 2) Te falta “prueba” con números en los case studies

Tienes buen texto, pero **sin métricas** pierdes credibilidad frente a otros seniors.
**Plantilla por proyecto (3 bullets, sin párrafos largos):**

- **Contexto:** escala/tráfico/constraints
- **Acción:** qué cambiaste tú
- **Resultado:** _P95/P99, throughput, coste, MTTR, incidencias, uptime, $ ahorrados_

Ejemplo:

- “Reduced P99 from 2.4s → 450ms; cut AWS spend -18%; eliminated recurring incident (MTTR 40m → 12m).”

#### 3) “Tech Stack” está demasiado largo (parece checklist)

Ahora mismo la lista es enorme y puede dar señal de “toco de todo”. ([Israel López Developer][1])
**Cómo lo dejaría:**

- “Core stack” (8–12 items máximo)
- “Also worked with” colapsable
- Y sobre todo: **alinear stack con lo que vendes** (backend perf + cloud + observability + AI integration). Lo demás, secundario.

#### 4) Falta un “producto” claro: paquetes/ofertas

Tú ya lo describes, pero lo convertiría en 3 paquetes para facilitar compra:

- **Perf & Reliability Sprint (1–2 semanas)** → deliverables + precio orientativo
- **Architecture Review (5 días)** → diagrama + roadmap + riesgos
- **Monthly Retainer** → X horas/mes, SLA de respuesta, objetivos

Esto reduce fricción para contratarte (especialmente en Upwork/LinkedIn inbound).

#### 5) Social proof: está bien, pero lo haría más creíble

El testimonial “confidential reference” está ok, pero añadiría:

- 1–2 citas reales con **nombre/rol** (si puedes)
- O “mini casos” tipo: “Devo — ingestion platform, security constraints, high-throughput” ([Israel López Developer][1])
  Aunque no pongas cifras exactas, **pon magnitudes** (TB/día, req/s, etc.).

### Quick wins (30–60 minutos)

- Añade un botón visible “**Download CV (PDF)**”.
- En “View selected work”, ordena 3 piezas top **por relevancia comercial** (no por cariño): algo de high-scale backend, algo de cloud/cost, algo AI/RAG.
- Reduce texto en servicios (menos “cuando encaja”, más “resultados + entregables”).

### Cambios estratégicos (2–4 horas)

- Reescribir 3 case studies con la plantilla “Context → Action → Result”.
- Simplificar Tech Stack a “core + collapsible”.
- Añadir “Packages” con 3 ofertas.

---

Si quieres, te lo dejo aún más fino con un “copy pass” completo (hero + services + 3 case studies) manteniendo tu tono “no hype / performance-first”, pero ya en formato listo para pegar en el repo.

[1]: https://israellopezdeveloper.github.io/ 'israellopezdeveloper.github.io'

## Análisis 2
