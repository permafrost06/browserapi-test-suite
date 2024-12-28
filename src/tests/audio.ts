import HTMLMediaElement from "./HTMLMediaElement";
import WebAudio from "./WebAudio";
import sampleAudioFile from "../../test-files/sample-9s.mp3?inline";

const localAudioFile = sampleAudioFile;
export const localAudioTest = HTMLMediaElement(
    "localAudioTest",
    "audio",
    localAudioFile,
);

const remoteAudioFile = "https://samplelib.com/lib/preview/mp3/sample-9s.mp3";
export const remoteAudioTest = HTMLMediaElement(
    "remoteAudioTest",
    "audio",
    remoteAudioFile,
);

export const localWebAudioTest = WebAudio(
    "localWebAudioTest",
    localAudioFile,
);

