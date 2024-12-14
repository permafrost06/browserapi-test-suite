import tests from "./tests";

(async () => {
    for (const test of tests) {
        await test.run();
    }
    document.body.innerText = "All tests have finished running"
})()
