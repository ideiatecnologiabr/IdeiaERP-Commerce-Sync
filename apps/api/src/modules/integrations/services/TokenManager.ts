import { appDataSource } from '../../../config/database';
import { PlatformToken } from '../../../entities/app/PlatformToken';
import { AuthAdapter, LoginCredentials, TokenData } from '../ports/AuthAdapter';
import { logger } from '../../../config/logger';

export class TokenManager {
  /**
   * Get a valid access token for a platform
   * If token is expired, tries to refresh. If refresh fails, performs new login.
   */
  async getValidToken(
    lojavirtual_id: string,
    platform: string,
    authAdapter: AuthAdapter,
    credentials: LoginCredentials
  ): Promise<string | null> {
    try {
      // Try to get existing token from database
      const repository = appDataSource.getRepository(PlatformToken);
      let tokenRecord = await repository.findOne({
        where: {
          lojavirtual_id,
          platform,
        },
      });

      // If token exists and is still valid, return it
      if (tokenRecord && this.isTokenValid(tokenRecord.access_token, tokenRecord.expires_at)) {
        logger.debug('Using existing valid token', { lojavirtual_id, platform });
        return tokenRecord.access_token;
      }

      // If token exists but is expired, try to refresh
      if (tokenRecord && this.isTokenValid(tokenRecord.refresh_token, tokenRecord.refresh_expires_at)) {
        try {
          logger.info('Token expired, attempting refresh', { lojavirtual_id, platform });
          const newTokenData = await authAdapter.refresh(tokenRecord.refresh_token);
          await this.saveToken(lojavirtual_id, platform, newTokenData);
          return newTokenData.access_token;
        } catch (refreshError: any) {
          logger.warn('Refresh failed, performing new login', {
            lojavirtual_id,
            platform,
            error: refreshError.message,
          });
          // Fall through to login
        }
      }

      // Perform new login
      logger.info('Performing new login', { lojavirtual_id, platform });
      const tokenData = await authAdapter.login(credentials);
      await this.saveToken(lojavirtual_id, platform, tokenData);
      return tokenData.access_token;
    } catch (error: any) {
      logger.error('Error getting valid token', {
        lojavirtual_id,
        platform,
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Save token data to database
   */
  async saveToken(lojavirtual_id: string, platform: string, tokenData: TokenData): Promise<void> {
    const repository = appDataSource.getRepository(PlatformToken);
    
    // Calculate expiration dates
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setSeconds(refreshExpiresAt.getSeconds() + tokenData.refresh_expires_in);

    // Check if token record exists
    const existing = await repository.findOne({
      where: { lojavirtual_id, platform },
    });

    if (existing) {
      // Update existing token
      existing.access_token = tokenData.access_token;
      existing.refresh_token = tokenData.refresh_token;
      existing.expires_at = expiresAt;
      existing.refresh_expires_at = refreshExpiresAt;
      existing.token_type = tokenData.token_type;
      await repository.save(existing);
      logger.debug('Updated platform token', { lojavirtual_id, platform });
    } else {
      // Create new token record
      const newToken = repository.create({
        lojavirtual_id,
        platform,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
        refresh_expires_at: refreshExpiresAt,
        token_type: tokenData.token_type,
      });
      await repository.save(newToken);
      logger.debug('Created new platform token', { lojavirtual_id, platform });
    }
  }

  /**
   * Check if token is still valid (with 5 minute safety margin)
   */
  isTokenValid(token: string, expiresAt: Date): boolean {
    if (!token || !expiresAt) {
      return false;
    }

    // Add 5 minute safety margin
    const safetyMargin = 5 * 60 * 1000; // 5 minutes in milliseconds
    const now = new Date();
    const validUntil = new Date(expiresAt.getTime() - safetyMargin);

    return now < validUntil;
  }

  /**
   * Delete token for a platform (logout)
   */
  async deleteToken(lojavirtual_id: string, platform: string): Promise<void> {
    const repository = appDataSource.getRepository(PlatformToken);
    await repository.delete({ lojavirtual_id, platform });
    logger.info('Deleted platform token', { lojavirtual_id, platform });
  }
}

