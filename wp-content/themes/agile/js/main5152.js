/*jshint undef: true, unused: false, vars: true, plusplus: true */
/*global jQuery:false, window: false, setInterval: false, clearTimeout: false, setTimeout: false, mo_options:false, mo_theme:false, template_dir:false, document:false  */

jQuery.noConflict();

var MO_THEME; // theme namespace

/*================================ Global Function init ==================================*/
// Helps to avoid continuous method execution as can happen in the case of scroll or window resize. Useful specially
// when DOM access/manipulation is involved
var mo_wait_for_final_event = (function () {
    "use strict";
    var timers = {};
    return function (callback, ms, uniqueId) {
        if (!uniqueId) {
            uniqueId = "Don't call this twice without a uniqueId";
        }
        if (timers[uniqueId]) {
            clearTimeout(timers[uniqueId]);
        }
        timers[uniqueId] = setTimeout(callback, ms);
    };
})();

/*---- Enter negative percentage to darken; assumes presence of # - Credit: http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color --*/
var mo_shadeColor = (function () {
    "use strict";
    return function (color, percent) {
        var num = parseInt(color.slice(1), 16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    };
})();

var mo_isIE = (function () {
    "use strict";
    return function (version) {
        var exp = new RegExp('msie' + (!isNaN(version) ? ('\\s' + version) : ''), 'i');
        return exp.test(navigator.userAgent);
    };
})();

var mo_isMobile = (function () {
    "use strict";
    return function () {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return true;
        }
        return false;
    };
})();

/*================================== Theme Function init =======================================*/

(function ($) {

    "use strict";

    MO_THEME = {

        add_body_classes: function () {
            if (mo_isMobile()) {
                $('body').addClass('mobile-device');
            }
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                $('body').addClass('ios-device');
            }
            if (navigator.userAgent.match(/Android/i) !== null) {
                $('body').addClass('android-device');
            }
        },

        toggle_mobile_menu: function () {
            $('#mobile-menu-toggle').toggleClass('menu-open');
            $('body').toggleClass('push-right');
            $('#mobile-menu').toggleClass('slide-open');
        },

        display_numbers: function (duration) {
            /* ------- Numbers ---------- */
            $('.animate-numbers .number').animateNumbers(false, duration);
        },

        display_stats: function () {
            /* ------- Skill Bar --------- */
            $('.skill-bar-content').each(function () {
                var dataperc = $(this).attr('data-perc');
                $(this).animate({ "width": dataperc + "%"}, dataperc * 20);
            });

            /* -------- Charts like Pie Chart -------- */
            var charts = $('.piechart .percentage'),
                bar_color = mo_options.theme_skin,
                track_color = mo_shadeColor(bar_color, 26);
            /* Lighten */
            charts.easyPieChart({
                animate: 2000,
                lineWidth: 20,
                barColor: bar_color,
                trackColor: track_color,
                scaleColor: false,
                lineCap: 'square',
                size: 250

            });
        },

        get_internal_link: function (urlString) {
            var internal_link = null;
            if (urlString.indexOf("#") !== -1) {
                var arr = urlString.split('#');
                if (arr.length === 2) {
                    var url = arr[0];
                    internal_link = '#' + arr[1];
                    // check if this internal link belongs to current URL
                    if (url === (document.URL + '/') || url === document.URL) {
                        return internal_link;
                    }
                } else if (arr.length === 1) {
                    internal_link = '#' + arr[0];
                    return internal_link;
                }
            }
            return internal_link;

        },

        init_page_navigation: function () {

            // make the parent of current page active for lavalamp highlight
            $('#primary-menu > ul > li.current_page_ancestor').first().addClass('active');

            // make the current page active for lavalamp highlight - top list cannot have both a parent and current page item
            $('#primary-menu > ul > li.current_page_item').first().addClass('active');

            // make the parent of current page active for lavalamp highlight
            $('#primary-menu > ul > li.current-page-ancestor').first().addClass('active');

            $('#primary-menu > ul > li.current_page_parent').first().addClass('active');

            // make the current page active for lavalamp highlight - top list cannot have both a parent and current page item
            $('#primary-menu > ul > li.current-page-item').first().addClass('active');

            // make the parent of current page active for lavalamp highlight
            $('#primary-menu > ul > li.current-menu-ancestor').first().addClass('active');

            // make the current page active for lavalamp highlight - top list cannot have both a parent and current page item
            $('#primary-menu > ul > li.current-menu-item').first().addClass('active');

            var lavaLamp = jQuery('html:not(".ie") #primary-menu > ul.menu').lavaLamp({
                speed: 600
            });

            var delay = (function () {
                var timer = 0;
                return function (callback, ms) {
                    clearTimeout(timer);
                    timer = setTimeout(callback, ms);
                };
            })();

            /*--- Sticky Menu -------*/
            var width = $(window).width();
            if (width > 768 && mo_options.sticky_menu) {
                $('#header').waypoint('sticky', {
                    stuckClass: 'sticky',
                    offset: -100,
                    handler: function (direction) {
                        if (direction === "up") {
                            /* Reached the top and hence highlight current page link */
                            $('#primary-menu > ul > li').not(".hover-bg").each(function () {
                                $(this).removeClass('active');
                                var menu_link = $(this).find('a').attr('href').replace(/\/?$/, '/'); // add a trailing slash if not present
                                var current_url = document.URL.replace(/\/?$/, '/');
                                if (menu_link === current_url) {
                                    $(this).addClass('active');
                                    if (lavaLamp !== null) {
                                        lavaLamp.moveLava($(this)[0]);// pass the list element to update lavaLamp menu highlight
                                    }
                                }
                            });
                        } else {
                            if (lavaLamp !== null) {
                                lavaLamp.moveLava(); // Update the position of lavaLamp on reaching the top
                            }
                        }
                    }
                });

                $('#container').waypoint(function () {
                    var height = $('#header').height();
                    $('.sticky-wrapper').height(height);
                    if (lavaLamp !== null) {
                        lavaLamp.moveLava(); // Update the position of lavaLamp on reaching the top
                    }
                });


                $(window).resize(function () {
                    mo_wait_for_final_event(function () {
                        if ($(document).scrollTop() < 50) {
                            var height = $('#header').height();
                            $('.sticky-wrapper').height(height);
                        }
                    }, 200, 'sticky-wrapper-resize');

                });

            }

            /* ----- Smooth Scroll --------*/

            if ($().smoothScroll !== undefined) {
                $('.single-page-template #primary-menu > ul > li > a[href*=#]').smoothScroll(
                    { preventDefault: true, easing: 'swing', speed: 700, offset: -50, exclude: ['.external a'],
                        beforeScroll: function () {
                            // Disable all waypoints on internal divs which are linked to from the menu
                            $('.single-page-template #primary-menu > ul > li > a[href*=#]').each(function () {
                                var element_id = MO_THEME.get_internal_link($(this).attr('href')); // Gives me ids of div's with ids like #work,#service, #portfolio etc.
                                $(element_id).waypoint('disable');
                            });
                        },
                        afterScroll: function () {
                            // Enable all waypoints on internal divs which are linked to from the menu
                            $('.single-page-template #primary-menu > ul > li > a[href*=#]').each(function () {
                                var element_id = MO_THEME.get_internal_link($(this).attr('href')); // Gives me ids of div's with ids like #work,#service, #portfolio etc.
                                $(element_id).waypoint('enable');
                            });
                        }});
                $('.single-page-template #mobile-menu a[href*=#]').smoothScroll(
                    {easing: 'swing', speed: 700, offset: 0, exclude: ['.external a']});
            }


            /* --------- One Page Menu --------- */
            $('.single-page-template #primary-menu > ul > li > a[href*=#]').click(function () {
                $(this).closest('ul').children('li').each(function () {
                    $(this).removeClass('active');
                });
                $(this).parent('li').addClass('active');
            });
            $('.single-page-template #primary-menu > ul > li > a[href*=#]').each(function () {
                var current_div_selector = MO_THEME.get_internal_link($(this).attr('href')); // Give ids of div's with ids like #work,#service, #portfolio etc.

                $(current_div_selector).waypoint(function (direction) {
                        if (direction === "up") {
                            $('#primary-menu > ul > li').not(".hover-bg").each(function () {
                                $(this).removeClass('active');
                                if ($(this).find('a').attr('href').indexOf(current_div_selector) !== -1) {
                                    $(this).addClass('active');
                                    lavaLamp.moveLava($(this)[0]);// pass the list element to update lavaLamp menu highlight
                                }
                            });
                        }
                    }, {
                        offset: function () {
                            var half_browser_height = $.waypoints('viewportHeight') / 2;
                            var element_height = $(this).height();
                            var result = 0;
                            if (element_height > half_browser_height) {
                                result = -( element_height - (half_browser_height)); // enable when top of the div is half exposed on the screen
                            }
                            else {
                                result = -(element_height / 2); // enable the menu when everything is visible
                            }
                            return result;
                        }
                    }
                );
                $(current_div_selector).waypoint(function (direction) {
                    if (direction === "down") {
                        $('#primary-menu > ul > li').not(".hover-bg").each(function () {
                            $(this).removeClass('active');
                            if ($(this).find('a').attr('href').indexOf(current_div_selector) !== -1) {
                                $(this).addClass('active');
                                lavaLamp.moveLava($(this)[0]);
                            }
                        });
                    }
                }, { offset: '50%' });
            });

        },

        init_menus: function () {
            /* For sticky and primary menu navigation */
            $('.dropdown-menu-wrap > ul').superfish({
                delay: 300, // one second delay on mouseout
                animation: {height: 'show'}, // fade-in and slide-down animation
                speed: 'fast', // faster animation speed
                autoArrows: false // disable generation of arrow mark-up
            });


            /* Take care of internal links too - close the menu when scrolling from internal links */
            $("#mobile-menu-toggle, #mobile-menu a[href*=#]").click(function () {
                MO_THEME.toggle_mobile_menu();
                return true;
                /* must return true to record click event for smooth scroll of internal links */
            });

            /* Close the mobile menu if the user touches the right document when mobile menu is open */
            $('#container').on('click touchstart', function () {
                if ($('body').hasClass('push-right')) {
                    MO_THEME.toggle_mobile_menu();
                    return false;
                    /* no need to do anything else for now until menu closes */
                }
                return true;
                /* continue with normal click activity */
            });

            $("#mobile-menu ul li").each(function () {
                var sub_menu = $(this).find("> ul");
                if (sub_menu.length > 0 && $(this).addClass("has-ul")) {
                    $(this).append('<div class="sf-sub-indicator"><i class="icon-uniF488"></i></div>');
                }
            });

            $('#mobile-menu ul li:has(">ul") > div').click(function () {
                $(this).siblings("ul.sub-menu").stop(true, true).slideToggle();
                $(this).parent().toggleClass("open");
                return false;
            });

            this.init_page_navigation();
        },

        scroll_effects: function () {
            if ($().waypoint === undefined) {
                return;
            }

            $(".download-buttons .appstore img, .profiles .profile-header img, .download-buttons .google-play img, #client-list .twocol img, .single-page-template .showcase-section .image-area, #featured-app .app-screenshot img, .features-list-alternate i").css('opacity', 0);

            $(".download-buttons").waypoint(function (direction) {
                $(this).find(".appstore img").addClass("animated fadeInLeft"); // flash only the button
                $(this).find(".google-play img").addClass("animated fadeInRight"); // flash only the button
            }, { offset: $.waypoints('viewportHeight') - 200,
                triggerOnce: true});


            $(".features-list-alternate i").waypoint(function (direction) {
                $(this).addClass("animated fadeIn");
            }, { offset: $.waypoints('viewportHeight') - 300,
                triggerOnce: true});

            $(".single-page-template .showcase-section .image-area").waypoint(function (direction) {
                $(this).addClass("animated fadeInUp");
            }, { offset: $.waypoints('viewportHeight') - 150,
                triggerOnce: true});

            $("#client-list .twocol img").waypoint(function (direction) {
                $(this).addClass("animated fadeIn");
            }, { offset: $.waypoints('viewportHeight') - 250,
                triggerOnce: true});

            $("#featured-app .app-screenshot img").waypoint(function (direction) {
                $(this).addClass("animated fadeInUp");
            }, { offset: $.waypoints('viewportHeight') - 450,
                triggerOnce: true});

            $(".profiles .profile-header img").waypoint(function (direction) {
                $(this).addClass("animated fadeIn");
            }, { offset: $.waypoints('viewportHeight') - 250,
                triggerOnce: true});

            /* ------------------- Stats -----------------------------*/

            $("#stats-section").waypoint(function (direction) {

                MO_THEME.display_stats();

            }, { offset: $.waypoints('viewportHeight') - 250,
                triggerOnce: true});

            $(".animate-numbers").waypoint(function (direction) {
                setTimeout(function () {
                    MO_THEME.display_numbers(2400)
                }, 100);

            }, { offset: $.waypoints('viewportHeight') - 100,
                triggerOnce: true});

        },

        prettyPhoto: function () {

            if ($().prettyPhoto === undefined) {
                return;
            }

            var theme_selected = 'pp_default';

            $("a[rel^='prettyPhoto']").prettyPhoto({
                "theme": theme_selected, /* light_rounded / dark_rounded / light_square / dark_square / facebook */
                social_tools: false
            });
        },

        toggle_state: function (toggle_element) {
            var active_class;
            var current_content;

            active_class = 'active-toggle';

            // close all others first
            toggle_element.siblings().removeClass(active_class);
            toggle_element.siblings().find('.toggle-content').slideUp("fast");

            current_content = toggle_element.find('.toggle-content');

            if (toggle_element.hasClass(active_class)) {
                toggle_element.removeClass(active_class);
                current_content.slideUp("fast");
            }
            else {
                toggle_element.addClass(active_class);
                current_content.slideDown("fast");
            }
        },

        validate_contact_form: function () {
            /* ------------------- Contact Form Validation ------------------------ */
            var rules = {
                contact_name: {
                    required: true,
                    minlength: 5
                },
                contact_email: {
                    required: true,
                    email: true
                },
                contact_phone: {
                    required: false,
                    minlength: 5
                },
                contact_url: {
                    required: false,
                    url: true
                },
                message: {
                    required: true,
                    minlength: 15
                }
            };
            var messages = {
                contact_name: {
                    required: mo_theme.name_required,
                    minlength: mo_theme.name_format
                },
                contact_email: mo_theme.email_required,
                contact_url: mo_theme.url_required,
                contact_phone: {
                    minlength: mo_theme.phone_required
                },
                message: {
                    required: mo_theme.message_required,
                    minlength: mo_theme.message_format
                }
            };
            $("#content .contact-form").validate({
                rules: rules,
                messages: messages,
                errorClass: 'form-error',
                submitHandler: function (theForm) {
                    $.post(
                        theForm.action,
                        $(theForm).serialize(),
                        function (response) {
                            $("#content .feedback").html('<div class="success-msg">' + mo_theme.success_message + '</div>');
                            theForm.reset();
                        });
                }

            });
            $(".widget .contact-form").validate({
                rules: rules,
                messages: messages,
                errorClass: 'form-error',
                submitHandler: function (theForm) {
                    $.post(
                        theForm.action,
                        $(theForm).serialize(),
                        function (response) {
                            $(".widget .feedback").html('<div class="success-msg">' + mo_theme.success_message + '</div>');
                            theForm.reset();
                        });
                }

            });
        }


    };

})(jQuery);

/*======================== Plugins ======================*/

(function ($) {

    "use strict";

    $.fn.lavaLamp = function (o) {

        o = $.extend({ fx: "easeOutBack", speed: 500, click: function () {
        } }, o || {});

        if (this.length === 0) {
            return null;
        }

        function setCurr(el) {
            hover_element.css({ left: el.offsetLeft + "px", width: el.offsetWidth + "px" });
            current = el;
        }

        function move(el) {
            hover_element.each(function () {
                    $.dequeue(this, "fx");
                }
            ).animate({
                    width: el.offsetWidth,
                    left: el.offsetLeft
                }, o.speed, o.fx);
        }

        var me = $(this), noop = function () {
            },
            hover_element = $('<li class="hover-bg"></li>').appendTo(me),
            list_element = $(">li", this),
            current = $("li.active", this)[0] || $(list_element[0]).addClass("active")[0];

        var delay = (function () {
            var timer = 0;
            return function (callback, ms) {
                clearTimeout(timer);
                timer = setTimeout(callback, ms);
            };
        })();

        var moveLava = function (el) {
            if (el) {
                setCurr(el);
            }
            else {
                hover_element.css({left: current.offsetLeft + "px", width: current.offsetWidth + "px"});
            }
        };

        list_element.not(".hover-bg").hover(function () {
            move(this);
        }, noop);

        $(this).hover(noop, function () {
            move(current);
        });

        list_element.click(function (e) {
            setCurr(this);
            return o.click.apply(this, [e, this]);
        });
        setCurr(current);

        $(window).resize(function () {
            delay(function () {
                hover_element.css({left: current.offsetLeft + "px", width: current.offsetWidth + "px"});
            }, 200);

        });

        return {
            moveLava: moveLava
        };

    };
})(jQuery);

/*======================== Document event handling ======================*/

jQuery(document).ready(function ($) {

    "use strict";

    /* -------------------------- Initialize document based on platform type -------------------- */

    MO_THEME.add_body_classes();

    /* ---------------------------------- Drop-down Menu.-------------------------- */

    MO_THEME.init_menus();

    /* --------- Back to top function ------------ */
    $(window).scroll(function () {
        mo_wait_for_final_event(function () {
            var yPos = $(window).scrollTop();
            /* show back to top after screen has scrolled down 200px from the top in desktop and big size tablets only */
            if (yPos > 200) {
                if (!mo_options.disable_back_to_top) {
                    $("#go-to-top").fadeIn();
                }
            } else {
                $("#go-to-top").fadeOut();
            }
        }, 200, 'go-to-top');
    });


    // Animate the scroll to top
    $('#go-to-top').click(function (event) {
        event.preventDefault();
        $('html, body').animate({scrollTop: 0}, 600);
    });

    /* ------------------- Scroll Effects ----------------------------- */


    if (!mo_options.disable_animations_on_page && !mo_isIE() && !mo_isMobile()) {
        MO_THEME.scroll_effects();
    }
    else {

        //Show stats without waiting for user to scroll to the element
        MO_THEME.display_stats();
        setTimeout(function () {
            MO_THEME.display_numbers(2400)
        }, 200);

        // Show elements rightaway without animation
        $('#featured-app .app-screenshot').addClass('visible');
        $('#feature-pointers img').css({ opacity: 1});
    }


    /* ------------------- Tabs and Accordions plus Tooltips ------------------------ */

    $("ul.tabs").tabs(".pane");

    $(".accordion").tabs("div.pane", {
        tabs: 'div.tab',
        effect: 'slide',
        initialIndex: 0
    });

    $(".social-list li a[title]").tooltip();

    $(".single-page-template .page_section a.edit-button[title]").tooltip();


    /* ------------------- Back to Top and Close ------------------------ */

    $(".back-to-top").click(function (e) {
        $('html,body').animate({
            scrollTop: 0
        }, 600);
        e.preventDefault();
    });

    $('a.close').click(function (e) {
        e.preventDefault();
        $(this).closest('.message-box').fadeOut();
    });


    $(".toggle-label").toggle(
        function () {
            MO_THEME.toggle_state($(this).parent());
        },
        function () {
            MO_THEME.toggle_state($(this).parent());
        }
    );

    // Hide the honeypot trap field
    $("p.trap-field").hide();

    MO_THEME.validate_contact_form();
    /* -------------------------------- PrettyPhoto Lightbox --------------------------*/


    MO_THEME.prettyPhoto();

    /* ------------------------------- Ticker display in home page --------------- */

    $('.ticker').each(function () {
        var num = 1;
        var height = $(this).height();
        var count = $(this).children().length;
        var elem = $(this).find('div:nth-child(1)');
        setInterval(function () {
            var top = num * -height;
            elem.css("margin-top", top + "px");
            if (num === count) {
                elem.css("margin-top", "0px");
                num = 1;
            } else {
                num++;
            }
        }, 2000);
    })

    /* --------------------------- YouTube Video display ------------------------- */

    if (!mo_isMobile()) {
        $(".ytp-player").mb_YTPlayer({
            startAt: 0,
            showYTLogo: false,
            showControls: false
        });
    }

    /*-----------------------------------------------------------------------------------*/
    /*	jQuery isotope functions and Infinite Scroll
     /*-----------------------------------------------------------------------------------*/

    $(function () {

        if ($().isotope === undefined) {
            return;
        }

        var post_snippets = $('.post-snippets').not('.bx-wrapper .post-snippets').not('.pane .post-snippets');

        post_snippets.imagesLoaded(function () {
            $(this).isotope({
                // options
                itemSelector: '.entry-item',
                layoutMode: 'fitRows'
            });
        });

        var container = $('#showcase-items');
        if (container.length === 0) {
            return;
        }

        container.imagesLoaded(function () {
            $(this).isotope({
                // options
                itemSelector: '.showcase-item',
                layoutMode: 'fitRows'
            });

            $('#showcase-filter a').click(function (e) {
                e.preventDefault();

                var selector = $(this).attr('data-value');
                container.isotope({ filter: selector });
                return false;
            });
        });

        if (mo_options.ajax_showcase) {
            if ($().infinitescroll !== undefined && $('.pagination').length) {

                container.infinitescroll({
                        navSelector: '.pagination', // selector for the paged navigation
                        nextSelector: '.pagination .next', // selector for the NEXT link (to page 2)
                        itemSelector: '.showcase-item', // selector for all items you'll retrieve
                        loading: {
                            msgText: mo_theme.loading_portfolio,
                            finishedMsg: mo_theme.finished_loading,
                            img: template_dir + '/images/loader.gif',
                            selector: '#main'
                        }
                    },
                    // call Isotope as a callback
                    function (newElements) {
                        var $newElems = $(newElements);
                        $newElems.imagesLoaded(function () {
                            container.isotope('appended', $newElems);
                        });
                        MO_THEME.prettyPhoto();
                    });
            }
        }
    });

    /*-----------------------------------------------------------------------------------*/
    /*	Handle videos in responsive layout - Credit - http://css-tricks.com/NetMag/FluidWidthVideo/Article-FluidWidthVideo.php
     /*-----------------------------------------------------------------------------------*/

    $("#content, #sidebar-primary, #footer").fitVids();

    // Take care of maps too - https://github.com/davatron5000/FitVids.js - customSelector option
    $("#content").fitVids({ customSelector: "iframe[src^='http://maps.google.com/']"});
    $("#content").fitVids({ customSelector: "iframe[src^='https://maps.google.com/']"});


    /*----------------- Parallax Effects - only on desktop ------------------ */

    var width = $(window).width();
    if (width > 1100) {

        $('.parallax-banner').parallax("50%", 0.6);

    }


});

jQuery(window).load(function () {

    if (!mo_options.disable_smooth_page_load) {
        jQuery("#page-loading").delay(500).fadeOut("slow");
    }

    /* Temporary fix for Chrome 33 Build Fonts display issue */
    jQuery('body').width(jQuery('body').width()+1).width('auto');
});