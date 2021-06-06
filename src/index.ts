import { Client } from 'discord.js';
import Player from './Player'
import Util from './utils/Util'

const client: ClientPlayer = new Client();
client.player = new Player(client);

client.on("ready", async () => {
    const g = client.guilds.cache.get("610152636385198091");
    client.player.join(g.channels.cache.get("793512602231767071"))
    client.player.add(await Util.YouTube.urlToTrack(new URL("https://www.youtube.com/watch?v=54kMy4mvomE")), g);
    console.log("ready !");
});

client.player.on("trackStart", (track, queue) => {
    console.log("Start > " + track.title)
});

client.player.on("trackEnd", (track, queue) => {
    console.log("End > " + track.title)
});

client.login("ODQ5NzQwMjQ2MzAwMzYwNzA0.YLfkRg.C8GT7foH82vZDel4ZsNxWofcZlA");

interface ClientPlayer extends Client {
    player?: Player
}