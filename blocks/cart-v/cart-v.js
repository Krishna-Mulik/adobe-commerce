
import { render as cartProvider } from '@dropins/storefront-cart/render.js';
import CartContainer from '@dropins/storefront-cart/containers/Cart.js';
import { events } from '@dropins/tools/event-bus.js';

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // Clear any authored content (this block is a pure drop-in)
  block.textContent = '';

  // Create mount point
  const cartMount = document.createElement('div');
  cartMount.classList.add('cart-container');
  block.append(cartMount);

  // Mount Cart drop-in container
  cartProvider(CartContainer, {
    slots: {
      // Custom empty cart message
      EmptyCart: (ctx) => {
        const emptyMessage = document.createElement('div');
        emptyMessage.classList.add('cart-empty-message');
        emptyMessage.textContent = 'Your cart is empty. Start shopping now!';
        ctx.replaceWith(emptyMessage);
      },
      // Custom cart footer (e.g., promotional banner)
      Footer: (ctx) => {
        const footer = document.createElement('div');
        footer.classList.add('cart-footer');
        footer.innerHTML = `
          <div class="promo-banner">
            <p>Free shipping on orders over $50!</p>
          </div>
        `;
        ctx.append(footer);
      }
    },
    onSuccess: () => {
      console.debug('Cart container mounted successfully');
    },
    onError: (error) => {
      console.error('Cart container failed to mount:', error);
      const errorMessage = document.createElement('div');
      errorMessage.classList.add('cart-error');
      errorMessage.textContent = 'Unable to load cart. Please refresh the page.';
      cartMount.textContent = '';
      cartMount.append(errorMessage);
    }
  })(cartMount);

  // Subscribe to cart events
  events.on('cart/updated', (payload) => {
    console.debug('Cart updated:', payload?.items?.length || 0, 'items');
  });

  events.on('cart/error', (payload) => {
    console.error('Cart error:', payload?.message || 'Unknown error');
  });
}
    