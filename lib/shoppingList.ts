const STORAGE_KEY = "dinner-ideas:shopping-list";

export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
}

function getItemId(name: string): string {
  return name.trim().toLowerCase();
}

export function getShoppingList(): ShoppingItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveShoppingList(items: ShoppingItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
  }
}

export function addIngredientsToShoppingList(ingredients: string[]): ShoppingItem[] {
  const list = getShoppingList();
  const existingIds = new Set(list.map((item) => item.id));

  const newItems: ShoppingItem[] = [];
  for (const name of ingredients) {
    const id = getItemId(name);
    if (!existingIds.has(id)) {
      newItems.push({ id, name, checked: false });
      existingIds.add(id);
    }
  }

  const updated = [...list, ...newItems];
  saveShoppingList(updated);
  return updated;
}

export function toggleShoppingItem(id: string): ShoppingItem[] {
  const list = getShoppingList();
  const updated = list.map((item) =>
    item.id === id ? { ...item, checked: !item.checked } : item
  );
  saveShoppingList(updated);
  return updated;
}

export function removeShoppingItem(id: string): ShoppingItem[] {
  const updated = getShoppingList().filter((item) => item.id !== id);
  saveShoppingList(updated);
  return updated;
}

export function clearCheckedItems(): ShoppingItem[] {
  const updated = getShoppingList().filter((item) => !item.checked);
  saveShoppingList(updated);
  return updated;
}

export function clearShoppingList(): ShoppingItem[] {
  saveShoppingList([]);
  return [];
}
