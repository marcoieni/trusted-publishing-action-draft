import * as core from "@actions/core";
import { getTokensEndpoint, runAction, throwHttpErrorMessage } from "./utils.js";

function getRegistryUrl(): string {
    const url = core.getInput("url") || "https://crates.io";

    // Remove trailing `/` at the end of the URL if present
    if (url.endsWith("/")) {
        return url.slice(0, -1);
    }

    return url;
}

async function getJwtToken(audience: string): Promise<string> {
    core.info(`Retrieving GitHub Actions JWT token with audience: ${audience}`);

    const jwtToken = await core.getIDToken(audience);

    if (!jwtToken) {
        throw new Error("Failed to retrieve JWT token from GitHub Actions");
    }

    core.info("Retrieved JWT token successfully");
    return jwtToken;
}

async function requestTrustedPublishingToken(
    registryUrl: string,
    jwtToken: string,
): Promise<string> {
    const tokenUrl = getTokensEndpoint(registryUrl);
    core.info(`Requesting token from: ${tokenUrl}`);

    const response = await fetch(tokenUrl, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ jwt: jwtToken }),
    });

    if (!response.ok) {
        // status is not in the range 200-299
        await throwHttpErrorMessage("Failed to retrieve token from Cargo registry", response);
    }
    const tokenResponse = (await response.json()) as { token: string };

    if (!tokenResponse.token) {
        await throwHttpErrorMessage("Failed to retrieve token from Cargo registry", response);
    }

    return tokenResponse.token;
}

function setTokenOutputs(token: string, registryUrl: string): void {
    core.info("Retrieved token successfully");

    // Register the token with the runner as a secret to ensure it is masked in logs
    core.setSecret(token);

    // Set the token as output
    core.setOutput("token", token);

    // Store token for cleanup in post action
    core.saveState("token", token);
    core.saveState("registryUrl", registryUrl);
}

// Extract audience from registry URL by removing `https://` or `http://`
function getAudienceFromUrl(url: string): string {
    const audience = url.replace(/^https?:\/\//, "");

    if (audience.startsWith("http://") || audience.startsWith("https://")) {
        throw new Error("Bug: The audience should not include the protocol (http:// or https://).");
    }

    return audience;
}

async function run(): Promise<void> {
    // Check if permissions are set correctly
    if (!process.env.ACTIONS_ID_TOKEN_REQUEST_URL) {
        throw new Error(
            "Please ensure the 'id-token' permission is set to 'write' in your workflow. For more information, see: https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect#adding-permissions-settings",
        );
    }

    const registryUrl = getRegistryUrl();

    const audience = getAudienceFromUrl(registryUrl);

    // Get the GitHub Actions JWT token
    const jwtToken = await getJwtToken(audience);

    // Request trusted publishing token
    const token = await requestTrustedPublishingToken(registryUrl, jwtToken);

    // Set outputs and save state
    setTokenOutputs(token, registryUrl);
}

runAction(run);
