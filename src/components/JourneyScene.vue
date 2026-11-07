<script setup lang="ts">
import { useJourney } from '../composables/journey'
import JourneyChoices from './JourneyChoices.vue'
const { current } = useJourney()
</script>
<template>
  <div class="h-[285px] min-w-0 shrink-0 overflow-y-auto">
    <h4
      data-ui="scene-title"
      class="h-14 overflow-auto break-words font-display text-xl font-semibold leading-snug"
    >
      {{ current.title }}
    </h4>
    <p
      class="mt-2 h-24 overflow-y-auto whitespace-pre-line break-words text-xs leading-relaxed text-muted"
    >
      {{ current.body }}
    </p>
    <JourneyChoices />
  </div>
</template>
