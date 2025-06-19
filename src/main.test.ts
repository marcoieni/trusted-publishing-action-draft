import { expect, test } from "vitest";
import * as main from "./main.js";

test("returns the correct endpoint URL", async () => {
    // The environment variable `ACTIONS_ID_TOKEN_REQUEST_URL` is not set.
    await expect(main.run()).rejects.toThrowError(
        "Please ensure the 'id-token' permission is set to 'write' in your workflow. For more information, see: https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect#adding-permissions-settings"
    );
});
