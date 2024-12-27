setTimeout(function() {
    'use strict';

    const div = document.createElement("div");
    div.classList.add("injected-iframe-container");

    const frame = document.createElement("iframe");
    frame.src = "http://localhost:5173/watcher";

    const toggle = document.createElement("div");
    toggle.classList.add("injected-iframe-toggle");
    toggle.addEventListener("click", () => {
        const hidden = div.classList.contains("iframe-hidden");
        if (hidden) {
            div.classList.remove("iframe-hidden");
        } else {
            div.classList.add("iframe-hidden");
        }
    });

    div.appendChild(frame);
    div.appendChild(toggle);

    const main = document.querySelector("main");
    main.insertBefore(div, main.firstChild);
}, 1000);
