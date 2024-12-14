import HTMLMediaElement from "./HTMLMediaElement";

const localVideoFile = "/sample-10s.mp4";
export const localVideoTest = HTMLMediaElement(
    "localVideoTest",
    "video",
    localVideoFile,
);

const remoteVideoFile = "https://samplelib.com/lib/preview/mp4/sample-10s.mp4";
export const remoteVideoTest = HTMLMediaElement(
    "remoteVideoTest",
    "video",
    remoteVideoFile,
);
