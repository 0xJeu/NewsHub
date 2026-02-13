# Category Configuration Guide

## Overview

The category system is fully dynamic and automatically assigns colors to category cards. You can add or remove categories without worrying about color configuration.

## How It Works

### Color Assignment

Category cards are automatically assigned colors from a rotating palette in `category-cards.ts`. The system:

1. **Cycles through colors**: If you have 6 categories and 20 colors in the palette, colors 0-5 are used
2. **Repeats when needed**: If you add a 21st category, it starts from the beginning of the palette
3. **Supports dark mode**: Each color has light and dark mode variants built-in

### File Structure

```
lib/config/
├── categories.ts          # Define categories here
├── category-cards.ts      # Color palette and assignment logic
├── queries.ts             # Search queries for each category
└── README.md             # This file
```

## Adding a New Category

### Step 1: Add to `categories.ts`

Add your new category to the `CATEGORIES` array:

```typescript
{
  slug: 'business',                    // URL-friendly identifier
  name: 'Business',                    // Display name
  description: 'Business news, markets, economy, and finance',
  color: 'bg-emerald-500',            // Used for category indicators (not cards)
  icon: '💼',                          // Emoji icon
  
  // Smart categorization
  preferredSources: [
    'bloomberg.com',
    'wsj.com',
    'ft.com',
    // ... add more trusted sources
  ],
  
  keywords: {
    strong: [
      'business', 'market', 'stocks', 'economy',
      // ... high-confidence keywords
    ],
    weak: [
      'company', 'trade', 'investment',
      // ... supporting keywords
    ],
    exclude: [
      'sports business', 'entertainment industry',
      // ... keywords to exclude
    ]
  },
  
  queries: [
    'business OR market OR stocks',
    'economy OR finance OR investment',
    // ... search queries for this category
  ]
}
```

### Step 2: That's It!

The color will be **automatically assigned** from the palette. The system will:
- ✅ Assign a color based on the category's position
- ✅ Apply light and dark mode variants
- ✅ Generate category cards automatically
- ✅ Update all pages and components

## Removing a Category

Simply delete or comment out the category from the `CATEGORIES` array in `categories.ts`. All colors will automatically adjust.

## Custom Color Assignment (Optional)

If you want a specific category to always use a specific color, edit `CUSTOM_CATEGORY_COLORS` in `category-cards.ts`:

```typescript
const CUSTOM_CATEGORY_COLORS: Record<string, string> = {
  'politics': COLOR_PALETTE[4],     // Always use blue
  'technology': COLOR_PALETTE[7],   // Always use purple
  'business': COLOR_PALETTE[8],     // Always use green
};
```

## Expanding the Color Palette

To add more colors to the palette, edit the `COLOR_PALETTE` array in `category-cards.ts`:

```typescript
const COLOR_PALETTE = [
  // Add your new color scheme:
  "bg-NEW-50 text-NEW-700 border-NEW-100 dark:bg-NEW-950 dark:bg-opacity-40 dark:text-NEW-300 dark:border-NEW-900",
  // ... existing colors
];
```

Replace `NEW` with any Tailwind color name:
- `red`, `orange`, `amber`, `yellow`, `lime`
- `green`, `emerald`, `teal`, `cyan`, `sky`
- `blue`, `indigo`, `violet`, `purple`, `fuchsia`
- `pink`, `rose`, `slate`, `gray`, `zinc`

## Examples

### Example 1: Adding Multiple Categories

```typescript
// Add to CATEGORIES array in categories.ts
{
  slug: 'travel',
  name: 'Travel',
  description: 'Travel news, destinations, and tourism',
  color: 'bg-sky-500',
  icon: '✈️',
  // ... rest of configuration
},
{
  slug: 'food',
  name: 'Food & Dining',
  description: 'Culinary news, restaurants, and recipes',
  color: 'bg-orange-500',
  icon: '🍽️',
  // ... rest of configuration
},
```

Colors will be automatically assigned: Travel gets color #6, Food gets color #7 from the palette.

### Example 2: Reordering Categories

Categories can be reordered without affecting colors if you use `CUSTOM_CATEGORY_COLORS`. Otherwise, colors are assigned by position.

## Color Palette Info

The system includes a utility function to check color utilization:

```typescript
import { getColorPaletteInfo } from '@/lib/config/category-cards';

const info = getColorPaletteInfo();
console.log(info);
// {
//   totalColors: 20,
//   colors: [...],
//   categoriesCount: 6,
//   colorUtilization: "30%"
// }
```

## Troubleshooting

### Colors not appearing?

1. **Restart dev server**: Tailwind needs to rebuild with new colors
2. **Clear cache**: `rm -rf .next && npm run dev`
3. **Check browser**: Hard refresh (Cmd/Ctrl + Shift + R)

### Want different color intensity?

Modify the color values in the palette. Change:
- `50` → lighter background
- `700` → text color
- `100` → border color
- `950` → dark mode background
- `300` → dark mode text
- `900` → dark mode border

### Need more than 20 colors?

The system supports unlimited categories through color cycling. Add more colors to the palette or let it cycle through existing ones.

## Best Practices

1. **Use descriptive slugs**: Use lowercase, hyphenated slugs (e.g., `tech-news`, not `TechNews`)
2. **Add quality sources**: Include reputable news sources in `preferredSources`
3. **Strong keywords**: Add 10-20 strong keywords that clearly identify the category
4. **Exclude keywords**: Prevent misclassification with exclude keywords
5. **Test queries**: Make sure search queries return relevant results

## Need Help?

- Review existing categories in `categories.ts` for examples
- Check `category-cards.ts` to see the color palette
- Test your changes with `npm run dev` or `bun dev`
