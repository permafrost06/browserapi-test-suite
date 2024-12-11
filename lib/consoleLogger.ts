export function logToConsole(description: string) {
    console.log(`test "${description}" passed`);
}

export function logErrorToConsole(description: string, e: Error) {
    console.log(`test "${description}" failed: ` + " " + e);
}

