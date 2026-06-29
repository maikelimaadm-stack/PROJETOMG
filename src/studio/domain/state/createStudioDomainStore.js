import { studioDomainReducer } from "./studioDomainReducer.js";
import { createInitialStudioDomainState } from "../contracts/studioDomainContracts.js";

/**
 * @typedef {object} StudioDomainStore
 * @property {() => object} getState
 * @property {(action: object) => void} dispatch
 * @property {(listener: (state: object) => void) => () => void} subscribe
 */

/**
 * Creates the official MAK Studio domain store — single shared state model.
 * @param {object} [initialState]
 * @returns {StudioDomainStore}
 */
export function createStudioDomainStore(initialState) {
  let state = initialState ?? createInitialStudioDomainState();
  const listeners = new Set();

  return Object.freeze({
    getState: () => state,
    dispatch(action) {
      state = studioDomainReducer(state, action);
      listeners.forEach((listener) => listener(state));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
}

export default createStudioDomainStore;
