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
        run: () => {
        type: "comment" | "result",
        content: string;
        status?: "pass" | "fail";
        failReason?: Error;
    } | Promise<{
        type: "comment" | "result",
        content: string;
        status?: "pass" | "fail";
        failReason?: Error;
    }>
    }> = [];
    let logs: Array<{
        type: "comment" | "result",
        content: string;
        status?: "pass" | "fail";
        failReason?: Error;
    }> = [];

    async function addTest(
        description: string,
        testFn: (
            props: T,
            helpers: HelperFns,
            logComment: (comment: string) => Promise<void>
        ) => void | Promise<void>,
    ) {
        tests.push({
            description,
            testFn,
            run: async () => {
                const props = await setupFn({ delay, waitUntil });
                try {
                    await testFn(props, { delay, waitUntil }, logComment);
                } catch (e) {
                    await errorLogger(name, description, e as Error);
                    await teardownFn(props);
                    return {
                        type: "result",
                        content: description,
                        status: "fail",
                        failReason: e as Error
                    };
                }
                await logger(name, description);
                await teardownFn(props);
                return { type: "result", content: description, status: "pass" };
            }
        });
    }

    async function run() {
        const props = await setupFn({ delay, waitUntil });

        for (const test of tests) {
            try {
                await test.testFn(props, { delay, waitUntil }, logComment);
            } catch (e) {
                await errorLogger(name, test.description, e as Error);
                logs.push({
                    type: "result",
                    content: test.description,
                    status: "fail",
                    failReason: e as Error
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

    return { run, addTest, suiteName: name, tests }
}

