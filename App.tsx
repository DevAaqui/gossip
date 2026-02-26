import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
  SafeAreaView,
  ListRenderItem,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { GOSSIP_NEWS } from './data/gossipNews';
import type { GossipItem } from './data/gossipNews';
import GossipCard from './components/GossipCard';
import type { ReactionType } from './components/GossipCard';
import { getPosts, reactToPost } from './services/gossipApi';
import type { ApiPost } from './services/gossipApi';
import {
  getCachedPosts,
  setCachedPosts,
  setPostCacheSize,
} from './utils/postCache';

const HEADER_HEIGHT = 88;

/** How many posts to keep in cache and show immediately while API loads. */
const CACHE_POSTS_SIZE = 5;
/** Posts per page for infinite scroll. */
const PAGE_SIZE = 10;

// Apply configurable cache size once at load
setPostCacheSize(CACHE_POSTS_SIZE);

type PostWithCounts = GossipItem & { thumbs_up_count?: number; thumbs_down_count?: number; heart_count?: number };

interface ReactionState {
  like: number;
  dislike: number;
  support: number;
  active: ReactionType | null;
}

type ReactionsMap = Record<string, ReactionState>;

function reactionStateFromPost(p: PostWithCounts): ReactionState {
  return {
    like: p.thumbs_up_count ?? 0,
    dislike: p.thumbs_down_count ?? 0,
    support: p.heart_count ?? 0,
    active: null,
  };
}

function mergePostFromApi(p: ApiPost): PostWithCounts {
  const id = typeof p.id === 'number' ? String(p.id) : p.id;
  return {
    ...p,
    id,
    imageUri: p.imageUri ?? p.media_url,
    thumbs_up_count: p.thumbs_up_count ?? 0,
    thumbs_down_count: p.thumbs_down_count ?? 0,
    heart_count: p.heart_count ?? 0,
  };
}

export default function App() {
  const { height } = useWindowDimensions();
  const listItemHeight = height - HEADER_HEIGHT;
  const [reactions, setReactions] = useState<ReactionsMap>({});
  const [posts, setPosts] = useState<PostWithCounts[]>(() =>
    getCachedPosts<PostWithCounts>() as PostWithCounts[]
  );
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);

  const syncReactionsFromPosts = useCallback((newPosts: PostWithCounts[]) => {
    setReactions((prev) => {
      const next = { ...prev };
      newPosts.forEach((p) => {
        next[p.id] = reactionStateFromPost(p);
      });
      return next;
    });
  }, []);

  const loadPosts = useCallback(
    async (append = false) => {
      if (append) {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
      } else {
        setError(null);
        setLoading(true);
        pageRef.current = 1;
      }

      const page = pageRef.current;
      try {
        const { posts: data, hasMore: more } = await getPosts({
          page,
          limit: PAGE_SIZE,
        });

        if (append) {
          setPosts((prev) => {
            const ids = new Set(prev.map((p) => p.id));
            const added = data.filter((p) => !ids.has(p.id));
            return prev.concat(added);
          });
          if (data.length === 0) setHasMore(false);
          setLoadingMore(false);
        } else {
          setPosts(data);
          setCachedPosts(data);
          setLoading(false);
        }
        setHasMore(more);
        if (data.length > 0) {
          syncReactionsFromPosts(data);
        }
      } catch (e) {
        if (append) {
          setLoadingMore(false);
        } else {
          setError(e instanceof Error ? e.message : 'Failed to load posts');
          setLoading(false);
          if (posts.length === 0) setPosts(GOSSIP_NEWS);
        }
      }
    },
    [loadingMore, hasMore, syncReactionsFromPosts, posts.length]
  );

  const loadMore = useCallback(() => {
    pageRef.current += 1;
    loadPosts(true);
  }, [loadPosts]);

  useEffect(() => {
    loadPosts(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- initial load only

  const handleReaction = useCallback(async (id: string, type: ReactionType) => {
    const post = posts.find((p) => p.id === id);
    const prevReactions = reactions[id];
    const prevLike = post?.thumbs_up_count ?? prevReactions?.like ?? 0;
    const prevDown = post?.thumbs_down_count ?? prevReactions?.dislike ?? 0;
    const prevHeart = post?.heart_count ?? prevReactions?.support ?? 0;

    try {
      const res = await reactToPost(id, type);
      if (!res.success || !res.post) return;

      const updated = mergePostFromApi(res.post);
      const up = updated.thumbs_up_count ?? 0;
      const down = updated.thumbs_down_count ?? 0;
      const heart = updated.heart_count ?? 0;

      setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));

      let active: ReactionType | null = null;
      if (type === 'like' && up > prevLike) active = 'like';
      else if (type === 'dislike' && down > prevDown) active = 'dislike';
      else if (type === 'support' && heart > prevHeart) active = 'support';

      setReactions((prev) => ({
        ...prev,
        [id]: { like: up, dislike: down, support: heart, active },
      }));
    } catch {
      // Optimistic fallback: update UI locally if API fails
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
    }
  }, [posts, reactions]);

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
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vāk</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? 'Loading…' : 'Scroll up for next'}
          </Text>
          {error ? (
            <TouchableOpacity style={styles.retryBtn} onPress={() => loadPosts(false)}>
              <Text style={styles.retryText}>{error} — Tap to retry</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {loading && posts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C5A36A" />
            <Text style={styles.loadingText}>Loading posts…</Text>
          </View>
        ) : (
          <FlatList
            data={posts}
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
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#C5A36A" />
                  <Text style={styles.footerLoaderText}>Loading more…</Text>
                </View>
              ) : null
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 163, 106, 0.2)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f0efe7',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#a09f95',
    marginTop: 2,
  },
  retryBtn: {
    marginTop: 6,
    paddingVertical: 4,
  },
  retryText: {
    fontSize: 12,
    color: '#C5A36A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#a09f95',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  footerLoaderText: {
    fontSize: 14,
    color: '#a09f95',
  },
});
