import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Page from "../routes/+page.svelte";

vi.mock("../lib/config.js", () => ({
	OPENAI_API_KEY: "test-api-key",
}));

describe("Tarot Reading Flow", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should display question input on initial load", () => {
		render(Page);

		expect(screen.getByText(/Lydia Venieri's/i)).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText(/What question weighs/i),
		).toBeInTheDocument();
		expect(screen.getByText(/CONSULT THE CARDS/i)).toBeInTheDocument();
	});

	it("should disable submit button when question is empty", () => {
		render(Page);

		const button = screen.getByText(/CONSULT THE CARDS/i);
		expect(button).toBeDisabled();
	});

	it("should enable submit button when question is entered", async () => {
		render(Page);

		const textarea = screen.getByPlaceholderText(/What question weighs/i);
		await fireEvent.input(textarea, { target: { value: "Will I find love?" } });

		const button = screen.getByText(/CONSULT THE CARDS/i);
		expect(button).not.toBeDisabled();
	});

	it("should show shuffle stage after submitting question", async () => {
		render(Page);

		const textarea = screen.getByPlaceholderText(/What question weighs/i);
		await fireEvent.input(textarea, { target: { value: "Will I find love?" } });

		const button = screen.getByText(/CONSULT THE CARDS/i);
		await fireEvent.click(button);

		await waitFor(() => {
			expect(screen.getByText(/Shuffling the cards/i)).toBeInTheDocument();
		});
	});

	it("should transition to card selection after shuffle", async () => {
		vi.useFakeTimers();
		render(Page);

		const textarea = screen.getByPlaceholderText(/What question weighs/i);
		await fireEvent.input(textarea, { target: { value: "Will I find love?" } });

		const button = screen.getByText(/CONSULT THE CARDS/i);
		await fireEvent.click(button);

		// Wait for shuffle animation (2 seconds)
		vi.advanceTimersByTime(2000);

		await waitFor(() => {
			expect(screen.getByText(/Card 1 of 5/i)).toBeInTheDocument();
			expect(screen.getByText(/Past/i)).toBeInTheDocument();
		});

		vi.useRealTimers();
	});

	it("should show selected cards section after first card selection", async () => {
		vi.useFakeTimers();
		render(Page);

		const textarea = screen.getByPlaceholderText(/What question weighs/i);
		await fireEvent.input(textarea, { target: { value: "Will I find love?" } });

		const button = screen.getByText(/CONSULT THE CARDS/i);
		await fireEvent.click(button);

		vi.advanceTimersByTime(2000);

		await waitFor(() => {
			expect(screen.getByText(/Card 1 of 5/i)).toBeInTheDocument();
		});

		// Click first card
		const cardButtons = screen.getAllByLabelText(/Select tarot card/i);
		await fireEvent.click(cardButtons[0]);

		await waitFor(() => {
			expect(screen.getByText(/Selected Cards/i)).toBeInTheDocument();
		});

		vi.useRealTimers();
	});

	it("should show reading stage after 5 cards selected", async () => {
		vi.useFakeTimers();
		render(Page);

		const textarea = screen.getByPlaceholderText(/What question weighs/i);
		await fireEvent.input(textarea, { target: { value: "Will I find love?" } });

		const button = screen.getByText(/CONSULT THE CARDS/i);
		await fireEvent.click(button);

		vi.advanceTimersByTime(2000);

		await waitFor(() => {
			expect(screen.getByText(/Card 1 of 5/i)).toBeInTheDocument();
		});

		// Select 5 cards
		for (let i = 0; i < 5; i++) {
			const cardButtons = screen.getAllByLabelText(/Select tarot card/i);
			await fireEvent.click(cardButtons[0]);
			vi.advanceTimersByTime(100);
		}

		await waitFor(() => {
			expect(screen.getByText(/RECEIVE YOUR READING/i)).toBeInTheDocument();
		});

		vi.useRealTimers();
	});

	it("should generate reading when button clicked", async () => {
		vi.useFakeTimers();

		const mockReading = "Your cards reveal a profound journey...";
		global.fetch = vi.fn().mockResolvedValue({
			json: async () => ({
				choices: [{ message: { content: mockReading } }],
			}),
		});

		render(Page);

		// Enter question
		const textarea = screen.getByPlaceholderText(/What question weighs/i);
		await fireEvent.input(textarea, { target: { value: "Will I find love?" } });

		const submitButton = screen.getByText(/CONSULT THE CARDS/i);
		await fireEvent.click(submitButton);

		vi.advanceTimersByTime(2000);

		// Select 5 cards
		for (let i = 0; i < 5; i++) {
			await waitFor(() => {
				const cardButtons = screen.getAllByLabelText(/Select tarot card/i);
				expect(cardButtons.length).toBeGreaterThan(0);
			});

			const cardButtons = screen.getAllByLabelText(/Select tarot card/i);
			await fireEvent.click(cardButtons[0]);
			vi.advanceTimersByTime(100);
		}

		// Generate reading
		await waitFor(() => {
			expect(screen.getByText(/RECEIVE YOUR READING/i)).toBeInTheDocument();
		});

		const readingButton = screen.getByText(/RECEIVE YOUR READING/i);
		await fireEvent.click(readingButton);

		await waitFor(() => {
			expect(screen.getByText(/The Oracle contemplates/i)).toBeInTheDocument();
		});

		await waitFor(
			() => {
				expect(screen.getByText(mockReading)).toBeInTheDocument();
			},
			{ timeout: 5000 },
		);

		vi.useRealTimers();
	});

	it("should reset game when new reading button clicked", async () => {
		vi.useFakeTimers();

		const mockReading = "Your cards reveal...";
		global.fetch = vi.fn().mockResolvedValue({
			json: async () => ({
				choices: [{ message: { content: mockReading } }],
			}),
		});

		render(Page);

		// Complete full flow
		const textarea = screen.getByPlaceholderText(/What question weighs/i);
		await fireEvent.input(textarea, { target: { value: "Test question" } });
		await fireEvent.click(screen.getByText(/CONSULT THE CARDS/i));
		vi.advanceTimersByTime(2000);

		for (let i = 0; i < 5; i++) {
			const cardButtons = screen.getAllByLabelText(/Select tarot card/i);
			await fireEvent.click(cardButtons[0]);
			vi.advanceTimersByTime(100);
		}

		await waitFor(() => {
			const readingButton = screen.getByText(/RECEIVE YOUR READING/i);
			fireEvent.click(readingButton);
		});

		await waitFor(() => {
			expect(screen.getByText(mockReading)).toBeInTheDocument();
		});

		// Click new reading
		const newReadingButton = screen.getByText(/NEW READING/i);
		await fireEvent.click(newReadingButton);

		await waitFor(() => {
			expect(
				screen.getByPlaceholderText(/What question weighs/i),
			).toBeInTheDocument();
		});

		vi.useRealTimers();
	});
});
