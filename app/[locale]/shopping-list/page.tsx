"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";
import {
  getShoppingList,
  toggleShoppingItem,
  removeShoppingItem,
  clearCheckedItems,
  clearShoppingList,
  type ShoppingItem,
} from "@/lib/shoppingList";
import { getFavorites } from "@/lib/favorites";

export default function ShoppingListPage() {
  const t = useTranslations();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(getShoppingList());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavoritesCount(getFavorites().length);
  }, []);

  function handleToggle(id: string) {
    setItems(toggleShoppingItem(id));
  }

  function handleRemove(id: string) {
    setItems(removeShoppingItem(id));
  }

  function handleClearChecked() {
    setItems(clearCheckedItems());
  }

  function handleClearAll() {
    setItems(clearShoppingList());
  }

  const hasChecked = items.some((item) => item.checked);

  return (
    <>
      <Navbar favoritesCount={favoritesCount} />

      <main className="min-h-screen py-12 px-4">
        <div className="max-w-xl mx-auto flex flex-col gap-6">
          <header className="text-center">
            <h1 className="font-display text-4xl font-semibold text-ink">
              {t("shoppingListTitle")}
            </h1>
          </header>

          {items.length === 0 ? (
            <div className="text-center py-12 text-ink-soft/60">
              <div className="text-5xl mb-7">🛒</div>
              <p className="text-sm">{t("shoppingListEmpty")}</p>
            </div>
          ) : (
            <>
              <div className="bg-paper-card rounded-2xl border border-line divide-y divide-line overflow-hidden">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleToggle(item.id)}
                      className="w-4 h-4 accent-saffron cursor-pointer"
                    />
                    <span
                      className={`flex-1 text-sm ${
                        item.checked ? "line-through text-ink-soft/50" : "text-ink"
                      }`}
                    >
                      {item.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="text-ink-soft/50 hover:text-paprika text-sm"
                      aria-label={item.name}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-4 text-sm">
                {hasChecked && (
                  <button
                    onClick={handleClearChecked}
                    className="text-ink-soft hover:text-ink"
                  >
                    {t("clearChecked")}
                  </button>
                )}
                <button
                  onClick={handleClearAll}
                  className="text-paprika hover:text-paprika/80"
                >
                  {t("clearAll")}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
