/**
 * In-memory cache for posts. Shows cached posts immediately while fresh data loads.
 * Size is configurable (e.g. last 2 or more posts).
 */

export const DEFAULT_CACHE_SIZE = 2;

let cacheSize = DEFAULT_CACHE_SIZE;
let cachedPosts: unknown[] = [];

export type PostLike = { id: string | number };

export function setPostCacheSize(size: number): void {
  cacheSize = Math.max(0, size);
}

export function getPostCacheSize(): number {
  return cacheSize;
}

/**
 * Returns a copy of cached posts (up to cacheSize). Empty if none.
 */
export function getCachedPosts<T extends PostLike>(): T[] {
  const slice = cachedPosts.slice(0, cacheSize) as T[];
  return slice;
}

/**
 * Stores posts in cache. Keeps only the first cacheSize posts from the given list.
 */
export function setCachedPosts<T extends PostLike>(posts: T[]): void {
  cachedPosts = posts.slice(0, cacheSize);
}

export function clearPostCache(): void {
  cachedPosts = [];
}
