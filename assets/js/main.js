/**
 * Main JS file for Hoia
 */

jQuery(document).ready(function($) {

    if(typeof changeConfig !== "undefined"){
        config = Object.assign(config, changeConfig);
    }

    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
        rellax,
        msnry;

    var ghostAPI = new GhostContentAPI({
        url: config['content-api-url'],
        key: config['content-api-key'],
        version: 'v3'
    });

    setGalleryRation();

    // Add classes and attributes for Rellax library
    $('.content-inner .post-content a img:only-child').each(function(index, el) {
        $(this).parent().addClass('img-holder');
    });

    $('.content-inner .post-content img:not(.kg-image):not(.kg-bookmark-icon):not(.kg-bookmark-thumbnail img), .content-inner .kg-image-card').each(function(index, el) {
        $(this).attr('style', 'transform: translateX(-50%)');
    });

    if ($('.content-inner .post-content img:not(.kg-image):not(.kg-bookmark-icon):not(.kg-bookmark-thumbnail img), .content-inner .kg-image-card').length) {
        $('.content-inner .post-content img:not(.kg-image):not(.kg-bookmark-icon):not(.kg-bookmark-thumbnail img), .content-inner .kg-image-card').each(function(index, el) {
            $(this).attr('data-rellax-speed', '2');
            $(this).attr('data-rellax-percentage', '0.5');
        });
    };

    $('.content-inner img:not(.kg-image):not(.kg-bookmark-icon):not(.kg-bookmark-thumbnail img), .content-inner .kg-image-card').addClass('rellax');
    setTimeout(function() {
        $('.content-inner .content-holder img, .grid img, .content-inner .post-content img:not(.kg-image):not(.kg-bookmark-icon):not(.kg-bookmark-thumbnail img), .content-inner .kg-image-card').addClass('notransition');
    }, 300);

    if (w < 767) {
        $('.rellax').attr('data-rellax-speed', 1.2);
        $('.rellax').attr('data-rellax-percentage', 0.3);
    };

    $(window).on('load', function(event) {

        setGalleryRation();

        // Initialize Masonry - Cascading grid layout library
        if ($('#content.grid').length) {
            var elem = document.querySelector('#content.grid');
            msnry = new Masonry(elem, {
                itemSelector: '#content .grid-item',
                columnWidth: '#content .grid-sizer',
                hiddenStyle: {
                    opacity: 0
                },
                visibleStyle: {
                    opacity: 1
                }
            });
        }

        // Initialize Rellax - Parallax library
        if ($('.rellax').length) {
            rellax = new Rellax('.rellax');
        };

        var currentPage = 1;
        var pathname = window.location.pathname;
        var $result = $('.grid-item');
        var step = 0;

        // remove hash params from pathname
        pathname = pathname.replace(/#(.*)$/g, '').replace('/\//g', '/');

        if ($('body').hasClass('paged')) {
            currentPage = parseInt(pathname.replace(/[^0-9]/gi, ''));
        }

        // Load more posts on click
        if (config['load-more']) {

            $('#load-posts').addClass('visible');

            $('#load-posts').on('click', function(event) {
                event.preventDefault();

                if (currentPage == maxPages) {
                    $('#load-posts').addClass('hidden');
                    return;
                };

                var $this = $(this);

                // next page
                currentPage++;

                if ($('body').hasClass('paged')) {
                    pathname = '/';
                };

                // Load more
                var nextPage = pathname + 'page/' + currentPage + '/';

                if ($this.hasClass('step')) {
                    setTimeout(function() {
                       $this.removeClass('step');
                       step = 0;
                    }, 1000);
                };

                $.get(nextPage, function (content) {
                    step++;
                    var post = $(content).find('.post');
                    post.addClass('hidden');
                    post.find('img').addClass('notransition');
                    $('#content.grid').append( post );
                    $('#content.grid').imagesLoaded( function() {
                        msnry.appended( post );
                        post.removeClass('hidden');
                        if (w < 767) {
                            $('.rellax').attr('data-rellax-speed', 1.2);
                            $('.rellax').attr('data-rellax-percentage', 0.3);
                        };
                        if (rellax) {
                            rellax.destroy();
                        }
                        rellax = new Rellax('.rellax');
                    });
                });

            });
        };

        if (config['infinite-scroll'] && config['load-more']) {
            var checkTimer = 'on';
            if ($('#load-posts').length > 0) {
                $(window).on('scroll', function(event) {
                    var timer;
                    if (isScrolledIntoView('#load-posts') && checkTimer == 'on' && step < config['infinite-scroll-step']) {
                        $('#load-posts').click();
                        checkTimer = 'off';
                        timer = setTimeout(function() {
                            checkTimer = 'on';
                            if (step == config['infinite-scroll-step']) {
                                $('#load-posts').addClass('step');
                            };
                        }, 1000);
                    };
                });
            };
        };

    });

    // Menu trigger
    var disabled = false;
    $('header .menu-container').css('overflow', 'hidden');
    $('.nav-trigger').on('click', function(event) {
        event.preventDefault();
        if (disabled == false) {
            disabled = true;
            if (!$('body').hasClass('new-active')) {
                $('header').addClass('active');
                $('header .menu-container').css({
                    opacity: '1',
                    zIndex: '9995'
                });
                setTimeout(function() {
                    $('body, html').addClass('new-active');
                    $('header .menu-container').css('overflow-y', 'scroll');
                    disabled = false;
                }, 300);
            }else{
                $('header').removeClass('active');
                $('header .menu-container').css({
                    opacity: '0'
                });
                $('body, html').removeClass('new-active');
                $('header .menu-container').css('overflow-y', 'hidden');
                setTimeout(function() {
                    $('header .menu-container').css({
                        zIndex: '-1',
                    });
                    disabled = false;
                }, 300);
            };
        };
    });
    resizeMenu();

    // Search trigger
    $('.search-trigger').on('click', function(event) {
        event.preventDefault();
        $('#search-field').focus();
        if (disabled == false) {
            disabled = true;
            if (!$('body').hasClass('new-active')) {
                $('header .search-container').css({
                    opacity: '1',
                    zIndex: '9995'
                });
                setTimeout(function() {
                    $('body, html').addClass('new-active');
                    $('header .search-container').css('overflow-y', 'scroll');
                    disabled = false;
                }, 300);
            }else{
                $('#search-field').blur();
                $('header .search-container').css({
                    opacity: '0'
                });
                $('body, html').removeClass('new-active');
                $('header .search-container').css('overflow-y', 'hidden');
                setTimeout(function() {
                    $('header .search-container').css({
                        zIndex: '-1',
                    });
                    disabled = false;
                }, 300);
            };
        };
    });

    var ghostSearch = new GhostSearch({
        url: config['content-api-url'],
        key: config['content-api-key'],
        input: '#search-field',
        results: '#results',
        template: function(result) {
            var url = [location.protocol, '//', location.host].join('');
            return '<li><a href="' + url + '/' + result.slug + '/">' + result.title + '</a></li>';  
        },
    });

    // Validate Subscribe input
    $('.gh-signin').on('submit', function(event) {
        var email = $('.gh-input').val();
        if (!validateEmail(email)) {
            $('.gh-input').addClass('error');
            setTimeout(function() {
                $('.gh-input').removeClass('error');
            }, 500);
            event.preventDefault();
        };
    });

    // Initialize shareSelectedText
    if (config['share-selected-text']) {
        shareSelectedText('.content-inner .post-content', {
            sanitize: true,
            buttons: [
                'twitter',
            ],
            tooltipTimeout: 250
        });
    };

    // Position social share buttons inside a single post
    var checkIfSticky = 0;
    if (w >= 992) {
        stickIt();
        checkIfSticky = 1;
    };
    function stickIt(){
        $('.content-inner .post-content .social-share').stick_in_parent({
            offset_top: 50
        });
    }

    // Initialize Disqus comments
    if ($('#content').attr('data-id') && config['disqus-shortname'] != '') {

        $('.comments').append('<div id="disqus_thread"></div>')

        var url = [location.protocol, '//', location.host, location.pathname].join('');
        var disqus_config = function () {
            this.page.url = url;
            this.page.identifier = $('#content').attr('data-id');
        };

        (function() {
        var d = document, s = d.createElement('script');
        s.src = '//'+ config['disqus-shortname'] +'.disqus.com/embed.js';
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
        })();
    };

    $(window).on('resize', function () {

        w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

        resizeMenu();

        if (w < 768) {
            $('.rellax').attr('data-rellax-speed', 1.2);
            $('.rellax').attr('data-rellax-percentage', 0.3);
        }else{
            $('.rellax').attr('data-rellax-speed', 2);
            $('.rellax').attr('data-rellax-percentage', 0.5);
        };

        if (w < 960) {
            $('.content-inner .post-content .social-share').trigger("sticky_kit:detach");
            checkIfSticky = 0;
        }else{
            if (checkIfSticky == 0) {
                stickIt();
                checkIfSticky++;
            }
        };

        setTimeout(function() {
            if (rellax) {
                $('.rellax').attr('style', '');
                $('.content-inner .post-content img').each(function(index, el) {
                    $(this).attr('style', 'translateX(-50%)');
                });
                rellax.destroy();
                rellax = new Rellax('.rellax');
            }
        }, 400);
    });

    // Initialize Highlight.js
    $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
    });

    // Hoia's functions

    // Check if element is into view when scrolling
    function isScrolledIntoView(elem){
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();

        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();

        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }

    // Resize menu
    function resizeMenu(){
        h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        var navHeight = $('header nav').height();
        var navHeightUl = $('header nav ul').height();
        var headerNavHeight = h - $('header .menu-container .menu-container-header').outerHeight() - $('header .social').outerHeight() - 10;
        
        if ((navHeightUl + 200) < headerNavHeight) {
            $('header nav').removeClass('fixed-height');  
            $('header nav').height(headerNavHeight);
        }else{
            $('header nav').addClass('fixed-height');  
        };
    }

    // Validate email input
    function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    // Set the right proportion for images inside the gallery
    function setGalleryRation(){
        $('.kg-gallery-image img').each(function(index, el) {
            var container = $(this).closest('.kg-gallery-image');
            var width = $(this)[0].naturalWidth;
            var height = $(this)[0].naturalHeight;
            var ratio = width / height;
            container.attr('style', 'flex: ' + ratio + ' 1 0%');
        });
    }

    // Parse the URL parameter
    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    // Give the parameter a variable name
    var action = getParameterByName('action');
    var stripe = getParameterByName('stripe');

    if (action == 'subscribe') {
        $('body').addClass("subscribe-success");
    }
    if (action == 'signup') {
        window.location = '/signup/?action=checkout';
    }
    if (action == 'checkout') {
        $('body').addClass("signup-success");
    }
    if (action == 'signin') {
        $('body').addClass("signin-success");
    }
    if (stripe == 'success') {
        $('body').addClass("checkout-success");
    }
    $('.notification-close').click(function () {
        $(this).parent().addClass('closed');
        var uri = window.location.toString();
        if (uri.indexOf("?") > 0) {
            var clean_uri = uri.substring(0, uri.indexOf("?"));
            window.history.replaceState({}, document.title, clean_uri);
        }
    });

});