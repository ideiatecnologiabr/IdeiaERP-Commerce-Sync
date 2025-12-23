import { AuthAdapter, LoginCredentials, TokenData } from '../ports/AuthAdapter';
import { PlatformConfig } from '../ports/PlatformConfig';
import { logger } from '../../../config/logger';

export class OpenCartAuthAdapter implements AuthAdapter {
  private baseUrl: string;
  private loginEndpoint: string;
  private refreshEndpoint?: string;

  constructor(config: PlatformConfig) {
    if (!config.baseUrl) {
      throw new Error('OpenCart baseUrl is required');
    }

    this.baseUrl = config.baseUrl;
    // Default endpoint for OpenCart OCFT extension
    this.loginEndpoint = config.loginEndpoint || 'api_ocft/admin/auth/login';
    this.refreshEndpoint = config.refreshEndpoint;
  }

  async login(credentials: LoginCredentials): Promise<TokenData> {
    logger.info('Logging in to OpenCart', { baseUrl: this.baseUrl, username: credentials.username });

    try {
      const loginUrl = `${this.baseUrl}/index.php?route=${encodeURIComponent(this.loginEndpoint)}`;
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('OpenCart login failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(`OpenCart login failed: ${response.statusText}`);
      }

      const result = await response.json() as {
        success: boolean;
        data?: {
          tokens?: {
            access_token: string;
            refresh_token: string;
            expires_in: string | number;
            refresh_expires_in: string | number;
            token_type: string;
          };
        };
        message?: string;
      };

      if (!result.success || !result.data?.tokens) {
        logger.error('OpenCart login response invalid', { result });
        throw new Error(result.message || 'Invalid login response');
      }

      const tokens = result.data.tokens;

      // Convert expires_in to number if it's a string
      const expiresIn = typeof tokens.expires_in === 'string' 
        ? parseInt(tokens.expires_in, 10) 
        : tokens.expires_in;
      
      const refreshExpiresIn = typeof tokens.refresh_expires_in === 'string'
        ? parseInt(tokens.refresh_expires_in, 10)
        : tokens.refresh_expires_in;

      logger.info('OpenCart login successful', {
        baseUrl: this.baseUrl,
        expiresIn,
        refreshExpiresIn,
      });

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: expiresIn,
        refresh_expires_in: refreshExpiresIn,
        token_type: tokens.token_type || 'Bearer',
      };
    } catch (error: any) {
      logger.error('OpenCart login error', {
        baseUrl: this.baseUrl,
        error: error.message,
      });
      throw error;
    }
  }

  async refresh(refreshToken: string): Promise<TokenData> {
    if (!this.refreshEndpoint) {
      throw new Error('Refresh endpoint not configured for OpenCart');
    }

    logger.info('Refreshing OpenCart token', { baseUrl: this.baseUrl });

    try {
      const refreshUrl = `${this.baseUrl}/index.php?route=${encodeURIComponent(this.refreshEndpoint)}`;
      
      const response = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('OpenCart refresh failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(`OpenCart refresh failed: ${response.statusText}`);
      }

      const result = await response.json() as {
        success: boolean;
        data?: {
          tokens?: {
            access_token: string;
            refresh_token: string;
            expires_in: string | number;
            refresh_expires_in: string | number;
            token_type: string;
          };
        };
        message?: string;
      };

      if (!result.success || !result.data?.tokens) {
        logger.error('OpenCart refresh response invalid', { result });
        throw new Error(result.message || 'Invalid refresh response');
      }

      const tokens = result.data.tokens;

      const expiresIn = typeof tokens.expires_in === 'string' 
        ? parseInt(tokens.expires_in, 10) 
        : tokens.expires_in;
      
      const refreshExpiresIn = typeof tokens.refresh_expires_in === 'string'
        ? parseInt(tokens.refresh_expires_in, 10)
        : tokens.refresh_expires_in;

      logger.info('OpenCart refresh successful', {
        baseUrl: this.baseUrl,
        expiresIn,
        refreshExpiresIn,
      });

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: expiresIn,
        refresh_expires_in: refreshExpiresIn,
        token_type: tokens.token_type || 'Bearer',
      };
    } catch (error: any) {
      logger.error('OpenCart refresh error', {
        baseUrl: this.baseUrl,
        error: error.message,
      });
      throw error;
    }
  }
}

