import dotenv from 'dotenv';
import process from "process";


dotenv.config();

export const setting = {
    JWT_SECRET: process.env.JWT_SECRET || '123',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '321',
};