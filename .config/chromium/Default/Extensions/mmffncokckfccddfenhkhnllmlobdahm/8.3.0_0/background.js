(function()
{
    var EXT_NAME = 'FastestChrome';

    var get_log_msg_url = function(msg)
    {
        msg['rand'] = parseInt(Math.random() * 1000000000);
        var params = [];
        for(var k in msg)
        {
            params.push(encodeURIComponent(k) + '=' + encodeURIComponent(msg[k]));
        }
        /*
        if('https:' == document.location.protocol)
        {
            return 'https://ssl.msgs.smarterfox.com/log_msg?' + params.join('&');
        }
        */
        return 'http://msgs.smarterfox.com/log_msg?' + params.join('&');
    };


    chrome.extension.onMessage.addListener(function(request, sender, sendResponse)
    {
        if(request.msg_type == 'get_localStorage')
        {
            sendResponse({'value': localStorage[request.key]});
        }
        else if(request.msg_type == 'get_pref')
        {
            read_pref(request.key, function(val) {
                sendResponse({'value': val});
            });
            return true;
        }
        else if(request.msg_type == 'show_options')
        {
            var url = chrome.extension.getURL('options.html');
            if(request.suffix) {
                url += request.suffix;
            }
            chrome.tabs.create({
                index: 100000000, //last
                url: url
            });
            sendResponse({});
        }
        else if(request.msg_type == '$.get')
        {
            $.get(request.url, request.data, function(data, textStatus)
            {
                sendResponse({'data': data, 'textStatus': textStatus});
            }, request.type);
            return true;
        }
        else if(request.msg_type == 'set_pref')
        {
            write_pref(request.key, request.value);
            sendResponse({'status': true});
        }
        else {
            sendResponse({});
        }
    });

    //set up context menu
    /*
    chrome.contextMenus.create({
        title: 'Add scrolling rule...',
        onclick: function(info, tab) {
            chrome.tabs.executeScript(tab.id, {
                code: 'activate_rule_creator()'
            })
        }
    });
    */



    var onuninstallURL = function(install_time, install_duration) {
        return 'http://www.smarterfox.com/smarterwiki/uninstalled/?install_time=' + install_time + '&install_duration=' + install_duration;
    };
    var ondisableURL = function(install_time, install_duration) {
        return 'http://www.smarterfox.com/smarterwiki/disabled/?install_time=' + install_time + '&install_duration=' + install_duration;
    };
    var oninstallURL = function(lastVersion, currentVersion) {
        return 'http://www.smarterfox.com/smarterwiki/installed/?from_ver=' + lastVersion + '&to_ver=' + currentVersion;
    };
    var onupdateURL = function(lastVersion, currentVersion) {
        return 'http://www.smarterfox.com/smarterwiki/updated/?from_ver=' + lastVersion + '&to_ver=' + currentVersion;
    };
    var announcementURL = function(msg)
    {
        msg['rand'] = parseInt(Math.random() * 1000000000);
        var params = [];
        for(var k in msg)
        {
            params.push(encodeURIComponent(k) + '=' + encodeURIComponent(msg[k]));
        }
        /*
        if('https:' == document.location.protocol)
        {
            return 'https://ssl.msgs.smarterfox.com/log_msg?' + params.join('&');
        }
        */
        return 'http://api.smarterfox.com/api/check_announcement.json?' + params.join('&');
    };

    function try_create_tab(url)
    {
        chrome.tabs.create({
            index: 100000000, //last
            url: url
        }, function(tab) {
            if(!tab || chrome.extension.lastError) {
                setTimeout(function() {
                    try_create_tab(url);
                }, 100)
            }
        });
    }; //we need to catch error in case there is no Chrome window yet

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if(xhr.readyState==4)
        {
            var data = JSON.parse(xhr.responseText);
            var current_version = data.version;
            write_pref('last-version2', current_version);
            read_pref('last-version', function(last_version)
            {
                //check for announcements
                read_multi_pref(['last-version', 'install-time', 'install-source'], function(p_items)
                {
                  $.get(announcementURL({name: EXT_NAME + '_installed',
                         version_from: p_items['last-version'],
                         version_to: current_version,
                         locale: navigator.language,
                         install_time: p_items['install-time'],
                         install_source: p_items['install-source']
                        }),
                        function(msg) {
                            if(msg["url"]) {
                                try_create_tab(msg["url"]);
                            }
                        },
                        "json");
                });
                if(last_version != current_version)
                {
                    if(last_version == 'firstrun')
                    {
                        read_multi_pref(['last-version', 'install-time', 'install-source'], function(p_items)
                        {
                            $.get(get_log_msg_url({name: EXT_NAME + '_installed',
                                                   version_from: p_items['last-version'],
                                                   version_to: current_version,
                                                   locale: navigator.language,
                                                   install_time: p_items['install-time'],
                                                   install_source: p_items['install-source']
                                                  }));
                        });
                        try_create_tab(oninstallURL(last_version, current_version));
                    }
                    else
                    {
                        read_multi_pref(['last-version', 'add_related_shopping_results', 'add_related_deals',
                                         'add_similar_product_search', 'add_search_refinements',
                                         'popup_bubble_show_link_info',
                                         'install-time', 'install-source'], function(p_items)
                        {
                            var tag = 'UNKNOWN';
                            ///*
                            var hashCode = function(s) {  //adapted from http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
                                var hash = 0;
                                for(var i = 0; i < s.length; i++) {
                                    hash = ((hash << 5) - hash) + s.charCodeAt(i);
                                    hash = hash & hash; // Convert to 32bit integer
                                }
                                return hash;
                            };
                            var u_hash = Math.abs(hashCode(p_items['install-time']));
                            var locale = navigator.browserLanguage || navigator.language;
                            if((/^en/i.test(locale) || /^de/i.test(locale) || /^fr/i.test(locale)) &&
                                    u_hash % 100 == 95) {
                                tag = 'fast_max_widget';
                            }
                            if((/^en/i.test(locale) || /^de/i.test(locale) || /^fr/i.test(locale)) &&
                                    u_hash % 100 == 94) {
                                tag = 'fast_max_widget2';
                            }
                            if((/^en/i.test(locale) || /^de/i.test(locale) || /^fr/i.test(locale)) &&
                                    u_hash % 100 < 49) {
                                tag = 'fast_max_widget3';
                            }
                            if((/^en/i.test(locale) || /^de/i.test(locale) || /^fr/i.test(locale)) &&
                                    (u_hash % 100 >= 60 && u_hash % 100 < 70)) {
                                tag = 'fast_max_widget4';
                            }
                            if((/^en/i.test(locale) || /^de/i.test(locale) || /^fr/i.test(locale)) &&
                                    (u_hash % 100 >= 80 && u_hash % 100 < 90)) {
                                tag = 'fast_new_strip';
                            }
                            //*/

                            $.get(get_log_msg_url({name: EXT_NAME + '_updated',
                                                   version_from: p_items['last-version'],
                                                   version_to: current_version,
                                                   locale: navigator.language,
                                                   shopping_pref: p_items['add_related_shopping_results'],
                                                   add_related_deals: p_items['add_related_deals'],
                                                   tag: tag,
                                                   superfish_pref: p_items['add_similar_product_search'],
                                                   refinements_pref: p_items['add_search_refinements'],
                                                   link_info_pref: p_items['popup_bubble_show_link_info'],
                                                   install_time: p_items['install-time'],
                                                   install_source: p_items['install-source']
                                                  }));
                        });
                    }

                    write_pref('last-version', current_version);
                    write_pref('enable-optional', true);
                }
            });
        }
    };
    xhr.open('GET', chrome.extension.getURL('manifest.json'), true);
    xhr.send();
}());
