import StoreProvider from './store-provider.js';

const storage = new StoreProvider({
  storeType: 'memory',
  prefix: 'test',
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('StoreProvider initialized:', storage);
  storage.setValue('test-key', 'Hello from StoreProvider!');
  console.log('Value retrieved:', storage.getValue('test-key'));
});
