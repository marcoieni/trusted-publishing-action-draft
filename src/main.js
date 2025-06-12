const core = require('@actions/core');

async function run() {
    try {
        // Get inputs
        let registryUrl = core.getInput("url") || "https://crates.io";

        // Check if permissions are set correctly
        if (!process.env.ACTIONS_ID_TOKEN_REQUEST_URL) {
            core.setFailed(
                "Error. Please ensure the 'id-token' permission is set to 'write' in your workflow. For more information, see: https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect#adding-permissions-settings",
            );
            return;
        }

        // Extract audience from registry URL by removing `https://` or `http://`
        const audience = registryUrl.replace(/^https?:\/\//, "");

        // Remove trailing `/` at the end of the URL if present
        if (registryUrl.endsWith("/")) {
            registryUrl = registryUrl.slice(0, -1);
        }

        core.info(`Retrieving GitHub Actions JWT token with audience: ${audience}`);

        // Get the GitHub Actions JWT token
        const jwtToken = await core.getIDToken(audience);

        if (!jwtToken) {
            core.setFailed("Error: Failed to retrieve JWT token from GitHub Actions");
            return;
        }

        core.info("Retrieved JWT token successfully");

        // Send the request to the trusted publishing endpoint
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
            return;
        }

        const tokenResponse = await response.json();

        if (!tokenResponse.token) {
            const errors = tokenResponse.errors || "Unknown error";
            core.setFailed(
                `Error: Failed to retrieve token from Cargo registry. Errors: ${errors}`,
            );
            return;
        }

        core.info("Retrieved token successfully");

        // Register the token with the runner as a secret to ensure it is masked in logs
        core.setSecret(tokenResponse.token);

        // Set the token as output
        core.setOutput("token", tokenResponse.token);

        // Store token for cleanup in post action
        core.saveState("token", tokenResponse.token);
        core.saveState("registryUrl", registryUrl);
    } catch (error) {
        core.setFailed(`Action failed with error: ${error.message}`);
    }
}

run();
