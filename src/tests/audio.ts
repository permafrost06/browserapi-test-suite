import HTMLMediaElement from "./HTMLMediaElement";

const localAudioFile = "/sample-9s.mp3";
const localAudioDurationInMs = 10000;
export const localAudioTest = HTMLMediaElement("audio", localAudioFile, localAudioDurationInMs);

const remoteAudioFile = "https://samplelib.com/lib/preview/mp3/sample-9s.mp3";
const remoteAudioDurationInMs = 10000;
export const remoteAudioTest = HTMLMediaElement("audio", remoteAudioFile, remoteAudioDurationInMs);
