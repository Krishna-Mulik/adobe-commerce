import { render as provider } from '@dropins/storefront-cart/render.js';
import CartSummaryList from '@dropins/storefront-cart/containers/CartSummaryList.js';
import OrderSummary from '@dropins/storefront-cart/containers/OrderSummary.js';
import { events } from '@dropins/tools/event-bus.js';

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // Read authored content (none for this block, but defensive)
  const rows = Array.from(block.children);
  if (rows.length === 0) {
    console.warn('Cart block has no rows');
    return;
  }

  // Build layout DOM
  const cartContainer = document.createElement('div');
  cartContainer.className = 'cart-summary-container';

  const orderSummaryContainer = document.createElement('div');
  orderSummaryContainer.className = 'order-summary-container';

  block.textContent = '';
  block.append(cartContainer, orderSummaryContainer);

  // Mount CartSummaryList container
  provider(CartSummaryList, {
    hideHeading: true,
    hideFooter: false,
    routeProduct: '/product/:sku',
    routeEmptyCartCTA: '/',
    enableRemoveItem: true,
    enableUpdateItemQuantity: true,
    slots: {
      Heading: (ctx) => {
        const heading = document.createElement('h2');
        heading.className = 'cart-heading';
        heading.textContent = 'Shopping Cart';
        ctx.replaceWith(heading);
      },
      EmptyCart: (ctx) => {
        const empty = document.createElement('div');
        empty.className = 'cart-empty';
        empty.innerHTML = '<p>Your cart is empty.</p><a href="/" class="button">Continue Shopping</a>';
        ctx.replaceWith(empty);
      },
      Footer: (ctx) => {
        const footer = document.createElement('div');
        footer.className = 'cart-footer';
        footer.innerHTML = '<a href="/checkout" class="button primary">Proceed to Checkout</a>';
        ctx.append(footer);
      },
      Thumbnail: (ctx) => {
        const img = document.createElement('img');
        img.className = 'cart-item-thumbnail';
        img.src = ctx.data?.product?.thumbnail?.url || '';
        img.alt = ctx.data?.product?.thumbnail?.label || 'Product thumbnail';
        img.loading = 'lazy';
        ctx.replaceWith(img);
      }
    }
  })(cartContainer);

  // Mount OrderSummary container
  provider(OrderSummary, {
    routeCheckout: '/checkout',
    enableCoupons: true,
    enableGiftCards: false,
    showTotalSaved: true
  })(orderSummaryContainer);

  // Subscribe to cart events
  events.on('cart/updated', (payload) => {
    if (!payload?.items?.length) {
      block.classList.add('empty');
    } else {
      block.classList.remove('empty');
    }
  });

  // Initialize cart data
  const { getCartData } = await import('@dropins/storefront-cart/api.js');
  try {
    await getCartData();
  } catch (error) {
    console.error('Failed to initialize cart:', error);
  }
}
