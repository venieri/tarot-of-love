import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";
import { cards } from "../lib/cards.js";
import { createChatCompletion, getLlmConfig } from "../lib/llm.js";
import { buildReadingMessages } from "../lib/prompts.js";
import { nativeFetch } from "./setup.js";

const env = {
	LLM_PROVIDER: process.env.LLM_PROVIDER,
	LLM_API_KEY: process.env.LLM_API_KEY,
	LLM_MODEL: process.env.LLM_MODEL,
	LLM_BASE_URL: process.env.LLM_BASE_URL,
	OPENAI_API_KEY: process.env.OPENAI_API_KEY,
	VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY,
};

let config;

describe("LLM API Integration", () => {
	beforeAll(() => {
		vi.stubGlobal("fetch", nativeFetch);

		try {
			config = getLlmConfig(env);
		} catch {
			config = null;
		}

		if (!config) {
			throw new Error(
				"LLM API key not configured. Set LLM_API_KEY (and optionally LLM_PROVIDER) in .env",
			);
		}
	});

	afterAll(() => {
		global.fetch = vi.fn();
	});

	it("generates a tarot reading via configured provider", async () => {
		const testQuestion = "What does the future hold for my creative endeavors?";
		const testCards = [
			{ ...cards[0], position: "Past" },
			{ ...cards[5], position: "Present" },
			{ ...cards[10], position: "Future" },
			{ ...cards[15], position: "Root Cause" },
			{ ...cards[20], position: "Potential" },
		];

		const messages = buildReadingMessages({
			question: testQuestion,
			cards: testCards,
		});

		const reading = await createChatCompletion(config, {
			messages,
			temperature: 0.8,
			max_tokens: 1000,
		});

		expect(typeof reading).toBe("string");
		expect(reading.length).toBeGreaterThan(100);

		console.log(`\n=== ${config.provider.toUpperCase()} READING ===`);
		console.log(`Model: ${config.model}`);
		console.log(reading);
		console.log("================================\n");
	}, 30000);
});
