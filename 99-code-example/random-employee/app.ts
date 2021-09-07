import express from 'express';
import { employeeRouter } from './routes';
import config from './config';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use('/employees', employeeRouter);

app.get('/health', (_, res) => {
    res.status(200).json('ok');
});

app.listen(config.http.port, () => {
    console.log(`Application running on ${config.http.port}`);
});

