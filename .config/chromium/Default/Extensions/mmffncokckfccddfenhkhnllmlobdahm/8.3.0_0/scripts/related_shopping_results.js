$(document).ready(function()
{
    if(!(window.self === window.top)) { //do not execute in iframe
        return;
    }
    var blacklist = [/veetle.com/, /1800flowers.com/, /dominos.com/, /squidoo.com/, /nytimes.com/,
                     /developer.apple.com/, /hotmail.com/, /nfl.com/, /grooveshark.com/,
                     new RegExp("www.google.com/reader"),
                     new RegExp("www.google.com/calendar"),
                     /pandora.com/,

                     /.*live.com/, /.*battlefield.com/, /pch.com/];
    for(var i = 0; i < blacklist.length; i++) {
        if(blacklist[i].test(document.location.href)) {
            return;
        }
    }

    var SHOW_SCROLLED_HT_MULT = 1.40;
    var HIDE_SCROLLED_HT_MULT = 0.9;

    var inject_script = function(url)
    {
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = url;
        document.getElementsByTagName('head')[0].appendChild(s);
    };

    var get_ctid = function(install_source, install_time)
    {
        var ctid = "-";
        if(/^C/.test(install_source)) {
            ctid = "1";
        }
        else if(/^W/.test(install_source)) {
            ctid = "2";
        }
        else if(/^O.*l$/.test(install_source)) {
            ctid = "3";
        }
        else if(/^I/.test(install_source)) {
            ctid = "4";
        }
        else if(/^O.*y/.test(install_source)) {
            ctid = "5";
        }
        else if(/^f/.test(install_source)) {
            ctid = "6";
        }

        if(/ locale=de /.test(install_source)) {
            ctid += '_de';
        }

        var date = new Date(parseInt(install_time));
        var month_str = "" + (date.getUTCMonth() + 1);
        if(month_str.length < 2) {
            month_str = "0" + month_str;
        }
        ctid = ctid + '_' + date.getUTCFullYear() + '-' + month_str;
        return ctid;
    };

    var hashCode = function(s) {  //adapted from http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
        var hash = 0;
        for(var i = 0; i < s.length; i++) {
            hash = ((hash << 5) - hash) + s.charCodeAt(i);
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    };

    getBoolPref("add_similar_product_search", function(pref_value)
    {
        if(pref_value) {
            getBoolPref('add_price_comparison_results', function(add_price_comparison_results_pref_value) {
            getBoolPref('add_similar_product_search', function(add_similar_product_search_pref_value) {
            getBoolPref('add_related_deals', function(add_related_deals_pref_value) {
            getStringPref('install-source', function(install_source) {
            getStringPref('install-time', function(install_time) {
                var u_hash = Math.abs(hashCode(install_time));
                if(add_related_deals_pref_value && /Chrome/.test(navigator.userAgent)) //only executed from Chrome, not FF
                {
                    add_related_deals_pref_value = false; // we tell the script to not serve up dealply because we are serving it up here
                    SHOW_SCROLLED_HT_MULT = 1.10;
                    HIDE_SCROLLED_HT_MULT = 0.7;
                    add_related_deals_widget('fast_' + get_ctid(install_source, install_time));
                }

                var script_url = 'https://smarterfox.com/api/price_comparison.js?install_source=' + encodeURIComponent(install_source)
                               + '&add_price_comparison_results_pref=' + add_price_comparison_results_pref_value
                               + '&add_similar_product_search_pref=' + add_similar_product_search_pref_value
                               + '&add_related_deals_pref=' + add_related_deals_pref_value
                               + '&ext_name=' + EXTENSION_NAME + '&install_time=' + install_time;
                if($.browser.msie) {
                    inject_script(script_url);
                }
                else
                {
                    $.get(script_url, {}, function(code) {
                        inject_script('data:text/javascript,' + encodeURIComponent(code));
                    }, 'html');
                }
                //The script is cached locally -- Mozilla is fine with it
            });
            });
            });
            });
            });
        }
    });

    /*
    getBoolPref("add_related_deals", function(pref_value)
    {
        if(pref_value) {
            add_related_deals_widget();
        }
    });
    */

    var add_related_deals_widget = function(dealply_tag)
    {
        if(document.location.protocol != "http:") {
            return;
        }

        var widget_style = '<style type="text/css">'
                         + 'iframe.dealply-toast { right: -99999px !important; }'
                         + 'iframe.dealply-toast.fastestext-revealed { right: 0px !important; margin-bottom: 0px !important; }'
                         + '</style>';
        $('head').append(widget_style);

        var inject_dealply = function(channel) {
            if(document.location.href.toLowerCase().indexOf("https:") === 0) {
                inject_script('https://i_fastestjs_info.tlscdn.com/fast/javascript.js?channel=' + channel);
            } else {
                inject_script('http://i.fastestjs.info/fast/javascript.js?channel=' + channel);
            }
        };

        inject_dealply(dealply_tag);

        var WIDGET_SELECTOR = 'iframe.dealply-toast:eq(0)';
        var WIDGET_HEIGHT = '125px';

        var is_widget_hidable = function() {
            return $(WIDGET_SELECTOR).css('position') == 'fixed';
            //we only try to hide fixed widgets in the lower right corner
        };
        var widget_initialized = false;
        var widget_shown = false;
        var show_widget = function()
        {
            if(!is_widget_hidable()) {
                return;
            }
            if(!widget_initialized) {
                $(WIDGET_SELECTOR).height(0).addClass('fastestext-revealed');
                widget_initialized = true;
                widget_shown = false;
            }
            if(!widget_shown) {
                $(WIDGET_SELECTOR).animate({height: WIDGET_HEIGHT}); //slideDown is misnamed, really sets height to *full*. slideDown = show
                widget_shown = true;
            }
        };

        var hide_widget = function()
        {
            if(!is_widget_hidable()) {
                return;
            }
            if(widget_shown) {
                $(WIDGET_SELECTOR).animate({height: 0});
                widget_shown = false;
            }
        };

        var sync_widget_state = function()
        {
            var doc_height = Math.max($(document).height(), $('body').height());
            if(doc_height <= $(window).height())
            {
                //one page, show immediately and that's it
                show_widget();
            }
            else
            {
                var remaining_ht = doc_height - $(document).scrollTop() - $(window).height();

                var SHOW_SCROLLED_HT = $(window).height() * SHOW_SCROLLED_HT_MULT;
                var HIDE_SCROLLED_HT = $(window).height() * HIDE_SCROLLED_HT_MULT;
                var SHOW_REMAINING_HT = 300;
                var HIDE_REMAINING_HT = 400;

                if($(document).scrollTop() > SHOW_SCROLLED_HT || remaining_ht < SHOW_REMAINING_HT) {
                    show_widget();
                }
                else if($(document).scrollTop() < HIDE_SCROLLED_HT && remaining_ht > HIDE_REMAINING_HT) {
                    hide_widget();
                }
                //it's always possible to show the widget by scrolling to the bottom
                //it may not be possible to hide the widget if the page is so small that it's impossible to have more than
                //HIDE_REMAINING_HT of content left.
            }
        };

        $(document).scroll(sync_widget_state);
        setInterval(sync_widget_state, 400); //////////////////could lead to slow down?
        sync_widget_state();
    };
});