//Author: Yongqian Li <yongqli@10gic.net>
//(C)2012 Yongqian Li. All rights reserved

(function()
{
    var install_source = "";
    getStringPref('install-source', function(pref) {
        install_source = pref;
    });
    var install_time = "";
    getStringPref('install-time', function(pref) {
        install_time = pref;
    });
    
    var showOptions = function(anchor)
    {
        if(window.chrome && window.chrome.extension)
        {
            chrome.extension.sendMessage({"msg_type": "show_options", "suffix": "#" + anchor});
        }
        else
        {
            var wind = SW_showOptions();
            setTimeout(function() {
                wind.document.getElementById("smarterwikiOptions").showPane(wind.document.getElementById("SmarterWikiOptions_search_results"));
            }, 150); //must wait for init
        }
    };

    var confirm_disable = window.confirm_disable;
    if(!confirm_disable)
    {
        if(/Chrome/.test(navigator.userAgent)) {
            confirm_disable = "Are you sure you want to disable this?\n\nTo re-enable, go to Wrench icon -> Tools -> Extensions -> " + EXTENSION_NAME;
        }
        else {
            confirm_disable = "Are you sure you want to disable this?\n\nTo re-enable, go to Tools -> FastestFox";
        }
    }
    var disable_str = window.disable_label || "disable";


    function escapeHTMLEncode(str) 
    {
        var div = document.createElement('div');
        var text = document.createTextNode(str);
        div.appendChild(text);
        return div.innerHTML;
    }

    var truncate_string = function(s, len)
    {
        if(s.length > len)
        {
            return s.substring(0, len) + "...";
        }
        return s;
    };

    var install_source = '';
    getStringPref('install-source', function(val) {
        install_source = val;
    });
    
    var getSearchResultsURL = function(url, terms)
    {
        var language = navigator.language ? navigator.language : navigator.userLanguage;
        var url = url.replace(/{searchTerms}/g, encodeURIComponent(terms));
        url = url.replace(/{language}/g, language);
        return url;
    };

    
    var add_shopping_results_to_walmart = function(queryTerms)
    {
        add_shopping_results(queryTerms, "walmart", "com", "#res ol li h3 a", function($related_search_results)
        {
            var walmart_results = $(".ColumnContainer .Tabs.ShelfPagTop.SquarePagTop");
            $(walmart_results[0]).before($related_search_results);
        }, "em", true);
    };


    var add_shopping_results_to_google = function(queryTerms, tld)
    {
        add_shopping_results(queryTerms, "google", tld, "#res ol li h3 a", function($related_search_results)
        {
            var google_results = $("#res ol li");
            $(google_results[0]).before($related_search_results);
        }, "em");
    };

    var add_shopping_results_to_yahoo = function(queryTerms)
    {
        add_shopping_results(queryTerms, "yahoo", "com", "#web ol li h3 a", function($related_search_results)
        {
            var yahoo_results = $("#web ol li");
            $(yahoo_results[0]).before($related_search_results);
        }, "b");
    };

    var add_shopping_results_to_bing = function(queryTerms)
    {
        add_shopping_results(queryTerms, "bing", "com", "#results ul li h3 a, .sr_dcard a, .ans a", function($related_search_results)
        {
            if(queryTerms == "Amazon" || queryTerms == "amazon") {
                $(".sr_dcard").before($related_search_results);
            }
            else {
                $related_search_results.prependTo($("#results_container"))
            }
        }, "strong");
    };

    

    var is_ecommerce_query3 = function(queryTerms, callback)
    {
        /*
        $.get("http://ajax.googleapis.com/ajax/services/search/web?v=1.0&rsz=large&start=10&q=" + encodeURIComponent(queryTerms), {}, function(data)
        {
            for(var i in data["responseData"]["results"])
            {
                var url = data["responseData"]["results"][i]["unescapedUrl"];
                if(/www\.amazon\.com/.test(url) || /www\.amazon\.de/.test(url) || 
                    /www\.ebay\.com/.test(url) || 
                    /www\.buy\.com/.test(url) || /www\.bestbuy\.com/.test(url))
                {
                    callback(true);
                }
            }
            callback(false);
        }, "json");
        */
        callback(false);
    };

    var is_ecommerce_query2 = function(queryTerms) //if we see ads...
    {
        if($("#tads a, .ads li, .sb_adsWv2 li").length > 0) {
            return true;
        }
        return false;
    };

    var is_ecommerce_query = function(queryTerms, search_result_a_patt)
    {
        ///(^| )(n|N)ews( |$)/
        var test_url_patt = function(regexp)
        {
            var has_patt = false;
            $(search_result_a_patt).each(function()
            {
                if(regexp.test($(this).attr("href"))) {
                    has_patt = true;
                    return false;
                }
            });//new RegExp("^http://www.amazon.com/$"), "http://www.amazon.com/?tag=smtfx1-20"
            return has_patt;
        };
        var test_text_patt = function(regexp)
        {
            var has_patt = false;
            $(search_result_a_patt).each(function()
            {
                if(regexp.test($(this).text())) {
                    has_patt = true;
                    return false;
                }
            });//new RegExp("^http://www.amazon.com/$"), "http://www.amazon.com/?tag=smtfx1-20"
            return has_patt;
        };

        var has_google_books_result = test_url_patt(/books\.google\.com/);
        
        var has_ecomm_verbs = /(^(B|b)uy |^(S|s)hop for|.* dvd.*|.*dvd .*|^(D|d)vd|^(C|c)heap)/.test(queryTerms);

        return test_url_patt(/www\.amazon\..*/) || test_url_patt(/www\.ebay\..*/) || test_url_patt(/www\.buy\.com/) || test_url_patt(/www\.bestbuy\..*/) || test_url_patt(/www\.walmart\..*/) || 
               test_url_patt(/www\.argos\..*/) || test_url_patt(/www\.tesco\..*/) || test_url_patt(/www\.play\.com/) || test_url_patt(/www\.next\.co\.uk/) || 
               test_text_patt(/Shopping results for /) || test_text_patt(/Shop for /) || has_ecomm_verbs;        
    };
    
    var cleanup_query = function(query)
    {
        return query.replace(/(^(B|b)uy |^(S|s)hop for)/g, "");
    };


    var do_insert = function(queryTerms, search_engine_name, search_engine_tld, search_result_a_patt, add_div, bold_tag, ecomm_type)
    {
        if($('.related-shopping-search-widget').length > 0) {
            return;
        }

        var first_amazon_result_idx = -1;
        $(search_result_a_patt).each(function(i)
        {
            if(/www\.amazon\.(com|co\.uk)/.test($(this).attr("href")))
            {
                first_amazon_result_idx = i;
                return false;
            }
        });
                
        
        var params = {
            'q': queryTerms,
            'ecomm_type': ecomm_type,
            'first_amazon_result_idx': first_amazon_result_idx,
            'src_tag': install_source,
            'extension_name': EXTENSION_NAME
        };
        var url_comps = [];
        for(var k in params)
        {
            url_comps.push(encodeURIComponent(k) + "=" + encodeURIComponent(params[k]));
        }
        
        var server = "commandcenter.smarterfox.com";
        var widget_url = 'https://' + server + '/api/shopping_widget?' + url_comps.join("&")
        var $related_search_results = $('<div class="smarterwiki-related-search-results"></div>')
                                        .append($('<iframe class="res g related-shopping-search-widget" scrolling="no" frameborder="0"></iframe>')
                                                .attr('src', widget_url));
        $related_search_results.hide();
        
        add_div($related_search_results);
        
        $.get('http://' + server + '/api/num_shopping_results', 
            {'q': cleanup_query(queryTerms), 
             'tld': search_engine_tld, 
             'src_tag': install_source,
             'ecomm_type': ecomm_type,
             'first_amazon_result_idx': first_amazon_result_idx,
             'host': window.location.host}, function(data)
        {
            if(data && data['totalResults'])
            {
                if(data['totalResults'] < 4)
                {
                    var num_px = 125 - (4 - data['totalResults']) * 18;
                    $related_search_results.height(num_px);
                }                    
                $related_search_results.slideDown(0);
            }
            
        }, 'json');
    };

        
    var add_shopping_results = function(queryTerms, search_engine_name, search_engine_tld, search_result_a_patt, add_div, bold_tag, skip_ecommerce_query_check)
    {        
        if(skip_ecommerce_query_check)
        {
            do_insert(queryTerms, search_engine_name, search_engine_tld, search_result_a_patt, add_div, bold_tag);
        }
        else if(is_ecommerce_query(queryTerms, search_result_a_patt))
        {   
            do_insert(queryTerms, search_engine_name, search_engine_tld, search_result_a_patt, add_div, bold_tag, "ecomm1");
        }
        else if(is_ecommerce_query2(queryTerms))
        {   
            do_insert(queryTerms, search_engine_name, search_engine_tld, search_result_a_patt, add_div, bold_tag, "ecomm2");
        }
        else
        {
            is_ecommerce_query3(queryTerms, function(result)
            {
                if(result) {   
                    do_insert(queryTerms, search_engine_name, search_engine_tld, search_result_a_patt, add_div, bold_tag, "ecomm3");
                }
            });
        }
    };




    var add_related_search_results = function()
    {        
        var googleURLRegExp = new RegExp("^http(?:|s)://(?:www|encrypted).google.(?:com|ca|co.uk|com.au|co.in|co.id|com.ph)/(?:(?:search\\?|webhp\\?|#)(?:.*&)?q=([^&=]*)(.*)$)?");
        var match = googleURLRegExp.exec(document.location.href);

        if(match)
        {
            getBoolPref("add_related_shopping_results", function(pref_value)
            {
                if(pref_value) {
                    var try_insert_google = function()
                    {
                        if($("#res ol li").length > 0 
                            && $(".related-shopping-search-widget").length == 0
                            && !$("#res ol").data("is_amzn_already_inserted"))
                        {
                            $("#res ol").data("is_amzn_already_inserted", true);
                            match = googleURLRegExp.exec(document.location.href); //url can change
                            var queryTerms = decodeURIComponent(match[1]).replace(/\+/g, " ");
                            
                            var tld = new RegExp("\\.([^.]*)$").exec(window.location.hostname)[1];
                            add_shopping_results_to_google(queryTerms, tld);
                        }
                    };

                    try_insert_google();
                    window.setInterval(try_insert_google, 100);
                }
            });
        }


        var walmartURLRegExp = new RegExp("^http(s)?://www.walmart.com/search/search-ng.do\\?(?:.*&)?search_query=([^&=]*)(.*)$");
        match = walmartURLRegExp.exec(document.location.href);
        if(match)
        {
            queryTerms = decodeURIComponent(match[2]).replace(/\+/g, " ");
            getBoolPref("add_related_shopping_results", function(pref_value)
            {
                if(pref_value) {
                    add_shopping_results_to_walmart(queryTerms);
                }
            });
        }



        var yahooURLRegExp = new RegExp("^http://search.yahoo.com/search[^?]*\\?(?:.*&)?p=([^&=]*)(.*)$");
        match = yahooURLRegExp.exec(document.location.href);
        if(match)
        {
            queryTerms = decodeURIComponent(match[1]).replace(/\+/g, " ");
            getBoolPref("add_related_shopping_results", function(pref_value)
            {
                if(pref_value) {
                    var try_insert_yahoo = function()
                    {
                        if($("#web ol li").length > 0 
                            && $(".related-shopping-search-widget").length == 0
                            && !$("#web ol").data("is_amzn_already_inserted"))
                        {
                            $("#web ol").data("is_amzn_already_inserted", true);
                            match = yahooURLRegExp.exec(document.location.href); //url can change
                            var queryTerms = decodeURIComponent(match[1]).replace(/\+/g, " ");
                            
                            var tld = new RegExp("\\.([^.]*)$").exec(window.location.hostname)[1];
                            add_shopping_results_to_yahoo(queryTerms);
                        }
                    };

                    try_insert_yahoo();
                    window.setInterval(try_insert_yahoo, 100);
                }
            });
        }
        
        var bingURLRegExp = new RegExp("^http://www.bing.com/search[^?]*\\?(?:.*&)?q=([^&=]*)(.*)$");
        match = bingURLRegExp.exec(document.location.href);
        if(match)
        {
            queryTerms = decodeURIComponent(match[1]).replace(/\+/g, " ");
            getBoolPref("add_related_shopping_results", function(pref_value)
            {
                if(pref_value) {
                    var try_insert_bing = function()
                    {
                        if($("#results ul li").length > 0 
                            && $(".related-shopping-search-widget").length == 0
                            && !$("#results ul").data("is_amzn_already_inserted"))
                        {
                            $("#results ul").data("is_amzn_already_inserted", true);
                            match = bingURLRegExp.exec(document.location.href); //url can change
                            var queryTerms = decodeURIComponent(match[1]).replace(/\+/g, " ");
                            
                            var tld = new RegExp("\\.([^.]*)$").exec(window.location.hostname)[1];
                            add_shopping_results_to_bing(queryTerms);
                        }
                    };

                    try_insert_bing();
                    window.setInterval(try_insert_bing, 100);
                }
            });
        }

        /*
        var baiduURLRegExp = new RegExp("^http://www.baidu.com/s[^?]*\\?(?:.*&)?wd=([^&=]*)(.*)$");
        match = baiduURLRegExp.exec(document.location.href);
        if(match)
        {
            queryTerms = decodeURIComponent(match[1]).replace(/\+/g, " ");
        }
        */        
     };
    
    
    


    add_related_search_results();  
    
    if(new RegExp('smarterfox\\.com/api/shopping_widget').test(document.location.href))
    {
        //inside widget iframe
        $(document).ready(function() {
            setTimeout(function() {
                if(!$.browser.msie)
                {
                    $(".related-search-results-show-options").click(function() {
                        showOptions();
                        return;
                    });
                }
            }, 100); //give time for the widget code to exec and the options link to appear
        });
    }

    if(new RegExp('servedby.dealply.com/dealdo/shoppingjs').test(document.location.href))
    {
        //inside widget iframe
        $(document).ready(function() 
        {
            //send displayed msg
            getStringPref('install-source', function(install_source) {
            getStringPref('install-time', function(install_time) {
                $.get(get_log_msg_url({name: 'dealply_widget_shown', 
                                       locale: navigator.language || navigator.userLanguage,
                                       install_time: install_time,
                                       install_source: install_source        
                                      }));
            });
            });                
        });
    }
    if(new RegExp('http://www.superfish.com/ws/plugin_w.jsp?').test(document.location.href))
    {
        //inside widget iframe
        $(document).ready(function() 
        {
            //send displayed msg
            getStringPref('install-source', function(install_source) {
            getStringPref('install-time', function(install_time) {
                $.get(get_log_msg_url({name: 'superfish_widget_shown', 
                                       url: document.location.href,
                                       locale: navigator.language || navigator.userLanguage,
                                       install_time: install_time,
                                       install_source: install_source        
                                      }));
            });
            });
            $(document).on('click', function(e) {
                getStringPref('install-source', function(install_source) {
                getStringPref('install-time', function(install_time) {
                    $.get(get_log_msg_url({name: 'superfish_clicked', 
                                           url: document.location.href,
                                           locale: navigator.language || navigator.userLanguage,
                                           type: 'popout_widget',
                                           install_time: install_time,
                                           install_source: install_source        
                                          }));
                });
                });
            });
        });
    }
    $(document).on('click', '.SF_IIAD_ITEM, .SF_IIAD_MORE', function(e) {
        getStringPref('install-source', function(install_source) {
        getStringPref('install-time', function(install_time) {
            $.get(get_log_msg_url({name: 'superfish_clicked', 
                                   url: document.location.href,
                                   locale: navigator.language || navigator.userLanguage,
                                   type: 'inline_widget',
                                   install_time: install_time,
                                   install_source: install_source        
                                  }));
        });
        });
    });

    $("body").on("click", "#SF_SEARCHGET td a[target=_blank]", function() {
        showOptions("superfish-option");
    });
}());