import express from 'express';
import axios from 'axios';
import { load } from 'cheerio';
import { BASE_URL } from '../constants.js';
import { generateEncryptAjaxParameters, decryptEncryptAjaxResponse } from './extractors/encryption.js';
const router = express.Router();

const scrapeMP4 = async (serverUrl) => {
    let sources = []
    const goGoServerPage = await axios.get(serverUrl.href, { headers: { 'User-Agent': USER_AGENT } })
    const $$ = load(goGoServerPage.data)
    const params = await generateEncryptAjaxParameters($$, serverUrl.searchParams.get('id'));
    const fetchRes = await axios.get(`
            ${serverUrl.protocol}//${serverUrl.hostname}/encrypt-ajax.php?${params}`, {
        headers: {
            'User-Agent': USER_AGENT,
            'Referer': serverUrl.href,
            'X-Requested-With': 'XMLHttpRequest'
        }
    })

    const res = decryptEncryptAjaxResponse(fetchRes.data)

    if (!res.source) return { error: "No source found" };



    res.source_bk.forEach(source => sources.push(source))
    res.source.forEach(source => source.file.includes("m3u8") ? sources.push(source) : sources.push({
        file: ""
    }));

    let watch = sources[0].file;
    let sr2 = sources[1] && sources[1].file.includes("m3u8") ? sources[1].file : null;
    let sourcer;
    if (sr2) {
        sourcer = sr2;
    } else {
        sourcer = watch;
    }
    return {
        Referer: serverUrl.href,
        sources: watch,
        sources2: sr2,
        all: res.source,
        sourcer: sourcer
    }




}

router.get("/", async (req, res) => {
    try {
        var slug = req.params.slug;
        var episode = req.params.episode;

        let urlx = `${BASE_URL}${slug}-episode-${episode}`;
        let ress = await axios.get(`${urlx}`);
        let $ = load(ress.data);
        link = new URL("https:" + $("li.anime").children("a").attr("data-video"));
        let prev = $(".anime_video_body_episodes_l")
        let next = $(".anime_video_body_episodes_r");
        prev = prev.children("a").text() ? `https://animexninja-api.dhvitop1.repl.co/watch/${slug}/${Number(episode) - 1}` : null;
        next = next.children("a").text() ? `https://animexninja-api.dhvitop1.repl.co/watch/${slug}/${Number(episode) + 1}` : null;


        let result = await scrapeMP4(link);
        console.table(result)

        db.set(`${id}-episode-${episode}`, {
            result: result,
        });
        return res.render("index.ejs", { result: result, prev: prev, next: next, episode: episode });

    } catch (e) {
        console.log(e)
        return res.send("404");
    }

})

export { router };