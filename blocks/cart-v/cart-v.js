
import { render as provider } from '@dropins/storefront-cart/render.js';
import CartSummaryList from '@dropins/storefront-cart/containers/CartSummaryList.js';
import OrderSummary from '@dropins/storefront-cart/containers/OrderSummary.js';
import EmptyCart from '@dropins/storefront-cart/containers/EmptyCart.js';
import { events } from '@dropins/tools/event-bus.js';
import '../../scripts/initializers/cart.js';

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  // Read authored content (none for this block, but keep defensive)
  const rows = Array.from(block.children);
  const isEmpty = !rows.length || rows.every(row => !row.children.length);

  // Build layout DOM
  const container = document.createElement('div');
  container.className = 'cart-container';

  const main = document.createElement('div');
  main.className = 'cart-main';

  const sidebar = document.createElement('div');
  sidebar.className = 'cart-sidebar';

  container.append(main, sidebar);
  block.textContent = '';
  block.append(container);

  // Mount containers
  const routeProduct = (item) => `/${item.url_key}.html`;
  const routeCart = () => '/cart';
  const routeCheckout = () => '/checkout';
  const routeEmptyCartCTA = () => '/';

  try {
    await Promise.all([
      // Main cart items list
      provider.render(CartSummaryList, {
        routeProduct,
        routeEmptyCartCTA,
        routeCart,
        enableRemoveItem: true,
        enableUpdateItemQuantity: true,
        slots: {
          Thumbnail: (ctx) => {
            const { item, defaultImageProps } = ctx;
            const wrapper = document.createElement('a');
            wrapper.href = routeProduct(item);
            wrapper.className = 'cart-item-thumbnail';
            const img = document.createElement('img');
            img.src = defaultImageProps.src;
            img.alt = defaultImageProps.alt || item.product.name;
            img.loading = 'lazy';
            wrapper.append(img);
            ctx.appendChild(wrapper);
          },
          ItemQuantity: (ctx) => {
            const { item, handleItemQuantityUpdate, itemsLoading } = ctx;
            const wrapper = document.createElement('div');
            wrapper.className = 'cart-item-quantity';

            const input = document.createElement('input');
            input.type = 'number';
            input.min = '1';
            input.value = item.quantity;
            input.disabled = itemsLoading.has(item.uid);
            input.addEventListener('change', (e) => {
              const quantity = parseInt(e.target.value, 10);
              if (quantity > 0) handleItemQuantityUpdate(item, quantity);
            });

            const loading = document.createElement('span');
            loading.className = 'loading-indicator';
            loading.textContent = '...';
            loading.hidden = !itemsLoading.has(item.uid);

            wrapper.append(input, loading);
            ctx.replaceWith(wrapper);
          },
          ItemRemoveAction: (ctx) => {
            const { item, handleItemQuantityUpdate } = ctx;
            const button = document.createElement('button');
            button.className = 'cart-item-remove';
            button.type = 'button';
            button.title = 'Remove item';
            button.innerHTML = '&times;';
            button.addEventListener('click', () => handleItemQuantityUpdate(item, 0));
            ctx.replaceWith(button);
          },
        },
      })(main),

      // Sidebar order summary
      provider.render(OrderSummary, {
        routeCheckout,
        enableCoupons: true,
        enableGiftCards: true,
        showTotalSaved: true,
      })(sidebar),
    ]);
  } catch (error) {
    console.error('Cart block failed to mount:', error);
    // Fallback to empty cart UI
    const fallback = document.createElement('div');
    fallback.className = 'cart-fallback';
    fallback.append(document.createRange().createContextualFragment(`
      <h2>Your cart is empty</h2>
      <p>Looks like you haven't added anything to your cart yet.</p>
      <a href="/" class="button">Continue Shopping</a>
    `));
    block.textContent = '';
    block.append(fallback);
  }

  // Subscribe to cart events
  events.on('cart/data', (payload) => {
    const cart = payload || {};
    const isCartEmpty = !cart.items || cart.items.length === 0;
    block.classList.toggle('cart-empty', isCartEmpty);
  }, { eager: true });
}
