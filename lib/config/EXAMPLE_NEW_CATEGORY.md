# Example: Adding a New Category

## Quick Start Example

Here's exactly how to add a "Business" category to your news aggregator:

### Step 1: Open `lib/config/categories.ts`

Add this to the `CATEGORIES` array (after the existing 6 categories):

```typescript
{
  slug: 'business',
  name: 'Business',
  description: 'Business news, finance, markets, and economy',
  color: 'bg-emerald-500',
  icon: '💼',
  preferredSources: [
    'bloomberg.com',
    'wsj.com',
    'ft.com',
    'forbes.com',
    'businessinsider.com',
    'cnbc.com',
    'marketwatch.com',
    'reuters.com',
  ],
  keywords: {
    strong: [
      'business',
      'market',
      'stocks',
      'economy',
      'finance',
      'nasdaq',
      'dow jones',
      'investment',
      'trading',
      'earnings',
      'corporate',
      'ceo',
      'startup',
      'ipo',
      'merger',
      'acquisition',
    ],
    weak: [
      'company',
      'profit',
      'revenue',
      'quarter',
      'shares',
      'investor',
      'analyst',
      'forecast',
    ],
    exclude: [
      'sports business',
      'entertainment business',
      'music business',
      'film industry',
    ]
  },
  queries: [
    'business OR market OR stocks OR nasdaq',
    'economy OR finance OR investment',
    'corporate OR earnings OR merger OR acquisition'
  ]
}
```

### Step 2: Save the file

### Step 3: Restart your dev server

```bash
npm run dev
# or
bun dev
```

### Step 4: View your new category!

- Visit `http://localhost:3000` - See the new "Business 💼" card on the homepage
- Visit `http://localhost:3000/categories` - See all category cards including Business
- Visit `http://localhost:3000/categories/business` - See business news articles

## What Happens Automatically

✅ **Color assigned**: Business gets the next available color from the palette (green)  
✅ **Card created**: Category card appears on homepage and categories page  
✅ **Route created**: `/categories/business` page is automatically generated  
✅ **Dark mode**: All colors work in both light and dark modes  
✅ **Navigation**: Category appears in search and filtering  
✅ **Smart categorization**: Articles are automatically categorized based on your keywords  

## Test the New Category

1. **Check the homepage**: Look for the Business card in the "Explore Categories" section
2. **Click on it**: Should navigate to `/categories/business`
3. **Toggle dark mode**: Click the theme toggle in the navbar - colors should adapt
4. **Add more categories**: Add as many as you want - colors cycle automatically!

## Customize (Optional)

### Want a specific color for Business?

Edit `lib/config/category-cards.ts` and add to `CUSTOM_CATEGORY_COLORS`:

```typescript
const CUSTOM_CATEGORY_COLORS: Record<string, string> = {
  'business': COLOR_PALETTE[8], // Force green color
  // 'business': "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950 dark:bg-opacity-40 dark:text-emerald-300 dark:border-emerald-900",
};
```

### Want different keywords?

Adjust the `keywords` arrays in `categories.ts` to improve article categorization.

### Want more/fewer sources?

Add or remove domains from `preferredSources` to prioritize trusted sources.

---

**That's it!** Your new category is live and fully functional with automatic color assignment and dark mode support.
