import { Client, Collection, Guild, GuildChannel, GuildMember, Message, VoiceChannel, VoiceConnection } from 'discord.js';
import Queue from './structures/Queue';
import { DataTrack, Options, PlayerEvents } from './types';
export declare class Player {
    client: Client;
    options: Options;
    events: Array<(...args: any) => void>;
    private q;
    constructor(client: Client, options?: Options);
    on<T extends keyof PlayerEvents>(event: T, listener: (...args: PlayerEvents[T]) => void): void;
    removeListener<T extends keyof PlayerEvents>(event: T): void;
    add(track: DataTrack, g: Guild | GuildChannel | Message): Promise<void>;
    skip(g: Guild | GuildChannel | Message): void;
    pause(g: Guild | GuildChannel | Message): void;
    resume(g: Guild | GuildChannel | Message): void;
    getQueue(g: Guild | GuildChannel | Message): Queue;
    private _getGuild;
    join(c: VoiceChannel | GuildChannel | GuildMember): Promise<VoiceConnection>;
    get queues(): Collection<string, Queue>;
}
export default Player;
