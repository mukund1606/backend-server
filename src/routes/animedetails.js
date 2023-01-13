import express from 'express';
import axios from 'axios';
import { load } from 'cheerio';
import { BASE_URL, list_episodes_url } from '../constants.js';
const router = express.Router();

const scrapeAnimeDetails = async({ slug }) => {
    try {
        let genres = [];
        let epList = [];
        console.log(`${BASE_URL}category/${slug}`);

        const animePageTest = await axios.get(`${BASE_URL}category/${slug}`);

        const $ = load(animePageTest.data);

        const animeTitle = $('div.anime_info_body_bg > h1').text();
        const animeImage = $('div.anime_info_body_bg > img').attr('src');
        const type = $('div.anime_info_body_bg > p:nth-child(4) > a').text();
        const desc = $('div.anime_info_body_bg > p:nth-child(5)')
            .text()
            .replace('Plot Summary: ', '');
        const releasedDate = $('div.anime_info_body_bg > p:nth-child(7)')
            .text()
            .replace('Released: ', '');
        const status = $('div.anime_info_body_bg > p:nth-child(8) > a').text();
        const otherName = $('div.anime_info_body_bg > p:nth-child(9)')
            .text()
            .replace('Other name: ', '')
            .replace(/;/g, ',');

        $('div.anime_info_body_bg > p:nth-child(6) > a').each((i, elem) => {
            genres.push($(elem).attr('title').trim());
        });

        const ep_start = $('#episode_page > li').first().find('a').attr('ep_start');
        const ep_end = $('#episode_page > li').last().find('a').attr('ep_end');
        const movie_id = $('#movie_id').attr('value');
        const alias = $('#alias_anime').attr('value');

        const html = await axios.get(
            `${list_episodes_url}?ep_start=${ep_start}&ep_end=${ep_end}&id=${movie_id}&default_ep=${0}&alias=${alias}`
        );
        const $$ = load(html.data);

        $$('#episode_related > li').each((i, el) => {
            epList.push({
                episodeId: $(el).find('a').attr('href').split('/')[1],
                episodeNum: $(el).find(`div.name`).text().replace('EP ', ''),
                episodeUrl: BASE_URL + $(el).find(`a`).attr('href').split('/')[1].trim(),
            });
        });

        return {
            animeTitle: animeTitle.toString(),
            type: type.toString(),
            releasedDate: releasedDate.toString(),
            status: status.toString(),
            genres: genres,
            otherNames: otherName,
            synopsis: desc.toString(),
            animeImg: animeImage.toString(),
            totalEpisodes: ep_end,
            episodesList: epList.reverse(),
        };
    } catch (err) {
        // console.log(err);
        return { error: err };
    }
};


router.get('/', async (req, res) => {
    try {
        const slug = req.query.slug;

        const data = await scrapeAnimeDetails({ slug: slug });

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