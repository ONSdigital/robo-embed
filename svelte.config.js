/** @type {import('@sveltejs/kit').Config} */
import adapter from "@sveltejs/adapter-static";
import { base_preview, base_prod } from "./src/app.config.js";

const preview = process.env.PUBLIC_APP_ENV === "preview";
const production = process.env.NODE_ENV === "production";
// With no base path, use relative URLs so the build can be deployed to any path (see src/app.config.js).
// The chart embed codes use app_url, so they don't depend on this.
const base = (preview ? base_preview : production ? base_prod : "") || "";
const relative = !base;

const config = {
	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		adapter: adapter({
			// Options below are defaults
			pages: "build",
			assets: "build",
			strict: false
		}),
		prerender: {
			// Nothing links to /embed (it's only used by embed codes), so list it here
			entries: ["*", "/embed"],
			handleHttpError: "warn",
			handleMissingId: "warn"
		},
		paths: {
			base,
			relative
		}
	}
};

export default config;
