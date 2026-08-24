import axios from 'axios';

// WordPress (or whatever sits in front of it) occasionally answers a
// perfectly normal request with a 502/503/504 or drops the connection —
// especially under the concurrent load of a static build. Without a retry,
// one flaky request fails the entire deployment. Only GET requests are
// retried; mutations (POST/DELETE) are left alone since they aren't safely
// re-playable.
const RETRYABLE_STATUS = new Set([502, 503, 504]);
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

const client = axios.create({ timeout: 20000 });

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

client.interceptors.response.use(undefined, async (error) => {
  const { config } = error;
  const status = error.response?.status;
  const isNetworkError = !error.response;
  const isRetryableStatus = status !== undefined && RETRYABLE_STATUS.has(status);

  if (!config || config.method?.toLowerCase() !== 'get' || !(isNetworkError || isRetryableStatus)) {
    throw error;
  }

  config.__retryCount = (config.__retryCount || 0) + 1;
  if (config.__retryCount > MAX_RETRIES) {
    throw error;
  }

  await wait(BASE_DELAY_MS * 2 ** (config.__retryCount - 1));
  return client(config);
});

export default client;
