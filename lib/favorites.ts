import type { Dish } from "@/lib/prompt";

const STORAGE_KEY = "dinner-ideas:favorites";

export interface FavoriteDish extends Dish {
  id: string;
  savedAt: number;
  language: string;
}


export function getDishId(dish: Dish): string {
  return dish.title.trim().toLowerCase();
}

export function getFavorites(): FavoriteDish[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites: FavoriteDish[]) {
try {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
} catch {

} 
}

export function addFavorite(dish: Dish, language: string): FavoriteDish[] {
  const favorites = getFavorites();
  const id = getDishId(dish);

  if (favorites.some((f) => f.id === id)) {
    return favorites
  }

  const updated = [...favorites, {...dish, id, savedAt: Date.now(), language}];
  saveFavorites(updated);
  return updated;
  }

  export function removeFavorite(id: string): FavoriteDish[] {
    const updated = getFavorites().filter((f) => f.id !== id);
    saveFavorites(updated);
    return updated;
  }
