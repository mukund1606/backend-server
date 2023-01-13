import express from 'express';
import axios from 'axios';
import { load } from 'cheerio';
import { BASE_URL, new_season_path } from '../constants.js';
const router = express.Router();

const scrapeNewSeason = async({ list = [], page = 1 }) => {
    try {
        const popularPage = await axios.get(`
        ${BASE_URL + new_season_path}?page=${page}
        `);
        const $ = load(popularPage.data);

        $('div.last_episodes > ul > li').each((i, el) => {
            list.push({
                animeId: $(el).find('p.name > a').attr('href').split('/')[2],
                animeTitle: $(el).find('p.name > a').attr('title'),
                animeImg: $(el).find('div > a > img').attr('src'),
                releasedDate: $(el).find('p.released').text().replace('Released: ', '').trim(),
                animeUrl: BASE_URL + '/' + $(el).find('p.name > a').attr('href'),
            });
        });
        return list;
    } catch (err) {
        console.log(err);
        return { error: err };
    }
};


router.get('/', async (req, res) => {
    try {
        const page = req.query.page;

        const data = await scrapeNewSeason({ page: page });

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