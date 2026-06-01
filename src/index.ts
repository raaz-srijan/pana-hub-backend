import 'dotenv/config';
import express from 'express';
import { connectDb } from './infrastructure/connectDb';

const app = express();

app.use(express.json());

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
    connectDb();
})