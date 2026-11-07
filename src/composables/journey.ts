import { ref, computed, readonly, watch, inject, type Ref, type InjectionKey } from 'vue'
import type { Workspace } from '../domain/paths.ts'
export function createJourney(source: Readonly<Ref<Workspace>>) {
  const path = ref([source.value.start])
  const current = computed(() => source.value.scenes.find((s) => s.id === path.value.at(-1))!)
  const finished = computed(() => current.value.choices.length === 0),
    limited = computed(() => path.value.length >= 51)
  function choose(id: string) {
    if (limited.value) return false
    const choice = current.value.choices.find((c) => c.id === id)
    if (!choice) return false
    path.value = [...path.value, choice.to]
    return true
  }
  function back() {
    if (path.value.length < 2) return false
    path.value = path.value.slice(0, -1)
    return true
  }
  function restart() {
    path.value = [source.value.start]
  }
  watch(source, restart, { flush: 'sync' })
  return { path: readonly(path), current, finished, limited, choose, back, restart }
}
export type Journey = ReturnType<typeof createJourney>
export const journeyKey: InjectionKey<Journey> = Symbol('choice-path-journey')
export function useJourney() {
  const journey = inject(journeyKey)
  if (!journey) throw new Error('Journey components need a local JourneyRunner provider.')
  return journey
}
