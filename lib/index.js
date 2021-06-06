"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Player_1 = require("./Player");
const Util_1 = require("./utils/Util");
const client = new discord_js_1.Client();
client.player = new Player_1.default(client);
client.on("ready", async () => {
    const g = client.guilds.cache.get("610152636385198091");
    client.player.join(g.channels.cache.get("793512602231767071"));
    client.player.add(await Util_1.default.YouTube.urlToTrack(new URL("https://www.youtube.com/watch?v=54kMy4mvomE")), g);
    console.log("ready !");
});
client.player.on("trackStart", (track, queue) => {
    console.log("Start > " + track.title);
});
client.player.on("trackEnd", (track, queue) => {
    console.log("End > " + track.title);
});
client.login("ODQ5NzQwMjQ2MzAwMzYwNzA0.YLfkRg.C8GT7foH82vZDel4ZsNxWofcZlA");
