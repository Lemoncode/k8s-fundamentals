import express from 'express';
import cors from 'cors';
import { employeeRouter } from './routes';
import config from './config';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/employee', employeeRouter);

app.listen(config.http.port, () => {
    console.log(`Application running on ${config.http.port}`);
});
