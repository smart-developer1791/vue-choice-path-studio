import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ref, isReadonly, effectScope, nextTick } from 'vue'
import {
  sample,
  parseWorkspace,
  reachable,
  incoming,
  exportWorkspace,
  exportMarkdown,
} from '../src/domain/paths.ts'
import { createJourney } from '../src/composables/journey.ts'
test('sample graph and canonical provenance round-trip with detached choices', () => {
  const fixture = JSON.parse(
    readFileSync(new URL('../public/sample-workspace.json', import.meta.url), 'utf8'),
  )
  assert.deepEqual(exportWorkspace(sample), fixture)
  assert.deepEqual(parseWorkspace(fixture), sample)
  const w = parseWorkspace(sample)
  w.scenes[0]!.choices[0]!.label = 'Changed'
  assert.notEqual(sample.scenes[0]!.choices[0]!.label, 'Changed')
  assert.notEqual(exportWorkspace(w).provenance.marker, fixture.provenance.marker)
})
test('strict graph guards reject missing targets, duplicate identities, and wrong primitives', () => {
  for (const value of [
    { ...sample, name: ['x'] },
    { ...sample, start: 'missing' },
    { ...sample, scenes: [] },
    { ...sample, scenes: [sample.scenes[0], sample.scenes[0]] },
    { ...sample, scenes: [{ ...sample.scenes[0], id: 'constructor' }] },
    {
      ...sample,
      scenes: sample.scenes.map((s, i) =>
        i ? s : { ...s, choices: [{ ...s.choices[0], to: 'missing' }] },
      ),
    },
    {
      ...sample,
      scenes: sample.scenes.map((s, i) =>
        i ? s : { ...s, choices: [s.choices[0], s.choices[0]] },
      ),
    },
  ])
    assert.throws(() => parseWorkspace(value))
})
test('reachability and incoming references remain bounded through graph cycles', () => {
  assert.equal(reachable(sample).length, 6)
  assert.deepEqual(incoming(sample, 'garden'), ['river', 'market'])
  const w = parseWorkspace({
    ...sample,
    scenes: [
      ...sample.scenes,
      {
        id: 'loop',
        title: 'Loop',
        body: 'Return here.',
        choices: [{ id: 'again', label: 'Again', to: 'loop' }],
      },
    ],
  })
  assert.equal(reachable(w).includes('loop'), false)
  const loop = { ...w, start: 'loop' }
  assert.deepEqual(reachable(loop), ['loop'])
})
test('independent Vue journey contexts keep readonly paths and reset on source replacement', async () => {
  const scope = effectScope(),
    source = ref(parseWorkspace(sample)),
    one = scope.run(() => createJourney(source))!,
    two = scope.run(() => createJourney(source))!
  assert.equal(isReadonly(one.path), true)
  one.choose('river-choice')
  assert.equal(one.current.value.id, 'river')
  assert.equal(two.current.value.id, 'begin')
  two.choose('market-choice')
  one.choose('garden-choice')
  assert.equal(one.finished.value, true)
  assert.equal(two.current.value.id, 'market')
  assert.equal(one.choose('not-a-choice'), false)
  one.back()
  assert.equal(one.current.value.id, 'river')
  source.value = { ...parseWorkspace(sample), start: 'market' }
  await nextTick()
  assert.deepEqual([...one.path.value], ['market'])
  assert.deepEqual([...two.path.value], ['market'])
  scope.stop()
})
test('a visitor can loop only 50 decisions, then step back or restart', () => {
  const source = ref(
      parseWorkspace({
        version: 1,
        name: 'Loop',
        start: 'loop',
        scenes: [
          {
            id: 'loop',
            title: 'Loop',
            body: 'Try again.',
            choices: [{ id: 'again', label: 'Again', to: 'loop' }],
          },
        ],
      }),
    ),
    journey = createJourney(source)
  for (let i = 0; i < 50; i++) assert.equal(journey.choose('again'), true)
  assert.equal(journey.limited.value, true)
  assert.equal(journey.path.value.length, 51)
  assert.equal(journey.choose('again'), false)
  journey.back()
  assert.equal(journey.limited.value, false)
  journey.restart()
  assert.equal(journey.path.value.length, 1)
})
test('complete Markdown exports endings, linked scene names, and escaped user syntax', () => {
  const w = {
    ...sample,
    name: 'A | <path>',
    scenes: sample.scenes.map((s, i) => (i ? s : { ...s, title: '[A beginning]' })),
  }
  const md = exportMarkdown(w)
  assert.ok(md.includes('A \\| \\<path\\>'))
  assert.ok(md.includes('\\[A beginning\\]'))
  assert.ok(md.includes('Take the river path → Beside the water (river)'))
  assert.ok(md.includes('End of this path.'))
  assert.match(md, /CH-[A-F0-9]{8}/)
})
