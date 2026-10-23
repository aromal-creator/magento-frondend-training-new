/**
 * Wish list without logging in.
 *
 * Guests: the heart buttons save products in the browser (localStorage) instead of
 * sending the visitor to the login page. The list is shown on the /guest-wishlist page.
 * After login: the saved products are added to the customer's real wish list.
 */
define(['jquery', 'mage/cookies'], function ($) {
    'use strict';

    var storageKey = 'guestWishlist';

    function load() {
        try {
            return JSON.parse(localStorage.getItem(storageKey)) || {};
        } catch (e) {
            return {};
        }
    }

    function save(items) {
        localStorage.setItem(storageKey, JSON.stringify(items));
    }

    function productId(button) {
        try {
            return String(JSON.parse(button.getAttribute('data-post')).data.product);
        } catch (e) {
            return null;
        }
    }

    // Name, link, photo and price from the card (listing) or the product page around the heart
    function productInfo(button) {
        var $card = $(button).closest('.product-item'),
            $price;

        if ($card.length) {
            $price = $card.find('[data-price-type="finalPrice"] .price').first();

            return {
                name: $.trim($card.find('.product-item-link').first().text()),
                url: $card.find('.product-item-link').first().attr('href'),
                image: $card.find('img.product-image-photo').first().attr('src'),
                price: $.trim($price.text())
            };
        }

        $price = $('.product-info-price [data-price-type="finalPrice"] .price').first();

        return {
            name: $.trim($('.page-title .base').first().text()),
            url: window.location.href.split(/[?#]/)[0],
            image: $('.pdp-gallery img, .product.media img').first().attr('src'),
            price: $.trim($price.text())
        };
    }

    function refresh(items) {
        var count = Object.keys(items).length;

        $('.action.towishlist').each(function () {
            $(this).toggleClass('is-active', items.hasOwnProperty(productId(this)));
        });
        $('[data-role="guest-wishlist-count"]').text(count || '').toggle(count > 0);
    }

    function renderPage($container, items) {
        var ids = Object.keys(items),
            $list = $('<ol class="guest-wishlist-items"/>');

        $container.empty();

        if (!ids.length) {
            $container.append($('<p class="guest-wishlist-empty"/>').text('You have no items in your wish list.'));

            return;
        }

        ids.forEach(function (id) {
            var item = items[id],
                $item = $('<li class="guest-wishlist-item"/>');

            $item.append(
                $('<a class="guest-wishlist-photo"/>').attr('href', item.url)
                    .append($('<img/>').attr({src: item.image, alt: item.name})),
                $('<a class="guest-wishlist-name"/>').attr('href', item.url).text(item.name),
                $('<span class="guest-wishlist-price"/>').text(item.price),
                $('<a class="action primary"/>').attr('href', item.url).text('View Product'),
                $('<button type="button" class="guest-wishlist-remove"/>').attr('data-id', id).text('Remove')
            );
            $list.append($item);
        });

        $container.append($list);
    }

    // After login: copy the browser list into the customer's wish list, clear it,
    // then open My Wish List so the customer sees the products (and Magento's "added" messages)
    function moveToAccount(items, addUrl, wishlistUrl) {
        var formKey = $.mage.cookies.get('form_key');

        localStorage.removeItem(storageKey);
        $('body').trigger('processStart');

        $.when.apply($, Object.keys(items).map(function (id) {
            return $.post(addUrl, {product: id, 'form_key': formKey});
        })).always(function () {
            window.location.href = wishlistUrl;
        });
    }

    return function (config) {
        var items = load(),
            $page = $('[data-role="guest-wishlist"]');

        if (config.loggedIn) {
            if (Object.keys(items).length) {
                moveToAccount(items, config.addUrl, config.accountWishlistUrl);
            }
            $page.html($('<p/>').append(
                $('<a/>').attr('href', config.accountWishlistUrl).text('Go to My Wish List')
            ));

            return;
        }

        // Capture phase: runs before Magento's data-post handler, which would redirect to login
        document.addEventListener('click', function (event) {
            var button = event.target.closest('.action.towishlist'),
                id = button && productId(button);

            if (!id) {
                return;
            }
            event.preventDefault();
            event.stopImmediatePropagation();

            items = load();
            if (items.hasOwnProperty(id)) {
                delete items[id];
            } else {
                items[id] = productInfo(button);
            }
            save(items);
            refresh(items);
        }, true);

        $page.on('click', '.guest-wishlist-remove', function () {
            items = load();
            delete items[$(this).data('id')];
            save(items);
            refresh(items);
            renderPage($page, items);
        });

        refresh(items);
        renderPage($page, items);

        // Product carousels/lists that load later (Recently Viewed is rendered by JS)
        $(document).on('contentUpdated', function () {
            refresh(load());
        });
    };
});
