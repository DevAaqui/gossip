export {
  request,
  get,
  post,
  put,
  del,
  configureApi,
  getApiConfig,
  ApiError,
} from './api';
export type { ApiConfig, RequestOptions } from './api';

export { healthCheck, getPosts, reactToPost } from './gossipApi';
export type {
  HealthResponse,
  ReactResponse,
  ApiPost,
  GetPostsOptions,
  GetPostsResult,
  PostWithCounts,
} from './gossipApi';
