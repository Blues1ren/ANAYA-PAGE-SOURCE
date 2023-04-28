var unloadingState = false;

$(document).ready(function () {

    $(window).bind("beforeunload", function () {
        unloadingState = true;
    });

    /**
     * Replace all SVG images with inline SVG
     */
    $('img.svg-icon').each(function () {
        var $img = $(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');
        var iconColor = $img.attr('data-icon-color');
        var iconColorType = $img.attr('data-icon-color-type');

        $.ajax({
            type: "GET",
            url: imgURL,
            global: false,
            cache: true,
            success: function (data) {
                // Get the SVG tag, ignore the rest
                var $svg = $(data).find('svg');

                // Add replaced image's ID to the new SVG
                if (typeof imgID !== 'undefined') {
                    $svg = $svg.attr('id', imgID);
                }
                // Add replaced image's classes to the new SVG
                if (typeof imgClass !== 'undefined') {
                    $svg = $svg.attr('class', imgClass + ' replaced-svg');
                }
                // Change color to the new SVG
                if (typeof iconColor !== 'undefined') {
                    $svg.find('> path').css(typeof iconColorType !== 'undefined' ? iconColorType : 'fill', iconColor);
                }

                // Remove any invalid XML tags as per http://validator.w3.org
                $svg = $svg.removeAttr('xmlns:a');

                // Replace image with new SVG
                $img.replaceWith($svg);
            }
        });
    });

    jqueryNativeAjax = $.ajax;
    $.ajax = function () {
        var data = {};
        data[$('#csrf-name').attr('name')] = $('#csrf-name').attr('content');
        data[$('#csrf-value').attr('name')] = $('#csrf-value').attr('content');

        if (arguments[0].enctype == 'multipart/form-data') {
            arguments[0].data.append($('#csrf-name').attr('name'), $('#csrf-name').attr('content'));
            arguments[0].data.append($('#csrf-value').attr('name'), $('#csrf-value').attr('content'));
        } else if (typeof arguments[0].data == "undefined") {
            arguments[0].data = data;
        } else {
            arguments[0].data = $.extend(true, data, arguments[0].data);
        }
        return jqueryNativeAjax.apply($, arguments);
    };

    $(document).ajaxError(function (msg) {
        if (!unloadingState) {
            ajaxError();
        }
    });

    // Loading
    $(document).ajaxStop(function () {
        $.unblockUI();
    });
    $(document).ajaxStart(function () {
        showLoading();
    });
    $('.show-loading').click(function () {
        showLoading();
    });
    $('form').submit(function () {
        if (!$(this).hasClass('skip-loading')) {
            showLoading();
        }
    });


    window.addEventListener('scroll', function () {
        $('[data-sticky-to]').each(function () {
            var to = $(this).attr('data-sticky-to')
            var position = $('#' + to)[0].getBoundingClientRect();
            if (position.top > 0) {
                $(this).css('position', 'sticky');
            } else {
                $(this).css('position', 'inherit');
            }
        });
    });


    $('[data-url][data-url!=""]').on('click', function () {
        var url = $(this).attr('data-url');
        var target = $(this).attr('data-target') != null && $(this).attr('data-target') != '' ? $(this).attr('data-target') : null;
        if (target != null) {
            window.open(url, target);
        } else {
            if (window.location != window.parent.location) {
                window.parent.location = url;
            } else {
                window.location = url;
            }
        }
    });

    if ($('#post-subscribe-form').length) {
        $('.blog-post .post-subscribe').on('click', function () {
            if ($('#post-subscribe-form:visible').length) {
                $('#post-subscribe-form').slideUp();
            } else {
                $('#post-subscribe-form').slideDown();
            }
        });

        var errorMsg = '';
        $.validator.addMethod('checkEmailNotExists', function (value, element, param) {
            errorMsg = '';

            var dataParams = {"post_id": $(element).closest('form').find('[name="post_id"]').val(), "email": value};

            $.post({
                url: "/post/subscribe/check_email",
                async: false,
                data: dataParams,
                dataType: 'json',
                success: function (result) {
                    if (result == 1) {
                        errorMsg = __('js.blog_post_subscription.email_repeated');
                    }
                }
            });

            return !errorMsg.length;
        }, function () {
            return errorMsg;
        });

        $('#post-subscribe-form .subscriber-form').validate({
            onkeyup: false,
            rules: {
                email: {
                    checkEmailNotExists: true
                }
            },
            submitHandler: function (form) {
                grecaptcha.ready(function () {
                    grecaptcha.execute($('[data-recaptcha-public-key]').attr('data-recaptcha-public-key'), {action: 'post_subscribe'}).then(function (token) {
                        var data = new FormData(form);
                        data.append('token', token);

                        $.ajax({
                            type: 'POST',
                            url: '/post/subscribe',
                            data: data,
                            processData: false,
                            contentType: false,
                            success: function (data) {
                                if (data.error != null) {
                                    ajaxError();
                                } else {
                                    $('#post-subscribe-form .subscriber-form').slideUp(function () {
                                        $('#post-subscribe-form .subscriber-validate-form [name="email"]').val($('#post-subscribe-form .subscriber-form [name="email"]').val());
                                        $('#post-subscribe-form .subscriber-validate-form').slideDown();
                                    });
                                }
                            }
                        });
                    });
                });
                return false;
            },
            invalidHandler: defaultFormValidationHandler
        });

        $('#post-subscribe-form .subscriber-validate-form').validate({
            onkeyup: false,
            submitHandler: function (form) {
                var data = new FormData(form);
                $.ajax({
                    type: 'POST',
                    url: '/post/subscribe/validate',
                    data: data,
                    processData: false,
                    contentType: false,
                    success: function (data) {
                        if (data.error != null) {
                            if (data.error == 'incorrect_code') {
                                $('<label class="error">' + __('js.blog_post_subscription.code_not_valid') + '</label>').insertAfter('#post-subscribe-form .subscriber-validate-form [name="code"]');
                            } else if (data.error == 'exists_email') {
                                $('<label class="error">' + __('js.blog_post_subscription.email_repeated') + '</label>').insertAfter('#post-subscribe-form .subscriber-validate-form [name="code"]');
                            } else {
                                ajaxError();
                            }
                        } else {
                            $('#post-subscribe-form .subscriber-validate-form').slideUp(function () {
                                $('#post-subscribe-form .form-success').slideDown();
                            });
                        }
                    }
                });
                return false;
            },
            invalidHandler: defaultFormValidationHandler
        });

        $('#post-subscribe-form .subscriber-validate-form input').on('change', function () {
            $(this).siblings('.error').remove();
        });
    }

    sameHeight('.same-height-container', '.same-height-content');
    $(window).on('resize', function () {
        sameHeight('.same-height-container', '.same-height-content');
    });

    $('[data-fancybox][data-fancybox-type]').fancybox({
        toolbar: false,
        smallBtn: true,
        clickContent: false,
        iframe: {
            preload: false
        },
        caption: function (instance, item) {
            var caption = $(this).data('caption') || '';

            // Add caption with a link to open de document in new tab
            if (!caption.length && item.contentType == 'iframe') {
                caption = '<a href="' + (item.opts.fancyboxType == 'fancybox-doc' ? item.opts.fileUrl : item.src) + '" target="_blank">' + __('js.fancybox.open_new_tab') + '</a>';
            }

            return caption;
        },
        afterShow: function (instance, current) {
            if ($(instance.$trigger).attr('data-fancybox-type') != 'fancybox-doc') {
                return;
            }

            // Google docs often not load the document
            // Try some times if the document load (with different timemouts)
            var fileUrl = $(instance.$trigger).attr('data-file-url');
            var activeIframe = $(current.$iframe);
            var reloadIframeTimeouts = [2, 2, 2, 2, 2, 2, 8, 12];
            reloadIframeTimeoutId = reloadIframeTimeout(activeIframe, reloadIframeTimeouts, fileUrl);

            activeIframe.on('load', function () {
                clearInterval(reloadIframeTimeoutId);
            });
        },
        afterClose: function () {
            if (typeof reloadIframeTimeoutId != 'undefined' && reloadIframeTimeoutId != null) {
                clearInterval(reloadIframeTimeoutId);
            }
        }
    });

    $('.catalogue-card .cover img, .section-product .cover img, .related-books-container img').each(function () {
        addErrorEvent(this);
    });
});

var reloadIframeTimeoutId;
function reloadIframeTimeout(activeIframe, reloadIframeTimeouts, fileUrl) {
    return setTimeout(function () {
        if (reloadIframeTimeouts.length) {
            activeIframe.attr('src', activeIframe.attr('src'));
            reloadIframeTimeoutId = reloadIframeTimeout(activeIframe, reloadIframeTimeouts, fileUrl);
        } else {
            // If the document finally is not loaded, open in new tab
            parent.$.fancybox.close();
            window.open(fileUrl, '_blank');
        }
    }, reloadIframeTimeouts.shift() * 1000);
}

function __(text) {
    return text;
}

function showLoading() {
    if (!$('#loading-img').length) {
        $('.loading-img-container').remove();
        $('body').append('<div class="loading-img-container"><img id="loading-img" src="/web/images/loading.gif" /></div>');
    }
    $.blockUI({
        message: $('#loading-img'),
        css: {
            border: 'none',
            padding: '15px',
            backgroundColor: '#fff',
            '-webkit-border-radius': '100%',
            '-moz-border-radius': '100%',
            opacity: .8,
            color: '#fff',
            width: 'auto',
            left: 'calc(50% - 48px)'
        },
        overlayCSS: {backgroundColor: '#000'}
    });
}

function defaultFormValidationHandler(event, validator) {
    $.unblockUI();
}

function ajaxError() {
    showError(__('js.common.ajax_error'));
}




function CSRFToForm() {
    $('form[method="post"]').each(function () {
        $(this).prepend('<input type="hidden" name="' + $('#csrf-name').attr('name') + '" value="' + $('#csrf-name').attr('content') + '">');
        $(this).prepend('<input type="hidden" name="' + $('#csrf-value').attr('name') + '" value="' + $('#csrf-value').attr('content') + '">');
    });
}

$(window).on('load', function () {
    sameHeight('.same-height-container', '.same-height-content');
});

function sameHeight(container, selector) {
    $(container).each(function () {
        $(this).removeClass('load-completed');
        $(this).find(selector).css('height', '');
        var highestBox = 0;
        $(this).find(selector).each(function () {
            if ($(this).height() > highestBox) {
                highestBox = $(this).height();
            }
        });
        $(this).find(selector).height(highestBox);
        $(this).addClass('load-completed');
    });
}

function alignImages(container) {
    container.find('img').each(function () {
        if (this.complete) {
            setTimeout(function () {
                sameHeight('.same-height-container', '.same-height-content');
            }, 1);
        } else {
            $(this).one('load', function () {
                sameHeight('.same-height-container', '.same-height-content');
            });
        }
    });
}

function addErrorEvent(img) {
    if (img.complete) {
        if (img.naturalHeight == 0) {
            fallbackImage(img);
        }
    } else {
        $(img).on('error', function () {
            fallbackImage(this);
        });
    }
}

function fallbackImage(img) {
    $(img).off('error');
    var imgName = $(img).attr('src').split('#').shift().split('?').shift().split('/').pop();
    $(img).attr('src', $(img).attr('src').replace(imgName, 'no_disponible.jpg'));
}





