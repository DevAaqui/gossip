/**
 * Gossip API service — uses the generic API client to call the Gossip server.
 * Replace local GOSSIP_NEWS with gossipApi.getPosts() when the backend is ready.
 */

import { get, post, ApiError } from './api';
import type { GossipItem } from '../data/gossipNews';

export { ApiError };

export interface HealthResponse {
  ok: boolean;
  service: string;
}

/**
 * Check if the Gossip server is up.
 */
export async function healthCheck(): Promise<HealthResponse> {
  return get<HealthResponse>('/health');
}

/**
 * Fetch posts from the API. Map server shape to GossipItem if needed.
 */
export async function getPosts(): Promise<GossipItem[]> {
  const data = await get<GossipItem[] | { posts?: GossipItem[] }>('/api/posts');
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { posts?: GossipItem[] }).posts)) {
    return (data as { posts: GossipItem[] }).posts;
  }
  return [];
}

/**
 * Example: submit a reaction to a post (adjust path/body to match your server).
 */
export async function submitReaction(
  postId: string,
  reaction: 'like' | 'dislike' | 'support'
): Promise<unknown> {
  return post('/api/posts/:id/reactions'.replace(':id', postId), { reaction });
}
