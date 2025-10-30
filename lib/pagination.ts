/**
 * Pagination Configuration
 * Uses environment variables to configure pagination behavior
 */

export const PAGINATION_LIMIT = parseInt(
  process.env.NEXT_PUBLIC_PAGINATION_LIMIT || '20',
  10
)

// Fallback to 20 if invalid value is provided
export const getPaginationLimit = (): number => {
  const limit = parseInt(process.env.NEXT_PUBLIC_PAGINATION_LIMIT || '20', 10)
  return isNaN(limit) || limit < 1 ? 20 : limit
}
