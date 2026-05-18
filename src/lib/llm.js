const PROVIDERS = {
	openai: {
		baseUrl: "https://api.openai.com/v1",
		defaultModel: "gpt-4",
	},
	zen: {
		baseUrl: "https://opencode.ai/zen/v1",
		defaultModel: "minimax-m2.5-free",
	},
};

/**
 * @param {Record<string, string | undefined>} env
 */
export function getLlmConfig(env) {
	const provider = (env.LLM_PROVIDER || "openai").toLowerCase();
	const preset = PROVIDERS[provider];

	if (!preset) {
		throw new Error(
			`Unknown LLM_PROVIDER "${provider}". Use "openai" or "zen".`,
		);
	}

	const apiKey =
		env.LLM_API_KEY ||
		env.OPENAI_API_KEY ||
		env.VITE_OPENAI_API_KEY ||
		"";

	if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
		throw new Error(
			"LLM API key not configured. Set LLM_API_KEY in your .env file.",
		);
	}

	const baseUrl = (env.LLM_BASE_URL || preset.baseUrl).replace(/\/$/, "");
	const model = env.LLM_MODEL || preset.defaultModel;

	return { apiKey, baseUrl, model, provider };
}

/**
 * @param {{ apiKey: string, baseUrl: string, model: string }} config
 * @param {{ messages: Array<{ role: string, content: string }>, temperature: number, max_tokens: number }} body
 */
export async function createChatCompletion(config, body) {
	const response = await fetch(`${config.baseUrl}/chat/completions`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${config.apiKey}`,
		},
		body: JSON.stringify({
			model: config.model,
			...body,
		}),
	});

	const data = await response.json();

	if (data.error) {
		throw new Error(data.error.message || "LLM API error");
	}

	const content = data.choices?.[0]?.message?.content;
	if (!content) {
		throw new Error("Unexpected response from LLM");
	}

	return content;
}
