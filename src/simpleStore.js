import { useState, useEffect } from 'react';

const SimpleStore = (() => {
  const globalStores = new Map();
  const listenersMap = new Map();

  function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  function deepMerge(target, source) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key]) && isObject(target[key])) {
        target[key] = deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    });
    return target;
  }

  function isEqual(objA, objB) {
    if (objA === objB) return true;

    if (!isObject(objA) || !isObject(objB)) return false;

    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key) || !isEqual(objA[key], objB[key])) {
        return false;
      }
    }

    return true;
  }

  const createStore = (key, initialState, actionsInitializer) => {
    if (typeof key !== 'string') {
      throw new Error('Store key must be a string.');
    }
    if (globalStores.has(key)) {
      throw new Error(`Store with key "${key}" already exists.`);
    }

    const set = (action) => {
      console.log('Inside set function', action);
      const currentStore = globalStores.get(key);
      const newState = action(currentStore.state);
      console.log(newState);
      const newStore = {
        ...currentStore,
        state: deepMerge(currentStore.state, newState),
      };

      globalStores.set(key, newStore);
      const listeners = listenersMap.get(key);
      listeners.forEach((listener) => listener(newStore.state));
    };

    const actions = actionsInitializer(set);

    const store = {
      state: initialState,
      ...actions,
    };
    globalStores.set(key, store);
    listenersMap.set(key, new Set());
    console.log(globalStores, listenersMap);
  };

  const useStore = (key, selectors = [(store) => store.state]) => {
    if (!Array.isArray(selectors)) {
      selectors = [selectors]; // Ensure selectors is always an array
    }

    const currentStore = globalStores.get(key);
    if (typeof currentStore === 'undefined') {
      throw new Error(`Store with key "${key}" does not exist.`);
    }

    const selectedStates = selectors.map((selector) => selector(currentStore));
    const [states, setStates] = useState(selectedStates);

    useEffect(() => {
      const listener = (newState) => {
        const newSelectedStates = selectors.map((selector) =>
          selector({ ...currentStore, state: newState })
        );
        if (
          !newSelectedStates.every((selectedState, index) =>
            isEqual(selectedState, states[index])
          )
        ) {
          setStates(newSelectedStates);
        }
      };

      const listeners = listenersMap.get(key);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }, [currentStore, key, selectors, states]);
    return states.length === 1 ? states[0] : states;
  };

  return {
    createStore,
    useStore,
  };
})();

export default SimpleStore;
