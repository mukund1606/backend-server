import express from 'express';
import axios from 'axios';
import { load } from 'cheerio';
import { BASE_URL, popular_ongoing_url } from '../constants.js';
const router = express.Router();

const scrapeTopAiringAnime = async({ list = [], page = 1 }) => {
    try {
        const popular_page = await axios.get(`${popular_ongoing_url}?page=${page}`);
        const $ = load(popular_page.data);

        $('div.added_series_body.popular > ul > li').toArray().forEach((el, i) => {
            let genres = [];
            $(el)
                .find('p.genres > a')
                .toArray()
                .forEach((el, i) => {
                    genres.push($(el).attr('title'));
                });
            list.push({
                animeTitle: $(el).find('a:nth-child(1)').attr('title'),
                animeSlug: $(el).find('a:nth-child(1)').attr('href').split('/')[2],
                animeImg: $(el)
                    .find('a:nth-child(1) > div')
                    .attr('style')
                    .match('(https?://.*.(?:png|jpg))')[0],
                latestEp: $(el).find('p:nth-child(4) > a').text().trim(),
                animeUrl: BASE_URL + '/' + $(el).find('a:nth-child(1)').attr('href'),
                genres: genres,
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

        const data = await scrapeTopAiringAnime({ page: page });

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