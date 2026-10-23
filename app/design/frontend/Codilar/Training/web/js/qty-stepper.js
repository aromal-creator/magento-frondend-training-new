/**
 * -/+ buttons around the product page quantity input.
 */
define(['jquery'], function ($) {
    'use strict';

    return function (config, element) {
        var $input = $(element).find('input.qty');

        $(element).on('click', '[data-qty-step]', function () {
            var step = parseInt($(this).data('qty-step'), 10),
                value = Math.max(1, (parseInt($input.val(), 10) || 1) + step);

            $input.val(value).trigger('change');
        });
    };
});
