/**
 * Main JS file for Hoia
 */

jQuery(document).ready(function($) {

    var config = {
        'share-selected-text': true,
        'load-more': true,
        'infinite-scroll': false,
        'disqus-shortname': 'hauntedthemes-demo'
    };

    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
        rellax,
        msnry;

    // Add classes and attributes for Rellax library
    $('.content-inner .post-content a img:only-child').each(function(index, el) {
        $(this).parent().addClass('img-holder');
    });

    $('.content-inner .post-content img').each(function(index, el) {
        $(this).attr('style', 'transform: translateX(-50%)');
    });

    if ($('.content-inner .post-content img').length) {
        $('.content-inner .post-content img').each(function(index, el) {
            $(this).attr('data-rellax-speed', '2');
            $(this).attr('data-rellax-percentage', '0.5');
        });
    };

    $('.content-inner img').addClass('rellax');
    setTimeout(function() {
        $('.content-inner .content-holder img, .grid img, .content-inner img').addClass('notransition');
    }, 300);

    if (w < 767) {
        $('.rellax').attr('data-rellax-speed', 1.2);
        $('.rellax').attr('data-rellax-percentage', 0.3);
    };

    $(window).load(function() {

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

    });

    // Load more posts on click
    if (config['load-more']) {

        $('#load-posts').addClass('visible');

        var nextPage = 2;
        var pagination = $('#load-posts').attr('data-posts_per_page');

        $('#load-posts').click(function() {

            var parseUrl = '&include=tags&limit=' + pagination + '&page=' + nextPage;
            if ($('body').attr('data-author')) {
                parseUrl = parseUrl + '&filter=author:' + $('body').attr('data-author');
            }else if($('body').attr('data-tag')){
                parseUrl = parseUrl + '&filter=tag:' + $('body').attr('data-tag');
            }

            $.ajax({
                url: ghost.url.api("posts") + parseUrl,
                type: 'get'
            }).done(function(data) {
                $.each(data.posts, function(i, post) {
                    $.ajax({
                        url: ghost.url.api("users") + '&filter=id:' + post.author,
                        type: 'get'
                    }).done(function(data) {
                        $.each(data.users, function(i, users) {
                            insertPost(post, users);
                        });
                    });
                });
            }).done(function(data) {
                var sum = nextPage*pagination;
                if (sum >= data.meta.pagination.total) {
                    $('#load-posts').addClass('hidden');
                }
                nextPage += 1;
            }).fail(function(err) {
                console.log(err);
            });
        });
    };

    // Infinite scroll
    if (config['infinite-scroll'] && config['load-more']) {
        var checkTimer = 'on';
        if ($('#load-posts').length > 0) {
            $(window).on('scroll', function(event) {
                var timer;
                if (isScrolledIntoView('#load-posts') && checkTimer == 'on') {
                    $('#load-posts').click();
                    checkTimer = 'off';
                    timer = setTimeout(function() {
                        checkTimer = 'on';
                    }, 1000);
                };
            });
        };
    };

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

    // Initialize ghostHunter - A Ghost blog search engine
    $("#search-field").ghostHunter({
        results             : "#results",
        onKeyUp             : true,
        displaySearchInfo   : false,
        result_template     : "<li><a href='{{link}}' title='{{title}}'>{{title}}</a></li>",
        onComplete      : function( results ){
            $('#results li').each(function(index, el) {
                if (index > 9) {
                    $(this).hide();
                };
            });
        }
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

    // Hoia's functions

    // Check if element is into view when scrolling
    function isScrolledIntoView(elem){
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();

        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();

        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }

    // Get first number of words from a string
    function getWords(str) {
        return str.split(/\s+/).slice(0,44).join(" ");
    }

    // Append posts on masonry container
    function insertPost(postData, authorData) {

        var d = postData.published_at.slice(0, 10).split('-');
        var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var monthNumber = d[1];
        if (monthNumber.slice(0,1) == '0') {
            monthNumber = monthNumber.slice(1,2) - 1;
        }else{
            monthNumber--;
        };

        var featured = '';

        if (postData.featured) {
            featured = 'featured';
        };

        var datetime = d[0] +'-'+ d[1] +'-'+ d[2];
        var date = d[2] +' '+ monthNames[monthNumber] +' '+ d[0];
        var excerpt;
        if (postData.custom_excerpt != null) {
            excerpt = postData.custom_excerpt;
        }else{
            excerpt = getWords($(postData.html).text());
        };

        var data = {
            title: postData.title,
            date: {
                "datetime": datetime,
                "date": date
            },
            featured: featured,
            url: postData.url,
            excerpt: excerpt,
            author: {
                "slug": authorData.slug,
                "name": authorData.name
            },
            tags: function(){
                if (!$.isEmptyObject(postData.tags)) {
                    data.tags.tag = postData.tags;
                    return true;
                };
            },
            feature_image: function(){
                if (postData.feature_image != '' && postData.feature_image != null) {
                    return postData.feature_image;
                };
            },
        }

        var template = [
            '<article class="post grid-item {{#tags}}{{#tags.tag}}tag-{{slug}} {{/tags.tag}}{{/tags}}">',
               ' <div class="post-meta">',
                    '<a href="/author/{{author.slug}}/">{{author.name}}</a>',
                    '<time class="post-date" datetime="{{date.datetime}}">{{date.date}}</time>',
                '</div>',
                '<h2 class="post-title"><a href="{{url}}" title="{{title}}">{{title}}</a></h2>',
                '<div class="content-holder">',
                    '{{#feature_image}}',
                        '<a href="{{url}}" title="{{title}}" class="img-holder">',
                            '<img src="{{feature_image}}" alt="{{title}}" class="rellax notransition" data-rellax-speed="2" data-rellax-percentage="0.5">',
                        '</a>',
                    '{{/feature_image}}',
                    '<p>',
                        '{{excerpt}}',
                        '<br>',
                        '<a class="read-more btn" href="{{url}}" title="{{title}}">Read more</a>',
                    '</p>',
                '</div>',
            '</article>'
        ].join("\n");

        var post = Mustache.render(template, data);
        post = $(post);

        post.addClass('hidden');
        $('#content').append( post );
        $('#content').imagesLoaded( function() {
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
    }

    // Resize menu
    function resizeMenu(){
        h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        var navHeight = $('header nav').height();
        var navHeightUl = $('header nav ul').height();
        
        if ((navHeightUl + 200) < (h - $('header .menu-container .menu-container-header').outerHeight() - $('header .social').outerHeight())) {
            $('header nav').removeClass('fixed-height');  
        }else{
            $('header nav').addClass('fixed-height');  
        };
    }

    // Validate email input
    function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

});