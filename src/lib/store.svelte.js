import { cards } from "./cards.js";

// Get API key from environment variable
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export class TarotGame {
	question = $state("");
	shuffledDeck = $state([]);
	selectedCards = $state([]);
	gameStage = $state("question"); // 'question' | 'shuffle' | 'selection' | 'reading'
	reading = $state("");
	isLoadingReading = $state(false);

	shuffleDeck() {
		const shuffled = [...cards]
			.map((card) => ({ ...card, sortOrder: Math.random() }))
			.sort((a, b) => a.sortOrder - b.sortOrder);
		this.shuffledDeck = shuffled;
		this.gameStage = "shuffle";
	}

	selectCard(card, position) {
		if (this.selectedCards.length < 5) {
			this.selectedCards = [...this.selectedCards, { ...card, position }];
			if (this.selectedCards.length === 5) {
				this.gameStage = "reading";
			}
		}
	}

	setQuestion(q) {
		this.question = q;
	}

	startSelection() {
		this.gameStage = "selection";
	}

	async getReading() {
		this.isLoadingReading = true;
		try {
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
								content: `Question: "${this.question}"

Cross Spread Reading:
${this.selectedCards
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
				},
			);

			const data = await response.json();
			this.reading = data.choices[0].message.content;
		} catch (error) {
			console.error("Error getting reading:", error);
			this.reading = "Unable to generate reading. Please try again.";
		} finally {
			this.isLoadingReading = false;
		}
	}

	reset() {
		this.question = "";
		this.shuffledDeck = [];
		this.selectedCards = [];
		this.gameStage = "question";
		this.reading = "";
		this.isLoadingReading = false;
	}
}

export const game = new TarotGame();
