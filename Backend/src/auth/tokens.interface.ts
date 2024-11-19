export interface Tokens {
  access_token: string;
  refresh_token: string;
}

export interface TokenPayload {
  email: string;
  sub: string;
  type: 'access' | 'refresh';
}
