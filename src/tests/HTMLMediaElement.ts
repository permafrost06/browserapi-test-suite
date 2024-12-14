import { assert } from "chai";
import TestSuite from "../setup";

export default function HTMLMediaElement(
    suiteName: string,
    type: "audio" | "video",
    src: string,
) {
    const suite = TestSuite(suiteName);
    let durationInMs: number;
    let seekTimeInSeconds: number;

    suite.setup(() => {
        const mediaEl = document.createElement(type);
        mediaEl.src = src;
        mediaEl.id = "test_" + type;
        mediaEl.controls = true;
        mediaEl.muted = true;
        document.body.appendChild(mediaEl);
        durationInMs = mediaEl.duration;
        seekTimeInSeconds = Math.floor(durationInMs * .5);

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

        props.mediaEl.currentTime = seekTimeInSeconds;
        await waitUntil(() => seekingDispatched === true);
        await waitUntil(() => seekedDispatched === true);
        assert(props.mediaEl.currentTime === seekTimeInSeconds);
    });

    suite.addTest("ends media correctly", async (props, { waitUntil, delay }, logComment) => {
        let ended = false;
        props.mediaEl.addEventListener("ended", () => {
            ended = true;
        });

        try {
            await waitUntil(() => props.mediaEl.readyState >= 5);
        } catch (e) {
            if ((e as Error).message === "Timed out waiting for condition") {
                logComment("media taking a long time to finish loading. test may be flaky");
            }
        }

        props.mediaEl.play();
        assert(ended === false);
        const timeToMediaEnd = (
            (durationInMs - props.mediaEl.currentTime) + 1
        ) * 1000;
        await delay(timeToMediaEnd);
        assert(Boolean(ended) === true);
    });

    return suite;
}

