import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type PokemonType = {
  slot: number;
  type: { name: string };
};

type Pokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonType[];
  sprites: {
    other?: {
      'official-artwork'?: { front_default: string | null };
    };
  };
};

type PokemonListItem = {
  name: string;
  url: string;
};

const PAGE_SIZE = 20;
const API_URL = 'https://pokeapi.co/api/v2';

const typeColors: Record<string, string> = {
  fire: '#F97316',
  water: '#3B82F6',
  grass: '#22C55E',
  electric: '#EAB308',
  psychic: '#EC4899',
  ice: '#06B6D4',
  dragon: '#6366F1',
  dark: '#4B5563',
  fairy: '#D946EF',
  fighting: '#EF4444',
  flying: '#818CF8',
  poison: '#A855F7',
  ground: '#B45309',
  rock: '#78716C',
  bug: '#84CC16',
  ghost: '#7C3AED',
  steel: '#64748B',
  normal: '#9CA3AF',
};

function formatName(name: string) {
  return name.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function App() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [query, setQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(async (pageOffset: number, replace = false) => {
    const response = await fetch(`${API_URL}/pokemon?limit=${PAGE_SIZE}&offset=${pageOffset}`);
    if (!response.ok) throw new Error('Não foi possível carregar os Pokémon.');

    const data = await response.json();
    const items = data.results as PokemonListItem[];

    const detailResponses = await Promise.all(
      items.map((item) => fetch(item.url).then((detailResponse) => {
        if (!detailResponse.ok) throw new Error('Não foi possível carregar os detalhes.');
        return detailResponse.json();
      }))
    );

    setPokemons((current) => replace ? detailResponses : [...current, ...detailResponses]);
    setOffset(pageOffset + PAGE_SIZE);
    setHasMore(Boolean(data.next));
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchPage(0, true);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || refreshing || !hasMore) return;
    setLoadingMore(true);
    try {
      await fetchPage(offset);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Ocorreu um erro inesperado.');
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, loadingMore, offset, refreshing]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      await fetchPage(0, true);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Ocorreu um erro inesperado.');
    } finally {
      setRefreshing(false);
    }
  }, [fetchPage]);

  const filteredPokemons = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return pokemons;
    return pokemons.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(normalizedQuery) ||
      pokemon.id.toString().padStart(4, '0').includes(normalizedQuery)
    );
  }, [pokemons, query]);

  const renderPokemon = ({ item }: { item: Pokemon }) => {
    const image = item.sprites.other?.['official-artwork']?.front_default;
    const primaryType = item.types[0]?.type.name ?? 'normal';

    return (
      <TouchableOpacity activeOpacity={0.85} style={styles.card}>
        <View style={[styles.cardAccent, { backgroundColor: typeColors[primaryType] ?? '#9CA3AF' }]} />
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>#{item.id.toString().padStart(4, '0')}</Text>
        </View>
        {image ? (
          <Image source={{ uri: image }} style={styles.pokemonImage} resizeMode="contain" />
        ) : (
          <View style={styles.imageFallback} />
        )}
        <Text style={styles.pokemonName}>{formatName(item.name)}</Text>
        <View style={styles.typeRow}>
          {item.types.map(({ type }) => (
            <View
              key={type.name}
              style={[styles.typeBadge, { backgroundColor: typeColors[type.name] ?? '#9CA3AF' }]}
            >
              <Text style={styles.typeText}>{formatName(type.name)}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>POKÉDEX</Text>
            <Text style={styles.title}>Explore Pokémon</Text>
          </View>
          <View style={styles.logoMark}>
            <View style={styles.logoInner} />
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por nome ou número"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            clearButtonMode="while-editing"
            autoCapitalize="none"
          />
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#EF4444" />
            <Text style={styles.stateText}>Preparando a Pokédex...</Text>
          </View>
        ) : error && pokemons.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={styles.errorTitle}>Ops!</Text>
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadInitial}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredPokemons}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPokemon}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#EF4444"
                colors={['#EF4444']}
              />
            }
            onEndReached={query ? undefined : handleLoadMore}
            onEndReachedThreshold={0.35}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#EF4444" />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Nenhum Pokémon encontrado</Text>
                <Text style={styles.stateText}>Tente outro nome ou número.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  eyebrow: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  title: {
    color: '#171717',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EF4444',
    borderWidth: 4,
    borderColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#171717',
  },
  searchContainer: {
    height: 52,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEEF3',
  },
  searchIcon: {
    width: 48,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 24,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#171717',
    fontSize: 16,
    paddingRight: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48.5%',
    minHeight: 220,
    marginBottom: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 16,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: '#ECEEF3',
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  numberBadge: {
    position: 'absolute',
    right: 10,
    top: 12,
  },
  numberText: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '700',
  },
  pokemonImage: {
    width: 118,
    height: 118,
  },
  imageFallback: {
    width: 118,
    height: 118,
  },
  pokemonName: {
    color: '#18181B',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  typeBadge: {
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  stateText: {
    color: '#71717A',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
  },
  errorTitle: {
    color: '#18181B',
    fontSize: 24,
    fontWeight: '800',
  },
  retryButton: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 18,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  footerLoader: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    color: '#18181B',
    fontSize: 18,
    fontWeight: '800',
  },
});
