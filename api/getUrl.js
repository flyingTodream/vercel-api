const UNM = require("@unblockneteasemusic/rust-napi");
const executor = new UNM.Executor();
const fs = require('fs')
var exec = require('child-process-promise').exec;


const ctx = {
    enableFlac: null,
    proxyUri: null,
    searchMode: 1,
    config: {
        'joox:cookie': null,
        'qq:cookie': null,
        'ytdl:exe': null,
    },
}
function toBuffer(data) {
    if (data instanceof Buffer) {
        return data;
    } else {
        return Buffer.from(data);
    }
}

async function getBiliVideoFile(url) {
    const axios = await import('axios').then(m => m.default);
    const response = await axios.get(url, {
        headers: {
            Referer: 'https://www.bilibili.com/',
            'User-Agent': 'okhttp/3.4.1',
        },
        responseType: 'arraybuffer',
    });

    const buffer = toBuffer(response.data);
    const encodedData = buffer.toString('base64');

    return encodedData;
}
async function getPlayUrl(songName, artistsName, id) {
    const searchResult = await executor.search(
        ['ytdl', 'kugou', 'bilibili', 'pyncm', 'migu', 'kuwo',],
        {
            id: String(id),
            name: songName,
            artists: [
                {
                    id: "",
                    name: artistsName,
                },
            ],
        },
        ctx
    );
    const retrievedSong = await executor.retrieve(searchResult, ctx);
    if (retrievedSong.url.includes('bilivideo.com')) {
        retrievedSong.url = await getBiliVideoFile(retrievedSong.url);
    }

    if (retrievedSong.source === 'bilibili') {
        const path = `./acc/${id}.aac`
        const buffer = _decodeBase64(retrievedSong.url)
        await fs.writeFileSync(path, buffer)
        await execu(`./ffmpeg -i ${path} -acodec libmp3lame ./acc/${id}.mp3`)
        await execu(`rm ${path}`)
        retrievedSong.url = `https://hua.flytodream.cn/musicApi/getUrl/${id}.mp3`
    }

    return retrievedSong
}

function _decodeBase64(base64) {
    const content = base64.split(';base64,').pop()
    return Buffer.from(content, 'base64')
}

async function execu(exe) {
    await exec(exe)
        .then(function (result) {
            var stdout = result.stdout;
            // var stderr = result.stderr;
            // console.log('stdout: ', stdout);
            // console.log('stderr: ', stderr);
        })
        .catch(function (err) {
            console.error('ERROR: ', err);
        });
}

module.exports = {
    getPlayUrl,
    execu
}
