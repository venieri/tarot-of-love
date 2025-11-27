import { cards } from "./cards.js";

// Get API key from environment variable
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Reading history storage
const HISTORY_KEY = "tarot-reading-history";

function loadHistory() {
	if (typeof window === "undefined") return [];
	try {
		const stored = localStorage.getItem(HISTORY_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch (error) {
		console.error("Error loading history:", error);
		return [];
	}
}

function saveToHistory(entry) {
	if (typeof window === "undefined") return;
	try {
		const history = loadHistory();
		history.unshift(entry); // Add to beginning
		// Keep only last 50 readings
		const trimmed = history.slice(0, 50);
		localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
	} catch (error) {
		console.error("Error saving to history:", error);
	}
}

export class TarotGame {
	question = $state("");
	shuffledDeck = $state([]);
	selectedCards = $state([]);
	gameStage = $state("question"); // 'question' | 'shuffle' | 'selection' | 'reading'
	reading = $state("");
	isLoadingReading = $state(false);
	email = $state("");
	sendEmail = $state(false);
	history = $state(loadHistory());

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

Structure your reading as follows:

1. ORACLE ABSTRACT (First paragraph):
   - Present the CONCLUSION upfront - the essential insight and outcome
   - Distill the entire reading into its core truth (2-3 sentences)
   - This is the oracle's answer - direct, profound, complete
   - End with a blank line

2. DETAILED READING (Remaining paragraphs):
   - Weave mythological archetypes with psychological insights
   - Use poetic, evocative language that honors the mystery
   - Explore the hidden currents beneath surface events
   - Connect the personal journey to universal patterns
   - Look at the cards in sequence (Past → Present → Future → Root → Potential)
   - Speak of transformation, shadow work, and the soul's evolution
   - Reference themes of isolation and connection, power and surrender, time and eternity
   - Be contemplative, profound, and compassionate

The cards reveal what already exists in the depths. Look for connections between opposing cards (Past & Potential, Present & Root). The cards offer insight into the soul's journey, not definitive answers.`,
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

Please provide the reading with the ORACLE ABSTRACT first (conclusion/essence), followed by the detailed interpretation.`,
							},
						],
						temperature: 0.8,
						max_tokens: 1000,
					}),
				},
			);

			const data = await response.json();
			this.reading = data.choices[0].message.content;

			// Save to history
			const historyEntry = {
				id: Date.now(),
				timestamp: new Date().toISOString(),
				question: this.question,
				cards: this.selectedCards.map((c) => ({
					name: c.name,
					position: c.position,
					image: c.image,
				})),
				reading: this.reading,
			};
			saveToHistory(historyEntry);
			this.history = loadHistory();

			// Send email if requested
			if (this.sendEmail && this.email) {
				await this.sendReadingEmail(historyEntry);
			}
		} catch (error) {
			console.error("Error getting reading:", error);
			this.reading = "Unable to generate reading. Please try again.";
		} finally {
			this.isLoadingReading = false;
		}
	}

	async getDeepReading() {
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

For this DEEP RESEARCH READING, provide an extensive, multi-layered interpretation:

1. ORACLE ABSTRACT (First paragraph):
   - Present the CONCLUSION upfront - the essential insight and outcome
   - Distill the entire reading into its core truth (2-3 sentences)
   - End with a blank line

2. COMPREHENSIVE ANALYSIS:
   - Examine each card's archetypal symbolism in depth
   - Explore mythological parallels (Greek, Egyptian, Celtic traditions)
   - Apply Jungian depth psychology (shadow, anima/animus, individuation)
   - Discuss alchemical transformations and symbolic death/rebirth
   - Analyze the elemental and planetary correspondences
   - Reveal the hidden dialogue between opposing positions
   - Connect to timeless philosophical questions
   - Offer contemplative practices or meditations
   - Suggest creative or ritual expressions of the reading's wisdom

3. SOUL'S JOURNEY:
   - Map the path from where the querent has been to where they're going
   - Identify the threshold moments and liminal spaces
   - Illuminate the gifts hidden within challenges
   - Speak to the eternal questions of love, meaning, and becoming

Be expansive, profound, and transformative. This is the deep dive into the mysteries.`,
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

Please provide the comprehensive deep research reading with the oracle abstract first, followed by the extensive multi-layered interpretation.`,
							},
						],
						temperature: 0.85,
						max_tokens: 2500,
					}),
				},
			);

			const data = await response.json();
			this.reading = data.choices[0].message.content;

			// Update history with deep reading
			const historyEntry = {
				id: Date.now(),
				timestamp: new Date().toISOString(),
				question: this.question,
				cards: this.selectedCards.map((c) => ({
					name: c.name,
					position: c.position,
					image: c.image,
				})),
				reading: this.reading,
				isDeepReading: true,
			};
			saveToHistory(historyEntry);
			this.history = loadHistory();

			// Send email if requested
			if (this.sendEmail && this.email) {
				await this.sendReadingEmail(historyEntry);
			}
		} catch (error) {
			console.error("Error getting deep reading:", error);
			this.reading = "Unable to generate deep reading. Please try again.";
		} finally {
			this.isLoadingReading = false;
		}
	}

	async sendReadingEmail(historyEntry) {
		try {
			const response = await fetch("/api/send-reading", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: this.email,
					question: historyEntry.question,
					cards: historyEntry.cards,
					reading: historyEntry.reading,
					isDeepReading: historyEntry.isDeepReading || false,
				}),
			});

			const result = await response.json();

			if (!response.ok) {
				console.error("Failed to send email:", result.error);
				throw new Error(result.error || "Failed to send email");
			}

			console.log("Email sent successfully:", result.messageId);
			return true;
		} catch (error) {
			console.error("Error sending email:", error);
			return false;
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
