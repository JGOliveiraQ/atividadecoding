export type PokemonType = {
  slot: number;
  type: { name: string };
};

export type PokemonStat = {
  base_stat: number;
  stat: { name: string };
};

export type Pokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonType[];
  stats: PokemonStat[];
  sprites: {
    other?: {
      'official-artwork'?: { front_default: string | null };
    };
  };
};

export type RootStackParamList = {
  Home: undefined;
  Details: { pokemon: Pokemon };
  Favorites: undefined;
};
