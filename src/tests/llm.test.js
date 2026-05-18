import { describe, expect, it } from "vitest";
import { getLlmConfig } from "../lib/llm.js";

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
});
