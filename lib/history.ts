import type { Dish, IdeaRequestParams } from "@/lib/prompt";

const STORAGE_KEY = "dinner-ideas:history";
const MAX_ENTRIES = 20;

export interface HistoryEntry {
  id: string;
  dishes: Dish[];
  params: IdeaRequestParams;
  createdAt: number;
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
  }
}

export function addHistoryEntry(dishes: Dish[], params: IdeaRequestParams): HistoryEntry[] {
  const entries = getHistory();

  const newEntry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    dishes,
    params,
    createdAt: Date.now(),
  };

  const updated = [newEntry, ...entries].slice(0, MAX_ENTRIES);
  saveHistory(updated);
  return updated;
}

export function removeHistoryEntry(id: string): HistoryEntry[] {
  const updated = getHistory().filter((entry) => entry.id !== id);
  saveHistory(updated);
  return updated;
}

export function clearHistory(): HistoryEntry[] {
  saveHistory([]);
  return [];
}
