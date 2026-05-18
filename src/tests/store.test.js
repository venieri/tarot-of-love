import { beforeEach, describe, expect, it, vi } from "vitest";
import { cards } from "../lib/cards.js";

const { TarotGame } = await import("../lib/store.svelte.js");

describe("TarotGame Store", () => {
	let game;

	beforeEach(() => {
		game = new TarotGame();
	});

	describe("Initial State", () => {
		it("should initialize with empty question", () => {
			expect(game.question).toBe("");
		});

		it("should initialize with question stage", () => {
			expect(game.gameStage).toBe("question");
		});

		it("should initialize with empty selected cards", () => {
			expect(game.selectedCards).toEqual([]);
		});

		it("should initialize with empty shuffled deck", () => {
			expect(game.shuffledDeck).toEqual([]);
		});
	});

	describe("Deck Shuffling", () => {
		it("should shuffle deck and change stage to shuffle", () => {
			game.shuffleDeck();

			expect(game.shuffledDeck.length).toBe(24);
			expect(game.gameStage).toBe("shuffle");
		});

		it("should contain all cards after shuffle", () => {
			game.shuffleDeck();

			const cardIds = game.shuffledDeck.map((c) => c.id).sort((a, b) => a - b);
			const originalIds = cards.map((c) => c.id).sort((a, b) => a - b);

			expect(cardIds).toEqual(originalIds);
		});

		it("should shuffle cards in different order", () => {
			game.shuffleDeck();
			const firstShuffle = [...game.shuffledDeck];

			game.shuffledDeck = [];
			game.shuffleDeck();
			const secondShuffle = [...game.shuffledDeck];

			// Very unlikely to be in same order (1/24! chance)
			const sameOrder = firstShuffle.every(
				(card, i) => card.id === secondShuffle[i].id,
			);
			expect(sameOrder).toBe(false);
		});
	});

	describe("Card Selection", () => {
		beforeEach(() => {
			game.shuffleDeck();
		});

		it("should add card with position to selected cards", () => {
			const card = game.shuffledDeck[0];
			const position = "Past";

			game.selectCard(card, position);

			expect(game.selectedCards.length).toBe(1);
			expect(game.selectedCards[0].id).toBe(card.id);
			expect(game.selectedCards[0].position).toBe(position);
		});

		it("should allow selecting up to 5 cards", () => {
			const positions = [
				"Past",
				"Present",
				"Future",
				"Root Cause",
				"Potential",
			];

			positions.forEach((position, i) => {
				game.selectCard(game.shuffledDeck[i], position);
			});

			expect(game.selectedCards.length).toBe(5);
		});

		it("should not allow selecting more than 5 cards", () => {
			const positions = [
				"Past",
				"Present",
				"Future",
				"Root Cause",
				"Potential",
			];

			positions.forEach((position, i) => {
				game.selectCard(game.shuffledDeck[i], position);
			});

			game.selectCard(game.shuffledDeck[5], "Extra");

			expect(game.selectedCards.length).toBe(5);
		});

		it("should change to reading stage after 5 cards selected", () => {
			const positions = [
				"Past",
				"Present",
				"Future",
				"Root Cause",
				"Potential",
			];

			positions.forEach((position, i) => {
				game.selectCard(game.shuffledDeck[i], position);
			});

			expect(game.gameStage).toBe("reading");
		});
	});

	describe("Question Management", () => {
		it("should set question", () => {
			game.setQuestion("Will I find love?");
			expect(game.question).toBe("Will I find love?");
		});
	});

	describe("Stage Management", () => {
		it("should transition to selection stage", () => {
			game.startSelection();
			expect(game.gameStage).toBe("selection");
		});
	});

	describe("Reading Generation", () => {
		beforeEach(() => {
			game.question = "Will I find love?";
			game.shuffleDeck();
			const positions = [
				"Past",
				"Present",
				"Future",
				"Root Cause",
				"Potential",
			];
			positions.forEach((position, i) => {
				game.selectCard(game.shuffledDeck[i], position);
			});
		});

		it("should set loading state during reading generation", async () => {
			global.fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ reading: "Your reading here..." }),
			});

			const readingPromise = game.getReading();
			expect(game.isLoadingReading).toBe(true);

			await readingPromise;
		});

		it("should call reading API with question and cards", async () => {
			global.fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ reading: "Your reading here..." }),
			});

			await game.getReading();

			expect(global.fetch).toHaveBeenCalledWith(
				"/api/reading",
				expect.objectContaining({
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: expect.stringContaining("Will I find love?"),
				}),
			);
		});

		it("should set reading from API response", async () => {
			const mockReading = "Your cards reveal a journey of transformation...";

			global.fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ reading: mockReading }),
			});

			await game.getReading();

			expect(game.reading).toBe(mockReading);
			expect(game.isLoadingReading).toBe(false);
		});

		it("should handle API errors gracefully", async () => {
			global.fetch.mockRejectedValueOnce(new Error("API Error"));

			await game.getReading();

			expect(game.reading).toContain("Unable to generate reading");
			expect(game.isLoadingReading).toBe(false);
		});
	});

	describe("Reset", () => {
		it("should reset all game state", () => {
			game.question = "Test question";
			game.shuffleDeck();
			game.selectCard(game.shuffledDeck[0], "Past");
			game.gameStage = "reading";
			game.reading = "Test reading";

			game.reset();

			expect(game.question).toBe("");
			expect(game.shuffledDeck).toEqual([]);
			expect(game.selectedCards).toEqual([]);
			expect(game.gameStage).toBe("question");
			expect(game.reading).toBe("");
			expect(game.isLoadingReading).toBe(false);
		});
	});
});
