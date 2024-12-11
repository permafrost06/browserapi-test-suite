import { assert } from "chai";
import TestSuite from "../setup";

export default function HTMLMediaElement(
    type: "audio" | "video",
    src: string,
    mediaDurationInMs: number
) {
    const suite = TestSuite();

    suite.setup(() => {
        const mediaEl = document.createElement(type);
        mediaEl.src = src;
        mediaEl.id = "test_" + type;
        mediaEl.controls = true;
        mediaEl.muted = true;
        document.body.appendChild(mediaEl);

        return { mediaEl };
    });

    suite.teardown(() => {
        document.body.replaceChildren();
    });

    suite.addTest("supports media", (props) => {
        assert(!!props.mediaEl.canPlayType === true);
    });

    suite.addTest("is able to play", async (props, { waitUntil }) => {
        let playDispatched = false;
        props.mediaEl.addEventListener("play", () => {
            playDispatched = true;
        });
        let loadeddataDispatched = false;
        props.mediaEl.addEventListener("loadeddata", () => {
            loadeddataDispatched = true;
        });

        await waitUntil(() => loadeddataDispatched === true);
        props.mediaEl.play();
        assert(props.mediaEl.paused === false);

        await waitUntil(() => playDispatched === true, 100, 1000);
    });

    suite.addTest("is able to pause", async (props, { waitUntil }) => {
        let pauseDispatched = false;
        props.mediaEl.addEventListener("pause", () => {
            pauseDispatched = true;
        });

        props.mediaEl.pause();
        assert(props.mediaEl.paused === true);

        await waitUntil(() => pauseDispatched === true);
    });

    suite.addTest("is able to seek", async (props, { waitUntil }) => {
        let seekingDispatched: boolean,
            seekedDispatched: boolean;

        seekingDispatched = false;
        seekedDispatched = false;

        props.mediaEl.addEventListener("seeking", () => {
            seekingDispatched = true;
        });
        props.mediaEl.addEventListener("seeked", () => {
            seekedDispatched = true;
        });

        props.mediaEl.currentTime = 4;
        await waitUntil(() => seekingDispatched === true);
        await waitUntil(() => seekedDispatched === true);
        assert(props.mediaEl.currentTime === 4);
    });

    suite.addTest("ends media correctly", async (props, { waitUntil, delay }) => {
        let ended = false, isMediaAbleToPlay = props.mediaEl.readyState > 1;
        props.mediaEl.addEventListener("ended", () => {
            ended = true;
        });
        props.mediaEl.addEventListener("loadeddata", () => {
            isMediaAbleToPlay = true;
        });

        await waitUntil(() => isMediaAbleToPlay === true);
        props.mediaEl.play();
        assert(ended === false);
        await delay(mediaDurationInMs);
        assert(Boolean(ended) === true);
    });

    return suite;
}

