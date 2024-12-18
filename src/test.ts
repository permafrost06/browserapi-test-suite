import tests from "./tests";

const reports: Record<string, Array<{
    type: "comment" | "result",
    content: string;
    status?: "pass" | "fail";
    failReason?: Error;
}>> = {};

const allTests: Record<string, Array<string>> = {};

(async () => {
    for (const test of tests) {
        const suiteName = test.suiteName;
        allTests[suiteName] = test.tests.map(test => test.description);
    }

    await fetch("http://localhost:5173/register-tester", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allTests),
    });

    for (const suite of tests) {
        const suiteName = suite.suiteName;
        for (const test of suite.tests) {
            const testResult = await test.run();
            if (!reports[suiteName]) {
                reports[suiteName] = [];
            }
            reports[suiteName].push(testResult);

            await fetch("http://localhost:5173/test-result", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    suiteName,
                    test: test.description,
                    result: {
                        status: testResult.status,
                        error: testResult.failReason?.name,
                        errMsg: testResult.failReason?.message,
                    }
                }),
            });
        }
    }

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
