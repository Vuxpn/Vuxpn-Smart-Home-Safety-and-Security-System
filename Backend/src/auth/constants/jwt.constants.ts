export const jwtConstants = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'accessTokenSecretKey',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'refreshTokenSecretKey',
  accessTokenExpiration: process.env.JWT_ACCESS_EXPIRATION || '1h',
  refreshTokenExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
};
