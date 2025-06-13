import * as core from "@actions/core";
import { getTokensEndpoint, throwErrorMessage } from "./http_utils.js";

async function revokeToken(registryUrl, token) {
    const tokensEndpoint = getTokensEndpoint(registryUrl);

    core.info(`Revoking token at: ${tokensEndpoint}`);

    const response = await fetch(tokensEndpoint, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        await throwErrorMessage("Failed to revoke token", response);
    }

    core.info("Token revoked successfully");
}

async function cleanup() {
    try {
        const token = core.getState("token");
        const registryUrl = core.getState("registryUrl");

        if (!token) {
            core.info("No token to revoke");
            return;
        }

        core.info("Revoking trusted publishing token");

        await revokeToken(registryUrl, token);
    } catch (error) {
        core.setFailed(`Cleanup failed: ${error.message}`);
    }
}

cleanup();
