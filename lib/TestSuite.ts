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

export default function TestSuiteSetup(
    logger = logToConsole, errorLogger = logErrorToConsole
) {
    return () => TestSuite(logger, errorLogger);
}

function TestSuite(
    logger: (description: string) => void,
    errorLogger: (description: string, e: Error) => void
) {
    let props: Record<string, any>;
    let setupFn: () => Props;
    let teardownFn: () => void;
    let tests: Array<{
        description: string;
        testFn: (props: Props, helpers: HelperFns) => void | Promise<void>;
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
        testFn: (props: Props, helpers: HelperFns) => (void | Promise<void>),
    ) {
        tests.push({ description, testFn });
    }

    async function run() {
        testsRun = true;
        props = setupFn();

        for (const test of tests) {
            try {
                await test.testFn(props, { delay, waitUntil });
            } catch (e) {
                errorLogger(test.description, e as Error);
                results.push({
                    description: test.description,
                    status: "fail",
                    failReason: e as Error
                });
                continue;
            }
            logger(test.description);
            results.push({ description: test.description, status: "pass" });
        }

        teardownFn();
    }

    async function getResults() {
        if (!testsRun) {
            throw Error("Test suite has not yet been run. Call .run() to run suite.");
        }

        return results;
    }

    return { run, setup, teardown, addTest, getResults }
}

