
import { render as provider } from '@dropins/storefront-wishlist/render.js';
import Wishlist from '@dropins/storefront-wishlist/containers/Wishlist.js';
import WishlistAlert from '@dropins/storefront-wishlist/containers/WishlistAlert.js';
import { events } from '@dropins/tools/event-bus.js';
import { tryRenderAemAssetsImage } from '@dropins/tools/lib/aem/assets.js';
import '../../scripts/initializers/wishlist.js';

/**
 * Gets the product detail page route for a product
 * @param {Object} product - The product object
 * @returns {string} The product detail page route
 */
function routeProductDetailPage(product) {
  return `/products/${product.url_key || product.sku}`;
}

/**
 * Gets the route for the empty wishlist CTA
 * @param {string} link - The authored link
 * @returns {string} The route
 */
function routeEmptyWishlistCTA(link) {
  return link || '/';
}

/**
 * Moves products from wishlist to cart
 * @param {Array} products - Array of products to move
 * @returns {Promise} Promise that resolves when the operation completes
 */
async function moveProductsToCart(products) {
  try {
    const { addProductsToCart } = await import('@dropins/storefront-cart/api.js');
    return await addProductsToCart(products);
  } catch (error) {
    console.error('Failed to move products to cart:', error);
    return null;
  }
}

/**
 * Decorates the wishlist block
 * @param {Element} block - The wishlist block element
 */
export default async function decorate(block) {
  // Read authored content
  const rows = Array.from(block.children);
  const configRow = rows[0]?.children;
  const emptyWishlistCTAText = configRow?.[0]?.textContent?.trim() || 'Continue Shopping';
  const emptyWishlistCTALink = configRow?.[1]?.querySelector('a')?.getAttribute('href') || '/';
  const wishlistTitle = configRow?.[2]?.textContent?.trim() || 'My Wishlist';
  const variant = configRow?.[3]?.textContent?.trim().toLowerCase() || '';

  // Apply variant class
  if (variant) {
    block.classList.add(variant);
  }

  // Create layout DOM
  block.textContent = '';
  block.classList.add('wishlist-block');

  const header = document.createElement('div');
  header.classList.add('wishlist-header');
  const title = document.createElement('h2');
  title.classList.add('wishlist-title');
  title.textContent = wishlistTitle;
  header.appendChild(title);
  block.appendChild(header);

  const container = document.createElement('div');
  container.classList.add('wishlist-container');
  block.appendChild(container);

  const alertContainer = document.createElement('div');
  alertContainer.classList.add('wishlist-alert-container');
  block.appendChild(alertContainer);

  // Mount Wishlist container
  await provider.render(Wishlist, {
    routeEmptyWishlistCTA: () => routeEmptyWishlistCTA(emptyWishlistCTALink),
    routeToWishlist: '/wishlist',
    moveProdToCart: moveProductsToCart,
    routeProdDetailPage: routeProductDetailPage,
    getProductData: async (sku) => {
      try {
        const { getProductData } = await import('@dropins/storefront-pdp/api.js');
        return await getProductData(sku);
      } catch {
        return null;
      }
    },
    getRefinedProduct: async (sku, optionUIDs, anchorOptions, raw) => {
      try {
        const { getRefinedProduct } = await import('@dropins/storefront-pdp/api.js');
        return await getRefinedProduct(sku, optionUIDs, anchorOptions, raw);
      } catch {
        return null;
      }
    },
    slots: {
      image: (ctx) => {
        const { item, defaultImageProps } = ctx;
        const wrapper = document.createElement('a');
        wrapper.href = routeProductDetailPage(item.product);
        wrapper.classList.add('wishlist-item-image');
        tryRenderAemAssetsImage(ctx, {
          alias: item.product.sku,
          imageProps: defaultImageProps,
          wrapper
        });
      }
    }
  })(container);

  // Mount WishlistAlert container
  await provider.render(WishlistAlert, {
    routeToWishlist: '/wishlist'
  })(alertContainer);

  // Handle wishlist events
  events.on('wishlist/data', (payload) => {
    if (!payload || payload.items_count === 0) {
      container.classList.add('wishlist-empty');
      const emptyMessage = document.createElement('div');
      emptyMessage.classList.add('wishlist-empty-message');
      emptyMessage.innerHTML = `
        <p>Your wishlist is currently empty.</p>
        <a href="${routeEmptyWishlistCTA(emptyWishlistCTALink)}" class="wishlist-empty-cta">
          ${emptyWishlistCTAText}
        </a>
      `;
      container.appendChild(emptyMessage);
    } else {
      container.classList.remove('wishlist-empty');
      const emptyMessage = container.querySelector('.wishlist-empty-message');
      if (emptyMessage) {
        emptyMessage.remove();
      }
    }
  }, { eager: true });

  events.on('wishlist/alert', (payload) => {
    if (payload) {
      const alert = alertContainer.querySelector('.wishlist-alert');
      if (alert) {
        alert.remove();
      }
    }
  });
}
    