import { record, list, unique, text } from './validation.ts'
import { single, id, provenance } from './shared.ts'
export type Choice = { id: string; label: string; to: string }
export type Scene = { id: string; title: string; body: string; choices: Choice[] }
export type Workspace = { version: 1; name: string; start: string; scenes: Scene[] }
export const sample: Workspace = {
  version: 1,
  name: 'A slow Saturday in the neighborhood',
  start: 'begin',
  scenes: [
    {
      id: 'begin',
      title: 'A free morning',
      body: 'The market is opening, the river path is quiet, and there is a little time before lunch. Where would you like to begin?',
      choices: [
        { id: 'river-choice', label: 'Take the river path', to: 'river' },
        { id: 'market-choice', label: 'Visit the little market', to: 'market' },
      ],
    },
    {
      id: 'river',
      title: 'Beside the water',
      body: 'A bench catches the morning sun. Farther along, a footbridge leads toward a community garden.',
      choices: [
        { id: 'garden-choice', label: 'Walk to the garden', to: 'garden' },
        { id: 'bench-choice', label: 'Stay with a book', to: 'book' },
      ],
    },
    {
      id: 'market',
      title: 'A few useful things',
      body: 'Someone is selling fresh bread. A handwritten sign invites visitors to a shared garden after the market.',
      choices: [
        { id: 'shared-garden', label: 'Follow the garden invitation', to: 'garden' },
        { id: 'home-choice', label: 'Bring breakfast home', to: 'home' },
      ],
    },
    {
      id: 'garden',
      title: 'A place to grow',
      body: 'You help water a row of seedlings and meet someone new. A small morning becomes a good story to take home.',
      choices: [],
    },
    {
      id: 'book',
      title: 'One quiet chapter',
      body: 'You settle beside the river, read a chapter, and let the rest of the morning arrive slowly.',
      choices: [],
    },
    {
      id: 'home',
      title: 'Breakfast at the table',
      body: 'The bread is still warm. You open a window and make a little space for the day.',
      choices: [],
    },
  ],
}
export function parseScene(value: unknown): Scene {
  const o = record(value, 'Scene')
  const choices = list(o.choices, 'Choices', 4).map((v) => {
    const c = record(v, 'Choice')
    return { id: id(c.id), label: single(c.label, 'Choice label', 60), to: id(c.to) }
  })
  unique(
    choices.map((c) => c.id),
    'Choice identities within a scene',
  )
  return {
    id: id(o.id),
    title: single(o.title, 'Scene title', 60),
    body: text(o.body, 'Scene text', 1000),
    choices,
  }
}
export function parseWorkspace(value: unknown): Workspace {
  const o = record(value, 'Workspace')
  if (o.version !== 1) throw new Error('Expected CH/1 workspace.')
  const scenes = list(o.scenes, 'Scenes', 12).map(parseScene)
  if (!scenes.length) throw new Error('Keep at least one scene.')
  unique(
    scenes.map((s) => s.id),
    'Scene identities',
  )
  const start = id(o.start),
    known = new Set(scenes.map((s) => s.id))
  if (!known.has(start)) throw new Error('Starting scene must exist.')
  if (scenes.some((s) => s.choices.some((c) => !known.has(c.to))))
    throw new Error('Every choice must point to an existing scene.')
  return { version: 1, name: single(o.name, 'Journey title', 80), start, scenes }
}
export function reachable(w: Workspace) {
  const visited = new Set<string>(),
    pending = [w.start]
  while (pending.length) {
    const current = pending.pop()!
    if (visited.has(current)) continue
    visited.add(current)
    const scene = w.scenes.find((s) => s.id === current)!
    pending.push(...scene.choices.map((c) => c.to))
  }
  return w.scenes.filter((s) => visited.has(s.id)).map((s) => s.id)
}
export function incoming(w: Workspace, id: string) {
  return w.scenes.filter((s) => s.choices.some((c) => c.to === id)).map((s) => s.id)
}
export function exportWorkspace(value: Workspace) {
  const w = parseWorkspace(value)
  return { ...w, provenance: provenance('CH', 'vue-choice-path-studio', w) }
}
function md(value: string) {
  return value.replace(/[\\`*_[\]<>|]/g, '\\$&')
}
export function exportMarkdown(value: Workspace) {
  const w = parseWorkspace(value),
    marker = exportWorkspace(w).provenance.marker
  return `# ${md(w.name)}\n\nStart: ${md(w.scenes.find((s) => s.id === w.start)!.title)} (${w.start})\n\n${w.scenes.map((s) => `## ${md(s.title)} (${s.id})\n\n${md(s.body)}\n\n${s.choices.length ? s.choices.map((c) => `- ${md(c.label)} → ${md(w.scenes.find((s) => s.id === c.to)!.title)} (${c.to})`).join('\n') : 'End of this path.'}`).join('\n\n')}\n\n${marker} · CodeSculptor · vue-choice-path-studio\n`
}
