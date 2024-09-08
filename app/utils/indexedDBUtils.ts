const DB_NAME = 'canvasDB';
const DB_VERSION = 1;
const STORE_NAME = 'canvas';

interface CanvasState {
  id: string;
  state: string;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onerror = (event) => {
      reject('Database error: ' + (event.target as IDBOpenDBRequest));
    };
    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
  });
};

export const saveCanvasData = async (canvasData: string): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  store.put({ id: 'currentCanvas', state: canvasData });
};

export const loadCanvasData = async (callback: (state: string) => void): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const request = store.get('currentCanvas');
  request.onsuccess = (event) => {
    const result = (event.target as IDBRequest<CanvasState>).result;
    if (result) {
      callback(result.state);
    }
  };
};
