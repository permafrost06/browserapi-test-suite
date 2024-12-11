import HTMLMediaElement from "./HTMLMediaElement";

const seekTimeInSeconds = 4;

const localAudioFile = "/sample-9s.mp3";
export const localAudioTest = HTMLMediaElement(
    "localAudioTest",
    "audio",
    localAudioFile,
    seekTimeInSeconds,
);

const remoteAudioFile = "https://samplelib.com/lib/preview/mp3/sample-9s.mp3";
export const remoteAudioTest = HTMLMediaElement(
    "remoteAudioTest",
    "audio",
    remoteAudioFile,
    seekTimeInSeconds,
);
