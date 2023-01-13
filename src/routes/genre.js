import express from 'express';
import axios from 'axios';
import { load } from 'cheerio';
import { BASE_URL, Genres } from '../constants.js';
const router = express.Router();


const scrapeGenre = async({  list = [], genre, page = 1 }) => {
    try {
        genre = genre.trim().replace(/ /g, '-').toLowerCase();
        if (Genres.indexOf(genre) > -1) {
            const genrePage = await axios.get(`${BASE_URL}genre/${genre}?page=${page}`);
            const $ = load(genrePage.data);

            $('div.last_episodes > ul > li').each((i, elem) => {
                list.push({
                    animeId: $(elem).find('p.name > a').attr('href').split('/')[2],
                    animeTitle: $(elem).find('p.name > a').attr('title'),
                    animeImg: $(elem).find('div > a > img').attr('src'),
                    releasedDate: $(elem).find('p.released').text().replace('Released: ', '').trim(),
                    animeUrl: BASE_URL + '/' + $(elem).find('p.name > a').attr('href'),
                });
            });
            return list;
        }
        return { error: 'Genre Not Found' };
    } catch (err) {
        console.log(err);
        return { error: err };
    }
};

router.get('/', async (req, res) => {
    try {
        const genre = req.query.genre;
        const page = req.query.page;

        const data = await scrapeGenre({ genre: genre, page: page });

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