import Player from "../Player";
import { DataTrack } from "../types";
export declare class Track {
    private p;
    private d;
    constructor(player: Player, data: DataTrack);
    get queue(): import("./Queue").Queue;
    get player(): Player;
    get data(): DataTrack;
}
export default Track;
