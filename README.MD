# StoreProvider 📦

![Version](https://img.shields.io/badge/version-v1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![SSR Ready](https://img.shields.io/badge/SSR-ready-success)

A robust, SSR-safe storage abstraction for modern web applications.

`StoreProvider` provides a unified API over **localStorage**, **sessionStorage**, and an **in-memory Map**. It automatically JSON-serializes values, detects SSR environments, and falls back to memory when Web Storage is blocked or unavailable.

---

## ✨ Features

- ✅ **Unified API**: Same methods regardless of backend (`localStorage`, `sessionStorage`, or `memory`).
- ✅ **Automatic Serialization**: Values are stored via `JSON.stringify`. No manual conversion needed.
- ✅ **Smart Deserialization**: Automatically parses JSON; returns raw string if parsing fails.
- ✅ **SSR Safe**: Detects `window` availability and switches to memory storage in server environments.
- ✅ **Graceful Degradation**: If Web Storage is blocked (privacy mode, quota), it seamlessly falls back to memory.
- ✅ **Namespacing / Prefixing**: Prevents key collisions by prefixing keys (e.g., `app:settings`).
- ✅ **Zero Dependencies**: Extremely lightweight and framework-agnostic.

---

## 📦 Installation

Copy `store-provider.js` to your project and import it:

```js
import StoreProvider from './store-provider.js';
```

---

## 🚀 Quick Start

```js
import StoreProvider from './store-provider.js';

// Initialize with defaults: localStorage + prefix "test-app"
const store = new StoreProvider();

// Store values (objects are automatically serialized)
store.setValue('user', { name: 'Jane Doe', role: 'admin' });

// Retrieve values (automatically deserialized)
const user = store.getValue('user');
console.log(user.name); // "Jane Doe"

// Remove values
store.removeValue('user');
```

---

## 💾 Storage Options

### 1. Configuration

| Option      | Type                                             | Default          | Description                          |
| :---------- | :----------------------------------------------- | :--------------- | :----------------------------------- |
| `storeType` | `"localStorage" \| "sessionStorage" \| "memory"` | `"localStorage"` | The primary storage backend.         |
| `prefix`    | `string`                                         | `"test-app"`     | Prefix for keys to avoid collisions. |

### 2. Usage Examples

```js
// Use sessionStorage for temporary data
const sessionStore = new StoreProvider({
  storeType: 'sessionStorage',
  prefix: 'app-session',
});

// Use memory storage for transient data or testing
const memoryStore = new StoreProvider({
  storeType: 'memory',
});
```

---

## 🧠 Behavior Rules

### SSR Support

If `StoreProvider` detects it's running on the server (`window` is undefined), it automatically switches to `memory` storage to prevent crashes.

### Availability Testing

When `localStorage` or `sessionStorage` is selected, the library performs a quick write/read/delete test. If this fails (e.g., cookies/storage disabled in browser), it falls back to `memory` storage.

### Key Namespacing

All keys are prefixed as `${prefix}:${key}`.

- Example: `store.setValue("theme", "dark")` with prefix `my-app` stores the key `my-app:theme`.

---

## 📖 API Reference

### `setValue(key: string, value: any): void`

Serializes and stores the `value` under the prefixed `key`.

### `getValue<T>(key: string): T | string | null`

Retrieves and deserializes the value for the prefixed `key`.

- Returns `null` if the key doesn't exist.
- Returns the raw string if JSON parsing fails.

### `removeValue(key: string): void`

Removes the prefixed `key` and its value from storage.

---

## ⚠️ Important Notes

- **Refresh Persistence**: `localStorage` persists across refreshes; `sessionStorage` persists for the tab session; `memory` is cleared on every refresh/re-run.
- **Safety First**: This library is designed to never throw errors during normal operation, preferring graceful fallbacks to keep your application running.

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

Copyright (c) 2026 Bahram Bayramli
