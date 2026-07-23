import type { Recipe } from '../types/recipe';

const DATABASE_NAME = 'recipe-collection';
const DATABASE_VERSION = 1;
const STORE_NAME = 'recipes';

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) {
    return databasePromise;
  }

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      databasePromise = null;
      reject(request.error ?? new Error('Failed to open recipe database.'));
    };

    request.onblocked = () => {
      databasePromise = null;
      reject(new Error('Recipe database is blocked by another tab.'));
    };
  });

  return databasePromise;
}

function waitForTransaction(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('A recipe database transaction failed.'));
    tx.onabort = () => reject(tx.error ?? new Error('A recipe database transaction was aborted.'));
  });
}

function readRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('A recipe database read failed.'));
  });
}

async function writeWithStore<T>(handler: (store: IDBObjectStore) => Promise<T> | T): Promise<T> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  const result = await handler(store);
  await waitForTransaction(transaction);
  return result;
}

export async function getRecipes(): Promise<Recipe[]> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const recipes = await readRequest<Recipe[]>(store.getAll());
  await waitForTransaction(transaction);
  return recipes.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function getRecipe(id: string): Promise<Recipe | undefined> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const recipe = await readRequest<Recipe | undefined>(store.get(id));
  await waitForTransaction(transaction);
  return recipe;
}

export async function createRecipe(recipe: Recipe): Promise<Recipe> {
  await writeWithStore((store) => store.add(recipe));
  return recipe;
}

export async function updateRecipe(recipe: Recipe): Promise<Recipe> {
  await writeWithStore((store) => store.put(recipe));
  return recipe;
}

export async function deleteRecipe(id: string): Promise<void> {
  await writeWithStore((store) => store.delete(id));
}