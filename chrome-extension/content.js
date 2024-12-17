(function() {
    'use strict';

    const frame = document.createElement("iframe");
    frame.src = "http://localhost:5173/";

    const main = document.querySelector("main");
    main.insertBefore(frame, main.firstChild);
})();
