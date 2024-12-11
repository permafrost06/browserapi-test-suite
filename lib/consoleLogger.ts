export function logToConsole(suiteName: string, description: string) {
    console.log(`${suiteName}: test "${description}" passed`);
}

export function logErrorToConsole(suiteName: string, description: string, e: Error) {
    console.error(`${suiteName}: test "${description}" failed: ` + " " + e);
}

