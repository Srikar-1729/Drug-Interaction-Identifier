import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const shouldUseSsl = process.env.PGSSL === 'true' || process.env.PGSSLMODE === 'require';

const poolConfig = {};

if (process.env.DATABASE_URL) {
  poolConfig.connectionString = process.env.DATABASE_URL;
  if (shouldUseSsl) {
    poolConfig.ssl = { rejectUnauthorized: false };
  }
} else {
  if (process.env.PGHOST) poolConfig.host = process.env.PGHOST;
  if (process.env.PGPORT) poolConfig.port = Number(process.env.PGPORT);
  if (process.env.PGUSER) poolConfig.user = process.env.PGUSER;
  if (process.env.PGPASSWORD) poolConfig.password = process.env.PGPASSWORD;
  if (process.env.PGDATABASE) poolConfig.database = process.env.PGDATABASE;
  if (shouldUseSsl) {
    poolConfig.ssl = { rejectUnauthorized: false };
  }
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

export default pool;

