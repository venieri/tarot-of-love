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

/** Models that use Zen /responses or /messages, not /chat/completions */
const ZEN_NON_CHAT_MODEL_PREFIXES = ["gpt-", "claude-", "gemini-"];

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

	if (
		provider === "zen" &&
		ZEN_NON_CHAT_MODEL_PREFIXES.some((prefix) => model.startsWith(prefix))
	) {
		throw new Error(
			`Model "${model}" is not available on Zen chat/completions. ` +
				`Use a chat model (e.g. minimax-m2.5-free, kimi-k2.5, qwen3.5-plus) or set LLM_PROVIDER=openai.`,
		);
	}

	return { apiKey, baseUrl, model, provider };
}

/**
 * @param {unknown} message
 */
export function extractMessageContent(message) {
	if (!message || typeof message !== "object") {
		return null;
	}

	const { content, reasoning_content, refusal } = /** @type {Record<string, unknown>} */ (
		message
	);

	if (typeof refusal === "string" && refusal.trim()) {
		throw new Error(`LLM refused the request: ${refusal}`);
	}

	if (typeof content === "string" && content.trim()) {
		return content;
	}

	if (Array.isArray(content)) {
		const text = content
			.filter(
				(part) =>
					part &&
					typeof part === "object" &&
					/** @type {{ type?: string, text?: string }} */ (part).type === "text" &&
					typeof /** @type {{ text?: string }} */ (part).text === "string",
			)
			.map((part) => /** @type {{ text: string }} */ (part).text)
			.join("");

		if (text.trim()) {
			return text;
		}
	}

	// MiniMax and similar models on Zen may return text here when content is empty
	if (typeof reasoning_content === "string" && reasoning_content.trim()) {
		return reasoning_content;
	}

	return null;
}

/**
 * @param {unknown} data
 */
export function parseChatCompletionResponse(data) {
	if (!data || typeof data !== "object") {
		throw new Error("LLM returned an invalid response");
	}

	const payload = /** @type {Record<string, unknown>} */ (data);

	if (payload.error) {
		const err = /** @type {{ message?: string }} */ (payload.error);
		throw new Error(err.message || "LLM API error");
	}

	const choice = /** @type {Array<Record<string, unknown>> | undefined} */ (
		payload.choices
	)?.[0];

	if (!choice) {
		throw new Error(
			`Unexpected LLM response shape (missing choices). Keys: ${Object.keys(payload).join(", ")}`,
		);
	}

	let content = extractMessageContent(choice.message);

	if (!content && typeof choice.text === "string" && choice.text.trim()) {
		content = choice.text;
	}

	if (!content) {
		const finishReason =
			typeof choice.finish_reason === "string"
				? choice.finish_reason
				: "unknown";
		throw new Error(`Empty LLM response (finish_reason: ${finishReason})`);
	}

	return content;
}

/**
 * @param {{ apiKey: string, baseUrl: string, model: string, provider: string }} config
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

	const raw = await response.text();
	let data;

	try {
		data = JSON.parse(raw);
	} catch {
		throw new Error(
			`LLM returned non-JSON (${response.status}): ${raw.slice(0, 200)}`,
		);
	}

	if (!response.ok) {
		const err = data?.error;
		const message =
			typeof err === "object" && err && "message" in err
				? String(err.message)
				: `LLM request failed (${response.status})`;
		throw new Error(message);
	}

	return parseChatCompletionResponse(data);
}
