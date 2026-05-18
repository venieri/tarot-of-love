// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
import adapterStatic from "@sveltejs/adapter-static";
import adapterVercel from "@sveltejs/adapter-vercel";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter:
			process.env.VERCEL === "1"
				? adapterVercel({ runtime: "nodejs22.x" })
				: adapterStatic({
						// Allow API routes that won't be prerendered (for Vercel serverless functions)
						strict: false,
					}),
	},
};

export default config;
