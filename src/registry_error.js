import * as core from "@actions/core";

export async function setRegistryError(operation, response) {
    const errorText = await response.text();
    core.setFailed(`${operation}. Status: ${response.status}. Response: ${errorText}`);
}
