import suites from "./tests";
import { id } from "./setup";

const reports: Record<string, Array<{
    type: "comment" | "result",
    content: string;
    status?: "pass" | "fail";
    failReason?: Error;
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

    // window.reports = reports;
    document.body.innerText = "All tests have finished running"
    // const pre = document.createElement("pre");
    // pre.innerText += JSON.stringify(reports, null, 4);
    // document.body.appendChild(pre);
    for (const suite in reports) {
        const report = reports[suite];

        const div = document.createElement("div");
        document.body.appendChild(div);
        report.forEach(({ content, type, status, failReason }) => {
            const p = document.createElement("p");
            div.appendChild(p);
            if (type === "result") {
                if (status === "pass") {
                    p.innerText = `PASS: ${content}`;
                }
                if (status === "fail" && failReason) {
                    p.innerText = `FAIL: ${content}, ${failReason.name} - ${failReason.message}`;
                    const stack = document.createElement("p");
                    stack.innerText = "stacktrace: " + failReason.stack!;
                    console.log(failReason);
                    div.appendChild(stack);
                }
            } else {
                p.innerText = `COMMENT: ${content}`;
            }
        })
    }
    ;
})()
