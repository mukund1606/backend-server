import express from 'express';
import axios from 'axios';
import { load } from 'cheerio';
import { BASE_URL, seasons_url, Season } from '../constants.js';
const router = express.Router();

const scrapeSeason = async({ list = [], season, year, page = 1 }) => {
    try {
        if(Season.indexOf(season) > -1){
            const season_page = await axios.get(`${seasons_url}${season}-${year}-anime?page=${page}`);
            const $ = load(season_page.data);
    
            $('div.last_episodes > ul > li').each((i, el) => {
                list.push({
                    animeId: $(el).find('div > a').attr('href').split('/')[2],
                    animeTitle: $(el).find('div > a').attr('title'),
                    animeImg: $(el).find('div > a > img').attr('src'),
                    animeUrl: BASE_URL + '/' + $(el).find('div > a').attr('href'),
                });
            });
    
            return list;
        }
        return { error: 'Invalid Season' };
    } catch (err) {
        console.log(err);
        return { error: err };
    }
};

router.get('/', async (req, res) => {
    try {
        const season = req.query.season;
        const year = req.query.year;
        const page = req.query.page;

        const data = await scrapeSeason({ season:season, year:year, page: page });

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