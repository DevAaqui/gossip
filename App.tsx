import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
  SafeAreaView,
  ListRenderItem,
} from 'react-native';
import { GOSSIP_NEWS } from './data/gossipNews';
import type { GossipItem } from './data/gossipNews';
import GossipCard from './components/GossipCard';
import type { ReactionType } from './components/GossipCard';

const HEADER_HEIGHT = 88;

interface ReactionState {
  like: number;
  dislike: number;
  support: number;
  active: ReactionType | null;
}

type ReactionsMap = Record<string, ReactionState>;

export default function App() {
  const { height } = useWindowDimensions();
  const listItemHeight = height - HEADER_HEIGHT;
  const [reactions, setReactions] = useState<ReactionsMap>({});

  const handleReaction = useCallback((id: string, type: ReactionType) => {
    setReactions((prev) => {
      const current: ReactionState = prev[id] ?? {
        like: 0,
        dislike: 0,
        support: 0,
        active: null,
      };
      const wasActive = current.active === type;
      const next: ReactionState = { ...current };

      if (wasActive) {
        next[type] = Math.max(0, next[type] - 1);
        next.active = null;
      } else {
        if (current.active) {
          next[current.active] = Math.max(0, next[current.active] - 1);
        }
        next[type] = (next[type] ?? 0) + 1;
        next.active = type;
      }
      return { ...prev, [id]: next };
    });
  }, []);

  const renderItem: ListRenderItem<GossipItem> = useCallback(
    ({ item }) => (
      <View style={{ height: listItemHeight }}>
        <GossipCard
          item={item}
          reactions={reactions[item.id]}
          onReaction={handleReaction}
        />
      </View>
    ),
    [reactions, handleReaction, listItemHeight]
  );

  const keyExtractor = useCallback((item: GossipItem) => item.id, []);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: listItemHeight,
      offset: listItemHeight * index,
      index,
    }),
    [listItemHeight]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gossip</Text>
          <Text style={styles.headerSubtitle}>Scroll up for next</Text>
        </View>
        <FlatList
          data={GOSSIP_NEWS}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          pagingEnabled
          decelerationRate="fast"
          snapToInterval={listItemHeight}
          snapToAlignment="start"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          style={styles.list}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f0f0f5',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#808090',
    marginTop: 2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
});
