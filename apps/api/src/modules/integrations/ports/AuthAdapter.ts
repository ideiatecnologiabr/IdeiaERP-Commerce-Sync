/**
 * Credentials for platform login
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Token data returned from platform authentication
 */
export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds
  refresh_expires_in: number; // seconds
  token_type: string;
}

/**
 * Interface for platform authentication adapters
 * Each platform must implement this interface to handle login and token refresh
 */
export interface AuthAdapter {
  /**
   * Perform login and get tokens
   * @param credentials - Login credentials (username, password)
   * @returns Token data including access_token, refresh_token, and expiration times
   */
  login(credentials: LoginCredentials): Promise<TokenData>;

  /**
   * Refresh access token using refresh token
   * @param refreshToken - The refresh token to use
   * @returns New token data
   */
  refresh(refreshToken: string): Promise<TokenData>;
}

