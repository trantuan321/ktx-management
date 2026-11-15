import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const SERVER_DIR = path.resolve(__dirname, '..');
export const PORT = Number(process.env.PORT || 4000);
export const DB_PATH = process.env.DB_PATH || path.join(SERVER_DIR, 'data', 'ktx.db');
export const JWT_SECRET = process.env.JWT_SECRET || 'ktx-dev-secret-change-me';
export const TOKEN_TTL_SECONDS = Number(process.env.TOKEN_TTL_SECONDS || 60 * 60 * 12);
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
