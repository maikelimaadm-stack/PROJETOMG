/**
 * CRB objects with dependency chains for M07 tests.
 * @param {Object} [options]
 */
export function buildDependencyGraphFixture(options = {}) {
  const withCycle = options.withCycle ?? false;
  const withMissing = options.withMissing ?? false;
  const deep = options.deep ?? false;

  if (withCycle) {
    return [
      { objectId: 'obj-a', objectType: 'field', dependencies: { depend: ['obj-b'] } },
      { objectId: 'obj-b', objectType: 'field', dependencies: { depend: ['obj-a'] } },
    ];
  }

  if (withMissing) {
    return [
      { objectId: 'obj-a', objectType: 'field', dependencies: { depend: ['missing-ref'] } },
    ];
  }

  if (deep) {
    return [
      { objectId: 'obj-d', objectType: 'layout', dependencies: {} },
      { objectId: 'obj-c', objectType: 'field', dependencies: { depend: ['obj-d'] } },
      { objectId: 'obj-b', objectType: 'validation', dependencies: { depend: ['obj-c'] } },
      { objectId: 'obj-a', objectType: 'action', dependencies: { depend: ['obj-b'] } },
    ];
  }

  return [
    { objectId: 'obj-base', objectType: 'entity', dependencies: {} },
    { objectId: 'obj-child', objectType: 'field', dependencies: { depend: ['obj-base'] } },
    { objectId: 'obj-grand', objectType: 'action', dependencies: { depend: ['obj-child', 'obj-base'] } },
  ];
}

/**
 * @param {import('../../types/crb.js').CrbPayload} baseCrb
 * @param {unknown[]} objects
 */
export function withCrbObjects(baseCrb, objects) {
  const crb = { ...baseCrb, objects: [...objects] };
  return crb;
}
