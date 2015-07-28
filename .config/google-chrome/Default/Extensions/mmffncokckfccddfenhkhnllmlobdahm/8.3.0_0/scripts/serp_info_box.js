$(document).ready(function()
{
    var EXT_ICON_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAB/GAAAfxgBwnaBpAAAAAd0SU1FB9wDDg8ABuxomR8AAARFSURBVEjHjZVNbFVFFMd/Z2bufaWvH1LaAgWLxNBYVNSYJsZdQ/xIN7hhY6LGGF0YjRuCJCTGmEBKUlauXLlxowkLkkrEgEZFF24EoUhUhH698tG+An19ffdrjgv6nvT1w55kkpkzd85vzj3/c6/wgJ09e7bVWvuec+4Na+1Oa601xoi1Fmstxhiq8/o1UBCRr4Chrq6uyWpMqU5Onz7d4r0/Y63tU9Ulh+sD1w211uKck8VnC8aY/q6urj8BXBVQLpffUdU+Ywy9vb20tbVhjLl/C5HaAOr9ApAkCcViEaDLWvsp8NISwOjo6FvNzc309fXR3d1NkkakmtxPUQQrDmdCRCD1kPhFAOCs0BgEOOcYGxtT59yL1bg1wPj4+K4oiujv72d+YY6L02coJdOIGEQM+eAhnup8gQaX57tCxq2KEhghMNCWE57fbAmsJcsySdOUZQBjjNX7JnOVWX4ZO0Hsy3Q2PUJ7/mGipExxYZKWXA+Xip7QQmAUK8KdCJ7epDRbTxRFeO+XA+qLnvmEcnyPa8XzjM5epD2/nZ6252gMlFKSkcsEa4TAKAhkmcGLJ45jsiyrBTSsaLo4wIhFVbk5d52Z0hSlSsKvUzHX7qWUEqWcKqVYSb1HValUKlQqlVUzACBn8zSH7cxWbtRyEoVtTY/R2eC5XU75o5jS4GJ2NFue6QwIDKgqURSxYg2WAhrZ3/sxY3MjqHqUjG1NvbQGHcQ+5duBDfww5Wu59rQojcSkqVIul1HVtQEqsKFY5olriwu1ZJ13SHs6IbXksgn2bfx5sWRC7HYRZU8SRRFXrlypdvbqAOZLhJ9/hvzzd60kJnDohx+Rde+k5ebLSDZbezywG0k3fw10EMcxpVJp7SJLFCG3byJpimQZ4jOkUkEmJ7FawKQ3EFKEFDTBJAXEz69411VUtESxD7hkZf8aZpbHkAekWl8cXfRqbVdYm+nqxC/eezTfhH+0B3P54n+7YUi2+3HUbCHN9WGTv/AYEMUHO/C2DVGpxVkJMC0iHcVikS1bt6LvfgA3Cogqqop2bibY0EgSlbm75RQuuYRzDhGDd9sJ3SZujY8xPz+/agbfhGH42smTJ/XcuXOiujz1jvZ29u7dSy6XY4Fefvr+R2ZmZvD+N6IoYmZmRlVVrLW/LwOEYfhJFEX7FhYWWiYmJlZ8n4XJSfbs2UNHRwfDw8M6MjIiVc1X/w0icjcIgtdXlMqhQ4eeTdN0v6rmVbX6SVRjTIOqvm2MMQMDA1y4cEGvXr0qYRhijPlCVSMRSYHJIAhOHD169PIaWoQjR47I9PQ0xhiOHz+uQ0NDG6empm4DNggC4jhGRLxz7tXW1tYTSZJoPp/XAwcO+LVUVLPDhw8v0agxprrWOI5FRMrOufePHTv25f/1gVtPszjnVFXtImzaOffm4ODg8HrOrrstDx48eEpVd1trXxkcHDy/3nP/Ak+/5hWUi158AAAAAElFTkSuQmCC';
    var DDG_FAVICON_URL = 'data:image/vnd.microsoft.icon;base64,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';

    var get_log_msg_url = function(msg)
    {
        msg["rand"] = parseInt(Math.random() * 1000000000);
        var params = [];
        for(var k in msg)
        {
            params.push(encodeURIComponent(k) + "=" + encodeURIComponent(msg[k]));
        }
        return "http://msgs.smarterfox.com/log_msg?" + params.join("&");
    };

    var hashCode = function(s) {  //adapted from http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
        var hash = 0;
        for(var i = 0; i < s.length; i++) {
            hash = ((hash << 5) - hash) + s.charCodeAt(i);
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    };
	
    getBoolPref('add_serp_info_box', function(pref) {
    getStringPref('install-time', function(install_time) {
        if(pref) {
            var query_ddg = function(query, callback) {
                $.get('https://chrome.duckduckgo.com?q=' + encodeURIComponent(query) + '&format=json', {}, callback, 'json');
            };
            //in function search
            //<div class="smarterwiki-serp-info-box google"><div id="ddg_zeroclick"></div></div>

            //<div class="smarterwiki-serp-info-box bing"><div id="ddg_zeroclick"></div></div>
            //in createResultDiv

            //disable "ddg_answer"


            var google_url_regexp = new RegExp("^http(?:|s)://(?:www|encrypted).google.(?:com|ca|co.uk|com.au|co.in|co.id|com.ph)/(?:(?:search\\?|webhp\\?|#)(?:.*&)?q=([^&=]*)(.*)$)?");
            var google_match = google_url_regexp.exec(document.location.href);

            var bing_url_regexp = new RegExp('http://www.bing.com/search*');
            var bing_match = bing_url_regexp.exec(document.location.href);

            var CONFIRM_DISABLE_MSG = "Are you sure you want to disable this?\n\nTo re-enable, go to Options";
            if(/Chrome/.test(navigator.userAgent)) {
                CONFIRM_DISABLE_MSG = "Are you sure you want to disable this?\n\nTo re-enable, go to: \nchrome://chrome/extensions/ -> " + EXTENSION_LONG_NAME;
            }
            else {
                CONFIRM_DISABLE_MSG = "Are you sure you want to disable this?\n\nTo re-enable, go to Tools -> FastestFox";
            }

            if(google_match || bing_match) {
                //log_msg_async({'name': 'serp_page_visited'});
                $(document).on('click', '.smarterwiki-serp-info-box .smarterwiki-close-button', function() {
                    if(window.confirm(CONFIRM_DISABLE_MSG)) {
                        setBoolPref('add_serp_info_box', false);
                        $('.smarterwiki-serp-info-box #ddg_zeroclick').slideUp();
                    }
                });

                $(document).on('click', '.smarterwiki-serp-info-box #ddg_zeroclick_header .ddg_head', function() {
                    return false;
                });

                $(document).on('mouseup', '.smarterwiki-serp-info-box a', function() {
                    var msg = {'name': 'serp_info_box_link_clicked'};
                    var $a = $(this);
                    var original_href = $a.attr("href");
                    msg["redirect_to"] = original_href;
                    $a.attr("href", get_log_msg_url(msg));

                    setTimeout(function()
                    {
                        $a.attr("href", original_href);
                    }, 10);
                });

                setInterval(function()
                {
                    if($('#ddg_zeroclick').length == 1 && $('#smarterwiki-ext-attr').length == 0)
                    {
                        $('#ddg_zeroclick #ddg_zeroclick_abstract').after($('<div id="smarterwiki-attr">' +
                            '<span id="smarterwiki-ext-attr">' +
                                    '<img src="' + EXT_ICON_URL + '" alt="" />' + 
                                    'by ' +
                                    EXTENSION_LONG_NAME + 
                             '</span>' + 
                             '<span id="smarterwiki-ddg-attr">' + 
                                    '<a href="http://duckduckgo.com">more from<img src="' + DDG_FAVICON_URL + '" alt="" />DuckDuckGo &raquo;</a>' + 
                            '</span></div>'));

                        $('#ddg_zeroclick_header').append($(
                            '<span class="smarterwiki-close-button">' +
                                '<span class="smarterwiki-close-button-inner">Close</span></span>' + 
                            '<img alt="" src="' + EXT_ICON_URL + '" />'));


                        $('#ddg_zeroclick_header .ddg_head').replaceWith(
                            $('<span></span>', {'text': $('#ddg_zeroclick_header .ddg_head').text(),
                                                'class': 'ddg_head'}));
                    }
                }, 100);
            }

            if(google_match)
            {
/////////////////////////////////////////////////////////
/*
 * Copyright (C) 2012 DuckDuckGo, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */



var options = {};
var ddgBox;

    ddgBox = new DuckDuckBox({ 
                inputName: 'q',
                forbiddenIDs: ['rg_s'],
                hover: true,
                contentDiv: 'center_col',
                className: 'google',
                debug: options.dev
              });

    ddgBox.search = function(query) {
        var request = {query: query};
        query_ddg(query, function(response){
            ddgBox.renderZeroClick(response, query);
        });
    }

    ddgBox.init();


var ddg_timer;

function getQuery(direct) {
    var instant = document.getElementsByClassName("gssb_a");
    if (instant.length !== 0 && !direct){
        var selected_instant = instant[0];
        
        var query = selected_instant.childNodes[0].childNodes[0].childNodes[0].
                    childNodes[0].childNodes[0].childNodes[0].innerHTML;
        query = query.replace(/<\/?(?!\!)[^>]*>/gi, '');

        if(options.dev)
            console.log(query);

        return query;
    } else {
        return document.getElementsByName('q')[0].value;
    }
}

function qsearch(direct) {
    var query = getQuery(direct);
    ddgBox.lastQuery = query;
    ddgBox.search(query);
} 

// instant search
$('[name="q"]').keyup(function(e){
    var query = getQuery();
    if(ddgBox.lastQuery !== query && query !== '')
        ddgBox.hideZeroClick();

    if(options.dev)
        console.log(e.keyCode);

    var fn = function(){ qsearch(); };

    if(e.keyCode == 40 || e.keyCode == 38)
        fn = function(){ qsearch(true); };

    clearTimeout(ddg_timer);
    ddg_timer = setTimeout(function(){
        fn();
    }, 700);

    // instant search suggestions box onclick
    document.getElementsByClassName("gssb_c")[0].onclick = function(){
        if(options.dev)
            console.log("clicked")

        ddgBox.hideZeroClick();
        qsearch(true);
    };
});

$('[name="btnG"]').click(function(){
    qsearch();
});
/////////////////////////////////////////////////////////
        	}
            if(bing_match)
            {
/*
 * Copyright (C) 2012 DuckDuckGo, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var options = {};
var ddgBox;
chrome.extension.sendMessage({options: "get"}, function(opt){
    for (var option in opt) {
        options[option] = (opt[option] === 'true') ? true : false; 
    }
    ddgBox = new DuckDuckBox({ 
                inputName: 'q',
                hover: false,
                contentDiv: 'results_container',
                className: 'bing'
              });

    ddgBox.search = function(query) {
        var request = {query: query};
        query_ddg(query, function(response){
            ddgBox.renderZeroClick(response, query);
        });
    }

    ddgBox.init();
});

ddgBox.search = function(query) {
var request = {query: query};
        chrome.extension.sendMessage(request, function(response){
            ddgBox.renderZeroClick(response, query);
        });

    if (options.dev)
        console.log("query:", query);
}

var ddg_timer;

function getQuery(direct) {
    var instant = document.getElementsByClassName("gssb_a");
    if (instant.length !== 0 && !direct){
        var selected_instant = instant[0];
        
        var query = selected_instant.childNodes[0].childNodes[0].childNodes[0].
                    childNodes[0].childNodes[0].childNodes[0].innerHTML;
        query = query.replace(/<\/?(?!\!)[^>]*>/gi, '');

        if(options.dev)
            console.log(query);

        return query;
    } else {
        return document.getElementsByName('q')[0].value;
    }
}

function qsearch(direct) {
    var query = getQuery(direct);
    ddgBox.lastQuery = query;
    ddgBox.search(query);
} 

// instant search

$('[name="q"]').keyup(function(e){
    var query = getQuery();
    if(ddgBox.lastQuery !== query && query !== '')
        ddgBox.hideZeroClick();

    if(options.dev)
        console.log(e.keyCode);

    var direct = false;
    if(e.keyCode == 40 || e.keyCode == 38)
        direct = true;

    clearTimeout(ddg_timer);
    ddg_timer = setTimeout(function(){
        qsearch(direct);
    }, 700);
   
});

$('[name="go"]').click(function(){
    qsearch();
});

ddgBox.init();
            }
        }
    })
    });
});