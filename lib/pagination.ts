/**
 * Pagination Configuration
 * Uses environment variables to configure pagination behavior
 */

const resolvePaginationLimit = () => {
  const parsed = parseInt(process.env.NEXT_PUBLIC_PAGINATION_LIMIT || '20', 10)
  return Number.isNaN(parsed) || parsed < 1 ? 20 : parsed
}

export const PAGINATION_LIMIT = resolvePaginationLimit()

// Fallback to 20 if invalid value is provided
export const getPaginationLimit = (): number => {
  return resolvePaginationLimit()
}
