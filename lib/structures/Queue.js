"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
class Queue {
    t = [];
    p;
    voiceConnection = null;
    dispatcher;
    constructor(player) {
        this.p = player;
    }
    add(track) {
        this.t.push(track);
        if (this.player.events["addTrack"])
            this.player.events["addTrack"](track.data, this);
        if (this.t.length == 1)
            this._startTrack();
    }
    pause() {
        this.dispatcher.pause(true);
        if (this.player.events["pause"])
            this.player.events["pause"](this.t[0].data, this);
    }
    resume() {
        this.dispatcher.resume();
        if (this.player.events["play"])
            this.player.events["play"](this.t[0].data, this);
    }
    skip() {
        this.dispatcher.end();
        if (this.player.events["trackSkipped"])
            this.player.events["trackSkipped"](this.t[0].data, this);
    }
    clearQueue() {
        const current = this.t.shift();
        this.t = [current];
    }
    stop() {
        this.clearQueue();
        this.dispatcher.end();
    }
    _startTrack() {
        if (this.t.length == 0) {
            if (this.player.options.leaveOnEnd)
                this.voiceConnection.channel.leave();
            return;
        }
        const track = this.t[0];
        if (this.voiceConnection == null)
            return;
        this.dispatcher = this.voiceConnection.play(this.t[0].data.audio);
        this.dispatcher.on("start", () => {
            if (this.player.events['trackStart'])
                this.player.events['trackStart'](this.t[0].data, this);
        });
        this.dispatcher.on("finish", () => {
            if (this.player.events['trackEnd'])
                this.player.events['trackEnd'](this.t[0].data, this);
            this.t.shift();
            this._startTrack();
        });
    }
    get currentTimeMilli() { return (() => { try {
        return this.dispatcher.streamTime;
    }
    catch (e) {
        return -1;
    } })(); }
    ;
    get currentTime() {
        if (this.currentTimeMilli == -1)
            return "-1";
        const ts = this.currentTimeMilli / 1000;
        let end = "";
        end += Math.floor(ts / 60) + ":" + ((Math.floor(ts % 60) + "").length == 1 ? "0" + (Math.floor(ts % 60) + "") : Math.floor(ts % 60));
        return end;
    }
    get totalTime() { return (() => { try {
        return this.t[0].data.duration;
    }
    catch (e) {
        return "-1";
    } })(); }
    ;
    get totalTimeMilli() {
        if (this.totalTime == "-1")
            return -1;
        let t = this.totalTime.split(":");
        t = t.reverse();
        let tot = 0;
        for (let p in t) {
            tot += +t[p] * (p == "0" ? 1 : Math.pow(60, +p));
        }
        tot *= 1000;
        return tot;
    }
    get reamingTimeMilli() { return this.totalTimeMilli - this.currentTimeMilli; }
    get playing() { return (this.dispatcher ? !this.dispatcher.paused : false); }
    get tracks() {
        return this.t;
    }
    get player() {
        return this.p;
    }
    get guild() {
        return this.player.client.guilds.cache.get(this.player.queues.keyArray().find(key => this.player.queues.get(key) === this));
    }
}
exports.Queue = Queue;
exports.default = Queue;
