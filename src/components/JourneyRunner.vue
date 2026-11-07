<script setup lang="ts">
import { provide, toRef, useId } from 'vue'
import { createJourney, journeyKey } from '../composables/journey'
import type { Workspace } from '../domain/paths'
import JourneyScene from './JourneyScene.vue'
const props = defineProps<{ workspace: Workspace; visitor: string; label: string }>()
const journey = createJourney(toRef(() => props.workspace))
provide(journeyKey, journey)
const { path, back, restart } = journey
const heading = useId()
</script>
<template>
  <section
    :data-visitor="visitor"
    class="flex h-[460px] min-w-0 flex-col rounded-2xl border border-line bg-background p-4"
    :aria-labelledby="heading"
  >
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h3 :id="heading" class="text-base font-semibold">{{ label }}</h3>
      <span class="rounded-full bg-surface px-2 py-1 text-[10px] text-accent"
        >{{ path.length - 1 }} decisions</span
      >
    </div>
    <JourneyScene />
    <p
      data-ui="journey-path"
      class="mt-3 h-10 overflow-auto break-words font-mono text-[10px] leading-relaxed text-muted"
    >
      {{ path.join(' → ') }}
    </p>
    <div class="mt-auto flex flex-wrap gap-2">
      <button
        class="min-h-8! bg-surface py-1! text-xs! hover:bg-soft"
        :disabled="path.length < 2"
        @click="back"
      >
        Back</button
      ><button class="min-h-8! bg-surface py-1! text-xs! hover:bg-soft" @click="restart">
        Restart path
      </button>
    </div>
  </section>
</template>
