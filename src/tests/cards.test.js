import { describe, expect, it } from "vitest";
import { cards, spreadPositions } from "../lib/cards.js";

describe("Cards Data", () => {
	describe("Card Collection", () => {
		it("should have exactly 24 cards", () => {
			expect(cards).toHaveLength(24);
		});

		it("should have unique IDs", () => {
			const ids = cards.map((c) => c.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(24);
		});

		it("should have sequential IDs from 1 to 24", () => {
			const ids = cards.map((c) => c.id).sort((a, b) => a - b);
			const expected = Array.from({ length: 24 }, (_, i) => i + 1);
			expect(ids).toEqual(expected);
		});
	});

	describe("Card Structure", () => {
		it("should have all required fields", () => {
			cards.forEach((card) => {
				expect(card).toHaveProperty("id");
				expect(card).toHaveProperty("name");
				expect(card).toHaveProperty("byeline");
				expect(card).toHaveProperty("description");
				expect(card).toHaveProperty("reverse");
				expect(card).toHaveProperty("image");
			});
		});

		it("should have non-empty names", () => {
			cards.forEach((card) => {
				expect(card.name).toBeTruthy();
				expect(typeof card.name).toBe("string");
				expect(card.name.length).toBeGreaterThan(0);
			});
		});

		it("should have non-empty descriptions", () => {
			cards.forEach((card) => {
				expect(typeof card.description).toBe("string");
				expect(card.description.length).toBeGreaterThan(0);
			});
		});

		it("should have valid image paths", () => {
			cards.forEach((card) => {
				expect(card.image).toMatch(/^\/images\/.+\.png$/);
			});
		});
	});

	describe("Card Content", () => {
		it("should have unique names", () => {
			const names = cards.map((c) => c.name);
			const uniqueNames = new Set(names);
			expect(uniqueNames.size).toBe(24);
		});

		it("should have byelines (some may be empty)", () => {
			cards.forEach((card) => {
				expect(typeof card.byeline).toBe("string");
			});
		});
	});
});

describe("Spread Positions", () => {
	it("should have exactly 5 positions", () => {
		expect(spreadPositions).toHaveLength(5);
	});

	it("should have all required position names", () => {
		const names = spreadPositions.map((p) => p.name);
		expect(names).toContain("Past");
		expect(names).toContain("Present");
		expect(names).toContain("Future");
		expect(names).toContain("Root Cause");
		expect(names).toContain("Potential");
	});

	it("should have descriptions for all positions", () => {
		spreadPositions.forEach((position) => {
			expect(position).toHaveProperty("name");
			expect(position).toHaveProperty("description");
			expect(typeof position.name).toBe("string");
			expect(typeof position.description).toBe("string");
			expect(position.description.length).toBeGreaterThan(0);
		});
	});
});
