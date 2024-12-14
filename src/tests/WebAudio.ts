import { assert } from "chai";
import createTestSuite from "../setup";

export default function WebAudio(
    suiteName: string,
    src: string,
) {
    const suite = createTestSuite(suiteName, async ({ waitUntil }) => {
        let context: AudioContext | undefined;
        let source: AudioBufferSourceNode | undefined;
        let buttonClicked = false;

        const button = document.createElement("button");
        button.innerText = "Click to start tests";
        button.addEventListener("click", async () => {
            buttonClicked = true;
            context = new AudioContext();
            source = context.createBufferSource();
            const audioBuffer = await fetch(src)
                .then(res => res.arrayBuffer())
                .then(ArrayBuffer => context!.decodeAudioData(ArrayBuffer));

            source.buffer = audioBuffer;
            source.connect(context.destination);
        });
        document.body.appendChild(button);

        try {
            await waitUntil(() => buttonClicked === true);
        } catch (e) {
            if ((e as Error).message === "Timed out waiting for condition") {
                console.log("test was not initiated by clicking on the button. all tests will fail.");
            }
        }

        return { context, source, button } as {
            context: AudioContext;
            source: AudioBufferSourceNode;
            button: HTMLButtonElement;
        };
    });

    suite.teardown(({ source, context, button }) => {
        source.disconnect();
        context.close();
        button.remove();
    });

    suite.addTest("supports webaudio", () => {
        const supported = 'webkitAudioContext' in window || 'AudioContext' in window;
        assert(supported === true);
    });

    suite.addTest("is able to play", async ({ context, source }, { delay }) => {
        source.start();

        const t1 = context.currentTime;
        await delay(2000);
        const t2 = context.currentTime;

        assert(t2 > t1);
    });

    return suite;
}

