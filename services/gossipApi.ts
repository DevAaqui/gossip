/**
 * Gossip API service — uses the generic API client to call the Gossip server.
 */

import { get, post, ApiError } from './api';
import type { GossipItem } from '../data/gossipNews';

export { ApiError };

/** Post shape returned by the API (includes reaction counts). */
export interface ApiPost extends GossipItem {
  thumbs_up_count?: number;
  thumbs_down_count?: number;
  heart_count?: number;
  media_url?: string;
  media_type?: string;
}

export interface HealthResponse {
  ok: boolean;
  service: string;
}

export interface ReactResponse {
  success: boolean;
  post: ApiPost;
}

/** Backend reaction type (POST body). */
export type BackendReaction = 'thumbs_up' | 'thumbs_down' | 'heart';

const REACTION_MAP: Record<'like' | 'dislike' | 'support', BackendReaction> = {
  like: 'thumbs_up',
  dislike: 'thumbs_down',
  support: 'heart',
};

/**
 * Check if the Gossip server is up.
 */
export async function healthCheck(): Promise<HealthResponse> {
  return get<HealthResponse>('/health');
}

/**
 * Normalize API post to GossipItem (id string, imageUri from media_url) with counts.
 */
function normalizePost(p: ApiPost): GossipItem & { thumbs_up_count: number; thumbs_down_count: number; heart_count: number } {
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

export type PostWithCounts = GossipItem & { thumbs_up_count: number; thumbs_down_count: number; heart_count: number };

export interface GetPostsOptions {
  page?: number;
  limit?: number;
}

export interface GetPostsResult {
  posts: PostWithCounts[];
  hasMore: boolean;
}

/**
 * Fetch posts from the API, with optional pagination.
 * Backend can accept ?page=1&limit=10. If not supported, entire list is returned and hasMore is false.
 */
export async function getPosts(options?: GetPostsOptions): Promise<GetPostsResult> {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 10;
  const query = `?page=${page}&limit=${limit}`;
  const data = await get<ApiPost[] | { posts?: ApiPost[] }>(`/api/posts${query}`);
  const list = Array.isArray(data) ? data : (data?.posts ?? []);
  const posts = list.map(normalizePost);
  const hasMore = posts.length >= limit;
  return { posts, hasMore };
}

/**
 * Submit a reaction to a post. Backend: POST /api/posts/:id/react, body: { reaction }.
 */
export async function reactToPost(
  postId: string,
  reaction: 'like' | 'dislike' | 'support'
): Promise<ReactResponse> {
  const backendReaction = REACTION_MAP[reaction];
  const res = await post<ReactResponse>(`/api/posts/${postId}/react`, { reaction: backendReaction });
  return res;
}
