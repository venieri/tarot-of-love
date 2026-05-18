import { describe, expect, it } from "vitest";
import {
	extractMessageContent,
	getLlmConfig,
	parseChatCompletionResponse,
} from "../lib/llm.js";

describe("getLlmConfig", () => {
	it("defaults to OpenAI", () => {
		const config = getLlmConfig({ LLM_API_KEY: "sk-test" });
		expect(config.provider).toBe("openai");
		expect(config.baseUrl).toBe("https://api.openai.com/v1");
		expect(config.model).toBe("gpt-4");
	});

	it("configures Zen chat/completions", () => {
		const config = getLlmConfig({
			LLM_PROVIDER: "zen",
			LLM_API_KEY: "zen-test",
		});
		expect(config.provider).toBe("zen");
		expect(config.baseUrl).toBe("https://opencode.ai/zen/v1");
		expect(config.model).toBe("minimax-m2.5-free");
	});

	it("allows model and base URL overrides", () => {
		const config = getLlmConfig({
			LLM_PROVIDER: "zen",
			LLM_API_KEY: "zen-test",
			LLM_MODEL: "kimi-k2.5",
			LLM_BASE_URL: "https://opencode.ai/zen/v1/",
		});
		expect(config.model).toBe("kimi-k2.5");
		expect(config.baseUrl).toBe("https://opencode.ai/zen/v1");
	});

	it("throws when API key is missing", () => {
		expect(() => getLlmConfig({})).toThrow(/API key not configured/);
	});

	it("throws for unknown provider", () => {
		expect(() =>
			getLlmConfig({ LLM_PROVIDER: "ollama", LLM_API_KEY: "x" }),
		).toThrow(/Unknown LLM_PROVIDER/);
	});

	it("rejects GPT models on Zen chat/completions", () => {
		expect(() =>
			getLlmConfig({
				LLM_PROVIDER: "zen",
				LLM_API_KEY: "zen-test",
				LLM_MODEL: "gpt-4",
			}),
		).toThrow(/not available on Zen chat\/completions/);
	});
});

describe("parseChatCompletionResponse", () => {
	it("reads standard OpenAI-style content", () => {
		const text = parseChatCompletionResponse({
			choices: [{ message: { content: "Your reading here." } }],
		});
		expect(text).toBe("Your reading here.");
	});

	it("reads reasoning_content when content is empty", () => {
		const text = parseChatCompletionResponse({
			choices: [
				{
					message: {
						content: "",
						reasoning_content: "Oracle speaks through the cards.",
					},
					finish_reason: "stop",
				},
			],
		});
		expect(text).toBe("Oracle speaks through the cards.");
	});

	it("reads multipart content arrays", () => {
		const text = parseChatCompletionResponse({
			choices: [
				{
					message: {
						content: [{ type: "text", text: "Line one. " }, { type: "text", text: "Line two." }],
					},
				},
			],
		});
		expect(text).toBe("Line one. Line two.");
	});

	it("throws on API error payloads", () => {
		expect(() =>
			parseChatCompletionResponse({
				error: { message: "insufficient_quota" },
			}),
		).toThrow(/insufficient_quota/);
	});

	it("throws when choices are missing", () => {
		expect(() => parseChatCompletionResponse({ id: "resp_123" })).toThrow(
			/missing choices/,
		);
	});
});

describe("extractMessageContent", () => {
	it("throws on refusal", () => {
		expect(() =>
			extractMessageContent({ refusal: "content policy" }),
		).toThrow(/refused/);
	});
});
