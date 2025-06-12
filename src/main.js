import * as core from "@actions/core";

function getRegistryUrl() {
    const url = core.getInput("url") || "https://crates.io";

    // Remove trailing `/` at the end of the URL if present
    if (url.endsWith("/")) {
        return url.slice(0, -1);
    }

    return url;
}

async function getJwtToken(audience) {
    core.info(`Retrieving GitHub Actions JWT token with audience: ${audience}`);

    const jwtToken = await core.getIDToken(audience);

    if (!jwtToken) {
        core.setFailed("Error: Failed to retrieve JWT token from GitHub Actions");
        return null;
    }

    core.info("Retrieved JWT token successfully");
    return jwtToken;
}

async function requestTrustedPublishingToken(registryUrl, jwtToken) {
    const tokenUrl = `${registryUrl}/api/v1/trusted_publishing/tokens`;
    core.info(`Requesting token from: ${tokenUrl}`);

    const response = await fetch(tokenUrl, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ jwt: jwtToken }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        core.setFailed(
            `Failed to retrieve token from Cargo registry. Status: ${response.status}, Response: ${errorText}`,
        );
        return null;
    }

    const tokenResponse = await response.json();

    if (!tokenResponse.token) {
        const errors = tokenResponse.errors || "Unknown error";
        core.setFailed(`Error: Failed to retrieve token from Cargo registry. Errors: ${errors}`);
        return null;
    }

    return tokenResponse.token;
}

function setTokenOutputs(token, registryUrl) {
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
function getAudienceFromUrl(url) {
    const audience = url.replace(/^https?:\/\//, "");

    if (audience.startsWith("http://") || audience.startsWith("https://")) {
        core.setFailed("Bug: The audience should not include the protocol (http:// or https://).");
        return;
    }

    return audience;
}

async function run() {
    try {
        // Check if permissions are set correctly
        if (!process.env.ACTIONS_ID_TOKEN_REQUEST_URL) {
            core.setFailed(
                "Error. Please ensure the 'id-token' permission is set to 'write' in your workflow. For more information, see: https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect#adding-permissions-settings",
            );
            return;
        }

        // Normalize the registry URL
        const registryUrl = getRegistryUrl();

        const audience = getAudienceFromUrl(registryUrl);

        // Get the GitHub Actions JWT token
        const jwtToken = await getJwtToken(audience);
        if (!jwtToken) {
            return;
        }

        // Request trusted publishing token
        const token = await requestTrustedPublishingToken(registryUrl, jwtToken);
        if (!token) {
            return;
        }

        // Set outputs and save state
        setTokenOutputs(token, registryUrl);
    } catch (error) {
        core.setFailed(`Action failed with error: ${error.message}`);
    }
}

run();
