'use strict';

/**
 * @typedef {"memory" | "localStorage" | "sessionStorage"} StoreType
 */

/**
 * @typedef {object} StoreProviderOptions
 * @property {StoreType} [storeType]
 * @property {string} [prefix]
 */

/**
 * @typedef {object} StoreAdapter
 * @property {(key: string) => string | null} getRaw
 * @property {(key: string, raw: string) => void} setRaw
 * @property {(key: string) => void} remove
 */

/**
 * Provides an abstraction for storage management in a web application with support
 * for multiple storage backends, including memory, localStorage, and sessionStorage.
 */
export default class StoreProvider {
  static STORAGE_FACTORIES = Object.freeze({
    memory: () => new Map(),
    localStorage: () => window.localStorage,
    sessionStorage: () => window.sessionStorage,
  });

  /** @type {StoreType} */
  #storeType;

  /** @type {string} */
  #prefix;

  /** @type {boolean} */
  #isServer;

  /** @type {Map<string, string> | Storage} */
  #currentStorage;

  /** @type {StoreAdapter} */
  #store;

  /**
   * @param {StoreProviderOptions} [options]
   */
  constructor({ storeType = 'localStorage', prefix = 'test-app' } = {}) {
    if (!['memory', 'localStorage', 'sessionStorage'].includes(storeType)) {
      throw new Error(`Storage type "${storeType}" is not supported`);
    }
    if (typeof prefix !== 'string') {
      throw new TypeError(`"prefix" must be a string`);
    }

    this.#storeType = /** @type {StoreType} */ (storeType);
    this.#prefix = prefix.trim();
    this.#isServer = typeof window === 'undefined';

    this.#initStorage();
    this.#store = this.#adaptStorage();
  }

  /**
   * @param {Storage} storage
   */
  #canUseWebStorage(storage) {
    try {
      const k = '__ws_test__';
      storage.setItem(k, '1');
      storage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  }

  #initStorage() {
    // SSR => memory only
    if (this.#isServer && this.#storeType !== 'memory') {
      this.#storeType = 'memory';
    }

    const storeType = this.#storeType;
    const factory = StoreProvider.STORAGE_FACTORIES[storeType];
    if (!factory)
      throw new Error(`Storage type "${storeType}" is not supported`);

    // @ts-ignore - runtime returns Map or Storage
    this.#currentStorage = factory();

    // Fallback mechanism: If the selected Web Storage backend (localStorage/sessionStorage) is blocked
    // by browser privacy settings, incognito mode, quota limits, or other restrictions,
    // automatically switch to in-memory storage to prevent runtime errors and maintain functionality
    if (this.#storeType !== 'memory') {
      const s = /** @type {Storage} */ (this.#currentStorage);
      if (!this.#canUseWebStorage(s)) {
        this.#storeType = 'memory'; // Fixed typo here
        this.#currentStorage = StoreProvider.STORAGE_FACTORIES.memory();
      }
    }
  }

  /**
   * @param {string} [key]
   */
  #getKey(key) {
    if (!key) return this.#prefix;
    return this.#prefix ? `${this.#prefix}:${key}` : key;
  }

  /**
   * @param {any} value
   */
  #serialize(value) {
    return JSON.stringify(value);
  }

  /**
   * @param {string | null} raw
   */
  #deserialize(raw) {
    if (raw == null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }

  /** @returns {StoreAdapter} */
  #adaptStorage() {
    const c = this.#currentStorage;

    if (this.#storeType === 'memory') {
      const m = /** @type {Map<string, string>} */ (c);
      return {
        getRaw: (key) => m.get(key) ?? null,
        setRaw: (key, raw) => void m.set(key, raw),
        remove: (key) => void m.delete(key),
      };
    }

    const s = /** @type {Storage} */ (c);
    return {
      getRaw: (key) => s.getItem(key),
      setRaw: (key, raw) => s.setItem(key, raw),
      remove: (key) => s.removeItem(key),
    };
  }

  /**
   * @param {string} key
   * @param {any} value
   */
  setValue(key, value) {
    const storeKey = this.#getKey(key);
    this.#store.setRaw(storeKey, this.#serialize(value));
  }

  /**
   * @template T
   * @param {string} key
   * @returns {T | string | null}
   */
  getValue(key) {
    const storeKey = this.#getKey(key);
    const raw = this.#store.getRaw(storeKey);
    return /** @type {any} */ (this.#deserialize(raw));
  }

  /**
   * @param {string} key
   */
  removeValue(key) {
    const storeKey = this.#getKey(key);
    this.#store.remove(storeKey);
  }
}
