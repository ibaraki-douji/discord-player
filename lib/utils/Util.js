"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
const axios_1 = require("axios");
const stream_1 = require("stream");
const node_html_parser_1 = require("node-html-parser");
const qs = require("querystring");
const validPathDomains = /^https?:\/\/(youtu\.be\/|(www\.)?youtube.com\/(embed|v|shorts)\/)/;
const validQueryDomains = new Set([
    'youtube.com',
    'www.youtube.com',
    'm.youtube.com',
    'music.youtube.com',
    'gaming.youtube.com',
]);
const idRegex = /^[a-zA-Z0-9-_]{11}$/;
const jsVarStr = '[a-zA-Z_\\$][a-zA-Z_0-9]*';
const jsSingleQuoteStr = `'[^'\\\\]*(:?\\\\[\\s\\S][^'\\\\]*)*'`;
const jsDoubleQuoteStr = `"[^"\\\\]*(:?\\\\[\\s\\S][^"\\\\]*)*"`;
const jsQuoteStr = `(?:${jsSingleQuoteStr}|${jsDoubleQuoteStr})`;
const jsKeyStr = `(?:${jsVarStr}|${jsQuoteStr})`;
const jsPropStr = `(?:\\.${jsVarStr}|\\[${jsQuoteStr}\\])`;
const jsEmptyStr = `(?:''|"")`;
const reverseStr = ':function\\(a\\)\\{' +
    '(?:return )?a\\.reverse\\(\\)' +
    '\\}';
const sliceStr = ':function\\(a,b\\)\\{' +
    'return a\\.slice\\(b\\)' +
    '\\}';
const spliceStr = ':function\\(a,b\\)\\{' +
    'a\\.splice\\(0,b\\)' +
    '\\}';
const swapStr = ':function\\(a,b\\)\\{' +
    'var c=a\\[0\\];a\\[0\\]=a\\[b(?:%a\\.length)?\\];a\\[b(?:%a\\.length)?\\]=c(?:;return a)?' +
    '\\}';
const actionsObjRegexp = new RegExp(`var (${jsVarStr})=\\{((?:(?:${jsKeyStr}${reverseStr}|${jsKeyStr}${sliceStr}|${jsKeyStr}${spliceStr}|${jsKeyStr}${swapStr}),?\\r?\\n?)+)\\};`);
const actionsFuncRegexp = new RegExp(`${`function(?: ${jsVarStr})?\\(a\\)\\{` +
    `a=a\\.split\\(${jsEmptyStr}\\);\\s*` +
    `((?:(?:a=)?${jsVarStr}`}${jsPropStr}\\(a,\\d+\\);)+)` +
    `return a\\.join\\(${jsEmptyStr}\\)` +
    `\\}`);
const reverseRegexp = new RegExp(`(?:^|,)(${jsKeyStr})${reverseStr}`, 'm');
const sliceRegexp = new RegExp(`(?:^|,)(${jsKeyStr})${sliceStr}`, 'm');
const spliceRegexp = new RegExp(`(?:^|,)(${jsKeyStr})${spliceStr}`, 'm');
const swapRegexp = new RegExp(`(?:^|,)(${jsKeyStr})${swapStr}`, 'm');
class Util {
    static async downloadAudio(url) {
        return stream_1.Readable.from((await axios_1.default.get(url.toString(), {
            responseType: "arraybuffer"
        })).data);
    }
    static get YouTube() { return YouTube; }
}
exports.Util = Util;
class YouTube {
    static async search(query) {
        const url = new URL("https://youtube.com/results?search_query=" + query);
        const html = node_html_parser_1.parse((await axios_1.default.get(url.toString())).data);
        let data;
        for (let script of html.querySelectorAll("script")) {
            if (script.innerText.includes("var ytInitialData = ")) {
                data = JSON.parse(script.innerText.replace("var ytInitialData = ", "").slice(0, -1));
                break;
            }
        }
        const results = data.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
        const vids = [];
        for (let res of results) {
            if (res.videoRenderer)
                vids.push(res.videoRenderer);
        }
        const end = [];
        for (let vid of vids) {
            end.push({
                url: "https://youtube.com" + vid.navigationEndpoint.commandMetadata.webCommandMetadata.url,
                title: vid.title.runs[0].text,
                author: vid.ownerText.runs[0].text,
                duration: vid.lengthText.simpleText,
                thumbnail: vid.thumbnail.thumbnails[0].url
            });
        }
        return end;
    }
    static async urlToTrack(url) {
        let id;
        try {
            id = this.getURLVideoID(url.toString());
        }
        catch (e) {
            return null;
        }
        return this.toTrack((await this.search(id))[0]);
    }
    static getURLVideoID = link => {
        const parsed = new URL(link);
        let id = parsed.searchParams.get('v');
        if (validPathDomains.test(link) && !id) {
            const paths = parsed.pathname.split('/');
            id = paths[paths.length - 1];
        }
        else if (parsed.hostname && !validQueryDomains.has(parsed.hostname)) {
            throw Error('Not a YouTube domain');
        }
        if (!id) {
            throw Error(`No video id found: ${link}`);
        }
        id = id.substring(0, 11);
        if (!idRegex.test(id)) {
            throw TypeError(`Video id (${id}) does not match expected ` +
                `format (${idRegex.toString()})`);
        }
        return id;
    };
    static async toTrack(partial) {
        const html = node_html_parser_1.parse((await axios_1.default.get(partial.url)).data);
        let data;
        for (let script of html.querySelectorAll("script")) {
            if (script.innerText.includes("var ytInitialPlayerResponse = ")) {
                data = JSON.parse(script.innerText.replace("var ytInitialPlayerResponse = ", "").slice(0, -1));
                break;
            }
        }
        let sign = data.streamingData.adaptiveFormats.sort((a, b) => b.birate - a.birate).find((e) => {
            if (e.mimeType == "audio/webm; codecs=\"opus\"")
                return e;
        });
        let url = (sign.url ? sign.url : "");
        if (url == "") {
            const tokens = await this.getTokens(new URL(this.getHTML5player((await axios_1.default.get(partial.url)).data), "https://www.youtube.com/watch?v=").toString());
            const format = qs.parse(sign.signatureCipher);
            const sig = tokens ? this.decipher(tokens, format.s) : null;
            url = this.setDownloadURL(format, sig);
        }
        return {
            title: partial.title,
            author: partial.author,
            duration: partial.duration,
            thumbnail: partial.thumbnail,
            url: partial.url,
            description: data.videoDetails.shortDescription,
            audio: await Util.downloadAudio(new URL(url))
        };
    }
    static getHTML5player = body => {
        let html5playerRes = /<script\s+src="([^"]+)"(?:\s+type="text\/javascript")?\s+name="player_ias\/base"\s*>|"jsUrl":"([^"]+)"/
            .exec(body);
        return html5playerRes ? html5playerRes[1] || html5playerRes[2] : null;
    };
    static setDownloadURL = (format, sig) => {
        let decodedUrl;
        if (format.url) {
            decodedUrl = format.url;
        }
        else {
            return;
        }
        try {
            decodedUrl = decodeURIComponent(decodedUrl);
        }
        catch (err) {
            return;
        }
        // Make some adjustments to the final url.
        const parsedUrl = new URL(decodedUrl);
        // This is needed for a speedier download.
        // See https://github.com/fent/node-ytdl-core/issues/127
        parsedUrl.searchParams.set('ratebypass', 'yes');
        if (sig) {
            // When YouTube provides a `sp` parameter the signature `sig` must go
            // into the parameter it specifies.
            // See https://github.com/fent/node-ytdl-core/issues/417
            parsedUrl.searchParams.set(format.sp || 'signature', sig);
        }
        format.url = parsedUrl.toString();
        return format.url;
    };
    static swapHeadAndPosition = (arr, position) => {
        const first = arr[0];
        arr[0] = arr[position % arr.length];
        arr[position] = first;
        return arr;
    };
    static decipher = (tokens, sig) => {
        sig = sig.split('');
        for (let i = 0, len = tokens.length; i < len; i++) {
            let token = tokens[i], pos;
            switch (token[0]) {
                case 'r':
                    sig = sig.reverse();
                    break;
                case 'w':
                    pos = ~~token.slice(1);
                    sig = YouTube.swapHeadAndPosition(sig, pos);
                    break;
                case 's':
                    pos = ~~token.slice(1);
                    sig = sig.slice(pos);
                    break;
                case 'p':
                    pos = ~~token.slice(1);
                    sig.splice(0, pos);
                    break;
            }
        }
        return sig.join('');
    };
    static async getTokens(html5playerfile) {
        const body = (await axios_1.default.get(html5playerfile)).data;
        const tokens = this.extractActions(body);
        if (!tokens || !tokens.length) {
            throw Error('Could not extract signature deciphering actions');
        }
        return tokens;
    }
    ;
    static extractActions = body => {
        const objResult = actionsObjRegexp.exec(body);
        const funcResult = actionsFuncRegexp.exec(body);
        if (!objResult || !funcResult) {
            return null;
        }
        const obj = objResult[1].replace(/\$/g, '\\$');
        const objBody = objResult[2].replace(/\$/g, '\\$');
        const funcBody = funcResult[1].replace(/\$/g, '\\$');
        let result = reverseRegexp.exec(objBody);
        const reverseKey = result && result[1]
            .replace(/\$/g, '\\$')
            .replace(/\$|^'|^"|'$|"$/g, '');
        result = sliceRegexp.exec(objBody);
        const sliceKey = result && result[1]
            .replace(/\$/g, '\\$')
            .replace(/\$|^'|^"|'$|"$/g, '');
        result = spliceRegexp.exec(objBody);
        const spliceKey = result && result[1]
            .replace(/\$/g, '\\$')
            .replace(/\$|^'|^"|'$|"$/g, '');
        result = swapRegexp.exec(objBody);
        const swapKey = result && result[1]
            .replace(/\$/g, '\\$')
            .replace(/\$|^'|^"|'$|"$/g, '');
        const keys = `(${[reverseKey, sliceKey, spliceKey, swapKey].join('|')})`;
        const myreg = `(?:a=)?${obj}(?:\\.${keys}|\\['${keys}'\\]|\\["${keys}"\\])` +
            `\\(a,(\\d+)\\)`;
        const tokenizeRegexp = new RegExp(myreg, 'g');
        const tokens = [];
        while ((result = tokenizeRegexp.exec(funcBody)) !== null) {
            let key = result[1] || result[2] || result[3];
            switch (key) {
                case swapKey:
                    tokens.push(`w${result[4]}`);
                    break;
                case reverseKey:
                    tokens.push('r');
                    break;
                case sliceKey:
                    tokens.push(`s${result[4]}`);
                    break;
                case spliceKey:
                    tokens.push(`p${result[4]}`);
                    break;
            }
        }
        return tokens;
    };
}
exports.default = Util;
