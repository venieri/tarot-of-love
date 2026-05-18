import "@testing-library/jest-dom";
import { vi } from "vitest";

// Preserve native fetch for optional live LLM integration tests
export const nativeFetch = globalThis.fetch;

// Mock fetch for unit tests
global.fetch = vi.fn();
