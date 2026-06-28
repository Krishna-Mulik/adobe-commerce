
# Wishlist Block

The Wishlist block displays a user's saved products and allows them to manage their wishlist items. It integrates with the `@dropins/storefront-wishlist` package to provide core wishlist functionality.

## Features

- Displays all items in the user's wishlist
- Allows moving items to cart
- Shows product images with links to product detail pages
- Displays an empty state with a call-to-action when the wishlist is empty
- Shows alerts for wishlist actions (add/remove items)
- Responsive design with multiple layout variants

## Authoring

### Block Name
```
Wishlist
```

### Content Structure

| wishlist |
| --- |


**Columns:**
1. **Empty Wishlist CTA Text**: Text for the call-to-action button when the wishlist is empty (default: "Continue Shopping")
2. **Empty Wishlist CTA Link**: Link for the call-to-action button (default: "/")
3. **Wishlist Title**: Title displayed at the top of the wishlist (default: "My Wishlist")
4. **Variant**: Visual variant of the block ("compact" or "full-width")

### Example

```
Wishlist
Continue Shopping|/products|My Saved Items|compact
```

### Variants

- **Default**: Standard wishlist layout
- **Compact**: Smaller item spacing and padding
- **Full Width**: No maximum width, full container width

## Drop-ins Used

This block uses the following `@dropins/storefront-wishlist` containers:

1. **Wishlist** (`@dropins/storefront-wishlist/containers/Wishlist.js`)
   - Displays the list of wishlist items
   - Customized with an `image` slot to render product images

2. **WishlistAlert** (`@dropins/storefront-wishlist/containers/WishlistAlert.js`)
   - Shows alerts for wishlist actions (add/remove items)

## Events Handled

- `wishlist/data`: Updates the UI when wishlist data changes (shows empty state when appropriate)
- `wishlist/alert`: Manages alert visibility

## Dependencies

- `@dropins/storefront-wishlist` (v3.3.0)
- `@dropins/storefront-cart` (for moving items to cart)
- `@dropins/storefront-pdp` (for product data)

## Initialization

The block imports the wishlist initializer from `../../scripts/initializers/wishlist.js`. Ensure this file exists and properly initializes the wishlist drop-in.

## Customization

### CSS Custom Properties

The block defines several CSS custom properties that can be overridden:

```css
.wishlist-block {
  --wishlist-item-gap: 16px;
  --wishlist-item-padding: 16px;
  --wishlist-border-color: #e0e0e0;
  --wishlist-text-color: #333;
  --wishlist-title-color: #111;
  --wishlist-primary-color: #0066cc;
  --wishlist-error-color: #d32f2f;
}
```

### Slots

The block customizes the `image` slot of the Wishlist container to render product images with links to product detail pages.

## Accessibility

- The block uses semantic HTML elements (h2 for title)
- Product images are wrapped in anchor tags for keyboard navigation
- Alerts are positioned for visibility without obstructing content
    