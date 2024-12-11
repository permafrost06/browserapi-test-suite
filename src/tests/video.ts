import HTMLMediaElement from "./HTMLMediaElement";

const localVideoFile = "/sample-10s.mp4";
const localVideoDurationInMs = 10000;
export const localVideoTest = HTMLMediaElement("video", localVideoFile, localVideoDurationInMs);

const remoteVideoFile = "https://samplelib.com/lib/preview/mp4/sample-10s.mp4";
const remoteVideoDurationInMs = 10000;
export const remoteVideoTest = HTMLMediaElement("video", remoteVideoFile, remoteVideoDurationInMs);
