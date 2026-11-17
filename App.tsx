import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Pressable, Text } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FavoritesProvider } from './src/FavoritesContext';
import { DetailsScreen } from './src/screens/DetailsScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { theme } from './src/theme';
import type { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <FavoritesProvider>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <StatusBar style="dark" />
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerStyle: { backgroundColor: '#F6F7FB' },
                headerTintColor: '#171717',
                headerTitleStyle: { fontWeight: '800' },
                contentStyle: { backgroundColor: '#F6F7FB' },
              }}
            >
              <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
              <Stack.Screen
                name="Details"
                component={DetailsScreen}
                options={({ navigation }) => ({
                  title: 'Detalhes',
                  headerBackVisible: false,
                  headerLeft: () => (
                    <Pressable
                      onPress={() => navigation.goBack()}
                      hitSlop={8}
                      style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Text style={{ color: '#171717', fontSize: 28, lineHeight: 32 }}>‹</Text>
                    </Pressable>
                  ),
                })}
              />
              <Stack.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={({ navigation }) => ({
                  title: 'Favoritos',
                  headerBackVisible: false,
                  headerLeft: () => (
                    <Pressable
                      onPress={() => navigation.goBack()}
                      hitSlop={8}
                      style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Text style={{ color: '#171717', fontSize: 28, lineHeight: 32 }}>‹</Text>
                    </Pressable>
                  ),
                })}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </FavoritesProvider>
  );
}
