import express from 'express';
import axios from 'axios';
import { load } from 'cheerio';
import { BASE_URL } from '../constants.js';
import { USER_AGENT } from '../utils.js';
import { generateEncryptAjaxParameters, decryptEncryptAjaxResponse } from './extractors/encryption.js';
const router = express.Router();

const scrapeMP4 = async ({ slug, episode }) => {
    let sources = [];
    let sources_bk = [];
    let streamsb = [];
    try {
        let epPage, server, $, serverUrl;
        if (slug) {
            console.log(`${BASE_URL}/${slug}-episode-${episode}`)
            epPage = await axios.get(`${BASE_URL}/${slug}-episode-${episode}`);
            $ = load(epPage.data);
            server = $('#load_anime > div > div > iframe').attr('src');
            serverUrl = new URL('https:' + server);
        } else throw Error("Episode id not found")
        let prev = $(".anime_video_body_episodes_l")
        let next = $(".anime_video_body_episodes_r");
        prev = prev.children("a").text() ? true : false;
        next = next.children("a").text() ? true : false;
        const goGoServerPage = await axios.get(serverUrl.href, {
            headers: { 'User-Agent': USER_AGENT },
        });
        const $$ = load(goGoServerPage.data);
        const params = await generateEncryptAjaxParameters(
            $$,
            serverUrl.searchParams.get('id')
        );

        const fetchRes = await axios.get(
            `
        ${serverUrl.protocol}//${serverUrl.hostname}/encrypt-ajax.php?${params}`, {
            headers: {
                'User-Agent': USER_AGENT,
                'X-Requested-With': 'XMLHttpRequest',
            },
        }
        );

        const res = decryptEncryptAjaxResponse(fetchRes.data);

        if (!res.source) return { error: 'No sources found!! Try different source.' };
        res.source.forEach((source) => sources.push(source));
        res.source_bk.forEach((source) => sources_bk.push(source));
        streamsb.push({ link: res.linkiframe });

        return {
            Referer: serverUrl.href,
            sources: sources,
            sources_bk: sources_bk,
            streamsb: streamsb,
            prev: prev,
            next: next
        };
    } catch (err) {
        return { error: err };
    }
};

router.get('/', async (req, res) => {
    try {
        const slug = req.query.slug;
        const episode = req.query.episode;

        const data = await scrapeMP4({ slug: slug, episode: episode });

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
});


export { router };