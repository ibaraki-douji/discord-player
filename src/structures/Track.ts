import Player from "../Player";
import { DataTrack } from "../types";

export class Track {

    private p: Player;
    private d: DataTrack;

    constructor (player: Player, data: DataTrack) {
        this.p = player;
        this.d = data;
    }

    public get queue() {
        return this.player.queues.find((q) => q.tracks.includes(this));
    }

    public get player() {
        return this.p;
    }

    public get data() {return this.d};

}
export default Track;