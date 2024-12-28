import suites from "./tests";
import { id } from "./setup";

const reports: Record<string, Array<{
    type: "comment" | "result",
    content: string;
    status?: "pass" | "fail";
    failReason?: string;
}>> = {};

(async () => {
    document.querySelector<HTMLDivElement>("#id_display")!.innerText = String(id);

    await fetch(`${import.meta.env.VITE_HOST}/register-test-runner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id,
        }),
    });

    for (const suite of suites) {
        const suiteName = suite.suiteName;
        reports[suiteName] = await suite.run();
    }

    await fetch(`${import.meta.env.VITE_HOST}/remove-test-runner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id,
        }),
    });

    document.body.innerText = "All tests have finished running"

    const output = {
        name: "browserapi-test-report",
        version: 1,
        suites: reports,
    };

    const pre = document.createElement("pre");
    pre.innerText += JSON.stringify(output, null, 4);
    document.body.appendChild(pre);
})()
