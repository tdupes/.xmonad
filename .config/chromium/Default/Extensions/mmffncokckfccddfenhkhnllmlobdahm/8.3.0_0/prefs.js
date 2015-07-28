var uuid = function()
{
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+'-'+S4()+'-'+S4()+'-'+S4()+'-'+S4()+S4()+S4());
};

var default_pref = {};
var pref = function(key, value) {
    default_pref[key] = value;
};   



var read_multi_pref = function(keys, callback)
{
    if(keys.length == 0) {
        callback({});
    }
    else
    {
        read_pref(keys[0], function(val) {
            read_multi_pref(keys.slice(1), function(items) {
                items[keys[0]] = val;
                callback(items);
            });
        });
    }
};

var read_localStorage_or_default_pref = function(key)
{
    var pref_key = 'pref.' + key;
    var val = localStorage[pref_key];
    if(val == undefined) {
        val = default_pref[key];
    }
    return val;
};


var read_pref = function(key, callback)
{
    if(chrome.storage) {
        var pref_key = 'pref/' + key;
        chrome.storage.sync.get(pref_key, function(items) {
            var val = items[pref_key];
            if(val == undefined) {
                val = read_localStorage_or_default_pref(key);
            }
            callback(val);
        });
    }
    else {
        callback(read_localStorage_or_default_pref(key));
    }
};

var write_pref = function(key, val) {
    if(chrome.storage) {
        var pref_key = 'pref/' + key;
        var q = {};
        q[pref_key] = val;
        chrome.storage.sync.set(q);
    }
    else {
        var pref_key = 'pref.' + key;
        localStorage[pref_key] = val;
    }
};


pref('install-time', '0');
pref('install-source', 'Chrome Webstore');
pref('install-uuid', '');
pref('add_related_articles', true);
pref('add_related_searches', true);
pref('add_related_shopping_results', true);
pref('add_price_comparison_results', true);    
pref('add_related_search_results_oneriot', true);
pref('add_trending_search_results_oneriot', true);
pref('add_similar_product_search', true);
pref('show_context_menu_additions', true);
pref('show_popup_bubble', true);
pref('search_wikipedia', true);
pref('search_imdb', false);
pref('search_duckduckgo', true);
pref('search_yandex', false);
pref('search_google_translate', false);
pref('search_surfcanyon', false);
pref('search_twitter', false);
pref('tweet_this', false);
pref('search_bing', true);
pref('search_baidu', false);
pref('search_reddit', false);
pref('search_youtube', false);
pref('search_wiktionary', false);
pref('search_blekko', false);
pref('search_google_maps', false);
pref('search_google', true);
pref('search_custom', false);
pref('popup_bubble_show_definitions', true);
pref('popup_bubble_show_link_info', false);
pref('popup_bubble_add_share_attribution', true);
pref('popup_bubble_show_link_info_always', false);
pref('popup_bubble_open_new_tab', true);
pref('popup_bubble_force_single_row', false);
pref('popup_bubble_display_above_text', false);
pref('enhance_urlbar', true);
pref('num_urlbar_from_history', 4);
pref('enable_qlauncher', true);
pref('qlauncher_invoke_key', 'CTRL+SPACE');
pref('qlauncher_open_new_tab', true);
pref('enable_linkify', true);
pref('enable_endless_pages', true);
pref('auto_copy_selected', false);
pref('enable_middle_click_paste', false);
pref('enable_right_click_paste', false);
pref('insert_aff_code', true);
pref('add_search_refinements', true);
pref('add_serp_info_box', true);
pref('add_related_deals', true);
pref('custom_search_icon_url', '')
pref('custom_search_search_url', '')
pref('endless_pages_blacklist', '')
pref('last-version', 'firstrun');

read_pref('install-uuid', function(val) 
{
    if(!val) {
        write_pref('install-uuid', uuid());
    }
});

read_pref('install-time', function(val) 
{
    if(!val || val == "0") {
        write_pref('install-time', new Date().getTime());
    }
});

read_pref('install-source', function(val)
{
    if(val && val.valueOf() != 'Chrome Webstore'.valueOf()) { //rewrite the two prefs to that they get synced
        write_pref('install-source', val);
        read_pref('install-time', function(inst_time) {
            if(inst_time) {
                write_pref('install-time', inst_time);
            }
        });
    }
});