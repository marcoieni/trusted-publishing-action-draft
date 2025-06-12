const core = require('@actions/core');

async function cleanup() {
    try {
        const token = core.getState("token");
        const registryUrl = core.getState("registryUrl");

        if (!token) {
            core.info("No token to revoke");
            return;
        }

        core.info("Revoking trusted publishing token");

        // Attempt to revoke the token (if the registry supports it)
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
                core.warning(`Failed to revoke token. Status: ${response.status}`);
            }
        } catch (error) {
            core.warning(`Failed to revoke token: ${error.message}`);
        }
    } catch (error) {
        core.warning(`Cleanup failed: ${error.message}`);
    }
}

cleanup();
