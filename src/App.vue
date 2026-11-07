<script setup lang="ts">
import { ref, computed } from 'vue'
import StudioHeader from './components/StudioHeader.vue'
import DataTools from './components/DataTools.vue'
import AppDialog from './components/AppDialog.vue'
import JourneyRunner from './components/JourneyRunner.vue'
import { useDraft } from './services/draft'
import { download } from './services/files'
import {
  sample,
  parseWorkspace,
  parseScene,
  reachable,
  incoming,
  exportWorkspace,
  exportMarkdown,
  type Scene,
} from './domain/paths'
const { draft, storageStatus } = useDraft('vue-choice-path-studio:v1', sample, parseWorkspace)
const name = ref(draft.value.name),
  start = ref(draft.value.start),
  selectedId = ref(draft.value.scenes[0]!.id),
  error = ref(''),
  planError = ref(''),
  removeOpen = ref(false)
const selected = computed(
  () => draft.value.scenes.find((s) => s.id === selectedId.value) ?? draft.value.scenes[0]!,
)
const form = ref({ ...selected.value, choices: selected.value.choices.map((c) => ({ ...c })) })
function edit(scene: Scene) {
  selectedId.value = scene.id
  form.value = { ...scene, choices: scene.choices.map((c) => ({ ...c })) }
  error.value = ''
}
function savePlan() {
  try {
    draft.value = parseWorkspace({ ...draft.value, name: name.value, start: start.value })
    planError.value = ''
  } catch (e) {
    planError.value = (e as Error).message
  }
}
function save() {
  try {
    const scene = parseScene(form.value)
    draft.value = parseWorkspace({
      ...draft.value,
      scenes: draft.value.scenes.map((s) => (s.id === scene.id ? scene : s)),
    })
    edit(scene)
  } catch (e) {
    error.value = (e as Error).message
  }
}
function replace(value: unknown) {
  draft.value = parseWorkspace(value)
  name.value = draft.value.name
  start.value = draft.value.start
  planError.value = ''
  edit(draft.value.scenes[0]!)
}
function add() {
  const scene = {
    id: `scene-${crypto.randomUUID().slice(0, 8)}`,
    title: 'A new little waypoint',
    body: 'Describe one clear moment and what it might lead to.',
    choices: [],
  }
  draft.value = parseWorkspace({ ...draft.value, scenes: [...draft.value.scenes, scene] })
  edit(scene)
}
function addChoice() {
  form.value.choices.push({
    id: `choice-${crypto.randomUUID().slice(0, 8)}`,
    label: 'Take the next step',
    to: draft.value.scenes.find((s) => s.id !== form.value.id)?.id ?? form.value.id,
  })
}
const references = computed(() => incoming(draft.value, selected.value.id)),
  unreachable = computed(() => draft.value.scenes.length - reachable(draft.value).length)
const removable = computed(
  () =>
    draft.value.scenes.length > 1 &&
    selected.value.id !== draft.value.start &&
    !references.value.length,
)
function remove() {
  if (!removable.value) return
  draft.value = parseWorkspace({
    ...draft.value,
    scenes: draft.value.scenes.filter((s) => s.id !== selectedId.value),
  })
  edit(draft.value.scenes[0]!)
  removeOpen.value = false
}
const marker = computed(() => exportWorkspace(draft.value).provenance.marker)
const serialize = (value: unknown) => exportWorkspace(parseWorkspace(value))
function saveMarkdown() {
  download(`${marker.value}.md`, exportMarkdown(draft.value), 'text/markdown;charset=utf-8')
}
</script>
<template>
  <div
    data-project="vue-choice-path-studio"
    data-author="CodeSculptor"
    :data-marker="marker"
    class="min-h-screen"
  >
    <StudioHeader
      title="Choice Path Studio"
      subtitle="A small story with more than one way through."
      code="CH"
      ><DataTools
        :workspace="draft"
        :sample="sample"
        :parse="parseWorkspace"
        :serialize="serialize"
        @replace="replace"
        ><button
          class="border-accent! bg-accent text-on-accent hover:brightness-110"
          @click="saveMarkdown"
        >
          Markdown
        </button></DataTools
      ></StudioHeader
    >
    <main class="mx-auto max-w-[1500px] px-5 py-7 md:px-8">
      <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div class="min-w-0">
          <p class="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            A LITTLE CHOICE CAN CHANGE THE DAY
          </p>
          <h1 class="max-w-4xl break-words text-3xl font-semibold leading-tight sm:text-4xl">
            {{ draft.name }}
          </h1>
          <p class="mt-3 max-w-xl leading-relaxed text-muted">
            Connect a few scenes, offer a choice, and try two independent ways through.
          </p>
        </div>
        <span class="rounded-full border border-line bg-surface px-3 py-2 text-xs text-muted">{{
          storageStatus
        }}</span>
      </div>
      <div data-ui="workspace" class="grid min-w-0 gap-5 xl:grid-cols-[285px_minmax(0,1fr)_320px]">
        <section
          class="min-w-0 rounded-2xl border border-line bg-surface p-5"
          aria-labelledby="plan-heading"
        >
          <h2 id="plan-heading" class="mb-5 text-lg font-semibold">Set the scene</h2>
          <form @submit.prevent="savePlan">
            <label>Journey title<input v-model="name" maxlength="80" /></label
            ><label class="mt-4"
              >Starting scene<select v-model="start">
                <option v-for="scene in draft.scenes" :key="scene.id" :value="scene.id">
                  {{ scene.title }}
                </option>
              </select></label
            ><button type="submit" class="mt-3 w-full bg-soft hover:bg-accent/10">
              Save journey details
            </button>
            <p class="mt-2 h-10 overflow-auto text-xs text-danger" role="alert">{{ planError }}</p>
          </form>
          <div class="mt-2 flex items-center justify-between gap-2">
            <h3 class="text-sm font-semibold">{{ draft.scenes.length }} scenes</h3>
            <button
              class="bg-soft px-2! text-xs! hover:bg-accent/10"
              :disabled="draft.scenes.length >= 12"
              @click="add"
            >
              Add scene
            </button>
          </div>
          <div
            class="mt-3 h-[310px] overflow-y-auto rounded-xl border border-line p-2"
            role="region"
            tabindex="0"
            aria-label="Editable scenes"
          >
            <button
              v-for="scene in draft.scenes"
              :key="scene.id"
              :data-scene="scene.id"
              class="mb-2 block! w-full min-w-0 text-left hover:bg-soft"
              :class="selectedId === scene.id ? 'border-accent! bg-soft' : 'border-transparent!'"
              :aria-pressed="selectedId === scene.id"
              @click="edit(scene)"
            >
              <span class="block truncate text-xs">{{ scene.title }}</span
              ><span class="mt-1 block text-[10px] font-normal text-muted"
                >{{ scene.choices.length ? `${scene.choices.length} choices` : 'Ending'
                }}{{ scene.id === draft.start ? ' · START' : '' }}</span
              >
            </button>
          </div>
          <div class="mt-4 rounded-xl bg-background p-4">
            <p class="text-xs font-semibold text-accent">
              {{ draft.scenes.filter((s) => !s.choices.length).length }} endings ·
              {{ unreachable }} unreachable scenes
            </p>
            <p class="mt-2 text-xs leading-relaxed text-muted">
              Cycles are allowed. Each visitor stops after 50 decisions in one pass.
            </p>
          </div>
        </section>
        <section
          data-ui="journey-preview"
          class="min-w-0 rounded-2xl border border-line bg-surface p-5"
          aria-labelledby="preview-heading"
        >
          <div class="mb-5 flex flex-wrap items-center justify-between gap-2">
            <h2 id="preview-heading" class="text-lg font-semibold">Two little journeys</h2>
            <span class="rounded-full bg-soft px-3 py-1.5 text-xs text-accent"
              >Independent paths</span
            >
          </div>
          <div
            class="grid h-[590px] content-start gap-4 overflow-y-auto pr-1 sm:grid-cols-2"
            role="region"
            tabindex="0"
            aria-label="Journey previews"
          >
            <JourneyRunner :workspace="draft" visitor="one" label="Visitor one" /><JourneyRunner
              :workspace="draft"
              visitor="two"
              label="Visitor two"
            />
          </div>
          <p class="mt-4 text-xs leading-relaxed text-muted">
            Each visitor keeps its own choices. Saving scene or journey changes restarts both
            previews with the updated graph.
          </p>
        </section>
        <section
          data-ui="scene-editor"
          class="min-w-0 rounded-2xl border border-line bg-surface p-5"
          aria-labelledby="edit-heading"
        >
          <h2 id="edit-heading" class="mb-5 text-lg font-semibold">What happens here?</h2>
          <form class="h-[540px] overflow-y-auto" @submit.prevent="save">
            <label>Scene title<input v-model="form.title" maxlength="60" /></label
            ><label class="mt-4"
              >Scene text<textarea
                v-model="form.body"
                rows="4"
                maxlength="1000"
                class="resize-none"
              />
            </label>
            <div class="mt-5 flex items-center justify-between gap-2">
              <h3 class="text-sm font-semibold">Choices</h3>
              <button
                type="button"
                class="bg-soft px-2! text-xs! hover:bg-accent/10"
                :disabled="form.choices.length >= 4"
                @click="addChoice"
              >
                Add choice
              </button>
            </div>
            <div
              v-for="(choice, index) in form.choices"
              :key="choice.id"
              class="mt-3 rounded-xl border border-line bg-background p-3"
            >
              <label
                >Choice {{ index + 1 }} label<input v-model="choice.label" maxlength="60" /></label
              ><label class="mt-3"
                >Choice {{ index + 1 }} destination<select v-model="choice.to">
                  <option v-for="scene in draft.scenes" :key="scene.id" :value="scene.id">
                    {{ scene.title }}
                  </option>
                </select></label
              ><button
                type="button"
                class="mt-3 min-h-8! bg-surface py-1! text-xs! text-danger hover:bg-danger/5"
                :aria-label="`Remove choice ${index + 1}`"
                @click="form.choices.splice(index, 1)"
              >
                Remove choice
              </button>
            </div>
            <p v-if="!form.choices.length" class="mt-3 text-xs leading-relaxed text-muted">
              No choices makes this scene an ending.
            </p>
            <p class="mt-3 h-10 overflow-auto text-xs text-danger" role="alert">{{ error }}</p>
            <button
              type="submit"
              class="w-full border-accent! bg-accent text-on-accent hover:brightness-110"
            >
              Save scene
            </button>
          </form>
          <div class="mt-4 h-20 overflow-auto rounded-xl bg-soft p-4">
            <p class="break-words text-xs leading-relaxed text-muted">
              {{
                selected.id === draft.start
                  ? 'This is the starting scene.'
                  : references.length
                    ? `Referenced by: ${references.join(', ')}`
                    : 'No incoming choices.'
              }}
              Remove incoming choices and choose another start before deleting a referenced scene.
            </p>
          </div>
          <button
            class="mt-4 text-danger hover:bg-danger/5"
            :disabled="!removable"
            @click="removeOpen = true"
          >
            Remove scene
          </button>
        </section>
      </div>
      <footer class="mt-6 flex flex-wrap justify-between gap-2 text-xs text-muted">
        <span>Branching scenes, local journeys · CH/1</span><span>{{ marker }} · CodeSculptor</span>
      </footer>
    </main>
    <AppDialog v-model="removeOpen" title="Remove this scene?"
      ><p class="break-words text-muted">Remove the unreferenced scene “{{ selected.title }}”?</p>
      <div class="mt-6 flex justify-end gap-2">
        <button @click="removeOpen = false">Cancel</button
        ><button class="bg-danger text-white" @click="remove">Remove scene</button>
      </div></AppDialog
    >
  </div>
</template>
