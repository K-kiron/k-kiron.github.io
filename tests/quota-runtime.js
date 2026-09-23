// Exercise the production quota class in the local Workers runtime.
export { DailyQuota } from '../worker/index.js';
export default {
  fetch(request, env) {
    return env.QUOTA.get(env.QUOTA.idFromName(new URL(request.url).pathname)).fetch(request);
  },
};
