import * as core from "@actions/core";

export async function throwHttpErrorMessage(operation: string, response: Response): Promise<void> {
    const responseText = await response.text();
    let errorMessage = `${operation}. Status: ${response.status.toString()}.`;
    if (responseText) {
        errorMessage += ` Response: ${responseText}`;
    }

    throw new Error(errorMessage);
}

export function getTokensEndpoint(registryUrl: string): string {
    return `${registryUrl}/api/v1/trusted_publishing/tokens`;
}

export function runAction(fn: () => Promise<void>): void {
    fn().catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        core.setFailed(`Error: ${errorMessage}`);
    });
}

export function jsonContentType() {
    return {
        /* eslint-disable  @typescript-eslint/naming-convention */
        "Content-Type": "application/json",
    };
}
