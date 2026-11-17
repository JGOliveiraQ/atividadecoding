import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useFavorites } from '../FavoritesContext';
import type { Pokemon, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

const formatName = (name: string) =>
  name.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export function FavoritesScreen({ navigation }: Props) {
  const { favorites, toggleFavorite } = useFavorites();

  const renderItem = ({ item }: { item: Pokemon }) => {
    const image = item.sprites.other?.['official-artwork']?.front_default;
    return (
      <Card
        style={styles.card}
        mode="elevated"
        onPress={() => navigation.navigate('Details', { pokemon: item })}
      >
        {image && <Card.Cover source={{ uri: image }} style={styles.image} resizeMode="contain" />}
        <Card.Content style={styles.content}>
          <View style={{ flex: 1 }}>
            <Text variant="labelSmall">#{item.id.toString().padStart(4, '0')}</Text>
            <Text variant="titleMedium" style={styles.name}>{formatName(item.name)}</Text>
          </View>
          <Pressable
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(item)}
            hitSlop={8}
          >
            <Text style={styles.heart}>♥</Text>
          </Pressable>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyHeart}>♡</Text>
          <Text variant="titleMedium">Nenhum favorito ainda</Text>
          <Text style={styles.emptyText}>Toque no coração dos Pokémon para salvá-los.</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 40 },
  row: { justifyContent: 'space-between' },
  card: { width: '48.5%', marginBottom: 14, backgroundColor: '#FFFFFF' },
  image: { height: 140, backgroundColor: 'transparent' },
  content: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingBottom: 8 },
  name: { fontWeight: '800' },
  favoriteButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  heart: { color: '#EF4444', fontSize: 24, lineHeight: 28 },
  emptyHeart: { color: '#A1A1AA', fontSize: 48, lineHeight: 52 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { color: '#71717A', marginTop: 6, textAlign: 'center' },
});
