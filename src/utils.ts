import * as core from "@actions/core";

export async function throwHttpErrorMessage(operation: string, response: Response) {
    const responseText = await response.text();
    let errorMessage = `${operation}. Status: ${response.status}.`;
    if (responseText) {
        errorMessage += ` Response: ${responseText}`;
    }

    throw new Error(errorMessage);
}

export function getTokensEndpoint(registryUrl: string) {
    return `${registryUrl}/api/v1/trusted_publishing/tokens`;
}

export function runAction(fn: () => void | Promise<void>) {
    try {
        fn();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        core.setFailed(`Error: ${errorMessage}`);
    }
}
