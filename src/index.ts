import 'dotenv/config';
import express from 'express';
import { connectDb } from './infrastructure/connectDb';
import { ENV } from './infrastructure/env';

const app = express();

app.use(express.json());

const PORT = ENV.PORT;

import permissionRoute from "./modules/permission/permission.route";

app.use("api/v1/permissions", permissionRoute );

app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
    connectDb();
})