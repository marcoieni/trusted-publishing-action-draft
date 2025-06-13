export async function throwErrorMessage(operation, response) {
    const responseText = await response.text();
    let errorMessage = `${operation}. Status: ${response.status}.`;
    if (responseText) {
        errorMessage += ` Response: ${responseText}`;
    }

    throw new Error(errorMessage);
}

export function getTokensEndpoint(registryUrl) {
    return `${registryUrl}/api/v1/trusted_publishing/tokens`;
}
