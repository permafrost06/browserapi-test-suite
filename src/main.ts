import tests from "./tests";

for (let i = 0; i < tests.length; i++) {
    await tests[i].run();
}
document.body.innerText = "All tests have finished running"
