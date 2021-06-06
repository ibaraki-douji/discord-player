import axios from "axios";
import { StreamDispatcher, VoiceBroadcast, VoiceConnection } from "discord.js";
import { Readable } from "stream";
import Player from "../Player";
import Track from "./Track";

export class Queue {

    private t: Array<Track> = [];
    private p: Player;
    public voiceConnection: VoiceConnection = null;
    private dispatcher: StreamDispatcher;

    constructor(player: Player) {
        this.p = player;
        
    }

    public add(track: Track) {
        this.t.push(track);
        if (this.player.events["addTrack"]) this.player.events["addTrack"](track.data, this);
        if (this.t.length == 1) this._startTrack();
    }

    public pause() {
        this.dispatcher.pause(true);
        if (this.player.events["pause"]) this.player.events["pause"](this.t[0].data, this);
    }

    public resume() {
        this.dispatcher.resume();
        if (this.player.events["play"]) this.player.events["play"](this.t[0].data, this);
    }

    public skip() {
        this.dispatcher.end();
        if (this.player.events["trackSkipped"]) this.player.events["trackSkipped"](this.t[0].data, this);
    }

    public clearQueue() {
        const current = this.t.shift()
        this.t = [current];
    }

    public stop() {
        this.clearQueue();
        this.dispatcher.end();
    }

    private async _startTrack() {
        if (this.t.length == 0) {
            if (this.player.options.leaveOnEnd) this.voiceConnection.channel.leave();
            return;
        }
        const track = this.t[0];
        if (this.voiceConnection == null) return;
        this.dispatcher = this.voiceConnection.play(track.data.audio.streamURL);
        this.dispatcher.on("start", () => {
            if (this.player.events['trackStart']) this.player.events['trackStart'](track.data, this);
        });

        this.dispatcher.on("finish", () => {
            if (this.player.events['trackEnd']) this.player.events['trackEnd'](track.data, this);
            this.t.shift();
            this._startTrack();
        });
    }

    public get currentTimeMilli() {return (() => {try {return this.dispatcher.streamTime} catch (e) {return -1}})()};
    public get currentTime() {
        if (this.currentTimeMilli == -1) return "-1";
        const ts = this.currentTimeMilli/1000;

        let end = "";
        end += Math.floor(ts/60) + ":" + ((Math.floor(ts%60)+"").length == 1 ? "0" + (Math.floor(ts%60)+"") : Math.floor(ts%60));
        return end;
    }
    public get totalTime() {return (() => {try {return this.t[0].data.duration} catch (e) {return "-1"}})()};
    public get totalTimeMilli() {
        if (this.totalTime == "-1") return -1;
        let t = this.totalTime.split(":");
        t = t.reverse();
        let tot = 0;
        for (let p in t) {
            tot += +t[p]*(p == "0" ? 1 : Math.pow(60, +p));
        }
        tot*=1000;
        return tot;
    }
    public get reamingTimeMilli() {return this.totalTimeMilli-this.currentTimeMilli;}

    public get playing() {return (this.dispatcher ? !this.dispatcher.paused : false)}



    public get tracks() {
        return this.t;
    }

    public get player() {
        return this.p;
    }

    public get guild() {
        return this.player.client.guilds.cache.get(this.player.queues.keyArray().find(key => this.player.queues.get(key) === this));
    }



}
export default Queue;