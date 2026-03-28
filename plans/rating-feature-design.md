# Asset Rating Feature Design

## Overview
A comprehensive rating system allowing users to rate assets (stocks, crypto, commodities, indices) with 1-5 stars and optional comments. This helps users share sentiment and make better investment decisions.

## Database Schema

### New Model: Rating
```prisma
model Rating {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  assetId   String   @map("asset_id")
  stars     Int      // 1-5 rating
  comment   String?  // Optional review/comment
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  asset     Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)

  @@unique([userId, assetId]) // One rating per user per asset
  @@index([assetId])
  @@index([userId])
  @@map("ratings")
}
```

### Updated Asset Model
Add relation to ratings:
```prisma
ratings   Rating[]
```

### Updated User Model
Add relation to ratings:
```prisma
ratings   Rating[]
```

## API Endpoints

### 1. GET /api/ratings?assetId={assetId}
- Get all ratings for a specific asset
- Returns: Array of ratings with user info
- Public endpoint (no auth required)

### 2. GET /api/ratings/user?assetId={assetId}
- Get current user's rating for a specific asset
- Requires: Authentication
- Returns: Single rating or null

### 3. POST /api/ratings
- Create or update a rating
- Requires: Authentication
- Body: { assetId, stars, comment? }
- Returns: Created/updated rating

### 4. DELETE /api/ratings?assetId={assetId}
- Delete user's rating for an asset
- Requires: Authentication
- Returns: Success message

### 5. GET /api/ratings/stats?assetId={assetId}
- Get rating statistics for an asset
- Returns: { averageRating, totalRatings, distribution }

## UI Components

### 1. StarRating Component
- Interactive star rating input (1-5)
- Hover effects
- Click to select
- Read-only mode option

### 2. RatingDisplay Component
- Shows average rating with stars
- Shows total number of ratings
- Shows rating distribution bar chart

### 3. RatingForm Component
- Form to submit/update rating
- Star selector
- Optional comment textarea
- Submit button

### 4. RatingList Component
- List of all ratings for an asset
- Shows user info, stars, comment, date
- Pagination support

### 5. RatingSummary Component
- Compact rating display for portfolio table
- Shows average rating and count

## Integration Points

### Portfolio Table
- Add rating column showing average rating
- Click to view all ratings

### Asset Detail/Terminal Page
- Show full rating section
- Allow users to submit their rating
- Display all ratings with comments

### Dashboard
- Show top-rated assets
- Show recently rated assets

## Subscription Limits (Optional)
- FREE: View ratings only
- PRO: Can submit ratings
- MAX: Can submit ratings with comments

## Implementation Order
1. Database schema update
2. API routes
3. StarRating component
4. RatingForm component
5. RatingDisplay component
6. RatingList component
7. Integration with portfolio table
8. Integration with terminal page
9. Testing