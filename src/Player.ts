import { Client, Collection, Guild, GuildChannel, GuildMember, Message, Snowflake, VoiceChannel, VoiceConnection } from 'discord.js'
import Queue from './structures/Queue';
import Track from './structures/Track';
import { DataTrack, Options, PlayerEvents } from './types';

export class Player {

    public client: Client;
    public options: Options;
    public events: Array<(...args: any) => void> = [];
    private q: Collection<Snowflake, Queue> = new Collection();

    constructor(client: Client, options: Options = {leaveOnEmpty: true, leaveOnEnd: true}) {
        this.client = client;
        this.options = options;

        client.on("voiceStateUpdate", (oldState, newState) => {
            const queue = this.getQueue(oldState.guild);
            if (queue.voiceConnection == null) return;
            if ((queue.voiceConnection.channel as VoiceChannel).members.filter((member) => !member.user.bot).size === 0 && options.leaveOnEmpty) {
                queue.stop();
                (queue.voiceConnection.channel as VoiceChannel).leave();
                this.queues.delete(queue.guild.id);
            }
        });
    }

    public on<T extends keyof PlayerEvents>(event: T, listener: (...args: PlayerEvents[T]) => void): void {this.events[event+''] = listener;}
    public removeListener<T extends keyof PlayerEvents>(event: T) {
        if (this.events[event+""]) delete this.events[event+""];
    };

    public async add(track: DataTrack, g: Guild | GuildChannel | Message) {
        const t = new Track(this, track);
        const c = await this._getGuild(g).fetch();
        if (c.voice.channel.fetch()) this.getQueue(c).voiceConnection = c.voice.connection;
        this.getQueue(g).add(t);
    }

    public skip(g: Guild | GuildChannel | Message) {
        this.getQueue(g).skip();
    }

    public pause(g: Guild | GuildChannel | Message) {
        this.getQueue(g).pause();
    }

    public resume(g: Guild | GuildChannel | Message) {
        this.getQueue(g).resume();
    }

    public getQueue(g: Guild | GuildChannel | Message) {
        if (!this.queues.has(this._getGuild(g).id)) this.queues.set(this._getGuild(g).id, new Queue(this));
        return this.queues.get(this._getGuild(g).id);
    }

    private _getGuild(g: Guild | GuildChannel | Message): Guild {
        if (g instanceof Guild) {
            return g;
        } else {
            return g.guild;
        }
    }

    public join(c: VoiceChannel | GuildChannel | GuildMember): Promise<VoiceConnection> {
        if (c instanceof GuildMember) {
            return c.voice.channel.join();
        } else {
            if (c instanceof VoiceChannel) {
                return c.join();
            }
            if (c.type == "voice") return c['join']();
        }
    }

    public get queues() {
        return this.q;
    }

}

export default Player;