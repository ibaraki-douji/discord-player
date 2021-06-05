import { VoiceConnection } from "discord.js";
import Player from "../Player";
import Track from "./Track";
export declare class Queue {
    private t;
    private p;
    voiceConnection: VoiceConnection;
    private dispatcher;
    constructor(player: Player);
    add(track: Track): void;
    pause(): void;
    resume(): void;
    skip(): void;
    clearQueue(): void;
    stop(): void;
    private _startTrack;
    get currentTimeMilli(): number;
    get currentTime(): string;
    get totalTime(): string;
    get totalTimeMilli(): number;
    get reamingTimeMilli(): number;
    get playing(): boolean;
    get tracks(): Track[];
    get player(): Player;
    get guild(): import("discord.js").Guild;
}
export default Queue;
