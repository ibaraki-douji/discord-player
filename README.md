# Discord Player
A simple discord music player with a custom YouTube downloader
## Getting started
`npm i @ibaraki-douji/discord-player --save`

## Usage

For all types like `DataTrack` or `PartialTrack` look at the en of this readme

### Start the player
```js
const { Player } = require('@ibaraki-douji/discord-player')
const Discord = require('discord.js')

const client = new Discord.Client();
client.player = new Player(client); // Now you can just do client.player to have access to the discord player
```
for typescript you can do that
```ts
import { Client } from 'discord.js';
import { Player } from '@ibaraki-douji/discord-player';

const client: ClientPlayer = new Client();
client.player = new Player(client);

interface ClientPlayer extends Client {
    player?: Player
}
```
### YouTube API
```js
const { Util } = require('@ibaraki-douji/discord-player');
const YouTube = Util.YouTube;

YouTube.search("search a thing").then((res) => {
    console.log(res);
    //return an array of PartialTrack
});

YouTube.urlToTrack(new URL("YT URL")).then(res => {
    console.log(res);
    //retuen a DataTrack
})

YouTube.toTrack(partialTrack).then(res => {
    console.log(res);
    //retuen a DataTrack
})
```

### Join a VoiceChannel
```js
client.player.join(arg);
```
The arg can be a GuildMember or a GuildChannel or a VoiceChannel

### Add a track to the Queue
Make sure the bot is in a VoiceChannel before execute this function.
```js
client.player.add(dataTrack, g);
// A full one can be
const g = client.guilds.cache.get("guildID");
client.player.add(await Util.YouTube.urlToTrack(new URL("https://www.youtube.com/watch?v=54kMy4mvomE")), g);
```
The `g` can be a Guild or a GuildChannel or a Message

### Manage Audio
```js
const g = client.guilds.cache.get("guildID");

client.player.pause(g); // PAUSE THE MUSIC
client.player.resume(g); // RESUME THE PAUSED MUSIC
client.player.skip(g); // SKIP THE AUDIO
```
The `g` can be a Guild or a GuildChannel or a Message

### Queue functions
```js
const g = client.guilds.cache.get("guildID");
const queue = client.player.getQueue(g);

// the functions `pause`, `resume`, `skip` are used above

queue.clearQueue(); // CLEAR THE QUEUE
queue.stop(); // CREAR QUEUE + STOP PLAYING
queue.tracks; // ARRAY OF TRACKS
queue.playing; // IS PLAYNIG
queue.currentTime; // CURRENT TIME OF THE MUSIC (formated mm:ss)
queue.currentTimeMilli; // CURRENT TIME IN MILLISECONDS
queue.totalTime; // TOTAL TIME OF THE MUSIC (formated mm:ss)
queue.totalTimeMilli; // TOTAL TIME IN MILLISECONDS
```

## Events
### Add Event
```js
client.player.on('event', (args) => {
    // DO SOMETHING
});
```
### Remove Event
```js
client.player.removeListener('event');
```
### Event List

| Event | Arguments |
| ------ | ------ |
| trackStart | DataTrack, Queue |
| trackEnd | DataTrack, Queue |
| pause | DataTrack, Queue |
| play | DataTrack, Queue |
| queueEnd | Queue |
| addTrack | DataTrack, Queue |
| trackSkipped | DataTrack, Queue |

## Types
```ts
export interface DataTrack {
    title: string,
    description: string,
    author: string,
    url: string,
    thumbnail: string,
    duration: string,
    audio: {
        length: number,
        streamURL: string
    }
}

export interface PartialTrack {
    title: string,
    author: string,
    url: string,
    thumbnail: string,
    duration: string
}

export interface Track {
    queue: Queue,
    player: Player,
    data: DataTrack
}
```