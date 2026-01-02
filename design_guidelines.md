# Digital Mall Platform - Design Guidelines

## Design Approach
**Reference-Based**: Inspired by Airbnb's marketplace trust, Etsy's community feel, and modern directory aesthetics. Creating a warm, professional platform that celebrates local South African businesses.

## Typography System
**Primary Font**: Inter (headings, UI elements, business names)
**Secondary Font**: Open Sans (body text, descriptions)

**Hierarchy**:
- Hero Headline: 3xl-5xl, bold (700)
- Section Headers: 2xl-3xl, semibold (600)
- Business Names: xl, semibold (600)
- Category Labels: lg, medium (500)
- Body Text: base, regular (400)
- Captions/Meta: sm, regular (400)

## Layout System
**Spacing Units**: Tailwind 2, 4, 8, 12, 16, 20 (primary: 4, 8, 16 for consistency)
**Container**: max-w-7xl centered
**Grid System**: 
- Desktop: 3-4 column grids for business cards
- Tablet: 2 columns
- Mobile: Single column stack

## Core Components

### Navigation
Sticky header with logo left, search bar center, "List Your Business" CTA right. Category tabs below header (horizontally scrollable on mobile). Include cart/favorites icon.

### Hero Section
**Full-width hero with large background image** showing vibrant South African market/community scene. Overlay with centered search box (w-full max-w-2xl), headline "Discover Local Businesses in Your Community", subheadline. Search box has location dropdown + search input + primary button with blurred background (backdrop-blur-md bg-white/90).

### Business Card Component
Card with image top (aspect-ratio-4/3), business name, category badge, rating stars, brief description, location pin icon + area, "View Shop" link. Subtle shadow, rounded corners (rounded-lg), hover lift effect.

### Category Grid
6-8 category cards in grid (grid-cols-2 md:grid-cols-4). Each card: icon, category name, business count. Colorful gradient backgrounds per category.

### Featured Businesses Section
Carousel/grid of premium listings. Larger cards with "Featured" badge, more prominent imagery.

### Trust Section
3-column grid: Total businesses registered, Community reviews, Years serving. Large numbers with icons.

### Footer
4-column: About, Categories, Support, Connect. Newsletter signup, social links, payment badges, location info.

## Images Strategy

**Hero Image**: Wide panoramic shot of vibrant South African marketplace, community street scene, or local businesses. Should feel warm, authentic, bustling. Full viewport width, 60-80vh height.

**Business Cards**: Individual shop/product photos (400x300px minimum). Authentic, well-lit imagery.

**Category Icons**: Custom illustrated icons representing each business type (scissors for tailors, washing machine for laundries, etc.).

**Trust Section**: Optional community/people imagery supporting social proof.

## Animations
Minimal: Card hover lifts (scale 1.02), smooth transitions (200ms). Avoid distracting scroll animations.

## Special Features
- Search autocomplete with suggestions
- Filter sidebar (collapsible on mobile): Categories, Location, Rating, Price Range
- Business profile modal/page with gallery, hours, contact, reviews
- "Support Local" badge system for verified businesses
- Map view toggle for location-based browsing

## Mobile Considerations
Bottom navigation bar with: Home, Categories, Search, Favorites, Profile. Hamburger menu for full navigation. Cards full-width with padding on mobile.

**Community-Focused Elements**: Testimonials from business owners, "Success Stories" section, community impact stats, local flavor throughout copy and imagery.