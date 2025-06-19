import { expect, test, vi, beforeEach, afterEach, describe } from "vitest";
import * as main from "./main.js";

// Mock the @actions/core module
vi.mock("@actions/core", () => ({
    getInput: vi.fn(),
    getIDToken: vi.fn(),
    setOutput: vi.fn(),
    setSecret: vi.fn(),
    setFailed: vi.fn(),
    info: vi.fn(),
    saveState: vi.fn(),
}));

// Import the mocked core module
import * as core from "@actions/core";

describe("Main Action Tests", () => {
    let originalEnvValue: string | undefined;

    beforeEach(() => {
        // Reset all mocks before each test
        vi.resetAllMocks();

        // Store original environment variable value
        originalEnvValue = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;

        // Reset environment variables
        delete process.env.ACTIONS_ID_TOKEN_REQUEST_URL;

        // Setup default mock implementations
        vi.mocked(core.getInput).mockReturnValue("https://example.com"); // Default registry URL
        vi.mocked(core.getIDToken).mockResolvedValue("mock-jwt-token");
        vi.mocked(core.setOutput).mockImplementation(() => {});
        vi.mocked(core.setSecret).mockImplementation(() => {});
        vi.mocked(core.setFailed).mockImplementation(() => {});
        vi.mocked(core.info).mockImplementation(() => console.log);
        vi.mocked(core.saveState).mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore original environment variable value
        if (originalEnvValue !== undefined) {
            process.env.ACTIONS_ID_TOKEN_REQUEST_URL = originalEnvValue;
        } else {
            delete process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
        }
    });

    test("permissions check fail if env var not set", async () => {
        // The environment variable `ACTIONS_ID_TOKEN_REQUEST_URL` is not set.
        await expect(main.run()).rejects.toThrowError(
            "Please ensure the 'id-token' permission is set to 'write' in your workflow. For more information, see: https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect#adding-permissions-settings",
        );
    });

    test("should throw error when getIDToken returns empty string", async () => {
        // Set up environment variable so we pass the permissions check
        process.env.ACTIONS_ID_TOKEN_REQUEST_URL = "https://example.com";

        // Mock getIDToken to return empty string
        vi.mocked(core.getIDToken).mockResolvedValue("");

        await expect(main.run()).rejects.toThrowError(
            "Failed to retrieve JWT token from GitHub Actions",
        );
    });
});
