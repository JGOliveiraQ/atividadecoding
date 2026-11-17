import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Pokemon } from './types';

type FavoritesContextValue = {
  favorites: Pokemon[];
  toggleFavorite: (pokemon: Pokemon) => Promise<void>;
  isFavorite: (id: number) => boolean;
};

const STORAGE_KEY = '@pokedex:favorites';
const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Pokemon[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved) setFavorites(JSON.parse(saved));
    });
  }, []);

  const toggleFavorite = async (pokemon: Pokemon) => {
    const next = favorites.some((item) => item.id === pokemon.id)
      ? favorites.filter((item) => item.id !== pokemon.id)
      : [...favorites, pokemon];

    setFavorites(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite: (id) => favorites.some((item) => item.id === id),
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites deve ser usado dentro de FavoritesProvider');
  return context;
}
