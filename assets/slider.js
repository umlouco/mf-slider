(function ($) {
  var LIGHTBOX_MODAL_ID = 'wplsLightboxModal';
  var LIGHTBOX_BODY_SELECTOR = '.wpls-lightbox__body';
  var lastActiveElement = null;

  function closeLightbox() {
    var $modal = $('#' + LIGHTBOX_MODAL_ID);
    if (!$modal.length) return;

    $modal.removeClass('is-visible').attr('aria-hidden', 'true');
    $modal.find(LIGHTBOX_BODY_SELECTOR).empty();
    $('body').removeClass('wpls-lightbox-open');

    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
    lastActiveElement = null;
  }

  function ensureLightbox() {
    var $modal = $('#' + LIGHTBOX_MODAL_ID);
    if ($modal.length) {
      return $modal;
    }

    $modal = $(
      '<div id="' + LIGHTBOX_MODAL_ID + '" class="wpls-lightbox" role="dialog" aria-modal="true" aria-hidden="true">' +
        '<div class="wpls-lightbox__content" role="document" tabindex="-1">' +
          '<button type="button" class="wpls-lightbox__close" aria-label="Close">&times;</button>' +
          '<div class="wpls-lightbox__body"></div>' +
        '</div>' +
      '</div>'
    );

    $('body').append($modal);

    $modal.on('click', '.wpls-lightbox__close', function (event) {
      event.preventDefault();
      closeLightbox();
    });

    $modal.on('click', function (event) {
      if (event.target === event.currentTarget) {
        closeLightbox();
      }
    });

    $(document).on('keyup.wpls-lightbox', function (event) {
      if (event.key === 'Escape') {
        closeLightbox();
      }
    });

    return $modal;
  }

  function openLightbox($sourceSlider, startIndex) {
    var $modal = ensureLightbox();
    var $body = $modal.find(LIGHTBOX_BODY_SELECTOR);
    var template = $sourceSlider.data('wpls-template') || $sourceSlider.html();
    var totalItems = parseInt($sourceSlider.attr('data-wpls-total'), 10);

    if (!template) {
      return;
    }

    if (isNaN(totalItems) || totalItems <= 0) {
      totalItems = $sourceSlider.find('li').length;
    }

    if (typeof startIndex !== 'number' || startIndex < 0 || startIndex >= totalItems) {
      startIndex = 0;
    }

    var sliderId = 'wpls-lightbox-' + Date.now();
    var $wrapper = $('<div class="wpls-demo"></div>');
    var $list = $('<ul>', {
      id: sliderId,
      'class': 'wpls-lightSlider wpls-lightbox-slider',
      'data-wpls-total': totalItems
    }).html(template);

    $wrapper.append($list);
    $body.empty().append($wrapper);

    lastActiveElement = document.activeElement;

    $modal.addClass('is-visible').attr('aria-hidden', 'false');
    $('body').addClass('wpls-lightbox-open');

    setTimeout(function () {
      initWPLightSlider($list, { startIndex: startIndex });
      var $content = $modal.find('.wpls-lightbox__content');
      if ($content.length) {
        $content.trigger('focus');
      }
    }, 0);
  }

  function initWPLightSlider($ul, options) {
    options = options || {};
    if (!$ul || !$ul.length) return null;
    if (typeof $ul.lightSlider !== 'function') return null;

    if (!$ul.data('wpls-template')) {
      $ul.data('wpls-template', $ul.html());
    }

    if ($ul.data('wpls-initialized')) {
      return $ul.data('wpls-slider') || null;
    }

    var startIndex = typeof options.startIndex === 'number' ? options.startIndex : null;

    $ul.data('wpls-initialized', true);

    var slider = $ul.lightSlider({
      gallery: true,
      item: 1,
      loop: true,
      slideMargin: 0,
      thumbItem: 4,
      enableTouch: true,
      enableDrag: true,
      controls: true,
      onSliderLoad: function () {
        const $outer = $ul.closest('.lSSlideOuter');
        if (!$outer.length) return;

        // Append custom nav over the thumb pager
        if (!$outer.find('.thumb-action').length) {
          $outer.append(
            '<div class="lSAction thumb-action">' +
              '<a id="thumb-prev" class="lSPrev" aria-label="Thumbs previous"></a>' +
              '<a id="thumb-next" class="lSNext" aria-label="Thumbs next"></a>' +
            '</div>'
          );
        }

        // Position buttons vertically centered against pager after layout
        setTimeout(function () {
          const pager = $outer.find('.lSPager')[0];
          const thumbAction = $outer.find('.thumb-action')[0];
          if (pager && thumbAction) {
            const pagerHeight = pager.offsetHeight;
            const buttonHeight = thumbAction.offsetHeight || 32;
            const bottomPosition = (pagerHeight - buttonHeight + 30) / 2;
            thumbAction.style.position = 'absolute';
            thumbAction.style.bottom = bottomPosition + 'px';
            thumbAction.style.left = '0';
            thumbAction.style.right = '0';
          }
        }, 100);

        // Scrollable thumbs (translate)
        var currentOffset = 0;
        $outer.on('click', '#thumb-next', function () {
          var $li = $outer.find('.lSPager li').first();
          if (!$li.length) return;
          var thumbWidth = $li.outerWidth(true);
          var totalThumbs = $outer.find('.lSPager li').length;
          var visibleWidth = $outer.find('.lSPager').parent().width();
          var totalWidth = thumbWidth * totalThumbs;

          if (currentOffset + visibleWidth < totalWidth) {
            currentOffset += thumbWidth;
            $outer.find('.lSPager').css('transform', 'translate3d(-' + currentOffset + 'px,0,0)');
          }
        });

        $outer.on('click', '#thumb-prev', function () {
          var $li = $outer.find('.lSPager li').first();
          if (!$li.length) return;
          var thumbWidth = $li.outerWidth(true);
          if (currentOffset > 0) {
            currentOffset -= thumbWidth;
            if (currentOffset < 0) currentOffset = 0;
            $outer.find('.lSPager').css('transform', 'translate3d(-' + currentOffset + 'px,0,0)');
          }
        });

        if (startIndex !== null && slider && typeof slider.goToSlide === 'function') {
          slider.goToSlide(startIndex + 1);
        }
      }
    });

    $ul.data('wpls-slider', slider);

    if (!$ul.hasClass('wpls-lightbox-slider')) {
      $ul.on('click.wpls-lightbox', 'li img', function (event) {
        event.preventDefault();

        var $item = $(this).closest('li');
        var indexAttr = $item.attr('data-wpls-index');
        var index = parseInt(indexAttr, 10);
        if (isNaN(index)) {
          index = $item.index();
        }

        if (index < 0) return;
        openLightbox($ul, index);
      });
    }

    return slider;
  }

  // Init all instances on DOM ready
  jQuery(function () {
    $('.wpls-lightSlider').each(function () {
      initWPLightSlider($(this));
    });
  });

  // In case of AJAX renders (e.g. block in FSE), listen for events
  document.addEventListener('wpls:init', function (e) {
    if (e && e.detail && e.detail.selector) {
      jQuery(e.detail.selector).each(function () {
        initWPLightSlider(jQuery(this));
      });
    }
  });
})(jQuery);
