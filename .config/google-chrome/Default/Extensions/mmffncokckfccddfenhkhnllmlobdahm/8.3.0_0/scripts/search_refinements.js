//Author: Yongqian Li <yongqli@10gic.net>
//(C)2012 Yongqian Li. All rights reserved

(function()
{
    var CONFIRM_DISABLE_MSG = "Are you sure you want to disable this?\n\nTo re-enable, go to Options";
    if(/Chrome/.test(navigator.userAgent)) {
        CONFIRM_DISABLE_MSG = "Are you sure you want to disable this?\n\nTo re-enable, go to: \nchrome://chrome/extensions/ -> " + EXTENSION_NAME;
    }
    else {
        CONFIRM_DISABLE_MSG = "Are you sure you want to disable this?\n\nTo re-enable, go to Tools -> FastestFox";
    }

    var install_source = "";
    getStringPref('install-source', function(pref) {
        install_source = pref;
    });
    var install_time = "";
    getStringPref('install-time', function(pref) {
        install_time = pref;
    });
    


    var install_source = '';
    getStringPref('install-source', function(val) {
        install_source = val;
    });
    
    var add_search_refinements_to_google = function(queryTerms)
    {
        add_search_refinements(queryTerms, "google", function($related_search_results)
        {
            var google_results = $("#res ol li");
            $(google_results[0]).before($related_search_results);
        }, "em");
    };

    var add_search_refinements_to_yahoo = function(queryTerms)
    {
        add_search_refinements(queryTerms, "yahoo", function($related_search_results)
        {
            var yahoo_results = $("#web ol li");
            $(yahoo_results[0]).before($related_search_results);
        }, "b");
    };

    var add_search_refinements_to_bing = function(queryTerms)
    {
        add_search_refinements(queryTerms, "bing", function($related_search_results)
        {
            var bing_results = $("#results ul li");
            $(bing_results[0]).before($related_search_results);
        }, "strong");
    };

    var add_search_refinements = function(unsafe_queryTerms, search_engine_name, add_div, bold_tag)
    {
        var escapeHTML = function(str) {
            return str.replace(/[&"<>]/g, function(m) {
                return "&" + ({"&": "amp", '"': "quot", "<": "lt", ">": "gt" })[m] + ";"
            });
        };
        var queryTerms = escapeHTML(unsafe_queryTerms);
        if($("#scTopOfPageRefinementLinks").length == 0)
        {
            var partner = { 
                uiLabel: 'FastestFox Refinements',
                partnerCode: 'fastestfox', 
                authCode: 'knm75903'
            };        
            if(/Chrome/.test(navigator.userAgent)) {
                partner.uiLabel = 'FastestFox Refinements';
            }
            $.get('http://' + partner.authCode + '.surfcanyon.com/queryReformulation', 
                        {"partner": partner.partnerCode,
                         "authCode": partner.authCode,
                         "format": "json",
                         "q": escape(queryTerms.replace(/( |<|>)/g, '+'))}, function(data)
            {
                var related_terms = data['data'];
                if(related_terms == null || related_terms.length == 0) {
                    related_terms = [queryTerms];
                }
                if($("#scTopOfPageRefinementLinks").length != 0)
                {
                    return;
                }
                var $refinements = $('<div id="scTopOfPageRefinementLinks" style="height: 20px; margin-top: 7px; margin-bottom: 7px;" partner="fastestfox" sctoppos="1">' + 
                '<font size=-1><span class="refinementResultsContainer"></span>&nbsp;<font size =-1 color=green>' + partner.uiLabel +
                ' <a id="disableRefinements" style="text-decoration: none; color: green;" title="Disable" href="#">[x]</a></font></font></div>');
                for(var i = 0; i < related_terms.length; i++) {
                    $refinements.find('.refinementResultsContainer')
                        .append($('<a></a>').attr('href', 'http://search.surfcanyon.com/search?f=nrl' + i + 
                                                            '&q=' + queryTerms + ' ' + related_terms[i] + '&p=fastestfox')
                                            .text(related_terms[i]));
                    $refinements.find('.refinementResultsContainer')
                        .append($('<span> &nbsp;</span>'));
                }
                if($refinements.find(".refinementResultsContainer a").length == 0)
                {
                    return;
                }
                add_div($refinements);
                //$refinements.find("#disableRefinements").click(function(event)
                $(document).on('click', '#disableRefinements', function(e) //ddg uses innerHTML :/
                {
                    var disable_refinements = function()
                    {
                        setBoolPref("add_search_refinements", false);
                        $('#scTopOfPageRefinementLinks').slideUp("normal", function() {
                            //$('#scTopOfPageRefinementLinks').remove();
                        });
                    };
                    if(window.confirm(CONFIRM_DISABLE_MSG)) {
                        disable_refinements();
                    }
                    return false;
                });
                $refinements.find(".refinementResultsContainer a").each(function(i)
                {
                    track_click($(this), {
                        "name": "search_refinement_clicked", 
                        "source": search_engine_name + " Search", 
                        "type": "Surf Canyon", 
                        "queryTerms": queryTerms,
                        "action": "result #" + i + " clicked"});
                });
            }, 'json');
        } 
    };

    var do_add_search_refinements = function()
    {        
        var googleURLRegExp = new RegExp("^http(?:|s)://(?:www|encrypted).google.(?:com|ca|co.uk|com.au|co.in|co.id|com.ph)/(?:(?:search\\?|webhp\\?|#)(?:.*&)?q=([^&=]*)(.*)$)?");
        var match = googleURLRegExp.exec(document.location.href);

        if(match)
        {
            getBoolPref("add_search_refinements", function(pref_value)
            {
                if(pref_value) {
                    var try_insert_google = function()
                    {
                        if($("#res ol li").length > 0 
                            && $("#scTopOfPageRefinementLinks").length == 0
                            && !$("#res ol").data("are_refinements_already_inserted"))
                        {
                            $("#res ol").data("are_refinements_already_inserted", true);
                            match = googleURLRegExp.exec(document.location.href); //url can change
                            var queryTerms = decodeURIComponent(match[1]).replace(/\+/g, " ");
                            add_search_refinements_to_google(queryTerms);
                        }
                    };
                    try_insert_google();
                    window.setInterval(try_insert_google, 100);
                }
            });
        }


        var yahooURLRegExp = new RegExp("^http://search.yahoo.com/search[^?]*\\?(?:.*&)?p=([^&=]*)(.*)$");
        match = yahooURLRegExp.exec(document.location.href);
        if(match)
        {
            queryTerms = decodeURIComponent(match[1]).replace(/\+/g, " ");
            getBoolPref("add_search_refinements", function(pref_value)
            {
                if(pref_value) {
                    add_search_refinements_to_yahoo(queryTerms);
                }
            });
        }
        
        var bingURLRegExp = new RegExp("^http://www.bing.com/search[^?]*\\?(?:.*&)?q=([^&=]*)(.*)$");
        match = bingURLRegExp.exec(document.location.href);
        if(match)
        {
            queryTerms = decodeURIComponent(match[1]).replace(/\+/g, " ");
            getBoolPref("add_search_refinements", function(pref_value)
            {
                if(pref_value) {
                    add_search_refinements_to_bing(queryTerms);
                }
            });
        }
    };


    do_add_search_refinements();  
}());