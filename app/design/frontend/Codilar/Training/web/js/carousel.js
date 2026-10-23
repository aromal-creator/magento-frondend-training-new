/**
 * Horizontal carousel: a scroll-snap track with prev/next arrows, one dot per page and optional autoplay.
 *
 * Markup: [data-role=track] (the scrolling list), [data-role=prev], [data-role=next], [data-role=dots].
 * Options: autoplay (ms between pages, 0 = off).
 */
define(['jquery'], function ($) {
    'use strict';

    return function (config, element) {
        var $root = $(element),
            track = $root.find('[data-role=track]')[0],
            $dots = $root.find('[data-role=dots]'),
            autoplay = config.autoplay || 0,
            timer;

        if (!track) {
            return;
        }

        function pageCount() {
            return Math.max(1, Math.ceil((track.scrollWidth - 5) / track.clientWidth));
        }

        function currentPage() {
            if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 5) {
                return pageCount() - 1;
            }

            return Math.round(track.scrollLeft / track.clientWidth);
        }

        function goTo(page) {
            var count = pageCount();

            page = (page + count) % count;
            track.scrollTo({left: page * track.clientWidth, behavior: 'smooth'});
        }

        function markDot() {
            $dots.children().removeClass('active').eq(currentPage()).addClass('active');
        }

        function renderDots() {
            var i;

            $dots.empty();

            for (i = 0; i < pageCount(); i++) {
                $('<button type="button" class="carousel-dot"></button>')
                    .attr('aria-label', 'Go to slide ' + (i + 1))
                    .data('page', i)
                    .appendTo($dots);
            }
            markDot();
        }

        function start() {
            if (autoplay) {
                timer = setInterval(function () {
                    goTo(currentPage() + 1);
                }, autoplay);
            }
        }

        $root.on('click', '[data-role=prev]', function () {
            goTo(currentPage() - 1);
        });
        $root.on('click', '[data-role=next]', function () {
            goTo(currentPage() + 1);
        });
        $dots.on('click', '.carousel-dot', function () {
            goTo($(this).data('page'));
        });
        $(track).on('scroll', function () {
            window.requestAnimationFrame(markDot);
        });
        $(window).on('resize', renderDots);

        $root.on('mouseenter', function () {
            clearInterval(timer);
        }).on('mouseleave', start);

        renderDots();
        start();
    };
});
