import * as core from "@actions/core";
import { setRegistryError } from "./registry_error.js";

async function revokeToken(registryUrl, token) {
    const revokeUrl = `${registryUrl}/api/v1/trusted_publishing/tokens/revoke`;

    try {
        const response = await fetch(revokeUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            core.info("Token revoked successfully");
        } else {
            setRegistryError("Failed to revoke token", response);
        }
    } catch (error) {
        core.warning(`Failed to revoke token: ${error.message}`);
    }
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
        core.warning(`Cleanup failed: ${error.message}`);
    }
}

cleanup();
