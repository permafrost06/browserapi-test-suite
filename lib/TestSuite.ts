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

export type TestFn = (
    props: Props,
    helpers: HelperFns,
    logComment: (comment: string) => Promise<void>
) => void | Promise<void>;

export default function TestSuiteSetup(
    logger: LoggerFn = logToConsole, errorLogger: ErrorLoggerFn = logErrorToConsole
) {
    return (name: string) => TestSuite(name, logger, errorLogger);
}

function TestSuite(
    name: string,
    logger: LoggerFn,
    errorLogger: ErrorLoggerFn,
) {
    let props: Record<string, any>;
    let setupFn: () => Props;
    let teardownFn: () => void;
    let tests: Array<{
        description: string;
        testFn: TestFn;
    }> = [];
    let results: Array<{
        description: string;
        status: "pass" | "fail";
        failReason?: Error;
    }> = [];
    let testsRun = false;

    function setup(fn: () => Props) {
        setupFn = fn;
    }

    function teardown(fn: () => void) {
        teardownFn = fn;
    }

    async function addTest(
        description: string,
        testFn: TestFn,
    ) {
        tests.push({ description, testFn });
    }

    async function run() {
        testsRun = true;
        props = setupFn();

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

        teardownFn();
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

    return { run, setup, teardown, addTest, getResults }
}

