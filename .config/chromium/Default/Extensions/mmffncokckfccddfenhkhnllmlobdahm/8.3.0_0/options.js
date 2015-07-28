$(document).ready(function()
{
    var assert = function(b)
    {
        if(!b) {
            throw new Error('assertion failed');
        }
    };

    var get_pref = function(key, callback)
    {    
        chrome.extension.sendMessage({"msg_type": "get_pref", "key": key}, function(response)
        {
            if(callback) {
                callback(response.value);
            }
        });
    };

    var set_pref = function(key, value, callback)
    {    
        chrome.extension.sendMessage({"msg_type": "set_pref", "key": key, "value": value}, function(response)
        {
            if(callback) {
                callback(response.status);
            }
        });
    };

    var setBoolPref = function(pref_name, value, callback)
    {
        set_pref(pref_name, value, callback);
    };

    var getBoolPref = function(pref_name, callback)
    {
        get_pref(pref_name, function(str)
        {
            if(callback) {
                callback((""+str) == "true");
            }
        });
    };

    var setStringPref = function(pref_name, value, callback)
    {
        set_pref(pref_name, value, callback);
    };

    var getStringPref = function(pref_name, callback)
    {
        get_pref(pref_name, function(str)
        {
            if(callback) {
                callback(str);
            }
        });
    };
    

    $(document).ready(function()
    {
        if(navigator.userAgent.indexOf('Chrome/') != -1) {
            $('body').addClass('chrome-browser');
        }

        $(window.location.hash).addClass("highlighted-option");
        var link_checkbox_to_pref = function($checkbox, pref_key)
        {
            var recv_value = function()
            {
                getBoolPref(pref_key, function(val)
                {
                    if(val) {
                        $checkbox.addClass('active')
                    }
                    else {
                        $checkbox.removeClass('active')
                    }
                    if(pref_key == "search_custom")
                    {
                        //clean up this code in future
                        if($checkbox.hasClass('active')){
                            $("#custom-config").slideDown();
                        } else {
                            $("#custom-config").slideUp();
                        }
                    }
                });
            };
            var send_value = function()
            {
                setBoolPref(pref_key, $checkbox.hasClass("active"));
            };
                        
            recv_value();
            $checkbox.click(function()
            {                
                $(this).toggleClass('active');
                send_value();
                if(pref_key == "search_custom")
                {
                    //clean up this code in future
                    if($checkbox.hasClass('active')){
                        $("#custom-config").slideDown();
                    } else {
                        $("#custom-config").slideUp();
                    }
                }
            });
        };

        var link_input_to_pref = function($text_input, pref_key, default_val)
        {
            var recv_value = function()
            {
                getStringPref(pref_key, function(val)
                {
                    if(!val) {
                        $text_input.val(default_val).addClass('default');
                    }
                    else {
                        $text_input.val(val).removeClass('default');
                    };
                });
            };
            var send_value = function()
            {
                setStringPref(pref_key, $text_input.val());
            };
            
            
            recv_value();
            $text_input.click(function()
            {
                if($text_input.hasClass('default')) {
                    $text_input.val('').removeClass('default');
                }
                send_value();
            }).change(send_value).keyup(send_value);
        };
        
        link_input_to_pref($('#endless-pages-blacklist-input'), 'endless_pages_blacklist', 'e.g. reddit.com');
        link_input_to_pref($('#custom-search-icon-url-input'), 'custom_search_icon_url', 
                            'e.g. http://www.google.com/favicon.ico');
        link_input_to_pref($('#custom-search-search-url-input'), 'custom_search_search_url', 
                            'e.g. http://www.google.com/search?q={searchTerms}');


        var bool_prefs = [
            'enable_linkify', 
            'add_related_articles', 
            'enable_endless_pages',
            'add_related_searches',
            'add_related_shopping_results',
            'add_price_comparison_results',
            'add_related_deals',
            'add_serp_info_box',
            'add_search_refinements',
            'add_similar_product_search',
            'show_popup_bubble',
            'search_wikipedia',
            'search_imdb',
            'search_duckduckgo',
            'search_yandex',
            'search_google_translate',
            'search_twitter',
            'search_surfcanyon',
            'search_bing',
            'search_baidu',
            'search_youtube',
            'search_wiktionary',
            'search_blekko',
            'search_google_maps',
            'search_google',
            'search_custom',

            'popup_bubble_show_definitions',
            'popup_bubble_show_link_info',
            'popup_bubble_add_share_attribution',
            'popup_bubble_show_link_info_always',
            'popup_bubble_open_new_tab',
            'popup_bubble_force_single_row',
            'popup_bubble_display_above_text',
        ];
        for(var i = 0; i < bool_prefs.length; i++)
        {
            var $checkbox = $('#' + bool_prefs[i].replace(/_/g, '-') + '-checkbox');
            //assert($checkbox.length == 1)
            link_checkbox_to_pref($checkbox, bool_prefs[i]);
        }
    });
});