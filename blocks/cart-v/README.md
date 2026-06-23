
# Cart Block

Renders the Adobe Commerce cart drop-in container with customizable slots for empty state and footer content.

## Features
- Full cart functionality (add/remove/update items, apply coupons, proceed to checkout)
- Custom empty cart message via `EmptyCart` slot
- Custom footer content via `Footer` slot
- Event-driven updates (listens to `cart/updated` and `cart/error` events)
- Responsive design with scoped styling

## Drop-ins Used
- `@dropins/storefront-cart` (Cart container)

## Slots
| Slot Name    | Description                                                                 | Context Methods |
|--------------|-----------------------------------------------------------------------------|-----------------|
| `EmptyCart`  | Renders when the cart has no items. Replace default empty cart message.    | `ctx.replaceWith(el)` |
| `Footer`     | Renders below the cart items. Append promotional content or additional CTAs. | `ctx.append(el)` |

## Events
| Event Name      | Payload Example                                                                 | Description                     |
|-----------------|---------------------------------------------------------------------------------|---------------------------------|
| `cart/updated`  | `{ items: [{ sku: 'P1', qty: 2 }], prices: { grandTotal: { value: 99.99 } } }` | Fires when cart data changes.   |
| `cart/error`    | `{ message: 'Failed to update cart' }`                                         | Fires on cart errors.           |

## Authoring
This block has no authorable content. Place the block on the page using the block name:

```
| Cart |
```

## Styling
Override CSS custom properties in your project's theme:
```css
.cart {
  --cart-primary-color: #your-color;
  --cart-spacing-unit: 1rem;
}
```

## Edge Cases Handled
- Empty cart state (custom message via slot)
- Cart loading errors (fallback error message)
- Missing event payloads (optional chaining)
- Responsive layout (mobile-first breakpoints)
    