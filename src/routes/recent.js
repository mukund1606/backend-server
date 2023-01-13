import express from 'express';
import axios from 'axios';
import { load } from 'cheerio';
import { BASE_URL } from '../constants.js';

const router = express.Router();


const scrapeRecent = async({ list = [], page = 1 }) => {
    try {
        const searchPage = await axios.get(
            `${BASE_URL}?page=${page}`
        );
        const $ = load(searchPage.data);
        $('div.last_episodes > ul > li').toArray().forEach((el, i) => {
            list.push({
                animeTitle: $(el).find('p.name > a').attr('title'),
                animeSlug: $(el).find('p.name > a').attr('href').split('/')[2],
                animeUrl: BASE_URL + '/' + $(el).find('p.name > a').attr('href'),
                animeImg: $(el).find('div > a > img').attr('src'),
                status: $(el).find('p.released').text().trim(),
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

        const data = await scrapeRecent({ page: page });

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