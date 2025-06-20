import { expect, test, vi, beforeEach, afterEach, describe } from "vitest";
import { http, HttpResponse } from "msw";
import * as main from "./main.js";
import * as post from "./post.js";
import * as core from "@actions/core";
import type * as msw from "msw/node";
import { startMockServer } from "./test_utils.js";

// Mock the @actions/core module
vi.mock("@actions/core", () => ({
    getInput: vi.fn(),
    getIDToken: vi.fn(),
    setOutput: vi.fn(),
    setSecret: vi.fn(),
    setFailed: vi.fn(),
    info: vi.fn(),
    saveState: vi.fn(),
    getState: vi.fn(),
}));

const AUDIENCE = "my-crates.io";
const REGISTRY_URL = `https://${AUDIENCE}`;
const TOKENS_URL = `${REGISTRY_URL}/api/v1/trusted_publishing/tokens`;
const EXPECTED_JWT = "mock-jwt-token";
const EXPECTED_TOKEN = "cargo-registry-token";

describe("Main Action Tests", () => {
    let originalEnvValue: string | undefined;
    const state = new Map<string, string>();
    let server: msw.SetupServer | null = null;

    beforeEach(() => {
        // Reset all mocks before each test
        vi.resetAllMocks();

        // Store original environment variable value
        originalEnvValue = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;

        // Reset environment variables
        delete process.env.ACTIONS_ID_TOKEN_REQUEST_URL;

        // Setup default mock implementations
        vi.mocked(core.getInput).mockReturnValue(REGISTRY_URL); // Default registry URL
        vi.mocked(core.getIDToken).mockResolvedValue(EXPECTED_JWT);
        vi.mocked(core.setOutput).mockImplementation(() => {});
        vi.mocked(core.setSecret).mockImplementation(() => {});
        vi.mocked(core.setFailed).mockImplementation(() => {});
        vi.mocked(core.info).mockImplementation(() => console.log);
        vi.mocked(core.saveState).mockImplementation(
            (key: string, value: string) => {
                state.set(key, value);
            },
        );
        vi.mocked(core.getState).mockImplementation((key: string) => {
            return state.get(key) ?? "";
        });
    });

    afterEach(() => {
        // Restore original environment variable value
        if (originalEnvValue !== undefined) {
            process.env.ACTIONS_ID_TOKEN_REQUEST_URL = originalEnvValue;
        } else {
            delete process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
        }

        if (server) {
            server.close();
            server.resetHandlers();
        }
    });

    test("permissions check fail if env var not set", async () => {
        // The environment variable `ACTIONS_ID_TOKEN_REQUEST_URL` is not set.
        await expect(main.run()).rejects.toThrowError(
            "Please ensure the 'id-token' permission is set to 'write' in your workflow. For more information, see: https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect#adding-permissions-settings",
        );
    });

    test("should throw error when getIDToken returns empty string", async () => {
        setRegistryUrl();

        // Mock getIDToken to return empty string
        vi.mocked(core.getIDToken).mockResolvedValue("");

        await expect(main.run()).rejects.toThrowError(
            "Failed to retrieve JWT token from GitHub Actions",
        );
    });

    test("should throw error when registry returns 400 with no matching config", async () => {
        setRegistryUrl();

        // Setup a server to mock the registry endpoint with 400 error
        server = startMockServer([
            http.put(TOKENS_URL, async ({ request }) => {
                const body = await request.json();
                expect(body).toHaveProperty("jwt", EXPECTED_JWT);
                return HttpResponse.json(
                    {
                        errors: [
                            {
                                detail: "No matching Trusted Publishing config found",
                            },
                        ],
                    },
                    { status: 400 },
                );
            }),
        ]);

        await expect(main.run()).rejects.toThrowError(
            `Failed to retrieve token from Cargo registry. Status: 400. Response: {"errors":[{"detail":"No matching Trusted Publishing config found"}]}`,
        );
    });

    test("should successfully retrieve and revoke token in happy path", async () => {
        setRegistryUrl();

        // Setup a server to mock the registry endpoint with successful response
        const server = startMockServer([
            http.put(TOKENS_URL, async ({ request }) => {
                const body = await request.json();
                expect(body).toHaveProperty("jwt", EXPECTED_JWT);
                return HttpResponse.json(
                    { token: EXPECTED_TOKEN },
                    { status: 200 },
                );
            }),
            http.delete(TOKENS_URL, ({ request }) => {
                // Verify the Authorization header contains the token
                const authHeader = request.headers.get("Authorization");
                expect(authHeader).toBe(`Bearer ${EXPECTED_TOKEN}`);
                return HttpResponse.json({}, { status: 204 });
            }),
        ]);

        // Run the main function
        await main.run();

        // Verify that setOutput was called with the token
        expect(core.setOutput).toHaveBeenCalledWith("token", EXPECTED_TOKEN);

        // Verify that setSecret was called to mask the token in logs
        expect(core.setSecret).toHaveBeenCalledWith(EXPECTED_TOKEN);

        // Verify that saveState was called with the correct token and registry URL
        expect(core.saveState).toHaveBeenCalledWith("token", EXPECTED_TOKEN);
        expect(core.saveState).toHaveBeenCalledWith(
            "registryUrl",
            REGISTRY_URL,
        );

        // Verify that getIDToken was called with the correct audience
        expect(core.getIDToken).toHaveBeenCalledWith(AUDIENCE);

        await post.cleanup();
        expect(core.info).toHaveBeenCalledWith("Token revoked successfully");
    });
});

/** Set up environment variable to pass the permissions check */
function setRegistryUrl(): void {
    // Set the registry URL in the environment variable
    process.env.ACTIONS_ID_TOKEN_REQUEST_URL = REGISTRY_URL;
}
