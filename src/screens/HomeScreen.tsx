import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Appbar,
  Card,
  Chip,
  Searchbar,
  Text,
} from 'react-native-paper';
import { useFavorites } from '../FavoritesContext';
import type { Pokemon, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const PAGE_SIZE = 20;
const API_URL = 'https://pokeapi.co/api/v2';
const typeColors: Record<string, string> = {
  fire: '#F97316', water: '#3B82F6', grass: '#22C55E', electric: '#EAB308',
  psychic: '#EC4899', ice: '#06B6D4', dragon: '#6366F1', dark: '#4B5563',
  fairy: '#D946EF', fighting: '#EF4444', flying: '#818CF8', poison: '#A855F7',
  ground: '#B45309', rock: '#78716C', bug: '#84CC16', ghost: '#7C3AED',
  steel: '#64748B', normal: '#9CA3AF',
};

const formatName = (name: string) =>
  name.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export function HomeScreen({ navigation }: Props) {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [query, setQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { isFavorite, toggleFavorite, favorites } = useFavorites();

  const fetchPage = useCallback(async (pageOffset: number, replace = false) => {
    const response = await fetch(`${API_URL}/pokemon?limit=${PAGE_SIZE}&offset=${pageOffset}`);
    if (!response.ok) throw new Error('Não foi possível carregar os Pokémon.');
    const data = await response.json();
    const details = await Promise.all(
      data.results.map((item: { url: string }) =>
        fetch(item.url).then((detailResponse) => {
          if (!detailResponse.ok) throw new Error('Não foi possível carregar os detalhes.');
          return detailResponse.json();
        })
      )
    );
    setPokemons((current) => replace ? details : [...current, ...details]);
    setOffset(pageOffset + PAGE_SIZE);
    setHasMore(Boolean(data.next));
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { await fetchPage(0, true); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Erro inesperado.'); }
    finally { setLoading(false); }
  }, [fetchPage]);

  useEffect(() => { loadInitial(); }, [loadInitial]);

  const handleLoadMore = async () => {
    if (loadingMore || refreshing || !hasMore) return;
    setLoadingMore(true);
    try { await fetchPage(offset); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Erro inesperado.'); }
    finally { setLoadingMore(false); }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try { await fetchPage(0, true); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Erro inesperado.'); }
    finally { setRefreshing(false); }
  };

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return pokemons;
    return pokemons.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(term) ||
      pokemon.id.toString().padStart(4, '0').includes(term)
    );
  }, [pokemons, query]);

  const renderPokemon = ({ item }: { item: Pokemon }) => {
    const image = item.sprites.other?.['official-artwork']?.front_default;
    const favorite = isFavorite(item.id);
    const primaryType = item.types[0]?.type.name ?? 'normal';
    return (
      <Card
        style={styles.card}
        mode="elevated"
        onPress={() => navigation.navigate('Details', { pokemon: item })}
      >
        <View style={[styles.accent, { backgroundColor: typeColors[primaryType] ?? '#9CA3AF' }]} />
        <Pressable
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item)}
          hitSlop={8}
        >
          <Text style={[styles.heart, { color: favorite ? '#EF4444' : '#A1A1AA' }]}>
            {favorite ? '♥' : '♡'}
          </Text>
        </Pressable>
        {image && <Card.Cover source={{ uri: image }} style={styles.image} resizeMode="contain" />}
        <Card.Content style={styles.cardContent}>
          <Text style={styles.number}>#{item.id.toString().padStart(4, '0')}</Text>
          <Text variant="titleMedium" style={styles.name}>{formatName(item.name)}</Text>
          <View style={styles.types}>
            {item.types.map(({ type }) => (
              <Chip
                compact
                key={type.name}
                textStyle={styles.chipText}
                style={[styles.chip, { backgroundColor: typeColors[type.name] ?? '#9CA3AF' }]}
              >
                {formatName(type.name)}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header
        mode="small"
        elevated={false}
        style={styles.appbar}
      >
        <Appbar.Content title="Pokédex" subtitle="Explore Pokémon" />
        <Pressable
          style={styles.favoritesButton}
          onPress={() => navigation.navigate('Favorites')}
          hitSlop={8}
        >
          <Text style={styles.headerHeart}>♥</Text>
        </Pressable>
        {favorites.length > 0 && <Text style={styles.badge}>{favorites.length}</Text>}
      </Appbar.Header>
      <Searchbar
        placeholder="Buscar por nome ou número"
        value={query}
        onChangeText={setQuery}
        style={styles.search}
        icon={() => <Text style={styles.searchIcon}>⌕</Text>}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.status}>Preparando a Pokédex...</Text>
        </View>
      ) : error && pokemons.length === 0 ? (
        <View style={styles.center}>
          <Text variant="headlineSmall">Ops!</Text>
          <Text style={styles.status}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPokemon}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          onEndReached={query ? undefined : handleLoadMore}
          onEndReachedThreshold={0.35}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.loader} /> : undefined}
          ListEmptyComponent={<View style={styles.center}><Text>Nenhum Pokémon encontrado</Text></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center' },
  appbar: { backgroundColor: '#F6F7FB', elevation: 0, shadowOpacity: 0 },
  search: { marginHorizontal: 16, marginVertical: 10, backgroundColor: '#FFFFFF' },
  searchIcon: { color: '#71717A', fontSize: 22, lineHeight: 24 },
  badge: {
    position: 'absolute',
    right: 8,
    top: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#171717',
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 18,
  },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  row: { justifyContent: 'space-between' },
  card: { width: '48.5%', marginBottom: 14, overflow: 'hidden', backgroundColor: '#FFFFFF' },
  accent: { position: 'absolute', left: 0, right: 0, top: 0, height: 4 },
  favoriteButton: { position: 'absolute', right: 4, top: 4, zIndex: 2, width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  favoritesButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  heart: { fontSize: 24, lineHeight: 28 },
  headerHeart: { color: '#EF4444', fontSize: 24, lineHeight: 28 },
  image: { width: '100%', height: 128, backgroundColor: 'transparent', marginTop: 8 },
  cardContent: { alignItems: 'center', paddingBottom: 12 },
  number: { color: '#A1A1AA', fontSize: 11, fontWeight: '700' },
  name: { marginTop: 2, fontWeight: '800', textAlign: 'center' },
  types: { flexDirection: 'row', gap: 4, marginTop: 8 },
  chip: { height: 24 },
  chipText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', marginVertical: 0 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  status: { marginTop: 12, textAlign: 'center' },
  loader: { marginVertical: 16 },
});
