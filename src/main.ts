const statusElement = document.getElementById("status")!;
const ws = new WebSocket(`ws://${location.host}`);

let list = {};

const resultDiv = document.querySelector("#result")!;

function renderList() {
    resultDiv.innerHTML = "";
    for (const suite in list) {
        const div = document.createElement("div");
        div.innerText = suite;
        for (const test of list[suite]) {
            const p = document.createElement("p");
            p.innerText = test;
            div.appendChild(p);
        }
        resultDiv.appendChild(div);
    }
}

ws.onopen = () => {
    statusElement.textContent = "WebSocket connection established!";
    ws.send("Hello Server!");
};

ws.onmessage = (event) => {
    console.log("Message from server:", event.data);
    const data = JSON.parse(event.data);
    if (data.message === "tests-list") {
        list = data.payload;
    }
    if (data.message === "test-result") {
        const { suiteName, test, result } = data.payload;
        const idx = list[suiteName].indexOf(test);
        if (result.status === "pass") {
            list[suiteName][idx] = test + ": PASSED";
        } else {
            list[suiteName][idx] = test + ": FAILED - " + result.error + ": " + result.errMsg;
        }
    }
    renderList();
};

ws.onclose = () => {
    statusElement.textContent = "WebSocket connection closed.";
};

ws.onerror = (error) => {
    statusElement.textContent = "WebSocket error occurred.";
    console.error("WebSocket error:", error);
};
