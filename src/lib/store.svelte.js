import { cards } from "./cards.js";

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

async function fetchReading(question, selectedCards, deep) {
	const response = await fetch("/api/reading", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			question,
			cards: selectedCards,
			deep,
		}),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error || "Failed to generate reading");
	}

	return data.reading;
}

async function persistReadingForShare(question, selectedCards, reading) {
	try {
		const response = await fetch("/api/readings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				question,
				cards: selectedCards.map((c) => ({
					name: c.name,
					position: c.position,
					image: c.image,
				})),
				reading,
			}),
		});

		const data = await response.json();
		if (!response.ok) {
			console.error("Failed to save reading for share:", data.error);
			return "";
		}

		return data.id || "";
	} catch (error) {
		console.error("Failed to save reading for share:", error);
		return "";
	}
}

export class TarotGame {
	question = $state("");
	shuffledDeck = $state([]);
	selectedCards = $state([]);
	gameStage = $state("question"); // 'question' | 'shuffle' | 'selection' | 'reading'
	reading = $state("");
	shareId = $state("");
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
			this.reading = await fetchReading(
				this.question,
				this.selectedCards,
				false,
			);

			this.shareId = await persistReadingForShare(
				this.question,
				this.selectedCards,
				this.reading,
			);

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
				shareId: this.shareId,
			};
			saveToHistory(historyEntry);
			this.history = loadHistory();
		} catch (error) {
			console.error("Error getting reading:", error);
			this.shareId = "";
			this.reading =
				error instanceof Error
					? `Unable to generate reading: ${error.message}`
					: "Unable to generate reading. Please try again.";
		} finally {
			this.isLoadingReading = false;
		}
	}

	async getDeepReading() {
		this.isLoadingReading = true;
		try {
			this.reading = await fetchReading(
				this.question,
				this.selectedCards,
				true,
			);

			this.shareId = await persistReadingForShare(
				this.question,
				this.selectedCards,
				this.reading,
			);

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
				shareId: this.shareId,
			};
			saveToHistory(historyEntry);
			this.history = loadHistory();
		} catch (error) {
			console.error("Error getting deep reading:", error);
			this.shareId = "";
			this.reading =
				error instanceof Error
					? `Unable to generate deep reading: ${error.message}`
					: "Unable to generate deep reading. Please try again.";
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

	async sendCurrentReadingEmail() {
		if (!this.email?.trim() || !this.reading) {
			return false;
		}

		return this.sendReadingEmail({
			question: this.question,
			cards: this.selectedCards.map((c) => ({
				name: c.name,
				position: c.position,
				image: c.image,
			})),
			reading: this.reading,
			isDeepReading: false,
		});
	}

	reset() {
		this.question = "";
		this.shuffledDeck = [];
		this.selectedCards = [];
		this.gameStage = "question";
		this.reading = "";
		this.shareId = "";
		this.isLoadingReading = false;
		this.email = "";
		this.sendEmail = false;
	}
}

export const game = new TarotGame();
