import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Chip, ProgressBar, Text } from 'react-native-paper';
import { useFavorites } from '../FavoritesContext';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

const formatName = (name: string) =>
  name.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export function DetailsScreen({ route }: Props) {
  const { pokemon } = route.params;
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(pokemon.id);
  const image = pokemon.sprites.other?.['official-artwork']?.front_default;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card} mode="elevated">
        <View style={styles.header}>
          <View>
            <Text variant="labelLarge" style={styles.number}>
              #{pokemon.id.toString().padStart(4, '0')}
            </Text>
            <Text variant="headlineMedium" style={styles.name}>
              {formatName(pokemon.name)}
            </Text>
          </View>
          <Pressable
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(pokemon)}
            hitSlop={8}
          >
            <Text style={[styles.heart, { color: favorite ? '#EF4444' : '#71717A' }]}>
              {favorite ? '♥' : '♡'}
            </Text>
          </Pressable>
        </View>

        {image && <Card.Cover source={{ uri: image }} style={styles.image} resizeMode="contain" />}

        <Card.Content>
          <View style={styles.types}>
            {pokemon.types.map(({ type }) => (
              <Chip key={type.name} compact>{formatName(type.name)}</Chip>
            ))}
          </View>

          <View style={styles.metrics}>
            <View style={styles.metric}>
              <Text variant="headlineSmall">{pokemon.height / 10} m</Text>
              <Text variant="bodySmall">Altura</Text>
            </View>
            <View style={styles.metric}>
              <Text variant="headlineSmall">{pokemon.weight / 10} kg</Text>
              <Text variant="bodySmall">Peso</Text>
            </View>
          </View>

          <Text variant="titleMedium" style={styles.statsTitle}>Status base</Text>
          {pokemon.stats.map(({ stat, base_stat }) => (
            <View key={stat.name} style={styles.stat}>
              <View style={styles.statLabel}>
                <Text>{formatName(stat.name)}</Text>
                <Text style={styles.statValue}>{base_stat}</Text>
              </View>
              <ProgressBar progress={Math.min(base_stat / 180, 1)} color="#EF4444" style={styles.progress} />
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  card: { maxWidth: 520, width: '100%', alignSelf: 'center', backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  number: { color: '#A1A1AA' },
  name: { fontWeight: '800' },
  favoriteButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  heart: { fontSize: 32, lineHeight: 36 },
  image: { width: '100%', height: 280, backgroundColor: 'transparent', marginVertical: 8 },
  types: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  metrics: { flexDirection: 'row', gap: 12, marginTop: 20 },
  metric: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F6F7FB',
    borderRadius: 16,
    paddingVertical: 14,
  },
  statsTitle: { marginTop: 24, marginBottom: 10, fontWeight: '800' },
  stat: { marginBottom: 10 },
  statLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  statValue: { fontWeight: '800' },
  progress: { height: 8, borderRadius: 4 },
});
