"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Track = void 0;
class Track {
    p;
    d;
    constructor(player, data) {
        this.p = player;
        this.d = data;
    }
    get queue() {
        return this.player.queues.find((q) => q.tracks.includes(this));
    }
    get player() {
        return this.p;
    }
    get data() { return this.d; }
    ;
}
exports.Track = Track;
exports.default = Track;
