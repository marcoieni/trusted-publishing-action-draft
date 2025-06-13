export async function getJsonBody(operation, response) {
    if (response.ok) {
        // status is in the range 200-299
        return await response.json();
    }

    await throwErrorMessage(operation, response);
}

export async function throwErrorMessage(operation, response) {
    const responseText = await response.text();
    let errorMessage = `${operation}. Status: ${response.status}.`;
    if (responseText) {
        errorMessage += ` Response: ${responseText}`;
    }

    throw new Error(errorMessage);
}
