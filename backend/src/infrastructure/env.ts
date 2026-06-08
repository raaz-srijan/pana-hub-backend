import 'dotenv/config';

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

export const ENV = {
  PORT: Number(getEnv('PORT', '5000')),
  
  MONGO_URI: getEnv('MONGO_URI'),
  
  JWT_SECRET: getEnv('JWT_SECRET_KEY'), 
  JWT_REFRESH: getEnv('JWT_REFRESH_KEY'),
  
  JWT_SECRET_TIMEOUT: getEnv('JWT_SECRET_TIMEOUT'),
  JWT_REFRESH_TIMEOUT: getEnv('JWT_REFRESH_TIMEOUT'),
  
  CLOUDINARY_CLOUD_NAME: getEnv('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: getEnv('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: getEnv('CLOUDINARY_API_SECRET'),
  
  FRONTEND_URL: getEnv('FRONTEND_URL'),
<<<<<<< HEAD
  VENDOR_FRONTEND_URL: getEnv('VENDOR_FRONTEND_URL'),
=======
>>>>>>> d2f16803441089d0f9cb6ca8822d8c1985f2ee31
  BACKEND_URL: getEnv('BACKEND_URL'),
  
  ESEWA_MERCHANT_ID: getEnv('ESEWA_MERCHANT_ID'),
  ESEWA_URL: getEnv('ESEWA_URL'),
  ESEWA_SECRET_KEY: getEnv('ESEWA_SECRET_KEY'),
  
  KHALTI_SECRET_KEY: getEnv('KHALTI_SECRET_KEY'),
  KHALTI_PUBLIC_KEY: getEnv('KHALTI_PUBLIC_KEY'),
  
  KHALTI_PAYMENT_URL: getEnv('KHALTI_URL'), 
  KHALTI_VERIFICATION_URL: getEnv('KHALTI_URL_TEST'),
} as const; 
