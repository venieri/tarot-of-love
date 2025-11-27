import { beforeAll, describe, expect, it } from "vitest";
import { cards } from "../lib/cards.js";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

describe("OpenAI API Integration", () => {
	beforeAll(() => {
		if (!OPENAI_API_KEY || OPENAI_API_KEY === "YOUR_API_KEY_HERE") {
			throw new Error(
				"OpenAI API key not configured. Please set it in src/lib/config.js",
			);
		}
	});

	it("should successfully call OpenAI API and get a tarot reading", async () => {
		// Prepare test data
		const testQuestion = "What does the future hold for my creative endeavors?";
		const testCards = [
			{ ...cards[0], position: "Past" },
			{ ...cards[5], position: "Present" },
			{ ...cards[10], position: "Future" },
			{ ...cards[15], position: "Root Cause" },
			{ ...cards[20], position: "Potential" },
		];

		// Make actual API call
		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${OPENAI_API_KEY}`,
			},
			body: JSON.stringify({
				model: "gpt-4",
				messages: [
					{
						role: "system",
						content: `You are Lydia Venieri, artist and creator of this mystical Tarot of Love deck. Your voice is poetic, philosophical, and deeply symbolic. You speak with the wisdom of ancient myths, the insights of depth psychology, and the mystery of the cosmos.

When you interpret a tarot spread:
- Weave mythological archetypes with psychological insights
- Use poetic, evocative language that honors the mystery
- Explore the hidden currents beneath surface events
- Connect the personal journey to universal patterns
- Speak of transformation, shadow work, and the soul's evolution
- Reference themes of isolation and connection, power and surrender, time and eternity
- Be contemplative, profound, and compassionate
- Remember: the cards reveal what already exists in the depths

Center yourself on the question. Look at the cards in sequence (Past → Present → Future → Root → Potential). Tell a cohesive story that connects all the cards through mythological and psychological lenses. Look for connections between opposing cards (Past & Potential, Present & Root). The cards offer insight into the soul's journey, not definitive answers.`,
					},
					{
						role: "user",
						content: `Question: "${testQuestion}"

Cross Spread Reading:
${testCards
	.map(
		(card, i) => `
Card ${i + 1} - ${card.position}:
${card.name}
"${card.byeline}"
${card.description}
Reverse meaning: ${card.reverse}
`,
	)
	.join("\n")}

Please provide a comprehensive tarot reading that weaves these cards together into a meaningful narrative addressing the question.`,
					},
				],
				temperature: 0.8,
				max_tokens: 1000,
			}),
		});

		// Validate response
		expect(response.ok).toBe(true);
		expect(response.status).toBe(200);

		const data = await response.json();

		// Validate response structure
		expect(data).toHaveProperty("choices");
		expect(Array.isArray(data.choices)).toBe(true);
		expect(data.choices.length).toBeGreaterThan(0);
		expect(data.choices[0]).toHaveProperty("message");
		expect(data.choices[0].message).toHaveProperty("content");

		const reading = data.choices[0].message.content;

		// Validate reading content
		expect(typeof reading).toBe("string");
		expect(reading.length).toBeGreaterThan(100); // Meaningful reading should be substantial

		// Log the reading for manual verification
		console.log("\n=== GENERATED TAROT READING ===");
		console.log(`Question: ${testQuestion}`);
		console.log("\nCards:");
		testCards.forEach((card) => {
			console.log(`- ${card.position}: ${card.name}`);
		});
		console.log("\nReading:");
		console.log(reading);
		console.log("=================================\n");
	}, 30000); // 30 second timeout for API call

	it("should validate response contains Lydia Venieri voice characteristics", async () => {
		const testQuestion = "Will I overcome my current challenges?";
		const testCards = [
			{ ...cards[6], position: "Past" }, // The Black Heart
			{ ...cards[11], position: "Present" }, // The Queen of Spades
			{ ...cards[16], position: "Future" }, // Lucidity
			{ ...cards[3], position: "Root Cause" }, // The Clock
			{ ...cards[19], position: "Potential" }, // The Deer Goddess
		];

		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${OPENAI_API_KEY}`,
			},
			body: JSON.stringify({
				model: "gpt-4",
				messages: [
					{
						role: "system",
						content: `You are Lydia Venieri, artist and creator of this mystical Tarot of Love deck. Your voice is poetic, philosophical, and deeply symbolic. You speak with the wisdom of ancient myths, the insights of depth psychology, and the mystery of the cosmos.

When you interpret a tarot spread:
- Weave mythological archetypes with psychological insights
- Use poetic, evocative language that honors the mystery
- Explore the hidden currents beneath surface events
- Connect the personal journey to universal patterns
- Speak of transformation, shadow work, and the soul's evolution
- Reference themes of isolation and connection, power and surrender, time and eternity
- Be contemplative, profound, and compassionate
- Remember: the cards reveal what already exists in the depths

Center yourself on the question. Look at the cards in sequence (Past → Present → Future → Root → Potential). Tell a cohesive story that connects all the cards through mythological and psychological lenses. Look for connections between opposing cards (Past & Potential, Present & Root). The cards offer insight into the soul's journey, not definitive answers.`,
					},
					{
						role: "user",
						content: `Question: "${testQuestion}"

Cross Spread Reading:
${testCards
	.map(
		(card, i) => `
Card ${i + 1} - ${card.position}:
${card.name}
"${card.byeline}"
${card.description}
Reverse meaning: ${card.reverse}
`,
	)
	.join("\n")}

Please provide a comprehensive tarot reading that weaves these cards together into a meaningful narrative addressing the question.`,
					},
				],
				temperature: 0.8,
				max_tokens: 1000,
			}),
		});

		const data = await response.json();
		const reading = data.choices[0].message.content.toLowerCase();

		// Check for characteristic themes (at least some should be present)
		const themes = [
			"soul",
			"journey",
			"transformation",
			"shadow",
			"wisdom",
			"mystery",
			"cosmic",
			"archetype",
			"depth",
			"evolve",
			"mythological",
		];

		const foundThemes = themes.filter((theme) => reading.includes(theme));

		console.log("\n=== VOICE CHARACTERISTICS CHECK ===");
		console.log("Found themes:", foundThemes);
		console.log("====================================\n");

		// At least 2-3 characteristic themes should be present
		expect(foundThemes.length).toBeGreaterThanOrEqual(2);
	}, 30000);

	it("should handle all 5 card positions correctly", async () => {
		const testQuestion = "What is my path forward?";

		// Use one card from each position to verify position handling
		const testCards = [
			{ ...cards[0], position: "Past" },
			{ ...cards[1], position: "Present" },
			{ ...cards[2], position: "Future" },
			{ ...cards[3], position: "Root Cause" },
			{ ...cards[4], position: "Potential" },
		];

		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${OPENAI_API_KEY}`,
			},
			body: JSON.stringify({
				model: "gpt-4",
				messages: [
					{
						role: "system",
						content: `You are Lydia Venieri, artist and creator of this mystical Tarot of Love deck. Your voice is poetic, philosophical, and deeply symbolic.`,
					},
					{
						role: "user",
						content: `Question: "${testQuestion}"

Cross Spread Reading:
${testCards
	.map(
		(card, i) => `
Card ${i + 1} - ${card.position}:
${card.name}
"${card.byeline}"
${card.description}
`,
	)
	.join("\n")}

Please provide a comprehensive tarot reading.`,
					},
				],
				temperature: 0.7,
				max_tokens: 800,
			}),
		});

		expect(response.ok).toBe(true);
		const data = await response.json();
		const reading = data.choices[0].message.content.toLowerCase();

		// Verify the reading addresses different temporal aspects
		const temporalReferences = [
			reading.includes("past") ||
				reading.includes("was") ||
				reading.includes("before"),
			reading.includes("present") ||
				reading.includes("now") ||
				reading.includes("current"),
			reading.includes("future") ||
				reading.includes("will") ||
				reading.includes("ahead"),
		];

		const hasTemporalFlow = temporalReferences.filter(Boolean).length >= 2;

		console.log("\n=== POSITION HANDLING CHECK ===");
		console.log("Temporal flow present:", hasTemporalFlow);
		console.log("===============================\n");

		expect(hasTemporalFlow).toBe(true);
	}, 30000);

	it("should maintain consistent quality across multiple requests", async () => {
		const testQuestion = "How should I approach new opportunities?";
		const testCards = [
			{ ...cards[7], position: "Past" },
			{ ...cards[12], position: "Present" },
			{ ...cards[17], position: "Future" },
			{ ...cards[4], position: "Root Cause" },
			{ ...cards[22], position: "Potential" },
		];

		const readings = [];

		// Make 2 requests with same data to check consistency
		for (let i = 0; i < 2; i++) {
			const response = await fetch(
				"https://api.openai.com/v1/chat/completions",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${OPENAI_API_KEY}`,
					},
					body: JSON.stringify({
						model: "gpt-4",
						messages: [
							{
								role: "system",
								content: `You are Lydia Venieri, artist and creator of this mystical Tarot of Love deck.`,
							},
							{
								role: "user",
								content: `Question: "${testQuestion}"

Cross Spread Reading:
${testCards
	.map(
		(card, idx) => `
Card ${idx + 1} - ${card.position}:
${card.name}
"${card.byeline}"
${card.description}
`,
	)
	.join("\n")}

Please provide a comprehensive tarot reading.`,
							},
						],
						temperature: 0.8,
						max_tokens: 600,
					}),
				},
			);

			const data = await response.json();
			readings.push(data.choices[0].message.content);
		}

		// Both should be successful and substantial
		readings.forEach((reading) => {
			expect(typeof reading).toBe("string");
			expect(reading.length).toBeGreaterThan(100);
		});

		// Readings should be different (due to temperature > 0) but similar in quality
		expect(readings[0]).not.toBe(readings[1]);

		console.log("\n=== CONSISTENCY CHECK ===");
		console.log("Reading 1 length:", readings[0].length);
		console.log("Reading 2 length:", readings[1].length);
		console.log("=========================\n");
	}, 60000); // 60 seconds for 2 API calls
});
