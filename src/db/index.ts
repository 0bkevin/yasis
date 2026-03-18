import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { existsSync } from 'node:fs';
import path from 'node:path';
import * as schema from './schema';

function normalizeDatabaseUrl(url: string) {
  if (url.startsWith('sqlite:')) {
    const sqlitePath = url.replace(/^sqlite:/, '');
    const resolvedPath = path.resolve(process.cwd(), sqlitePath);

    if (existsSync(resolvedPath)) {
      return `file:${resolvedPath}`;
    }

    return `file:${path.resolve(process.cwd(), 'local.db')}`;
  }

  return url;
}

const client = createClient({
  url: normalizeDatabaseUrl(process.env.TURSO_CONNECTION_URL || 'file:local.db'),
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
