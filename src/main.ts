import { assert } from "chai";
import { delay, waitUntil, test, asyncTest } from "./utils";

const videoEl = document.createElement("video");
videoEl.src = "/sample-10s.mp4";
videoEl.id = "test_video";
videoEl.controls = true;
document.body.appendChild(videoEl);

test("supports video", () => {
    assert(!!videoEl.canPlayType === true);
});

await asyncTest("is able to play", async () => {
    let playDispatched = false;
    videoEl.addEventListener("play", () => {
        playDispatched = true;
    });
    let loadeddataDispatched = false;
    videoEl.addEventListener("loadeddata", () => {
        loadeddataDispatched = true;
    });

    await waitUntil(() => loadeddataDispatched === true);
    videoEl.play();
    assert(videoEl.paused === false);

    waitUntil(() => playDispatched === true, 100, 1000);
});

await asyncTest("is able to pause", async () => {
    let pauseDispatched = false;
    videoEl.addEventListener("play", () => {
        pauseDispatched = true;
    });

    videoEl.pause();
    assert(videoEl.paused === true);

    await waitUntil(() => pauseDispatched === true, 50, 100);
});

await asyncTest("is able to seek", async () => {
    let seekingDispatched: boolean,
        seekedDispatched: boolean;

    seekingDispatched = false,
        seekedDispatched = false;

    videoEl.addEventListener("seeking", () => {
        seekingDispatched = true;
    });
    videoEl.addEventListener("seeked", () => {
        seekedDispatched = true;
    });

    videoEl.currentTime = 4;
    await waitUntil(() => seekingDispatched === true);
    await waitUntil(() => seekedDispatched === true);
    assert(videoEl.currentTime === 4);
});

await asyncTest("ends video correctly", async () => {
    let ended = false, isVideoAbleToPlay = videoEl.readyState > 1;
    videoEl.addEventListener("ended", () => {
        ended = true;
    });
    videoEl.addEventListener("loadeddata", () => {
        isVideoAbleToPlay = true;
    });

    await waitUntil(() => isVideoAbleToPlay === true);
    videoEl.play();
    assert(ended === false);
    await delay(10000);
    assert(Boolean(ended) === true);
});
