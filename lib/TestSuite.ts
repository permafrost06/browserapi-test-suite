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
    logger: LoggerFn = logToConsole, errorLogger: ErrorLoggerFn = logErrorToConsole
) {
    return function createTestSuite <T>(name: string, setupFn: () => T) {
        return TestSuite(name, setupFn, logger, errorLogger);
    }
}

export default function TestSuite<T>(
    name: string,
    setupFn: () => T,
    logger: LoggerFn,
    errorLogger: ErrorLoggerFn,
) {
    let teardownFn: (props: T) => void;
    let tests: Array<{
        description: string;
        testFn: (
            props: T,
            helpers: HelperFns,
            logComment: (comment: string) => Promise<void>
        ) => void | Promise<void>;
    }> = [];
    let results: Array<{
        description: string;
        status: "pass" | "fail";
        failReason?: Error;
    }> = [];
    let testsRun = false;

    function teardown(fn: (props: T) => void) {
        teardownFn = fn;
    }

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
        testsRun = true;
        const props = setupFn();

        for (const test of tests) {
            try {
                await test.testFn(props, { delay, waitUntil }, logComment);
            } catch (e) {
                await errorLogger(name, test.description, e as Error);
                results.push({
                    description: test.description,
                    status: "fail",
                    failReason: e as Error
                });
                continue;
            }
            await logger(name, test.description);
            results.push({ description: test.description, status: "pass" });
        }

        teardownFn(props);
    }

    async function logComment(comment: string) {
        await logger(name, comment);
    }

    async function getResults() {
        if (!testsRun) {
            throw Error("Test suite has not yet been run. Call .run() to run suite.");
        }

        return results;
    }

    return { run, teardown, addTest, getResults }
}

