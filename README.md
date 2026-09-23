# K-kiron — Research terminal

Personal research and open-source homepage for Wenhao XU, an AI/ML PhD student at Université de Montréal and Mila.

**Live site:** https://k-kiron.github.io/

Explore research interests and open-source skills through a small interactive terminal. Exact commands run locally. When an assistant endpoint is configured, other input goes to a Cloudflare Workers AI guide with short conversational context and curated public references. Suggested circuit actions require a click.

The circuit illustrates the difference between rule-driven and shortcut-driven decisions; it is not a trained model or a research result. The guide does not speak for Wenhao, has no access to private notes or live repository contents, and can make mistakes.

## Development

The frontend uses plain HTML, CSS, and JavaScript, with no build step or external runtime dependencies. Use Node.js 22 or newer for the Worker tools and tests.

```sh
python -m http.server 8000
```

Open http://localhost:8000. An empty `assistant-endpoint` meta tag keeps AI disconnected; commands still work.

```sh
npm ci
npm test
npm run check
node tests/preview-server.js
```

The loopback preview at http://127.0.0.1:8773 uses clearly labeled, fixed test responses. It never calls a model. Ask `slow`, `quota`, `offline`, or `xss` to exercise cancellation, limits, failure, and text rendering. Other questions echo the number of context messages and offer a circuit action. Tests cover input rejection, model failures, source/action allowlists, quota rollover, and concurrent requests against a real local SQLite Durable Object. `npm run check` checks syntax and performs a Worker dry-run build without deployment.

## Connect the free AI backend

1. Use a Cloudflare **Workers Free** account. Confirm its plan before deployment; do not upgrade to Paid or enable paid inference. The site does not purchase services or change billing.
2. Run `npx wrangler login` and complete Cloudflare's authorization in the browser. Credentials stay in Wrangler's local configuration, never in this repository or the frontend.
3. Run `npm run worker:deploy`. Wrangler creates `k-kiron-profile-assistant`, its Workers AI binding, and one SQLite Durable Object namespace. Use the actual `workers.dev` URL printed by deployment.
4. Verify `/health`, then POST to `/chat` with `Origin: https://k-kiron.github.io`, `Content-Type: application/json`, and a body such as `{"question":"What does Wenhao study?","history":[],"circuit":{"path":"rule","removed":false}}`. Check identity, English/Chinese follow-ups, unknown biographical details, out-of-scope questions, and circuit suggestions against the real model before publishing.
5. Set the `assistant-endpoint` meta tag in `index.html` to that URL plus `/chat`. Verify desktop/mobile behavior, then publish the frontend. Bump the asset query versions in HTML and module imports when changing cached assets.

The configured model is `@cf/meta/llama-3.3-70b-instruct-fp8-fast`. Cloudflare's Free plan currently includes 10,000 neurons per day across the account; exceeding the free allowance causes requests to fail. This is not a guarantee of a fixed number of conversations. Check [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) when deploying. An account already on Paid can incur usage charges; the application request cap is not a billing-plan switch.

The application reserves a quota slot **before** each model call: at most 50 attempts per UTC day globally, 12 per network per day, and 3 per network per rolling minute. Failed or cancelled calls still count. There is one attempt per request with no retries. The shared counter is a single Durable Object, so concurrent requests cannot overrun the application cap. CORS restricts browser access to this homepage; it is not authentication. Network changes can bypass a per-network limit, but not the global cap. Shared networks share an allowance.

## Data and maintenance

- `profile-data.js` contains only curated public facts, source links, and the allowed illustrative circuit actions. Keep claims concise and check them before changing them. Prompt instructions reduce unsupported claims but cannot guarantee factuality.
- Answers render as text. Links and action behavior come from local allowlists, never model-supplied URLs or executable code. There are no shell, repository mutation, messaging, or browsing tools.
- Chat context consists of at most two exchanges, capped at 4,800 characters, in tab memory. New chat, `clear`, and reload discard it. The backend does not store prompts or responses and has no application request logging. Questions and context are processed by Cloudflare; see its [data usage documentation](https://developers.cloudflare.com/workers-ai/platform/data-usage/).
- Quota storage contains counts and IP hashes with a random daily salt, not raw IP addresses. An alarm deletes expired counters; rollover also starts a fresh daily budget. No chat text is stored in the Durable Object.
- To disable AI, empty the endpoint meta tag and publish. Commands and the circuit remain available. Keep dependencies and the model choice reviewed as Cloudflare's platform changes.

## Deployment

GitHub Pages publishes the root of `main`. The `.nojekyll` file keeps the static assets unchanged. Push changes to `main` and confirm the Pages deployment succeeds before updating links to new content.
