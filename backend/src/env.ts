import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 3030),
  serverHost: process.env.SERVER_HOST,
  serverPort: Number(process.env.SERVER_PORT || 22),
  serverUser: process.env.SERVER_USER,
  serverPassword: process.env.SERVER_PASSWORD,
  serverKeyPath: process.env.SERVER_KEY_PATH,
  allowedServices: (process.env.ALLOWED_SERVICES || 'docker,ssh').split(',').filter(Boolean),
};

export const requiredEnvMessage =
  'Configure SERVER_HOST, SERVER_USER e uma credencial (SERVER_KEY_PATH ou SERVER_PASSWORD) nas variáveis de ambiente.';
