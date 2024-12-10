function logToConsole(message: string) {
    console.log(message);
}

function logErrorToConsole(message: string, e: Error) {
    logToConsole(message + " " + e);
}

const defaultLogger = logToConsole;
const defaultErrorLogger = logErrorToConsole;

export function delay(delayInms: number) {
    return new Promise(resolve => setTimeout(resolve, delayInms));
};

export function waitUntil(callback: () => boolean, interval = 100, timeout = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
        let retVal = false;
        let hasTimedOut = false;

        const intervalID = setInterval(() => {
            retVal = callback();

            if (retVal) {
                clearInterval(intervalID);
                resolve();
            }

            if (hasTimedOut) {
                reject("Timed out waiting for condition");
                clearInterval(intervalID);
            }
        }, interval);

        setTimeout(() => hasTimedOut = true, timeout);
    });
}

export async function test(
    description: string,
    testfn: () => void,
    onSuccess = defaultLogger,
    onFail = defaultErrorLogger
) {
    try {
        testfn();
    } catch (e) {
        onFail(`test "${description}" failed: `, e as Error);
        return;
    }

    onSuccess(`test "${description}" passed`);
}

export async function asyncTest(
    description: string,
    testfn: () => Promise<void>,
    onSuccess = defaultLogger,
    onFail = defaultErrorLogger,
) {
    try {
        await testfn();
    } catch (e) {
        onFail(`test "${description}" failed: `, e as Error);
        return;
    }

    onSuccess(`test "${description}" passed`);
}

