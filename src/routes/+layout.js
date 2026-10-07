import * as env from "$env/static/public";

// Preview builds aren't prerendered: they're a single 404.html fallback page (see svelte.config.js)
export const prerender = env?.PUBLIC_APP_ENV !== "preview";
export const trailingSlash = "always";
