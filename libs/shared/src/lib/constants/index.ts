// Shared constants

export const SYNC_TYPES = {
  CATALOG: 'catalog',
  PRICES: 'prices',
  STOCK: 'stock',
  ORDERS: 'orders',
} as const;

export const SYNC_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const LOG_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
} as const;

export const PLATFORMS = {
  OPENCART: 'opencart',
  VTEX: 'vtex',
} as const;

export const ENTITIES = {
  PRODUCT: 'product',
  ORDER: 'order',
  CATEGORY: 'category',
} as const;



