import express, { json } from "express";
import cors from 'cors';

import { router } from './routes/index.js'

const port = process.env.port || 5050;

const corsOptions = {
    origin: "*",
    credentails: true,
    optionSuccessStatus: 200,
    port: port,
};

const app = express();

app.use(cors(corsOptions));
app.use(json())

app.use(router);

app.listen(port, () => {
    console.log('Express server listening on port %d in %s mode', port, app.settings.env);
});