//Author: Yongqian Li
//(C)2012 Yongqian Li. All rights reserved

$(document).ready(function()
{
    var EXT_ICON_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAgCAYAAADjaQM7AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAO/QAADv0BuNrVxAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAPdSURBVEiJxZZRaJtVFMd/9/tuEpM0Xbc1WVqw1bXaFSmjs4aKoBvFYqGDwYQJE7YHBV98+/RRwecP9EGGPglD2BDmULGOgi2DsKYPFWxFW+zaSqVOLXRZE9ukX77rw5evy5qbrC0OD1zIPf9zzv/cm3PO/YRSCgDLsqLAG8BZoBNIAoL9yV/AGPAdcMW27S0AoZTCsqzDQBo4ts/g9SQNnLZt+66Zy+Uk8A3w3CMgAmgDBkdHRz+TeFd3ykcGBgbo6uoiGo3uO/rq6iqzs7NMTEz4qhPAGQmc9DX9/f2kUql9k/iSTCZJJpMAlYSnJNDj77q7uwFw3AI3ly+zfO9nFF4BBYwQxxOD9MQHtoOO/+Hy/YqiWPJsBHCsyeB8p0HQgI6Ojiqyp/xdPB4HILNyjak731JZjAJYyc0Rj7STjHaysK745Be3qlyXci4RCeeOGrS2tlZCXQYQ8HemaQJwJz+PEAJQ28s/4Z/52wAsrHs+ascSAhbW1QPx/HwNNKJQlGPrMUDVwOu4oiV7VKIlkyK4fQIdBhA09LgCgjWOoFX3xAcQmkkVkY0cbeoDoPewoDFQZYIATrbo2aRO2XkwxcWej1jJzaFwPUMRpPNgisdkAwCNQcGH/SZTq4qi6yVmCHi6ER5v0I9ULRlAPNJOPNJeCwagISB4qWX3s1pLJrYU4S9/Q/66fr+0ggaFF49QeL552y6Yv04odxWlNjw/DJxQH5tN76BEaHdk4a+XCX/1e9UDE/hxjVJLL84TUWRxhujfb7LTSG6mQQTZaHq3Kq6+GufXve7c2bGAvO11s1n4oWxd1dbIwpQubL0+q9Wau8H12P/f1EqK2uNKev+RrgDKFjUxg4qwruv1VOGFhD5MVLLVewgAJ/IymAe0doXoq56N41SqtySwBDwJ3gubSCQo9jeTjR8vl345l6BJ8dlDuOWx4RrNZFtvEfjnBpRLHwxKoT6c0AkAstlsJdmSBH7yyRYXF0kkvFM5HTGcjpg28+2bMI9QiF3QYvl8nnQ6Xamal8At4DTA2NgYk5OTSFlzsBCLxRgaGqK5+X5zz8zMMD09TbFYpFQq4TgOa2trO10vS+AS8DrwjJ9RPclms2QyGYaHhwEYHx8nk8nU9QE+t237qmHb9j3gFeAakHuYl5+QUoqRkZF6RJvAKPAWcBHKH6m+WJZlAq2AqXEeBD4FaGtrIxwOMzc3V4nfAN4DiuW1ZNv2RqXBA2T1xLKsM8D1GvAV4IL/mV1L/osJ8jFw/mFEUOc926W8b9v2B7s13gvZ3YrfLvC2bduX9uC/p2u8CXyBN3Fe2ysRwL842lT1svaplQAAAABJRU5ErkJggg%3D%3D';
    var SPINNER_URL = 'data:image/gif;base64,R0lGODlhIAAfAMIEAP9GsEOq6Ha1PP3MAP///////////////yH5BAEKAAQALAAAAAAgAB8AQAOHSCTcrhCGSatyGMfKefxgKCpAaZ5nNKxs22awsHX0Ejcg7aG8qbrAVY8HCgJvj4+Og0wqlswmYwadjK5YyDD1MbYIW9TPywpzFeQveCsiQ6S5qg0uqU6k07odL9NX+VR/dIFLbzBXOlmKikNXRlpmAEVpA5ElY2mWkhCUQpaYZJqgXmthk24JADs=';

    if(!(window.self === window.top)) { //do not execute in iframe
        return;
    }
    
    var loading_next_page_str = window.loading_next_page_str || "Loading page...";

    
    
    var RETRY_FIND_NEXT_LINK = false; //to speed things up
    
    var install_source = "";
    var install_time = "";
    var scrolling_rules = [];
    getStringPref('install-source', function(_install_source) {
    getStringPref('install-time', function(_install_time) {
    getStringPref('install-uuid', function(install_uuid) {
        install_source = _install_source;
        install_time = _install_time;
        $.get("http://api.smarterfox.com/api/infinite_scrolling_rules.json", 
        {
           locale: navigator.language || navigator.userLanguage,
           install_time: install_time,
           install_uuid: install_uuid,
           install_source: install_source,       
           extension_name: EXTENSION_NAME
        }, 
        function(data)
        {
            scrolling_rules = data;
        }, "json");
    });
    });
    });
    
    var check_scroll = function(blacklisted) 
    {
        if(document.body)
        {
            for(var z = 0; z < blacklisted.length; z++)
            {
                if(blacklisted[z] && new RegExp(blacklisted[z]).test(window.location.href)) {
                    return;
                }
            }

            var remaining = Math.max($(document).height(), $('body').height()) - $(document).scrollTop() - $(window).height();
            if(remaining < 300)
            {
                setTimeout(function() {
                    load_next_page();
                }, 15); //wait for animation or whatever to finish
            }
        }
    };
    
    getBoolPref("enable_endless_pages", function(pref_value)
    {
        if(pref_value)
        {            
            getStringPref("endless_pages_blacklist", function(blacklist)
            {
                var blacklisted = blacklist.split(',');

                var check_fn = function() {
                    check_scroll(blacklisted);
                };

                $(window).scroll(check_fn);
                setInterval(check_fn, 400);//////////////////could lead to slow down?
            });
        }
    });
    
    
    var identify_current_rule = function()
    {
        for(var i = 0; i < scrolling_rules.length; i++)
        {
            if(new RegExp(scrolling_rules[i]['url_matches']).test(window.location.href)) {
                return scrolling_rules[i];
            }
        }
        return null;
    };
    
    var $last_loaded_div = null;
    var $last_loaded_page = null;
    var identify_next_link = function(rule)
    {
        if(rule && rule['next_page_link_selector'])
        {
            var page = $last_loaded_page ? $last_loaded_page[0] : document;
            return $(page).find(rule['next_page_link_selector']);
        }
        else
        {
            return guess_next_page_link($last_loaded_page ? $last_loaded_page[0] : document);
        }
    };

    var loaded_urls = {};
    var identify_next_url = function(rule)
    {
        var url = null;
        var $next_link = identify_next_link(rule);
        if($next_link && $next_link.length)
        {
            url = $next_link[0].toString();

            $next_link.addClass("endless-pages-found-next-link");
            LOG_ERROR(url + ":" + $next_link.text());
        }

        return url;
    };
    
    var is_invalid_page = function(rule)
    {
        if(!rule) {
            return guess_is_invalid_page();
        }
        else {
            return !rule['enabled'];
        }
    };
    
    var loading_next_page = false;
    var load_next_page = function()
    {
        var curr_rule = identify_current_rule();
        if(is_invalid_page(curr_rule) || loading_next_page) {
            return;
        }

        loading_next_page = true;

        var next_url = identify_next_url(curr_rule);
        if(next_url)
        {            
            if(!(next_url in loaded_urls))
            {
                loaded_urls[next_url] = true;

                var loading_text = loading_next_page_str;
                //$("body").append($('<div id="endless-pages-loading"><img id="endless-pages-loading-spinner" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA%3D%3D" alt="spinner" />' + loading_text + '</div>').fadeIn());
                $("body")
                  .append($('<div id="endless-pages-loading" />')
                           .append($('<img id="endless-pages-loading-spinner" class="fastestx-logo" alt="spinner" />')
                                      .attr('src', SPINNER_URL))
                            .append($('<span />')
                                    .text(loading_text))
                            .fadeIn());

                var insert_url = function(url)
                {
                    //first make sure the domain is either the same or a subdomain of the domain of the current page.
                    var dot_url_domain = "." + url.match(/:\/\/(.[^/]+)/)[1];
                    var dot_page_domain = "." + document.location.hostname;
                    
                    if(dot_url_domain.substring(Math.max(dot_url_domain.length - dot_page_domain.length, 0)) == dot_page_domain)
                    {
                        //ok, matches
                        $.ajax({
                            type: "GET",
                            url: url,
                            success: function(data)
                            {
                                var redirect_url = get_meta_refresh(data);
                                if(redirect_url) {
                                    insert_url(redirect_url);
                                }
                                else
                                {
                                    insert_next_page(url, get_body_html(data), curr_rule);
                                    $("#endless-pages-loading").fadeOut(function() {
                                        $(this).remove();
                                        loading_next_page = false;
                                    });
                                }
                            }, 
                            error: function()
                            {
                                $("#endless-pages-loading").fadeOut(function() {
                                    $(this).remove();
                                    // loading_next_page = false; // don't try again
                                });
                            },
                            dataType: "html",
                            beforeSend: function(req)
                            {
                                req.setRequestHeader("X-moz", "prefetch");
                            }
                        });
                    }
                    else
                    {
                        $("#endless-pages-loading").fadeOut(function() {
                            $(this).remove();
                            // loading_next_page = false; // don't try again
                        });
                    }
                };
                insert_url(next_url);
            }
        }
        else {
            if(curr_rule || RETRY_FIND_NEXT_LINK) //always retry if we have rule since it's so fast
            {
                loading_next_page = false;
            }
        }
    };
    
    var insert_next_page = function(url, body_html, curr_rule) //mimetype="text/xml"
    {        
        getStringPref('install-source', function(install_source) {
        getStringPref('install-time', function(install_time) {
            $.get(get_log_msg_url({name: 'next_page_inserted', 
                                   locale: navigator.language || navigator.userLanguage,
                                   install_time: install_time,
                                   install_source: install_source        
                                  }));
        });
        });

        
        var main_content_selector = curr_rule ? curr_rule['main_content_selector'] : null;
        var main_cnt = main_content_selector ? main_content_selector : "body";

        var $loaded_by_endless_pages = $("#loaded-by-endless-pages");
        if($loaded_by_endless_pages.length == 0)
        {
            $loaded_by_endless_pages = $('<div id="loaded-by-endless-pages"></div>');
            $loaded_by_endless_pages.css("margin-top", $(main_cnt).css("margin-bottom"))
                                    .css("padding-top", $(main_cnt).css("padding-bottom"));
            if(main_content_selector) {
                var $cnt = $(document).find(main_content_selector); //some sites (like reddit) produce invalid html with repeated ids, this is the workaround
                $loaded_by_endless_pages.appendTo($($cnt[$cnt.length - 1]));
            }
            else {
                $loaded_by_endless_pages.appendTo("body");
            }
        }

        var txt = get_localized_message('page_n', 'Page {0}', $('.endless-pages-loaded-page-full').length + 2);
        var break_style = main_content_selector ? 'endless-pages-page-break-auto' : 'endless-pages-page-break-full';
        var $page_break_div = $('<div />')
                                .addClass(break_style)
                                .append($('<div class="endless-pages-page-break-desc" />')
                                  .append($('<span>- </span>'))
                                  .append($('<img class="smarterfox-icon" />')
                                            .attr('title', 'loaded by ' + EXTENSION_LONG_NAME)
                                            .attr('src', EXT_ICON_URL))
                                  .append($('<a class="endless-pages-page-break-link"/>').attr('href', url).text(txt))
                                  .append($('<span> -</span>')))
                              .appendTo($loaded_by_endless_pages);   
        //http://static.smarterfox.com/media/smarterwiki/smarterfox-logo.png                                            
                                    
        var parse_px = function(px_s)
        {
            var m = /(\d+)px/.exec(px_s);
            return (m && parseInt(m[1])) || 0;
        };
        $last_loaded_page = $('<div>' + body_html + '</div>');
        var $next_content = $(body_html);
        if(main_content_selector) {
            $next_content = $next_content.find(main_content_selector).children();
        }
        var $loaded_page_div = $('<div />')
                                 .attr('class', 'endless-pages-loaded-page' + (main_content_selector ? '-auto' : '-full'))
                                 .append($next_content)
                                 .appendTo($loaded_by_endless_pages);
    
        if(!main_content_selector) {
            $loaded_page_div.css("padding-top", 54 + parse_px($("body").css("margin-top")) + "px");
                //$loaded_page_div.css("margin-bottom", $("body").css("margin-bottom"));
        }
                
        if($last_loaded_div)
        {
            $last_loaded_div.css("margin-bottom", $(main_cnt).css("margin-bottom"))
                            .css("padding-bottom", $(main_cnt).css("padding-bottom")) //? should this be here?
                            .addClass("smarterwiki-clearfix");
        }
        $last_loaded_div = $loaded_page_div;
        /*
        var next_doc = new DOMParser().parseFromString(doc_str, mimetype);
        $(next_doc.body, next_doc).each(function()
        {
            if(this.nodeName != "script")
            {
                $next_page_div[0].appendChild(document.adoptNode(this));
            }
        });
        */
    };
});

//https://www.google.com/#hl=en&tbo=d&output=search&sclient=psy-ab&q=dd+&oq=dd+&gs_l=hp.3..0l4.1241.1588.0.1955.3.3.0.0.0.0.256.485.1j1j1.3.0.les%3B..0.0...1c.1.whURfK3DiOM&pbx=1&bav=on.2,or.r_gc.r_pw.r_cp.r_qf.&fp=6cac8731b3eaff51&bpcl=39650382&biw=1223&bih=968
