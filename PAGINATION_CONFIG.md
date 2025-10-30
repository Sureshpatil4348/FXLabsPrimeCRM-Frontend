# Pagination Configuration Guide

## Environment Variable

The pagination limit for all table views can be configured using the `NEXT_PUBLIC_PAGINATION_LIMIT` environment variable.

### Setup

Add the following to your `.env.local` file:

```bash
NEXT_PUBLIC_PAGINATION_LIMIT=20
```

### Configuration Details

-   **Variable Name**: `NEXT_PUBLIC_PAGINATION_LIMIT`
-   **Default Value**: `20` (if not set or invalid)
-   **Valid Range**: Any positive integer (1, 2, 3, ...)
-   **Fallback**: If an invalid value is provided, the system defaults to `20`

### Usage in Code

The pagination limit is accessed via the `getPaginationLimit()` function from `lib/pagination.ts`:

```typescript
import { getPaginationLimit } from "@/lib/pagination";

const pageLimit = getPaginationLimit(); // Returns configured limit or 20
```

### Pages Using Pagination Configuration

The following pages now use the configurable pagination limit:

#### Admin Dashboard

-   **Users Page** (`app/admin/users/page.tsx`)
-   **Partners Page** (`app/admin/partners/page.tsx`)
-   **Partner Users Page** (`app/admin/partner-users/page.tsx`)

#### Partner Dashboard

-   **Referrals Page** (`app/partner/referrals/referrals-content.tsx`)

### Example Configurations

```bash
# Default: 20 items per page
NEXT_PUBLIC_PAGINATION_LIMIT=20

# Smaller pages: 10 items per page
NEXT_PUBLIC_PAGINATION_LIMIT=10

# Larger pages: 50 items per page
NEXT_PUBLIC_PAGINATION_LIMIT=50
```

### Implementation Details

The `getPaginationLimit()` function:

1. Reads the environment variable `NEXT_PUBLIC_PAGINATION_LIMIT`
2. Defaults to `'20'` if not found
3. Parses the value as an integer
4. Returns `20` if the value is invalid (NaN) or less than 1
5. Otherwise returns the parsed limit

This ensures robust handling of configuration errors while maintaining a sensible default.
