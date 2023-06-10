import express from 'express';
import { createServer } from 'http';
import refreshToken from './routes/refreshToken';
import cookieParser from 'cookie-parser';

const app = express()
const httpServer = createServer(app);
app.use(cookieParser());
app.use("/refreshToken", refreshToken);

export { app, httpServer };