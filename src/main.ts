import tests from "./tests";

for (const test of tests) {
    await test.run();
}
document.body.innerText = "All tests have finished running"
