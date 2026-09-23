# K-kiron — Research terminal

Personal research and open-source homepage for Wenhao XU, an AI/ML PhD student at Université de Montréal and Mila.

**Live site:** https://k-kiron.github.io/

Explore research interests and open-source skills through a small interactive terminal. The circuit illustrates the difference between rule-driven and shortcut-driven decisions; it is not a trained model or a research result.

## Development

The site uses plain HTML, CSS, and JavaScript, with no build step or external runtime dependencies.

```sh
python -m http.server 8000
```

Open http://localhost:8000. Check JavaScript syntax with `node --check app.js`.

## Deployment

GitHub Pages publishes the root of `main`. The `.nojekyll` file keeps the static assets unchanged. Push changes to `main` and confirm the Pages deployment succeeds before updating links to new content.
