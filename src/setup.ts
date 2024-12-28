import { defineLoggers } from "../lib/TestSuite";

export const id = Math.floor(1000 + Math.random() * 9000);

async function logResult(
    suiteName: string,
    test: string,
    result: "pass" | "fail",
    error?: Error
) {
    let errorString = "";
    if (error) {
        errorString = `${error.name}: ${error.message}`;
    }

    await fetch(`${import.meta.env.VITE_HOST}/publish-test-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id,
            suiteName,
            test,
            result,
            error: (errorString !== "") ? errorString : undefined
        }),
    });
}

export default defineLoggers(async (suiteName, test) => {
    await logResult(suiteName, test, "pass");
}, async (suiteName, test, error) => {
    await logResult(suiteName, test, "fail", error);
});

