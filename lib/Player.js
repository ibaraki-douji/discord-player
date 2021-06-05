"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const discord_js_1 = require("discord.js");
const Queue_1 = require("./structures/Queue");
const Track_1 = require("./structures/Track");
class Player {
    client;
    options;
    events = [];
    q = new discord_js_1.Collection();
    constructor(client, options = { leaveOnEmpty: true, leaveOnEnd: true }) {
        this.client = client;
        this.options = options;
        client.on("voiceStateUpdate", (oldState, newState) => {
            const queue = this.getQueue(oldState.guild);
            if (queue.voiceConnection == null)
                return;
            if (queue.voiceConnection.channel.members.filter((member) => !member.user.bot).size === 0 && options.leaveOnEmpty) {
                queue.stop();
                queue.voiceConnection.channel.leave();
                this.queues.delete(queue.guild.id);
            }
        });
    }
    on(event, listener) { this.events[event + ''] = listener; }
    removeListener(event) {
        if (this.events[event + ""])
            delete this.events[event + ""];
    }
    ;
    async add(track, g) {
        const t = new Track_1.default(this, track);
        const c = await this._getGuild(g).fetch();
        if (c.voice.channel.fetch())
            this.getQueue(c).voiceConnection = c.voice.connection;
        this.getQueue(g).add(t);
    }
    skip(g) {
        this.getQueue(g).skip();
    }
    pause(g) {
        this.getQueue(g).pause();
    }
    resume(g) {
        this.getQueue(g).resume();
    }
    getQueue(g) {
        if (!this.queues.has(this._getGuild(g).id))
            this.queues.set(this._getGuild(g).id, new Queue_1.default(this));
        return this.queues.get(this._getGuild(g).id);
    }
    _getGuild(g) {
        if (g instanceof discord_js_1.Guild) {
            return g;
        }
        else {
            return g.guild;
        }
    }
    join(c) {
        if (c instanceof discord_js_1.GuildMember) {
            return c.voice.channel.join();
        }
        else {
            if (c instanceof discord_js_1.VoiceChannel) {
                return c.join();
            }
            if (c.type == "voice")
                return c['join']();
        }
    }
    get queues() {
        return this.q;
    }
}
exports.Player = Player;
exports.default = Player;
