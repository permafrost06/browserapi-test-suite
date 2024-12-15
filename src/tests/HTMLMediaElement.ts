import { assert } from "chai";
import createTestSuite from "../setup";

export default function HTMLMediaElement(
    suiteName: string,
    type: "audio" | "video",
    src: string,
) {
    function setup() {
        const mediaEl = document.createElement(type);
        mediaEl.src = src;
        mediaEl.id = "test_" + type;
        mediaEl.controls = true;
        mediaEl.muted = true;
        document.body.appendChild(mediaEl);

        return { mediaEl };
    }

    function teardown(props: ReturnType<typeof setup>) {
        props.mediaEl.remove();
    }

    const suite = createTestSuite(suiteName, setup, teardown);

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
        await props.mediaEl.play();
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
        let seekingDispatched = false, seekedDispatched = false;

        props.mediaEl.addEventListener("seeking", () => {
            seekingDispatched = true;
        });
        props.mediaEl.addEventListener("seeked", () => {
            seekedDispatched = true;
        });

        const seekTimeInSeconds = Math.floor(props.mediaEl.duration / 2);

        props.mediaEl.currentTime = seekTimeInSeconds;
        await waitUntil(() => seekingDispatched === true);
        await waitUntil(() => seekedDispatched === true);
        assert(props.mediaEl.currentTime === seekTimeInSeconds);
    });

    suite.addTest("ends media correctly", async (props, { waitUntil }, logComment) => {
        let ended = false;
        props.mediaEl.addEventListener("ended", () => {
            ended = true;
        });

        try {
            await waitUntil(() => props.mediaEl.readyState > 3);
        } catch (e) {
            if ((e as Error).message === "Timed out waiting for condition") {
                logComment("media taking a long time to finish loading. test may be flaky");
            }
        }

        await props.mediaEl.play();
        assert(ended === false);
        await waitUntil(() => Boolean(ended) === true);
    });

    return suite;
}

