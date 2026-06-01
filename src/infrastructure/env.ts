import 'dotenv/config';

function getEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

export const ENV = {
  PORT: Number(process.env.PORT) || 5000,
  MONGO_URI: getEnv('MONGO_URI'),
};