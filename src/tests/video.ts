import HTMLMediaElement from "./HTMLMediaElement";
import sampleVideoFile from "../../test-files/sample-10s.mp4";

const localVideoFile = sampleVideoFile;
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
