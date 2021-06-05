/// <reference types="node" />
import { Readable } from "stream";
import { DataTrack, PartialTrack } from "../types";
export declare class Util {
    static downloadAudio(url: URL): Promise<Readable>;
    static get YouTube(): typeof YouTube;
}
declare class YouTube {
    static search(query: string): Promise<PartialTrack[]>;
    static urlToTrack(url: URL): Promise<DataTrack>;
    private static getURLVideoID;
    static toTrack(partial: PartialTrack): Promise<DataTrack>;
    private static getHTML5player;
    private static setDownloadURL;
    private static swapHeadAndPosition;
    private static decipher;
    private static getTokens;
    private static extractActions;
}
export default Util;
