import { assert } from "chai";
import TestSuite from "../setup";

const suite = TestSuite();

suite.setup(() => {
    const videoEl = document.createElement("video");
    videoEl.src = "/sample-10s.mp4";
    videoEl.id = "test_video";
    videoEl.controls = true;
    videoEl.muted = true;
    document.body.appendChild(videoEl);

    return { videoEl };
});

suite.teardown(() => {
    document.body.replaceChildren();
});

suite.addTest("supports video", (props) => {
    assert(!!props.videoEl.canPlayType === true);
});

suite.addTest("is able to play", async (props, { waitUntil }) => {
    let playDispatched = false;
    props.videoEl.addEventListener("play", () => {
        playDispatched = true;
    });
    let loadeddataDispatched = false;
    props.videoEl.addEventListener("loadeddata", () => {
        loadeddataDispatched = true;
    });

    await waitUntil(() => loadeddataDispatched === true);
    props.videoEl.play();
    assert(props.videoEl.paused === false);

    await waitUntil(() => playDispatched === true, 100, 1000);
});

suite.addTest("is able to pause", async (props, { waitUntil }) => {
    let pauseDispatched = false;
    props.videoEl.addEventListener("pause", () => {
        pauseDispatched = true;
    });

    props.videoEl.pause();
    assert(props.videoEl.paused === true);

    await waitUntil(() => pauseDispatched === true);
});

suite.addTest("is able to seek", async (props, { waitUntil }) => {
    let seekingDispatched: boolean,
        seekedDispatched: boolean;

    seekingDispatched = false;
        seekedDispatched = false;

    props.videoEl.addEventListener("seeking", () => {
        seekingDispatched = true;
    });
    props.videoEl.addEventListener("seeked", () => {
        seekedDispatched = true;
    });

    props.videoEl.currentTime = 4;
    await waitUntil(() => seekingDispatched === true);
    await waitUntil(() => seekedDispatched === true);
    assert(props.videoEl.currentTime === 4);
});

suite.addTest("ends video correctly", async (props, { waitUntil, delay }) => {
    let ended = false, isVideoAbleToPlay = props.videoEl.readyState > 1;
    props.videoEl.addEventListener("ended", () => {
        ended = true;
    });
    props.videoEl.addEventListener("loadeddata", () => {
        isVideoAbleToPlay = true;
    });

    await waitUntil(() => isVideoAbleToPlay === true);
    props.videoEl.play();
    assert(ended === false);
    await delay(10000);
    assert(Boolean(ended) === true);
});

export default suite;
