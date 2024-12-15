import { assert } from "chai";
import createTestSuite from "../setup";
import type { HelperFns } from "../../lib/TestSuite";

export default function WebAudio(
    suiteName: string,
    src: string,
) {
    let durationInMs: number;
    let seekTimeInSeconds: number;

    const setup = async ({ waitUntil }: HelperFns) => {
        let context: AudioContext | undefined;
        let source: MediaElementAudioSourceNode | undefined;
        let buttonClicked = false;

        const buttonEl = document.createElement("button");
        buttonEl.innerText = "Click to start tests";
        const mediaEl = document.createElement("audio");
        mediaEl.src = src;
        document.body.appendChild(buttonEl);
        document.body.appendChild(mediaEl);

        buttonEl.addEventListener("click", async () => {
            buttonClicked = true;
            context = new AudioContext();
            source = context.createMediaElementSource(mediaEl);
            source.connect(context.destination);
        });

        try {
            await waitUntil(() => buttonClicked === true);
        } catch (e) {
            if ((e as Error).message === "Timed out waiting for condition") {
                console.log("test was not initiated by clicking on the button. all tests will fail.");
            }
        }

        return { context, source, buttonEl, mediaEl };
    }

    function teardown(
        { source, context, buttonEl, mediaEl }: Awaited<ReturnType<typeof setup>>
    ) {
        source?.disconnect();
        context?.close();
        mediaEl.remove();
        buttonEl.remove();
    };

    const suite = createTestSuite(suiteName, setup, teardown);

    suite.addTest("supports webaudio", () => {
        const supported = 'webkitAudioContext' in window || 'AudioContext' in window;
        assert(supported === true);
    });

    suite.addTest("is able to play", async (props, { waitUntil }) => {
        let playDispatched = false;
        props.mediaEl.addEventListener("play", () => {
            playDispatched = true;
        });

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
        let seekingDispatched: boolean,
            seekedDispatched: boolean;

        durationInMs = props.mediaEl.duration;
        seekTimeInSeconds = Math.floor(durationInMs / 2);

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

