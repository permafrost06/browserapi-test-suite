export function logToConsole(description: string) {
    console.log(`test "${description}" passed`);
}

export function logErrorToConsole(description: string, e: Error) {
    console.error(`test "${description}" failed: ` + " " + e);
}

