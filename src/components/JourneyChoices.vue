<script setup lang="ts">
import { useJourney } from '../composables/journey'
const { current, limited, finished, choose } = useJourney()
</script>
<template>
  <div class="mt-4 h-28 overflow-y-auto">
    <p v-if="finished" class="rounded-xl bg-soft p-3 text-xs leading-relaxed text-success">
      You reached the end of this path. Begin again or step back to try another choice.
    </p>
    <p v-else-if="limited" class="rounded-xl bg-danger/5 p-3 text-xs leading-relaxed text-danger">
      This pass reached 50 decisions. Step back or restart to continue.
    </p>
    <button
      v-for="choice in current.choices"
      :key="choice.id"
      class="mb-2 w-full min-w-0 justify-start! bg-surface text-left text-xs! hover:bg-soft"
      :disabled="limited"
      @click="choose(choice.id)"
    >
      <span class="break-words">{{ choice.label }}</span>
    </button>
  </div>
</template>
