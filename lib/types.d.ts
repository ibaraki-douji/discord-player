import Queue from "./structures/Queue";
export interface Options {
    leaveOnEnd?: boolean;
    leaveOnEmpty?: boolean;
}
export interface PlayerEvents {
    trackStart: [DataTrack, Queue];
    trackEnd: [DataTrack, Queue];
    pause: [DataTrack, Queue];
    play: [DataTrack, Queue];
    queueEnd: [Queue];
    addTrack: [DataTrack, Queue];
    trackSkipped: [DataTrack, Queue];
}
export interface DataTrack {
    title: string;
    description: string;
    author: string;
    url: string;
    thumbnail: string;
    duration: string;
    audio: {
        length: number;
        streamURL: string;
    };
}
export interface PartialTrack {
    title: string;
    author: string;
    url: string;
    thumbnail: string;
    duration: string;
}
