import express from 'express';
const router = express.Router();

import {router as searchRouter} from "./search.js"
import {router as recentRouter} from "./recent.js"
import {router as genreRouter} from "./genre.js"
import {router as topAiringAnimeRouter} from "./topairing.js"
import {router as animeMovieRoute} from "./animemovie.js"
import {router as popularAnimePath} from "./popular.js"
import {router as newSeasonPath} from "./newseason.js"
import {router as animeDetailsPath} from "./animedetails.js"
import {router as seasonPath} from "./season.js"
import {router as scrapemp4Path} from "./scrapemp4.js"

router.get("/", (req, res) => {
    res.status(200).json([
        {
            welcome: "Welcome to My API"
        },
        {
            route: '/search',
            query: ['?keyw=', '&page']
        },
        {
            route: '/recent',
            query: ['?page=']
        },
        {
            route: '/genre',
            query: ['?genre=','&page=']
        },
        {
            route: '/topairing',
            query: ['?page=']
        },
        {
            route: '/animemovie',
            query: ['?aph=','&page=']
        },
        {
            route: '/popular',
            query: ['?page=']
        },
        {
            route: '/newseason',
            query: ['?page=']
        },
        {
            route: '/animedetails',
            query: ['?slug=']
        },
        {
            route: '/season',
            query: ['?season=', '&year=', '&page=']
        },
        {
            route: '/scrapemp4',
            query: ['?slug=', '&episode=']
        },
    ])
});

router.use("/search", searchRouter);
router.use("/recent", recentRouter);
router.use("/genre", genreRouter);
router.use("/topairing", topAiringAnimeRouter);
router.use("/animemovie", animeMovieRoute);
router.use("/popular", popularAnimePath);
router.use("/newseason", newSeasonPath);
router.use("/animedetails", animeDetailsPath);
router.use("/season", seasonPath);
router.use("/scrapemp4", scrapemp4Path);


export { router };