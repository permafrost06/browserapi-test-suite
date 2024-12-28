import { logToConsole, logErrorToConsole } from "./consoleLogger";
import { delay, waitUntil } from "./helpers";

export type Props = Record<string, any>;
export type HelperFns = {
    delay: (delay: number) => Promise<unknown>;
    waitUntil: (
        callback: () => boolean,
        interval?: number,
        timeout?: number
    ) => Promise<void>;
};

export type LoggerFn = (
    suiteName: string,
    description: string
) => (Promise<void> | void);

export type ErrorLoggerFn = (
    suiteName: string,
    description: string,
    e: Error
) => (Promise<void> | void);

export function defineLoggers(
    logger: LoggerFn = logToConsole,
    errorLogger: ErrorLoggerFn = logErrorToConsole
) {
    return function createTestSuite<T>(
        name: string,
        setupFn: (helpers: HelperFns) => (T | Promise<T>),
        teardownFn: (props: T) => (void | Promise<T>)
    ) {
        return TestSuite(name, setupFn, teardownFn, logger, errorLogger);
    }
}

export default function TestSuite<T>(
    name: string,
    setupFn: (helpers: HelperFns) => (T | Promise<T>),
    teardownFn: (props: T) => (void | Promise<T>),
    logger: LoggerFn,
    errorLogger: ErrorLoggerFn,
) {
    let tests: Array<{
        description: string;
        testFn: (
            props: T,
            helpers: HelperFns,
            logComment: (comment: string) => Promise<void>
        ) => void | Promise<void>;
    }> = [];
    let logs: Array<{
        type: "comment" | "result",
        content: string;
        status?: "pass" | "fail";
        failReason?: string;
    }> = [];

    async function addTest(
        description: string,
        testFn: (
            props: T,
            helpers: HelperFns,
            logComment: (comment: string) => Promise<void>
        ) => void | Promise<void>,
    ) {
        tests.push({ description, testFn });
    }

    async function run() {
        const props = await setupFn({ delay, waitUntil });

        for (const test of tests) {
            try {
                await test.testFn(props, { delay, waitUntil }, logComment);
            } catch (e) {
                await errorLogger(name, test.description, e as Error);
                const { name: errorName, message: errorMessage } = e as Error;
                logs.push({
                    type: "result",
                    content: test.description,
                    status: "fail",
                    failReason: `${errorName}: ${errorMessage}`
                });
                continue;
            }
            await logger(name, test.description);
            logs.push({ type: "result", content: test.description, status: "pass" });
        }

        await teardownFn(props);

        return logs;
    }

    async function logComment(comment: string) {
        logs.push({ type: "comment", content: comment });
        await logger(name, comment);
    }

    function getTests() {
        return tests.map(test => test.description);
    }

    return { run, addTest, suiteName: name, getTests }
}

