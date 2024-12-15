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
                reject(new Error("Timed out waiting for condition"));
                clearInterval(intervalID);
            }
        }, interval);

        setTimeout(() => hasTimedOut = true, timeout);
    });
}

