import { createChatCompletion, getLlmConfig } from "$lib/llm.js";
import { buildReadingMessages } from "$lib/prompts.js";
import { env } from "$env/dynamic/private";
import { json } from "@sveltejs/kit";

export const prerender = false;

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { question, cards, deep = false } = await request.json();

		if (!question || !Array.isArray(cards) || cards.length === 0) {
			return json({ error: "Missing question or cards" }, { status: 400 });
		}

		const config = getLlmConfig(env);
		const messages = buildReadingMessages({ question, cards, deep });

		const reading = await createChatCompletion(config, {
			messages,
			temperature: deep ? 0.85 : 0.8,
			max_tokens: deep ? 2500 : 1000,
		});

		return json({ reading });
	} catch (error) {
		console.error("Error generating reading:", error);
		const message =
			error instanceof Error ? error.message : "Failed to generate reading";
		return json({ error: message }, { status: 500 });
	}
}
