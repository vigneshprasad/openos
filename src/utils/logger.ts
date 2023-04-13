import { type Logger } from "pino";
import pino from "pino";

export const logger:Logger = pino({
    name: 'app-name',
    level: 'debug'
});