import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock fetch for API tests
global.fetch = vi.fn();
