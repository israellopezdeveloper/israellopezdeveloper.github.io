<script lang="ts">
  import Section from './Section.svelte';
  import WorkCard from '$lib/components/WorkCard.svelte';
  import WorkModal from '$lib/components/WorkModal.svelte';
  import NN3DModel from '$lib/components/three/NN3DModel.svelte';
  import cv from '$lib/data/data_CV.json';
  import projects from '$lib/data/data_projects.json';
  import type { Work, Project } from '$lib/data/types';

  import type {
    LayerNode,
    ModelNode,
    NeuronNode,
    Nn3d
  } from '@israellopezdeveloper/nn3d';
  import { slugify } from '$lib/components/three/NN3DModel';
  import ProjectCard from '$lib/components/ProjectCard.svelte';

  const works: Work[] = cv.works ?? [];

  let modalOpen = false;
  let selected: Work | Project | null = null;
  let targetProjectId: string | null = null;

  let nn: Nn3d | null = null;

  let pendingGoto: { model?: string; layer?: string; neuron?: string } | null =
    null;

  $: if (nn && pendingGoto) {
    const { model, layer, neuron } = pendingGoto;
    nn?.goto(model, layer, neuron);
    pendingGoto = null;
  }

  function openWork(w: Work) {
    selected = w;
    modalOpen = true;

    const layerLabel = w.name;

    if (nn) {
      const layerId: string = slugify(layerLabel);
      nn?.goto('works', layerId);
    } else {
      pendingGoto = { model: 'works', layer: layerLabel };
    }
  }

  function openProject(p: Project) {
    selected = p;
    modalOpen = true;

    const layerLabel = p.lang.en.name;

    if (nn) {
      const layerId: string = slugify(layerLabel);
      nn?.goto('repositories', layerId);
    } else {
      pendingGoto = { model: 'repositories', layer: layerLabel };
    }
  }

  function gotoNeuron(layer: string, neuron?: string): void {
    if (nn) {
      nn?.goto('works', layer, neuron);
    } else {
      pendingGoto = { model: 'works', layer: layer, neuron: neuron };
    }
  }

  function onNothingSelect() {
    modalOpen = false;
    selected = null;
    targetProjectId = null;
  }

  function onModelSelect(_: ModelNode) {}

  function openWorkByLabel(
    workLabel: string,
    projectLabel: string | null = null
  ) {
    modalOpen = false;
    const w = works.find((x) => slugify(x.name) === slugify(workLabel));
    if (!w) return;
    selected = w;
    targetProjectId = null;
    if (projectLabel) {
      targetProjectId = projectLabel;
    }
    modalOpen = true;
  }

  function openRepositoryByLabel(
    repoLabel: string,
    projectLabel: string | null = null
  ) {
    modalOpen = false;
    const w = projects.find(
      (x) => slugify(x.lang.en.name) === slugify(repoLabel)
    );
    if (!w) return;
    selected = w;
    targetProjectId = null;
    if (projectLabel) {
      targetProjectId = projectLabel;
    }
    modalOpen = true;
  }

  function onLayerSelect(modelId: string, layer: LayerNode) {
    modalOpen = false;
    selected = null;
    targetProjectId = null;
    if (modelId === 'works') {
      openWorkByLabel(layer.id);
    } else {
      openRepositoryByLabel(layer.id);
    }
    targetProjectId = null;
  }

  function onNeuronSelect(
    modelId: string,
    layerId: string,
    neuron: NeuronNode
  ) {
    modalOpen = false;
    selected = null;
    targetProjectId = null;
    if (modelId === 'works') {
      openWorkByLabel(layerId, slugify(neuron.id));
    } else {
      openRepositoryByLabel(layerId, slugify(neuron.id));
    }
  }

  function closeModal() {
    modalOpen = false;
    selected = null;
    targetProjectId = null;
    nn?.goto();
  }
</script>

<Section title="Case studies" id="experience">
  <div class="experience__fullbleed">
    <div class="experience__grid">
      <div class="experience__left">
        <div class="cards">
          {#each works as w (w.name)}
            <WorkCard {w} onSelect={openWork} />
          {/each}
        </div>
        <h1>My own projects</h1>
        <div class="cards">
          {#each projects as p (p.id)}
            {#if p.lang.en.name && p.lang.en.name !== '.github'}
              <ProjectCard {p} onSelect={openProject} />
            {/if}
          {/each}
        </div>
        <WorkModal
          open={modalOpen}
          {selected}
          project={targetProjectId}
          onClose={closeModal}
          onProjectClick={gotoNeuron}
        />
      </div>

      <aside class="experience__right" aria-label="3D">
        <div class="nn3d">
          <NN3DModel
            bind:nn
            {onNothingSelect}
            {onModelSelect}
            {onLayerSelect}
            {onNeuronSelect}
          />
        </div>
      </aside>
    </div>
  </div>
</Section>

<style>
  .experience__fullbleed {
    width: 100vw;
    height: 100%;
    margin-left: calc(50% - 50vw);
    padding: 0 1.25rem;
    box-sizing: border-box;
  }

  .experience__grid {
    display: grid;
    grid-template-columns: minmax(0, 55%) minmax(0, 45%);
    gap: 1.25rem;

    align-items: stretch;

    min-height: calc(100vh - 2rem);
  }

  .experience__left,
  .experience__right {
    min-width: 0;
  }

  .experience__left {
    position: relative;
  }

  .experience__right {
    display: flex;
  }

  .nn3d {
    position: sticky;
    top: 1rem;

    height: calc(100vh - 2rem);
    width: 100%;

    border-radius: 16px;
    overflow: hidden;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 1rem;
    align-items: stretch;
    position: relative;
  }

  @media (max-width: 980px) {
    .experience__grid {
      grid-template-columns: 1fr;
      min-height: unset;
    }

    .nn3d {
      display: none;
      position: relative;
      top: 0;
      height: 420px;
    }

    .cards {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }
  }
</style>
