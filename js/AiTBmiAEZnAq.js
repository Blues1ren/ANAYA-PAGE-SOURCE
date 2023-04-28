function lazyLoadingImg() {
    if (typeof LAZY_IMAGES !== 'undefined' && LAZY_IMAGES == 1) {
        $('[lazy-src]').Lazy({'attribute': 'lazy-src', 'effect': 'fadeIn'});
    }
}

function toggleMainSubmenu() {

    $('#main-header').toggleClass("is-open");
    $('#header-search').removeClass('open');
    $('#private-submenu').removeClass('appear');

}

function toggleItemsSubmenu(item) {
    $(item).closest('.project-item').find('.hide').toggleClass("show");
    $(item).closest('.project-item').find('.arrow-submenu').toggleClass("rotate");
}

function openSubmenuMobile(item) {
    $(item).next('.project-submenu').toggleClass("show");
    $(item).find('.arrow-icon').toggleClass("rotate");
}

function DropDown(el) {

    this.dd = el;
    this.placeholder = this.dd.find('span');
    this.opts = this.dd.find('ul.drop li');
    this.val = '';
    this.index = -1;
    this.initEvents();

}

function selectTab(el) {
    var tabIndex = $('.tab-header .items').index(el);
    $(el).addClass('selected').siblings().removeClass('selected');
    $('.tab-content:not(:eq(' + tabIndex + '))').fadeOut(function () {
        $('.tab-content').eq(tabIndex).fadeIn();
    });

}

function openPrivateZoneSubmenu() {

    $('#private-submenu').toggleClass('appear');
    $('#main-header').removeClass('is-open');
    $('#header-search').removeClass('open');

}

function onAddTags() {

    if ($('#wrapper-tags').length) {

        $('#wrapper-tags').append('<div onclick="onRemoveTags(this)" class="tags"><span>' + $('#input-value').val() + '</span><img src="../../images/close-icon.svg" /></div>');

    }

}

function onRemoveTags(el) {

    $(el).remove();

}

function openSearch() {

    $('#header-search').toggleClass('open');
    $('#main-header').removeClass('is-open');
    $('#private-submenu').removeClass('appear');


}

function openCriteria(index) {

    $('.inner').eq(index).fadeToggle();
    $('.arrow-criteria').eq(index).toggleClass('rotate');

}


DropDown.prototype = {

    initEvents: function () {

        var obj = this;
        obj.dd.on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).siblings().removeClass('active');
            $(this).toggleClass('active');
        });

        obj.opts.on('click', function () {

            var opt = $(this);
            obj.val = opt.text();
            obj.index = opt.index();
            obj.placeholder.text(obj.val);
            opt.siblings().removeClass('selected');
            opt.filter(':contains("' + obj.val + '")').addClass('selected');

        }).change();
    },
    getValue: function () {

        return this.val;

    },
    getIndex: function () {

        return this.index;

    }
};

$.fn.isInViewport = function () {

    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();
    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();
    return elementBottom > viewportTop && elementTop < viewportBottom;

};

$(function () {
    lazyLoadingImg();

    $('.collapsable .title').click(function () {
        $(this).parent().toggleClass('active');
    });

    var animateSectionLinks = function () {
        if (($('#section-links').length && $('#section-links .transform').length) && ((!$('#section-links .transform').hasClass('translate-origin') && $('#section-links').isInViewport()))) {
            $('#section-links .transform').addClass('translate-origin');
        }

        if ($('#section-results').length && $('#seeker-bar').length && window.innerWidth > 1070) {
            if (!$('#section-results').isInViewport()) {
                $('#seeker-bar').addClass('not-sticky');
            } else {
                $('#seeker-bar').removeClass('not-sticky');

            }
        }
    };

    $(window).on('scroll', animateSectionLinks);
    $(window).on('load', animateSectionLinks);

    if ($('.section-slider').length) {

        $('.section-slider').slick({
            lazyLoad: 'ondemand',
            arrows: false,
            dots: true,
            infinite: false,
            mobileFirst: true,
            customPaging: function (slider, i) {
                return '<a href="#"></a>';
            }

        }).on('afterChange', function (event, slick, currentSlide, nextSlide) {
            lazyLoadingImg();
        }).on('beforeChange', function (event, slick, currentSlide, nextSlide) {
            lazyLoadingImg();
        });

    }

    if ($('.section-most-populars').length) {
        $('.section-most-populars').each(function () {
            var items = $(this).find('.item').length;
            var sliderContainer = $(this).closest('.slider-container');
            if (items > 3) {
                $(this).slick({
                    lazyLoad: 'ondemand',
                    arrows: sliderContainer.find('.slider-next, .slider-prev').length > 0,
                    dots: true,
                    variableWidth: true,
                    infinite: true,
                    responsive: [
                        {
                            breakpoint: 460,
                            settings: {
                                variableWidth: false,
                                settings: "unslick",
                                slidesToShow: 2,
                            }
                        }
                    ],
                    customPaging: function (slider, i) {
                        return '<a href="#"></a>';
                    },
                    nextArrow: sliderContainer.find('.slider-next'),
                    prevArrow: sliderContainer.find('.slider-prev')
                }).on('afterChange', function (event, slick, currentSlide, nextSlide) {
                    lazyLoadingImg();
                }).on('beforeChange', function (event, slick, currentSlide, nextSlide) {
                    lazyLoadingImg();
                });

            } else {
                var options = {
                    arrows: sliderContainer.find('.slider-next, .slider-prev').length > 0,
                    dots: false,
                    variableWidth: false,
                    infinite: false,
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    draggable: false,
                    centerMode: true,
                    centerPadding: '0px',
                    customPaging: function (slider, i) {
                        return '<a href="#"></a>';
                    },
                    nextArrow: sliderContainer.find('.slider-next'),
                    prevArrow: sliderContainer.find('.slider-prev')
                };

                if (items == 3) {
                    options.responsive = [
                        {
                            breakpoint: 460,
                            settings: {
                                slidesToShow: 2,
                                draggable: true,
                                centerMode: false,
                                dots: true,
                            }
                        }
                    ];
                }

                $(this).slick(options)
                        .on('beforeChange', function (event, slick, currentSlide, nextSlide) {
                            lazyLoadingImg();
                        }).on('afterChange', function (event, slick, currentSlide, nextSlide) {
                    lazyLoadingImg();
                });
                $(this).find('.slick-track').addClass('slick-center-mode');
            }
        });
    }

    if ($('.section-piece-keys-mobile').length) {

        $('.section-piece-keys-mobile > .wrapper').slick({
            lazyLoad: 'ondemand',
            arrows: false,
            dots: true,
            infinite: true,
            customPaging: function (slider, i) {
                return '<a href="#"></a>';
            }
        }).on('beforeChange', function (event, slick, currentSlide, nextSlide) {
            lazyLoadingImg();
        }).on('afterChange', function (event, slick, currentSlide, nextSlide) {
            lazyLoadingImg();
        });

    }

    $('.wrap-drop').each(function () {
        new DropDown($(this));
    });


    $(document).click(function (event) {
        $('.wrap-drop').removeClass('active');
        if ($('#private-submenu').length && !$(event.target).hasClass('nav-item')) {
            $('#private-submenu').removeClass('appear');
        }

        if ($('#main-header').hasClass('is-open') && !$(event.target).closest('.project-item > *, .project-items-mobile, .mobile-nav .submenu-icon, .mobile-nav .close-icon').length && !$(event.target).hasClass('books-launcher')) {
            toggleMainSubmenu();
        }

        if ($('#header-search').hasClass('open') && !$(event.target).closest('.header-search, .icon-seeker').length) {
            openSearch();
        }
    });

    $('.searchform').each(function () {
        var requiredCheckboxes = $(this).find(':checkbox[required]');
        requiredCheckboxes.change(function () {
            if (requiredCheckboxes.is(':checked')) {
                requiredCheckboxes.removeAttr('required');
            } else {
                requiredCheckboxes.attr('required', 'required');
            }
        });
    });

    $('.btn-action-search').click(function () {
        $(this).closest('form').find(':checkbox[required]').trigger('change');
        $(this).closest('form').find('[type="submit"]').click();
    });

    $('.tab-header .items').first().addClass('selected');

    $(window).on('resize', function () {
        $('.section-promo').each(function () {
            $(this).find('.content').css('position', 'unset');
            var minHeight = $(this).find('.content').outerHeight() + ($(this).find('.btn').length ? $(this).find('.btn').outerHeight() + parseInt($(this).find('.btn').css('bottom')) : 0);
            $(this).find('.wrapper-promo, img').css('min-height', minHeight + 'px');
            $(this).find('.content').css('position', 'absolute');
        });
    }).resize();

    $(window).on('load', function () {
        $(window).resize();
    });

});

