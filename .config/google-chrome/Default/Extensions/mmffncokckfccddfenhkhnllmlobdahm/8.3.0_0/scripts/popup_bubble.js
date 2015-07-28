//Author: Yongqian Li
//(C)2012 Yongqian Li. All rights reserved

(function()
{
    DEFINITION_BUBBLE_WIDTH = 350;
    var get_config = function(callback)
    {
        var config = {
            animate: true,
            enableGhosting: true,
            source: EXTENSION_NAME,
            searchCustom: false,
            customSearchEngines: [],
            searchWikipedia: true,
            showHomepageLink: false
        };
        if($.browser.msie && 
			navigator.userAgent.indexOf('Trident/5') == -1) //not IE9
        {
            config.enableGhosting = false;
        }
        var config_map = {
            showPopupBubble: "show_popup_bubble",
            showLinkInfo: "popup_bubble_show_link_info",
            addShareAttribution: 'popup_bubble_add_share_attribution',
            showLinkInfoAlways: "popup_bubble_show_link_info_always",
            openNewTab: "popup_bubble_open_new_tab",
            forceSingleRow: "popup_bubble_force_single_row",
            displayAboveText: "popup_bubble_display_above_text",
            searchWikipedia: "search_wikipedia",
            searchIMDB: "search_imdb",
            searchDuckDuckGo: "search_duckduckgo",
            searchYandex: "search_yandex",
            searchGoogleTranslate: "search_google_translate",
            searchTwitter: "search_twitter",
            searchSurfCanyon: "search_surfcanyon",
            tweetThis: "tweet_this",
            searchBing: "search_bing",
            searchBaidu: "search_baidu",
            searchReddit: "search_reddit",
            searchYouTube: "search_youtube",
            searchWiktionary: "search_wiktionary",
            searchBlekko: "search_blekko",
            searchGoogleMaps: "search_google_maps",
            searchGoogle: "search_google",
            searchCustom: 'search_custom'
        };

        getStringPref('custom_search_icon_url', function(icon_url) {
            if(icon_url == '') {
                icon_url = 'data:image/vnd.microsoft.icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAL47AAC+OwAAAAAAAAAAAAAAAADwAAAAPQAAAJoAAACiAAAAJwAAANwAAABCAAAAegAAAL4AAAAdAAAA0AAAAF8AAABaAAAA0QAAAEAAAADQAAAAdwAAACcAAAAyAAAANQAAAA0AAABIAAAAFQAAACcAAAA9AAAACgAAAEQAAAAfAAAAHQAAAEIAAABEAAAAugAAAEIAAAAWAAAAAAAAAAAAAAAAAAAAAAAAAAkAAAAZAAAACQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgAAAB0AAADcAAAASAAAAAAAAAAAAAAAAAAAAAAAAABHAAAA3wAAAF4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEQAAADQAAAAJwAAAA0AAAAAAAAAAAAAAAAAAAAAAAAANQAAAKYAAABGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfAAAAXgAAAKIAAAA1AAAAAAAAAAAAAAAAAAAAAAAAABsAAABeAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHQAAAFoAAACbAAAAMwAAAAAAAAAAAAAAAAAAAAAAAABGAAAA+AAAAGIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEUAAADTAAAAKwAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAKwAAAOYAAACdAAAACwAAAAAAAAAAAAAAAAAAAAAAAAAKAAAAHgAAAN4AAABJAAAAAAAAAAAAAAAAAAAAAAAAAAIAAABdAAAA4AAAAKIAAAAdAAAAAAAAAAAAAAAAAAAAPQAAALoAAAA8AAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AAADWAAAAuQAAABcAAAAAAAAAAAAAACkAAAB/AAAAggAAACsAAAAAAAAAAAAAAAYAAAAEAAAAAAAAAAAAAAAAAAAAdgAAAPwAAABOAAAAAAAAAAAAAAAUAAAAPgAAALgAAAA8AAAAAAAAAAAAAABHAAAAmwAAAFMAAAA1AAAATQAAAMcAAADlAAAAMQAAAAAAAAAAAAAASAAAAN0AAAAfAAAACgAAAAAAAAAAAAAAIAAAAI0AAAC9AAAAyAAAAM4AAACyAAAASQAAAAEAAAAAAAAAAAAAAA4AAAAqAAAA0gAAAEQAAAAAAAAAAAAAAAAAAAAAAAAACAAAABgAAAATAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAzAAAAnQAAAH8AAABiAAAACAAAAD0AAAApAAAAFQAAAEgAAAANAAAAMwAAADMAAAAOAAAASAAAABQAAAAnAAAAcgAAAKQAAABrAAAAzgAAAB4AAAC8AAAAfQAAAD8AAADdAAAAKQAAAJ8AAACeAAAAKgAAAN0AAAA+AAAAfgAAALsAAAAJAAAAAAAAAAA8fAAAPHwAADx8AAA8fAAAPHwAADw8AAA8HAAAPgwAADOMAAAwDAAAMAwAADg8AAAAAAAAAAAAAA==';
            }
            getStringPref('custom_search_search_url', function(search_url) {
                config['customSearchEngines'] = [['Search Custom', icon_url, search_url]];
                
                for(var key in config_map)
                {
                    (function(prop_name)
                    {
                        getBoolPref(config_map[prop_name], function(pref_value)
                        {
                            config[prop_name] = pref_value;
                            config_map[prop_name] = null;
                            for(var prop_name2 in config_map) {
                                if(config_map[prop_name2]) {
                                    return;
                                }
                            }
                            callback(config);
                        });
                    })(key);
                }
            })
        });
    };

    
    var arrayDeepEq = function(a1, a2)
    {
        if(a1.length != a2.length)
        {
            return false;
        }
        for(var i = 0; i < a1.length; i++)
        {
            if(a1[i] != a2[i])
            {
                return false
            }
        }
        return true;
    };

    var isDesignMode = function()
    {
        if(document.designMode == undefined) {
            return false;
        }
        return !(document.designMode == "off"
                || document.designMode == "Off" || document.designMode == "Inherit") // hack for IE
    };
    
    var isLeftClick = function(event)
    {
        if($.browser.msie) {
            if(document.documentMode && document.documentMode > 8) {
                return event.button == 0;
            }
            else {
                return event.button == 1;
            }
        }
        else {
            return event.button == 0;
        }
    };

    var getSelection = function(doc)
    {
        try
        {
            return doc.defaultView.getSelection(); // correct way for Firefox
        }
        catch(err){}
        try
        {
            return window.getSelection(); // hack for IE
        }            
        catch(err){}
        try
        {
            return document.getSelection(); // hack for IE
        }            
        catch(err){}
        try // hack for IE
        {
            var selection = document.selection && document.selection.createRange();
            selection.toString = function() { return this.text };
            return selection;
        }            
        catch(err){}
        return null;
    };

    var getLastRange = function(selection)
    {
        var lastRange = selection.getRangeAt(selection.rangeCount - 1);
        for(var r = selection.rangeCount - 1; r >= 0; r--)
        {
            if(!selection.getRangeAt(r).collapsed) {
                lastRange = selection.getRangeAt(r);
                break;
            }
            else {
                //alert("invalid range found");
            }
        } //fix Firefox bug? with selecting backwards: it creates an range at the end that is collapsed
        return lastRange;
    };        
    
    var isValidSelection = function(selection)
    {
        try
        {
            /*
            //alert(selection.toString() + ":" + 
                selection.anchorNode.nodeName + 
                ":" + selection.anchorOffset + ":" + 
                selection.focusNode.nodeName + ":" + selection.focusOffset + ":" + selection.isCollapsed);
            //alert(selection.anchorNode == selection.focusNode);
            */
            if(selection.toString())
            {
                if(selection.anchorNode.nodeName.toLowerCase() == "object")
                {//fix problems with flash players on myspace such as http://www.myspace.com/entershikari
                    return false;
                }
                if(selection.anchorNode == selection.focusNode && 
                    selection.toString().replace(/^\s+|\s+$/g,"").length > Math.abs(selection.focusOffset - selection.anchorOffset))
                {//fix <a> with title button on http://news.bbc.co.uk/2/hi/middle_east/8098776.stm
                    return false;
                }
                /*
                if(!(selection.anchorNode.nodeName.toLowerCase() == "#text" && 
                     selection.focusNode.nodeName.toLowerCase() == "#text"))
                {//too restrictive
                    return false;
                }
                */
                var containsInput = false;
                $("textarea, input[type=text]", doc).each(function(i)
                {
                    if(selection.containsNode(this, true))
                    {
                        containsInput = true; //contains input/textarea
                        return false;//break
                    }
                });
                return !containsInput;
            }
            else
            {
                return false;
            }
        }
        catch(err) //dirty hack for IE
        {
            return selection.toString();
        }
    };

    var getSearchResultsURL = function(url, terms)
    {
        var language = navigator.language ? navigator.language : navigator.userLanguage;
        language = language.toLowerCase();
        var url = url.replace(/{searchTerms}/g, encodeURIComponent(terms));
        url = url.replace(/{language}/g, language);
        var lang_tld = "com";
        if(/^de/.test(language)) {
            lang_tld = "de";
        }
        if(/^sv/.test(language)) {
            lang_tld = "se";
        }
        if(/^fr/.test(language)) {
            lang_tld = "fr";
        }
        if(/^ru/.test(language)) {
            lang_tld = "ru";
        }
        if(/^nl/.test(language)) {
            lang_tld = "nl";
        }
        if(/^pl/.test(language)) {
            lang_tld = "pl";
        }
        if(/^it/.test(language)) {
            lang_tld = "it";
        }
        if(/^es/.test(language)) {
            lang_tld = "es";
        }
        if(/^en-gb/.test(language)) {
            lang_tld = "co.uk";
        }
        if(/^en-au/.test(language)) {
            lang_tld = "com.au";
        }
        if(/^nl-be/.test(language)) {
            lang_tld = "be";
        }
        if(/^pt/.test(language)) {
            lang_tld = "pt";
        }
        url = url.replace(/{lang_tld}/g, lang_tld);
        return url;
    };
    var searchWikipediaURL = "http://api3.smarterfox.com/wikisearch/search?q={searchTerms}&locale={language}";
    var searchWikipediaURL2 = "http://api4.smarterfox.com/wikisearch/search?q={searchTerms}&locale={language}";
    var searchWikipediaURL = "http://www.google.{lang_tld}/search?hl={lang_tld}&btnI=I'm+Feeling+Lucky&q={searchTerms}+wikipedia";
    var searchIMDBURL = "http://www.imdb.com/find?s=all&q={searchTerms}";
    var searchGoogleTranslateURL = "http://translate.google.com/#auto/#auto/{searchTerms}";
    var searchTwitterURL = "https://twitter.com/search?q={searchTerms}";
    var searchSurfCanyonURL = "http://search.surfcanyon.com/search?f=nrl1&q={searchTerms}&partner=fastestfox";
    var tweetThisURL = "http://twitter.com/home?status={searchTerms}";
    var searchBingURL = "http://search.conduit.com/Results.aspx?q={searchTerms}&SearchSource=45&ctid=CT3303567";    
    var searchBaiduURL = "http://www.baidu.com/s?wd={searchTerms}&ie=utf-8";
    var searchRedditURL = "http://www.reddit.com/search?q={searchTerms}";
    var searchYouTubeURL = "http://www.youtube.com/results?search_query={searchTerms}";
    var searchWiktionaryURL = "http://en.wiktionary.org/wiki/Special:Search?search={searchTerms}&go=Define";
    var searchBlekkoURL = "http://blekko.com/ws/{searchTerms}";
    var searchGoogleMapsURL = "http://maps.google.{lang_tld}/maps?q={searchTerms}";
    var searchGoogleURL = "http://www.google.{lang_tld}/search?q={searchTerms}";

    var searchYandex_ru_URL = "http://yandex.ru/yandsearch?text={searchTerms}&clid=127504";
    var searchYandex_en_URL = "http://yandex.com/yandsearch?text={searchTerms}&clid=938833";
    var searchYandex_tr_URL = "http://yandex.com.tr/yandsearch?text={searchTerms}&clid=1813081";
    var searchYandexURL = searchYandex_ru_URL;
    var language = (navigator.language ? navigator.language : navigator.userLanguage).toLowerCase();
    if(/^ru/.test(language)) {
        searchYandexURL = searchYandex_ru_URL;
    }
    if(/^en/.test(language)) {
        searchYandexURL = searchYandex_en_URL;
    }
    if(/^tr/.test(language)) {
        searchYandexURL = searchYandex_tr_URL;
    }

    var searchDuckDuckGoURL = "http://duckduckgo.com/?q={searchTerms}&t=ff";
    var searchDuckDuckGoAPIURL = "http://ff.duckduckgo.com/?q={searchTerms}&o=json&d=1";
    
    var setup_popup_bubble = function(doc)
    {
        $(".smarterwiki-popup-bubble").remove();
        get_config(function(conf) {
            config = conf;
        });
        
        //"popup_bubble_loaded"
        var getSelectionKey = function(selection)
        {
            try
            {
                var lastRange = getLastRange(selection);//selection.getRangeAt(selection.rangeCount - 1);
                return [selection.toString(), lastRange.endContainer, lastRange.endOffset];
            }
            catch(err)
            {   //alert("using hack"); //dirty IE hack
                return [selection.toString()];
            }
        };

        //BEGIN preview code
        var homepageURL = "http://smarterfox.com/widget/";

        var get_definition = function(searchQuery, onsuccess)
        {
            var escapeHTML = function(str) {
                return str.replace(/[&"<>]/g, function(m) {
                    return "&" + ({"&": "amp", '"': "quot", "<": "lt", ">": "gt" })[m] + ";"
                });
            };
            var sanitizeHTML = function(str) {
                return escapeHTML(str).replace(/&lt;i&gt;/g, '<i>').replace(/&lt;\/i&gt;/g, '</i>')
                                      .replace(/&lt;pre&gt;/g, '<pre>').replace(/&lt;\/pre&gt;/g, '</pre>')
                                      .replace(/&lt;code&gt;/g, '<code>').replace(/&lt;\/code&gt;/g, '</code>')
                                      .replace(/&lt;b&gt;/g, '<b>').replace(/&lt;\/b&gt;/g, '</b>')
                                      .replace(/&lt;sub&gt;/g, '<sub>').replace(/&lt;\/sub&gt;/g, '</sub>')
                                      .replace(/&lt;sup&gt;/g, '<sup>').replace(/&lt;\/sup&gt;/g, '</sup>')
                                      .replace(/&amp;amp;/g, '&amp;')
                                      .replace(/&amp;#x28;/g, '(')
                                      .replace(/&amp;#x29;/g, ')')
                                      .replace(/&amp;nbsp;/g, '&nbsp;');
            };
            var replace_html_entities = function(str) {
                return str.replace(/&#x28;/g, '(')
                          .replace(/&#x29;/g, ')')
                          .replace(/&ndash;/g, '–')
                          .replace(/&nbsp;/g, ' ')
                          .replace(/&amp;/g, '&')
                          .replace(/&#xe1;/g, '\u00E1')
                          .replace(/&#xf3;/g, '\u00f3')
                          .replace(/&#xe9;/g, '\u00e9');
            };
            $.get(getSearchResultsURL(searchDuckDuckGoAPIURL, searchQuery), {}, function(data)
            {
                var unsafe_res = data["Abstract"];
                
                if(unsafe_res == "")
                {
                    unsafe_res = data["Definition"];
                    //data["RelatedTopics"][0]["Result"];
                }
                if(!unsafe_res)
                {
                    onsuccess(null);
                }
                else
                {
                    var $ddg_cite = $('<a title="Search DuckDuckGo"><img src="https://ff.duckduckgo.com/favicon.ico" alt="DuckDuckGo" /></a>')
                                      .attr('href', getSearchResultsURL(searchDuckDuckGoURL, searchQuery));
                    var $ddg_zc_content = $('<span></span>');

                    if(data["Heading"]) {
                        $ddg_zc_content.append($('<span class="smarterwiki-zc-header"></span>')
                                                 .text(data["Heading"]));
                    }
                    if(data['Type'] == 'D') {
                        for(var i = 0; i < data['RelatedTopics'].length; i++) {
                            if(data['RelatedTopics'][i] && data['RelatedTopics'][i]['FirstURL'].indexOf('duckduckgo.com/d/') == -1) {
                                if(config && !config.displayAboveText)
                                {
                                    //only supported if display below since image can push down text, causing height to miscalc
                                    if(data['RelatedTopics'][i]['Icon'] && data['RelatedTopics'][i]['Icon']['URL']) {
                                        $ddg_zc_content.append($('<span class="smarterwiki-zc-image"></span>')
                                                                 .append($('<img class="smarterwiki-zc-image-img" alt="" />')
                                                                           .attr('src', data['RelatedTopics'][i]['Icon']['URL'])));
                                    }
                                }
                                $ddg_zc_content.append($('<span class="smarterwiki-zc-abstract"></span>')
                                                         .html(sanitizeHTML(data['RelatedTopics'][i]['Text']) + " ")
                                                         .append($('<a id="dd-cite-link"><b>&rarr;</b></a>')
                                                                   .attr('href', getSearchResultsURL(searchDuckDuckGoURL, searchQuery))));
                                break;
                            }
                        }
                    }
                    else {
                        //only supported if display below since image can push down text, causing height to miscalc
                        if(data["Image"]) {
                            $ddg_zc_content.append($('<span class="smarterwiki-zc-image"></span>')
                                                     .append($('<img class="smarterwiki-zc-image-img" alt="" />')
                                                               .attr('src', data["Image"])));
                        }
                        $ddg_zc_content.append($('<span class="smarterwiki-zc-abstract"></span>')
                                                 .append($('<b></b>').text(data["AbstractSource"] + ':'))
                                                 .append($('<span></span>').html(' ' + sanitizeHTML(unsafe_res) + ' '))
                                                 .append($('<a id="dd-cite-link"><b>&rarr;</b></a>')
                                                           .attr('href', getSearchResultsURL(searchDuckDuckGoURL, searchQuery))));
                    }

                    onsuccess($ddg_zc_content);
                        //'<b>&#xbb;</b></a>');
                    track_click($("a#dd-cite-link"), {name: "ddg_cite_clicked"});
                }
            }, "json");
        };        
        
        var buildPopupSearchBubbleLite = function(config, searchQuery)//, insertCallback) //dirty hack for IE
        {
            var $popupBubble = $('<a class="smarterwiki-popup-bubble smarterwiki-popup-bubble-lite smarterwiki-popup-bubble-active" href="' 
                + getSearchResultsURL(searchWikipediaURL, searchQuery) + '"></a>', doc);
            if(config.openNewTab)
            {
                $popupBubble.attr("target", "_blank");
            }
            //insertCallback($popupBubble);
            return $popupBubble;     
        };
        
        var buildPopupSearchBubbleLinks = function(config, searchQuery, forceSingleRow)
        {
            var $popupBubbleLinks = $(
                '<span class="smarterwiki-popup-bubble-links"></span>',
                doc);
                
            var homepageLink = function(classes)
            {
                var $a = $('<a />')
                           .attr('href', homepageURL)
                           .attr('class', classes);
                if(config.openNewTab)
                {
                    $a.attr("target", "_blank");
                }
                track_click($a, {name: "homepage_visited", source: config.source});
                return $a;
            };

            var bubbleLinkAs = [];

            var addBubbleLink = function(title, icon_src, href, track)
            {
                var $a = $('<a class="smarterwiki-popup-bubble-link"></a>', doc)
                        .attr("href", href)
                        //.attr("href", "#")
                        .attr("title", title)
                        .append(
                            $('<img alt="" class="smarterwiki-popup-bubble-link-favicon" />', doc)
                            .attr("src", icon_src)
                        );

                if(config.openNewTab) {
                    $a.attr("target", "_blank");
                }
                
                if(track) {
                    track_click($a, {name: "popup_bubble_searched", search_engine_title: title, source: config.source});
                }

                bubbleLinkAs.push($a);
                return $a;
            };

            if(config.searchBlekko)
            {
                addBubbleLink(
                    "Search Blekko",
                    "https://blekko.com/favicon.ico", 
                    getSearchResultsURL(searchBlekkoURL, searchQuery),
                    false                    
                );
            }
            if(config.searchGoogleMaps)
            {
                addBubbleLink(
                    "Search Google Maps",
                    "https://smarterfox.com/media/smarterwiki/google-maps.png", 
                    getSearchResultsURL(searchGoogleMapsURL, searchQuery),
                    false                    
                );
            }
            //addBubbleLink("http://static.smarterfox.com/media/wiki-favicon.png", searchWikipediaURL(searchQuery), "Search Wikipedia");
            if(config.searchGoogle)
            {
                addBubbleLink(
                    "Search Google",
                    //"data:;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA7PT7/3zF6/9Ptu//RbHx/0227/+Tzvb/9vv5/97h0f9JeBz/NHoA/z98Av9AfAD/PHsA/0F6AP8AAAAA/vz7/1+33/8Mp+z/FrHw/xWy8f8bs/T/Hqrx/3zE7v////7/t8qp/zF2A/87gwH/P4ID/z59AP8+egD/Q3kA/97s8v8botj/ELn3/wy58f8PtfL/D7Lw/xuz9P8vq+f/8/n///779v9KhR3/OYYA/0GFAv88hgD/QIAC/z17AP/0+/j/N6bM/wC07/8Cxf7/CsP7/wm+9v8Aqur/SrDb//7+/v///P7/VZEl/zSJAP87jQD/PYYA/0OBBf8+fQH///3//9Dp8/84sM7/CrDf/wC14/8CruL/KqnW/9ns8f/8/v//4OjX/z+GDf85kAD/PIwD/z2JAv8+hQD/PoEA/9C7pv/97uv////+/9Xw+v+w3ej/ls/e/+rz9///////+/z6/22mSf8qjQH/OJMA/zuQAP85iwL/PIgA/zyFAP+OSSL/nV44/7J+Vv/AkG7/7trP//7//f/9//7/6/Lr/2uoRv8tjQH/PJYA/zuTAP87kwD/PY8A/z2KAP89hAD/olkn/6RVHP+eSgj/mEgR//Ho3//+/v7/5Ozh/1GaJv8tlAD/OZcC/zuXAv84lAD/O5IC/z2PAf89iwL/OIkA/6hWFf+cTxD/pm9C/76ihP/8/v//+////8nav/8fdwL/NZsA/zeZAP83mgD/PJQB/zyUAf84jwD/PYsB/z6HAf+fXif/1r6s//79///58u//3r+g/+3i2v/+//3/mbiF/yyCAP87mgP/OpgD/zeWAP85lgD/OpEB/z+TAP9ChwH/7eHb/////v/28ej/tWwo/7tUAP+5XQ7/5M+5/////v+bsZn/IHAd/zeVAP89lgP/O5MA/zaJCf8tZTr/DyuK//3////9////0qmC/7lTAP/KZAT/vVgC/8iQWf/+//3///j//ygpx/8GGcL/ESax/xEgtv8FEMz/AALh/wAB1f///f7///z//758O//GXQL/yGYC/8RaAv/Ojlf/+/////////9QU93/BAD0/wAB//8DAP3/AAHz/wAA5f8DAtr///////v7+/+2bCT/yGMA/89mAP/BWQD/0q+D///+/////P7/Rkbg/wEA+f8AA/z/AQH5/wMA8P8AAev/AADf///7/P////7/uINQ/7lXAP/MYwL/vGIO//Lm3P/8/v//1dT2/woM5/8AAP3/AwH+/wAB/f8AAfb/BADs/wAC4P8AAAAA//z7/+LbzP+mXyD/oUwE/9Gshv/8//3/7/H5/zo/w/8AAdX/AgL6/wAA/f8CAP3/AAH2/wAA7v8AAAAAgAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAEAAA==",
                    "https://www.google.com/favicon.ico", 
                    getSearchResultsURL(searchGoogleURL, searchQuery),
                    true                    
                );
            }
            if(config.searchSurfCanyon)
            {
                addBubbleLink(
                    "Search Surf Canyon",
                    //"http://surfcanyon.com/favicon.ico", 
                    "data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8AycnKOmdmaastLTDuIB8j/yAfI/87Oz7eg4OFi+no6Rj///8A////AP///wD///8A////AP///wD6+voDfHx+kyAfI/8gHyP/LCsv+FJRVPhHRkr6IiEl/SAfI/8tLTDuuLe5T////wD///8A////AP///wD///8AfHx+kyAfI/8wLzP4qqqr+Pv7+////////////+3t7f+Dg4X9IB8j/yMiJvq/vr9H////AP///wD///8AyMfIPyIhJf8wLzP429vb+P///////////////////////////////66ur/0gHyP/ODc74////wD///8A////AHRzda4wLjH/rKyt+P/////8/Pz/h4eJ/z8+Qv9GRUn/rq6v////////////iIiK/6ijnP/269Y/////AP///wBQTlDzR0VI+vv7+///////oqGh/zg2Of8hICT/IB8j/yAfI//c3Nz/7de7/9alX//GfhL/48KOfv///wD///8AWFZX/3Vzdfr//////////4iGhv9SUFL/MC8z/2ZlaP+1jmz/unMv/7NjFf+zYxX/s2MV/9atin7WrYp+1q2KfmdlZf91c3T8//////////+npaT/bWtr/0tJS/81Mzf/jIB5/9Gidv+/eDD/v3gw/8B6M//NlWD/x4pO/8WFRvqLiIjXbmxs/+rq6v//////6Ofn/4yJiP9lY2T/Q0JE/0tKTf/09PT/9uvc/+K5gP/apFL/9+zaP////wD///8AwcDAe357e/+koqL9///////////09PT/zs3N/8jHx//5+fn//////+7u7/9/f4H/4tfC//rv2T////8A////APb29g+YlZXjhYKB/7W0s//9/f3//////////////////////+vr6/9paGn/NTQ3/319f6f///8A////AP///wD///8A6OjnMpmWle6MiYf/lZOS/8XEw//b2tr/0dHR/6elpv9hYGH/TkxO/25sb8L09PQM////AP///wD///8A////AP///wDv7+4jsa6tu5KPjf+Kh4b/gX59/3h2df9vbW3/amho96alpof4+PgH////AP///wD///8A////AP///wD///8A////AP///wDs6+srz87Nb8XDw37Av75+zMvKXvLy8hT///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A//8AAPA/AADAHwAAgA8AAIAHAAAABwAAAAcAAAAHAAAAAAAAAAcAAIAHAACABwAAwA8AAOAfAAD//wAA//8AAA%3D%3D",
                    getSearchResultsURL(searchSurfCanyonURL, searchQuery),
                    true
                );
            }            
            if(config.searchCustom)
            {
                for(var s = 0; s < config.customSearchEngines.length; s++)
                {
                    addBubbleLink(
                            config.customSearchEngines[s][0], 
                            config.customSearchEngines[s][1],
                            getSearchResultsURL(config.customSearchEngines[s][2], searchQuery),
                            true                        
                    );
                }                
            }
            if(config.searchIMDB)
            {
                addBubbleLink(
                    "Search IMDB",
                    "data:image/x-icon;base64,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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVCgsVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRULCxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFwsMFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXDAwaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoMDhsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGw4OGxsbGxsbGxsbGxsbGxsbGxsbGxsb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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQlTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTSUmUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUCYnU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTUycoV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXVygpWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWSkqXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXSosZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZCwtZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZy0uampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqai4vbm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubi8xcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcTEzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3NzczM0dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dTQ1eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eDU2enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6QF56enp6ejY3e3t7QQAAAAR7FAAAAHsUAAB7FAAAAHsAAAAAAAAACmJ7FAAAAA4BAAAMe3t7ezc5fHx8QwAAAAR8FQAAAHwEAABDFQAAAHwAAAAAAAAAAAB8FQAAAAAAAAAAMnx8fDk6fX19RgAAAAR9FgAAAH0EAABGFgAAAH0AAAAAAgAAAABsFgAAAA8PAAAAFn19fTo7fn5+SAAAAAV+FwAAAH4AAAAXFwAAAH4AAAAAfgIAAABIFwAAABcXAAAAF35+fjs8gICASgAAAAWAGAAAAIAAAAAQGAAAAIAAAAAAgAUAAABKGAAAABgYAAAAGICAgDw9gYGBTAAAAAWBGQAAAEwAAAAFGQAAAIEAAAAAgQUAAABMGQAAABkZAAAAGYGBgT0+g4ODTwAAAAWDGgAAADgAAAACGgAAAIMAAAAAgwUAAABPGgAAABoaAAAAGoODgz4/hISEUgAAAAaEGwAAABsAAAAAGwAAAIQAAAAAhAYAAABSGwAAABsbAAAAG4SEhD9ChYWFVQAAAAaFHAAAABEAAQAAEQAAAIUAAAAAhQYAAABVHAAAABwcAAAAHIWFhUJEhoaGWAAAAAeGHQAAAAcABwAABwAAAIYAAAAAhgcAAABYHQAAAB0dAAAAHYaGhkRFiIiIWwAAAAeIHgAAAAIAHgcAAgAAAIgAAAAAiAcAAABbHgAAABISAAAAHoiIiEVHiYmJYAAAAAiJHwAAAAAAKw0AAAAAAIkAAAAAiQgAAABgHwAAAAAAAAAAI4mJiUdJioqKYwAAAAiKIAAAAAAAYyAAAAAAAIoAAAAAigEAAABjIAAAAAsBAAADioqKiklLi4uLZgAAAAiLIQAAAAAAi2YAAAAAAIsAAAAAAAAAAACLIQAAACGLZn+Li4uLi0tOjIyMaQAAAAiMIQAAAAABjIcAAAAAAIwAAAAAAAAAACGMIQAAACGMjIyMjIyMjE5RjY2NggkJCRONMAkJCQkTjY0JCQkJCY0JCQkJCQkibY2NMAkJCTCNjY2NjY2NjVFUjo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6OjlRWj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj1ZakJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkFpckZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkVxfkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkl9hk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk2FllJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlGVolZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlWhrlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlmtvl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl29wmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmHBymZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmXJ0mpqampqampqampqampqampqampqampqampqampqampqampqampqampqampqamnR2m5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm3Z3nJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnHd5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%3D",
                    getSearchResultsURL(searchIMDBURL, searchQuery),
                    true                    
                );
            }
            if(config.searchGoogleTranslate)
            {
                addBubbleLink(
                    "Search Google Translate",
                    "http://translate.google.com/favicon.ico", 
                    getSearchResultsURL(searchGoogleTranslateURL, searchQuery),
                    true
                );
            }
            if(config.searchTwitter)
            {
                addBubbleLink(
                    "Search Twitter",
                    "data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A/v7+D/7+/j/+/v5g/v7+YP7+/mD+/v5I/v7+KP///wD///8A////AP///wD///8A////AP///wD+/v4H/v7+UPbv4pHgx47B1K9Y3tWwWN7Ur1je3sKCx+rbuKj+/v5n/v7+GP///wD///8A////AP///wD+/v4Y+fbweM2ycMe2iB7/vI0f/8STIf/KlyL/zJki/8yZIv/LmCL/0ahK5/Hp1JH+/v4Y////AP///wD///8A7OTTaquHN+CujkXPs5ZTv6N6G/+2iB7/xpUh/8yZIv/MmSL/zJki/8yZIv/Kmy738OjUi////wD///8A////AMKtfY7w6+Ef////AP///wD///8A3sqbp8iWIf/MmSL/zJki/8yZIv/MmSL/y5gi/8mePO7+/v4w////AP///wD///8A////AP///wD+/v4H/v7+V9CtWN3KmCL/zJki/8yZIv/MmSL/zJki/8yZIv/JlyH/5tSqp/7+/mD+/v4/////AP///wD///8A+PXvJtGyZdXNnS/3y5gi/8qYIv/LmCL/zJki/8yZIv/MmSL/y5gi/82iPO7LqVfe0byMmf///wD///8A/v7+D/Do1JHKmy73ypci/8KSIP+/jyD/xpQh/8uYIv/MmSL/zJki/8qYIv+/jyD/rIEd/9nKqH7///8A////APPu4TzAlSz3wZEg/7mLH/+sgR3/uZdGz7mLH//JlyH/zJki/8yZIv/GlSH/to0r9eXbxD/Vx6dg////AP7+/h/p38WhtIsq9al/HP+kfyjuybaKgf///wCzjzjlwJAg/8qYIv/JlyH/u4wf/8CkYrn///8A////AP///wDj2sRMnHUa/7meYa7Vx6dg////AP///wD///8A2MmnYK6DHf++jiD/vo4g/62CHf/k2sQ/////AP///wD///8A8OvhH/f07w////8A////AP///wD///8A////AP///wC/p3Cfpnwc/66GKvPg1LZ8////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////ANXHp2DJtoqByLWKgf///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A//8AAP//AADgPwAAwA8AAIAHAAB4BwAA+AMAAPAAAADgAQAA4AMAAMEDAADPhwAA/48AAP/nAAD//wAA//8AAA%3D%3D", 
                    getSearchResultsURL(searchTwitterURL, searchQuery),
                    true
                );
            }
            if(config.tweetThis)
            {
                addBubbleLink(
                    "Tweet This!",
                    "http://static.smarterfox.com/media/finderfox/tweet_this.png", 
                    getSearchResultsURL(tweetThisURL, '"' + searchQuery + '" - ' + doc.location.href),
                    true                    
                );
            }
            if(config.searchBing)
            {
                addBubbleLink(
                    "Search Bing",
                    "http://www.bing.com/favicon.ico", 
                    getSearchResultsURL(searchBingURL, searchQuery),
                    true                    
                );
            }
            if(config.searchBaidu)
            {
                addBubbleLink(
                    "Search Baidu",
                    "http://www.baidu.com/favicon.ico", 
                    getSearchResultsURL(searchBaiduURL, searchQuery),
                    true                    
                );
            }
            if(config.searchReddit)
            {
                addBubbleLink(
                    "Search Reddit",
                    "http://www.reddit.com/favicon.ico", 
                    getSearchResultsURL(searchRedditURL, searchQuery),
                    true                    
                );
            }
            if(config.searchYouTube)
            {
                addBubbleLink(
                    "Search YouTube",
                    "http://www.youtube.com/favicon.ico", 
                    getSearchResultsURL(searchYouTubeURL, searchQuery),
                    true                    
                );
            }            
            if(config.searchWiktionary)
            {
                addBubbleLink(
                    "Search Wiktionary",
                    "http://en.wiktionary.org/favicon.ico", 
                    getSearchResultsURL(searchWiktionaryURL, searchQuery),
                    true                    
                );
            }
            if(config.searchDuckDuckGo)
            {
                addBubbleLink(
                    "Search DuckDuckGo",
                    //"data:;base64,AAABAAIAICAAAAEAIACoEAAAJgAAABAQAAABACAAaAQAAM4QAAAoAAAAIAAAAEAAAAABACAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAA////APbu/A++dfOOjQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/++dfOO9u78D////wD///8AqUfvv40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+wVvCu////ANOh9mCNCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6//TofZgmyjt3o0K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/5so7d6NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/7FX8f/jwvr/48L6/+PC+v/jwvr/48L6/+PC+v/jwvr/zZT2/40K6/+NCuv/48L6/+PC+v+4ZvP/jQrr/82U9v/jwvr/zZT2/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+4ZvP/////////////////////////////////////////////////jQrr/40K6////////////+PC+v+NCuv/1KP4////////////jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/ojjv//jw/v////////////////////////////////////////////////+UGez/jQrr/+PC+v//////48L6/40K6//GhfX///////////+bKe7/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/6I47//48P7//////////////////////////////////////////////////////6pH8P+NCuv/48L6////////////jQrr/7hm8////////////6pH8P+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+UGez/+PD+////////////////////////////////////////////////////////////qkfw/40K6//GhfX///////////+NCuv/qkfw////////////sVfx/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/lBns/+rR+//////////////////////////////////////////////////////////////////GhfX/jQrr/8aF9f///////////6I47/+iOO/////////////GhfX/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6//Uo/j//////////////////////////////////////////////////////////////////////8aF9f+NCuv/sVfx////////////qkfw/40K6////////////82U9v+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/6pH8P/48P7/////////////////////////////////////////////////////////////////48L6/40K6/+qR/D///////////+/dfT/jQrr//jw/v//////48L6/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/6I47//48P7////////////////////////////////////////////////////////////GhfX/jQrr/7FX8f///////////6pH8P+UGez////////////NlPb/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/6I47//q0fv/////////////////////////////////////////////////6tH7/5QZ7P+iOO//+PD+///////NlPb/lBns/+rR+///////6tH7/5QZ7P+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/5QZ7P/q0fv//////////////////////////////////////+rR+/+UGez/lBns//jw/v//////1KP4/40K6//Uo/j//////+rR+/+UGez/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/5QZ7P/jwvr////////////////////////////48P7/lBns/5QZ7P/q0fv//////9uy+f+NCuv/1KP4///////48P7/mynu/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6//Uo/j/////////////////+PD+/6I47/+UGez/6tH7///////q0fv/lBns/7919P//////+PD+/6I47/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6//NlPb///////////+iOO//jQrr/7919P//////6tH7/5QZ7P+bKe7///////////+qR/D/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+xV/H/sVfx/40K6/+NCuv/jQrr/7919P+bKe7/jQrr/40K6/+xV/H/sVfx/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/ojjuz40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/6I47s/asfhQjQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/2rH4UP///wC3ZvKfjQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/7dm8p////8A////AP///wDFg/SBjQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6//Fg/SB////AP///wD///8A////AP///wDv3/sfzJL1cMWD9IHFg/SBxYP0gcWD9IHFg/SBxYP0gcWD9IHFg/SBxYP0gcWD9IHFg/SBxYP0gcWD9IHFg/SBxYP0gcWD9IHFg/SBxYP0gcWD9IHFg/SBxYP0gcWD9IHTofZg9u78D////wD///8A////AMAAAAOAAAABgAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAABgAAAAcAAAAP4AAAfKAAAABAAAAAgAAAAAQAgAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAObM+jKZJO3jjQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/mSTt4+jP+i+hNu7PjQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+hNu7PjQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/vXHz//Hg/P/x4Pz/8eD8/+vV+/+NCuv/8eD8/61P8P/gvvn/uWny/40K6/+NCuv/jQrr/40K6/+NCuv/slrx//37/v//////////////////////lh3s//Hg/P+/dfP/37r5/9Cb9/+NCuv/jQrr/40K6/+NCuv/p0Pv//37/v///////////////////////////6I47v/iwvr/y5D2/9Kf9//dtvn/jQrr/40K6/+NCuv/jQrr/922+f////////////////////////////////+wVvH/1qf3/9mu+P/EgPT/69X7/40K6/+NCuv/jQrr/40K6/+SFez/4L75///////////////////////58/7/ojju/+nR+//CfPT/37r5/9Kf9/+NCuv/jQrr/40K6/+NCuv/jQrr/44N6//Yqvj////////////9+/7/qUfv/922+f/Ol/b/zZP2/9+6+f+ODev/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/8uQ9v//////slrx/8+X9v/Zrvj/u23z/+jN+/+SFez/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/nzDu/40K6/+ZJO3/kBHr/5Yd7P+WHez/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+SFevzjQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+SFevzxob0e40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/jQrr/40K6/+NCuv/xob0e////wDPmvZnqknvu6hF78CoRe/AqEXvwKhF78CoRe/AqEXvwKhF78CoRe/AqEXvwKhF78CsTfC20Z32ZP///wCAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIABAADAAwAA",
                    "https://ff.duckduckgo.com/favicon.ico",
                    getSearchResultsURL(searchDuckDuckGoURL, searchQuery),
                    true                    
                );
            }            
            if(config.searchYandex)
            {
                addBubbleLink(
                    "Search Yandex",
                    "http://www.yandex.ru/favicon.ico",
                    getSearchResultsURL(searchYandexURL, searchQuery),
                    true                    
                );
            }
            if(config.searchWikipedia)
            {
                addBubbleLink(
                    "Search Wikipedia",
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAATCAYAAACQjC21AAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAIpwAACKcBMsYCAwAAAAd0SU1FB9kFEwgQLXKnj9oAAAPsSURBVDiNdVRZSGRXEH1Joz8icSIMJsEQEvKvov4ICoOYIAp+KKISkLiAgij5UGOMjgoug6CiKC64i/sSpVHcl7jv7W6722pcWmyNoqBW6hRpyYSZC8W7975bdU+dOrcUIlL+axYWFq+SkpLybWxsYo17VlZWX/H6DebOzs4/ent7/+Lu7v7z/31h7y8U5fvV1VWNra3tIObGvZqamtaHh4fHxMTExb29vcejoyMKCwt7jIqKWuD/bz4Y0MXF5e319bU2JyfngA99x/YJ22empqZuERERKwcHB9Td3U37+/u0srJCc3NzNDIyQk1NTVcqleonPvv6JSCPL87OznQ8p+TkZC2vv2GzcnNz+83a2joqLy9vCQFnZ2dpfX2dlpaWqLe3lzo7O+WStLS0ORMTE7+XgCkpKTX07/Dz86PIyEhDVlaWISMjgxISEmRfp9PRzs4O7e7uEtMi6EZHRyVweHg4gp6bm5tbKK958PlbODES+ZmZmQmkxjsE2d3dHWm1WsrOzqa6ujoaGhqigYEBGh4epvT0dCovLyd7e3sfhR3fGR0vLy9fULa0tMj8/PycNBoNcVGIi0NxcXHU09NDY2Nj1N/fL2mXlZXJJV5eXkXK9va2DojggIDPz8/iuLGxQcvLy8IXEN7c3JBer5f14uKiIOzr66P29naqqqqiiooK8vf3n1aYbP3ExIQcZkkIKgcHBwJ/BoNB1ltbW8IbF466urrk3OTkpFhDQ4MEZA7Jx8fnSGEJ6I2pHh4eyvf2ViglVBbBwBMQb25u0sLCgnAXExMjVLS1tVFJSYmkHRoa+pfCmydwPjk5EYf7+3txwBoVRTFmZmZetFdcXEyBgYGUm5srVa6traWioiIqKCig4ODgVYVJnUE6LGpBhLQQDMjAHeaQzPT0tASG7iorK0U2kAwC4hIE9PT0HFZYvB7j4+NPQHlxcSGFOD4+Fvnw8xKOUGnwxAWkqakpqSz7CJ/V1dXEmiV+/+To6Pi7CJvFq356ehIHaA2ogPjq6krSRlVbW1ulqoODgyIbyMfX15dKS0spNjYWAf+2tLT8UgLyJAIPHinPz89LFcEXJIJUcdHa2ppIBAjVajWlpqYSNwcqLCwUdEFBQX9+ysP4llXcSf7gFO6A8PT0lJqbm4UXvB6kBc6QKgz/sAfu8Ers7OzecYxv3+s2PD53dXX9FVUFCiCqr6+njo4OSRMBwSN3FylKfn4+MQgKCAhAC1N9rB+aODk5vWUU5+ARUoHu8CpQ0cbGRjFcxA3kkjtRAft8/dEGazRuRabcZH8ICQkpjo6OVjNHmvj4+GXuiyMeHh453ATCzMzMXn3I9x8oCiuuorpqawAAAABJRU5ErkJggg==",
                    //"http://static.smarterfox.com/media/wiki-favicon-sharpened.png", 
                    getSearchResultsURL(searchWikipediaURL, searchQuery),
                    true
                );
            }            
            if(config.showHomepageLink)
            {
                var $a = addBubbleLink(
                    "What is this?",
                    "http://static.smarterfox.com/media/img/smarterfox-logo.png",
                    homepageURL
                );
                track_click($a, {name: "homepage_visited", source: config.source});
            }

            if(!config.displayAboveText) {
                bubbleLinkAs.reverse();
            }


            var numRows = forceSingleRow ? 1 : Math.floor(Math.sqrt(bubbleLinkAs.length));
            var numCols = Math.ceil(bubbleLinkAs.length / numRows);
            bubbleLinkAs.reverse();
            var a_bubbleLinkA = bubbleLinkAs[0];
            while(bubbleLinkAs.length)
            {
                var $row = $('<span class="smarterwiki-popup-bubble-links-row"></span>', doc).appendTo($popupBubbleLinks);
                for(var c = 0; c < numCols; c++)
                {
                    if(bubbleLinkAs.length)
                    {
                        if(!config.displayAboveText) {
                            $row.prepend(bubbleLinkAs.pop());
                        }
                        else {
                            $row.append(bubbleLinkAs.pop());
                        }
                    }
                    else
                    {
                        break;
                    }
                }
            }
            
            return $('<span class="smarterwiki-popup-bubble-links-container"></span>', doc).append($popupBubbleLinks);
        };

        var buildPopupSearchBubbleFull = function(config, searchQuery, is_flipped)//, insertCallback)
        {
            var $popupBubble = $(
                '<span class="smarterwiki-popup-bubble smarterwiki-popup-bubble-active' + (is_flipped ? ' smarterwiki-popup-bubble-flipped' : '') + '"></span>');
            
            buildPopupSearchBubbleLinks(config, searchQuery, config.forceSingleRow).appendTo(
                $('<span class="smarterwiki-popup-bubble-body"></span>').appendTo($popupBubble));
            

            var $popupBubbleTip = (
                    //config.showHomepageLink ? homepageLink("smarterwiki-popup-bubble-tip") :
                        $('<span class="smarterwiki-popup-bubble-tip"></span>'));
                
            if(!is_flipped) {
                $popupBubbleTip.appendTo($popupBubble);
            }
            else {
                $popupBubbleTip.prependTo($popupBubble);
            }
                
            //$popupBubble.css("margin-left", "-" + $popupBubble.css("width"));//(3*2 + 3*2 + numCols*18 + (numCols-1)*3)
            //$popupBubble.css("margin-top", "-" + (3*2 + 3*2 + numRows*18 + (numRows-1)*3 + 6) + "px");

            //insertCallback($popupBubble);
            
            //$popupBubble.css("margin-left", "-" + $popupBubble.width() + "px");
            //$popupBubble.css("margin-top", "-" + $popupBubble.height() + "px");

            return $popupBubble;
        };
        //END preview code
        
        var buildPopupSearchBubble = function(searchQuery, is_flipped)//, insertCallback)
        {
            return buildPopupSearchBubbleFull(config, searchQuery, is_flipped); // if(!$.browser.msie || ($.browser.msie && $.browser.version.indexOf("7") != 0))
            //return buildPopupSearchBubbleLite(config, searchQuery); //dirty hack for IE
        };
        
        var get_offsets_and_remove = function($test_span) {
            var curr_elem = $test_span[0];
            var total_offsetTop = 0;
            var total_offsetLeft = 0;
            while(curr_elem != null)
            {
                total_offsetTop += curr_elem.offsetTop;
                total_offsetLeft += curr_elem.offsetLeft;
                curr_elem = curr_elem.offsetParent;
            }
            var span_ht = $test_span.height();
            $test_span.remove();
            return [total_offsetTop, total_offsetLeft, span_ht];
        };
        
        var get_selection_offsets = function(selection)
        {
            //alert($(".smarterwiki-popup-bubble-active").length);
            //////////////////log_msg_async({name: "popup_bubble_inserted", source: config.source});
            var $test_span = $('<span class="smarterwiki-popup-bubble-test-span">x</span>');//"x" because it must have a height
            try
            {
                var lastRange = getLastRange(selection);
                //$("<div></div>").append(lastRange.cloneContents())[0].innerHTML
                var newRange = doc.createRange();
                newRange.setStart(lastRange.endContainer, lastRange.endOffset);
                newRange.insertNode($test_span[0]);
            }
            catch(err) //dirty hack for IE
            {
                try
                {
                    var $tmp = $('<div></div>', doc).append($test_span);
                    var newRange = selection.duplicate();
                    newRange.setEndPoint("StartToEnd", selection);
                    newRange.pasteHTML($tmp[0].innerHTML);
                    $test_span = $(".smarterwiki-popup-bubble-test-span");
                }
                catch(e) {
                    return null; //something is wrong, probably inside input or TextArea (IE <= 8 cannot detect this);
                }
            }

            return get_offsets_and_remove($test_span);
        };
        
        var cleanupPopupBubble = function($popupBubble)
        {
            if(!isValidSelection(getSelection(doc)) || 
                !$popupBubble.data("selectionKey") ||
                !arrayDeepEq($popupBubble.data("selectionKey"), getSelectionKey(getSelection(doc)))
            ) //is this still a valid popup?
            {
                $popupBubble.removeClass("smarterwiki-popup-bubble-active");
                //alert("removing");
                if(config.animate)
                {
                    $popupBubble.stop(true).fadeTo("fast", 0, function() //no longer valid, remove
                    {
                        $popupBubble.remove();
                    });
                }
                else
                {
                    $popupBubble.remove();
                }                
            }
        };

        var ghostPopupBubble = function($popupBubble)
        {
            var ghosted_opacity = 0.25;
            $popupBubble.stop(true)
                        .unbind("mouseenter mouseleave")
                        .animate({opacity: 1.}, 200)
                        .animate({opacity: 1.}, 6000)//.fadeTo("fast", ghosted_opacity)
                        .animate({opacity: ghosted_opacity}, 700)//, zIndex: -100000
                        .hover(function()//need this because the :hover css doesn't work in quirks mode
            {
                $(".smarterwiki-popup-bubble.smarterwiki-popup-bubble-active", doc)
                    .stop(true).css("opacity", 1.0);//.css("z-index", 2147483647);
            }, function()
            {
                $(".smarterwiki-popup-bubble.smarterwiki-popup-bubble-active", doc)
                    .stop(true).animate({opacity: ghosted_opacity}, 200);
                //.css("opacity", ghosted_opacity).css("z-index", 2147483647);
            });                                    
        };
        
        var insert_search_popup_bubble = function()
        {
            var selection = getSelection(doc);
            if(config.showPopupBubble && isValidSelection(selection))
            {
                var shouldInsert = $(".smarterwiki-popup-bubble-active").length == 0;
                if(shouldInsert)
                {
                    var queryTerms = selection.toString();
                    var offsets = get_selection_offsets(selection);
                    if(offsets == null) {
                        return;
                    }

                    var offsetTop = offsets[0] - offsets[2];
                    var offsetLeft = offsets[1];                    
                    if(offsetLeft < DEFINITION_BUBBLE_WIDTH/2) { /* half of .smarterwiki-popup-bubble-detailed width */
                        offsetLeft = DEFINITION_BUBBLE_WIDTH/2;
                    }

                    var is_flipped = offsetTop < 200;
                    if(!config.displayAboveText) {
                        is_flipped = true;
                    }


                    if(is_flipped) {
                        offsetTop = offsets[0] + 2 * offsets[2];
                    }
                    var $popupBubble = buildPopupSearchBubble(queryTerms, is_flipped);//, function($popupBubble)
                    $("body").append($popupBubble);
                    $popupBubble.data("selectionKey", getSelectionKey(selection), null);
                    $popupBubble.css("top", offsetTop + "px");
                    $popupBubble.css("left", offsetLeft + "px");
                    var m_left = $popupBubble.width();
                    if(m_left > 300) { //IE bug
                        m_left = 54;
                        offsets[2] = 14;
                    }
                    var m_top = $popupBubble.height();
                    if(m_top > 300) { //IE bug
                        m_top = 60;
                        offsets[2] = 14;
                    }
                    $popupBubble.css("margin-left", (-m_left) + "px");//(3*2 + 3*2 + numCols*18 + (numCols-1)*3)
                    if(!is_flipped) {
                        $popupBubble.css("margin-top", (-m_top) + "px");
                    }
                    
                    if(config.animate)
                    {
                        $popupBubble.css("opacity", 0.0);
                        if(config.enableGhosting) {
                            ghostPopupBubble($popupBubble);
                        }
                        else {
                            $popupBubble.fadeTo("fast", 1.0);                                    
                        }
                    }
                    
                    
                    getBoolPref("popup_bubble_show_definitions", function(pref_value)
                    {
                        if(pref_value)
                        {
                            get_definition(queryTerms, function($ddg_content)
                            {
                                if($ddg_content)
                                {
                                    var $defPopupBubble = $(
                                        '<span class="smarterwiki-popup-bubble smarterwiki-popup-bubble-active smarterwiki-popup-bubble-detailed' + 
                                            (is_flipped ? ' smarterwiki-popup-bubble-flipped' : '') + '"><span class="smarterwiki-popup-bubble-body"></span></span>');
                                    $defPopupBubble.find(".smarterwiki-popup-bubble-body")
                                        .empty()
                                        .append($('<span class="smarterwiki-popup-bubble-definition"></span>')
                                        .append($ddg_content));
                                    var $defPopupBubbleTip = (
                                            //config.showHomepageLink ? homepageLink("smarterwiki-popup-bubble-tip") :
                                                $('<span class="smarterwiki-popup-bubble-tip"></span>'));
                                    if(!is_flipped) {
                                        $defPopupBubbleTip.appendTo($defPopupBubble);
                                    }
                                    else {
                                        $defPopupBubbleTip.prependTo($defPopupBubble);
                                    }
                                    $("body").append($defPopupBubble);
                                    $defPopupBubble.data("selectionKey", $popupBubble.data("selectionKey"));

                                    var d_m_left = $defPopupBubble.width();
                                    if(d_m_left > 600) {
                                        d_m_left = 300;
                                    }
                                    var set_margin_top = function() {
                                        if(!is_flipped)
                                        {
                                            var d_m_top = $defPopupBubble.height() + $popupBubble.height();
                                            if(d_m_top > 600) { //IE bug
                                                d_m_top = 134;
                                            }
                                            $defPopupBubble.css("margin-top", -(d_m_top) + "px");
                                        }
                                        else
                                        {
                                            var d_m_top = $popupBubble.height();
                                            if(d_m_top > 600) { //IE bug
                                                d_m_top = 60;
                                            }
                                            $defPopupBubble.css("margin-top", d_m_top + "px");
                                        }
                                    };
                                    set_margin_top();
                                    $defPopupBubble.find('img').load(set_margin_top);
                                    $defPopupBubble.css("margin-left", (-d_m_left) + "px");
                                    $defPopupBubble.css("top", $popupBubble.css("top"));
                                    $defPopupBubble.css("left", $popupBubble.css("left"));

                                    if(config.animate) {
                                        if(config.enableGhosting) {
                                            ghostPopupBubble($popupBubble);
                                            ghostPopupBubble($defPopupBubble);
                                        }
                                    }
                                }
                            });
                        }
                    });

                    getStringPref('install-source', function(install_source) {
                    getStringPref('install-time', function(install_time) {
                        $.get(get_log_msg_url({name: 'popup_bubble_inserted', 
                                               locale: navigator.language || navigator.userLanguage,
                                               install_time: install_time,
                                               install_source: install_source        
                                              }));
                    });
                    });
                }
            }
        };

        $(doc).mousedown(function(event)
        {
            //if(isLeftClick(event))
            $(".smarterwiki-popup-bubble").each(function(i) {
                cleanupPopupBubble($(this));
            });
        });

        $(doc).mouseup(function(event)
        {
            $(".smarterwiki-popup-bubble", doc).each(function(i)
            {
                cleanupPopupBubble($(this));
            });
            
            get_config(function(conf)
            {
                config = conf;
                if(isLeftClick(event))
                {
                    if(!isDesignMode()) {
                        insert_search_popup_bubble();
                    }
                    else {
                        // in rich editor
                    }                    
                }
            });
        });
        
        var insert_link_info_popup_bubble = function($a) {
            //find out where the link ends and inject bubble at location
            var $test_span = $('<span class="smarterwiki-popup-bubble-test-span">x</span>');//"x" because it must have a height
            $test_span.appendTo($a);
            var offsets = get_offsets_and_remove($test_span);

            var $popupBubble = $(
                '<span class="smarterwiki-popup-bubble smarterwiki-popup-bubble-active smarterwiki-popup-bubble-link-info"><span class="smarterwiki-popup-bubble-body"><span class="smarterwiki-popup-bubble-links-container"><span class="smarterwiki-popup-bubble-links"><span class="smarterwiki-popup-bubble-links-row"></span></span></span></span></span>'
                );
            var $popupBubbleLinks = $popupBubble.find('.smarterwiki-popup-bubble-links-row');

            var $popupBubbleTip = (
                    //config.showHomepageLink ? homepageLink("smarterwiki-popup-bubble-tip") :
                        $('<span class="smarterwiki-popup-bubble-tip"></span>')
                ).appendTo($popupBubble);

                
            var addBubbleLink = function(title, icon_src, icon_label_src, href, track)
            {
                var $a = $('<a class="smarterwiki-popup-bubble-link"></a>')
                        .attr("href", href)
                        .attr("title", title)
                        .append($('<img alt="" class="smarterwiki-popup-bubble-link-badge" />').attr('src', icon_src))
                        .append($('<img alt="" class="smarterwiki-popup-bubble-link-badge-label" />').attr('src', icon_label_src));

                if(config.openNewTab) {
                    $a.attr("target", "_blank");
                }
                
                if(track) {
                    track_click($a, {name: "popup_bubble_searched", search_engine_title: title, source: config.source});
                }

                $popupBubbleLinks.append($a);
                return $a;
            };

            var create_badge_label = function(width, height, text) {
                var canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                var context = canvas.getContext("2d");
                context.font = "bold 9px Monospace";
                context.fillStyle = "rgb(0,0,0)";
                context.fillText(text, 0, height, width);
                return canvas.toDataURL("image/png");
            };
            
            var padString = function(s) {
                s = '' + s;
                while(s.length < 4) {
                    s = '0' + s;
                }
                return s;
            }

            $.get('https://graph.facebook.com/?id=' + encodeURIComponent($a.attr('href')), {}, function(facebook_data){
                $.get('http://urls.api.twitter.com/1/urls/count.json?url=' + encodeURIComponent($a.attr('href')), {}, function(twitter_data) {
                    var facebook_shares = facebook_data['shares'] ? facebook_data['shares'] : 0;
                    if(facebook_shares == 0 && twitter_data['count'] == 0 && (!config.showLinkInfoAlways)) {
                        return;
                    }
                    if(!isDesignMode() && hovered_link && hovered_link[0] == $a[0]) { //still valid
                        addBubbleLink(
                            'Share on Facebook (' + facebook_shares + ' shares)',
                            'https://www.facebook.com/favicon.ico', 
                            create_badge_label(20, 8, padString(facebook_shares)),
                            'http://www.facebook.com/sharer.php?u=' + encodeURIComponent($a.attr('href')),
                            true                    
                        );
                        
                        var status = $a.text() + ' : ' + $a.attr('href');
                        if(config.addShareAttribution) {
                            status += ' Sent using http://j.mp/fstchm';
                        }
                        addBubbleLink(
                            'Share on Twitter (' + twitter_data['count'] + ' tweets)',
                            'https://www.twitter.com/favicon.ico', 
                            create_badge_label(20, 8, padString(twitter_data['count'])),
                            'https://twitter.com/home?status=' + encodeURIComponent(status),
                            true                    
                        );                

                        $("body").append($popupBubble);
                        var offsetTop = offsets[0] - offsets[2];
                        var offsetLeft = offsets[1];
                        
                        $popupBubble.css("top", offsetTop + "px");
                        $popupBubble.css("left", offsetLeft + "px");
                        
                        $popupBubble.css("margin-left", (-$popupBubble.width()) + "px");//(3*2 + 3*2 + numCols*18 + (numCols-1)*3)
                        $popupBubble.css("margin-top", (-$popupBubble.height()) + "px");         
                    }
                }, 'json');            
            }, 'json');
        };
        
        
        var hovered_link = null;
        var in_popup_bubble = false;
        $(document).on('mouseenter', 'a', function() {
            if(!in_popup_bubble) {
                var $a = hovered_link = $(this);
                setTimeout(function() {
                    if(!isDesignMode() && hovered_link && hovered_link[0] == $a[0]) {
                        get_config(function(conf)
                        {
                            config = conf;
                            if(config.showPopupBubble && config.showLinkInfo) {
                                insert_link_info_popup_bubble($a);
                            }
                        });
                    }
                }, 750);
            }
        });
        $(document).on('mouseleave', 'a', function() {
            hovered_link = null; //if $a == hovered_link
            setTimeout(function() {
                if(!in_popup_bubble) {
                    $(".smarterwiki-popup-bubble").each(function(i) {
                        cleanupPopupBubble($(this));
                    });
                }
            }, 450);
        });
        $(document).on('mouseenter', '.smarterwiki-popup-bubble', function() {
            in_popup_bubble = true;
        });
        $(document).on('mouseleave', '.smarterwiki-popup-bubble', function() {
            in_popup_bubble = false;
        });
    };

    var blacklist_urlRegExp = new RegExp("https?://(([^/]*\.)?n___ytimes______disabled.com.*)");
    var blacklist_match = blacklist_urlRegExp.exec(document.location.href);
    if(blacklist_match == null) //ok, add popup bubble
    {
        $(document).ready(function()
        {
            if(!isDesignMode())
            {
                setup_popup_bubble(document);
            }
            else
            {
                // in rich editor
            }
        });
    }
    else
    {
        // disabled on this page b/c of blacklist
    }
}());