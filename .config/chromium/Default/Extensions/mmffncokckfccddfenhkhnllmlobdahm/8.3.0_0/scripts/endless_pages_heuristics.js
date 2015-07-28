//Author: Yongqian Li
//(C)2012 Yongqian Li. All rights reserved

var is_subset_of = function(set1, set2)
{
    if(set1.length != set2.length) {
        return false;
    }
    for(var i = 0; i < set1.length; i++) {
        if(set1[i] && !set2[i]) {
            return false;
        }
    }
    return true;
};

var shared_prefix_len = function(str_a, str_b)
{
    var len = Math.min(str_a.length, str_b.length);
    for(var i = 0; i < len; i++)
    {
        if(str_a.charAt(i) != str_b.charAt(i)) {
            return i;
        }
    }
    return len;
};    

var num_path_diff = function(url1, url2)
{
    var get_paths = function(url) {
        return url.split(new RegExp("([^/?]*)"));
    };
    var paths1 = get_paths(url1);
    var paths2 = get_paths(url2);
    var num_common_paths = 0;
    while(num_common_paths < Math.min(paths1.length, paths2.length) && 
        (paths1[num_common_paths] == paths2[num_common_paths]))
    {
        num_common_paths++;
    }
    return paths1.length + paths2.length - 2 * num_common_paths;
};

var get_a_matcher = function(keywords)
{
    keyword += " ";
    var expr1s = [];
    for(var i = 0; i < keywords.length; i++)
    {
        var keyword = keywords[i];
        //var verify_length1 = "string-length(translate(., ' ', '')) <= 20";
        //var verify_length2 = "string-length(translate(., ' ', '')) >= 1";
        var starts_with = "starts-with(concat(., ' '), '" + keyword + "')";
        var contains = "contains(translate(.,' ', ''), '" + keyword + "')";
        var maybe_ends_with = "string-length(substring-after(concat(., ' '), '" + keyword + "')) = 0";
        var keyword_expr = "("/* + verify_length1 + " and " + verify_length2 + " and ("*/ + starts_with + " or (" + contains + " and " + maybe_ends_with + "))"/* + ")"*/;
        expr1s.push(keyword_expr);
    }        
    var expr2s = [];
    var p_sib = "translate(concat(preceding-sibling::node()[2], preceding-sibling::node()[1], preceding-sibling::node()[0]), ' ', '')";
    var f_sib = "translate(concat(following-sibling::node()[0], following-sibling::node()[1], following-sibling::node()[2]), ' ', '')";
    for(var i = 0; i < keywords.length; i++)
    {
        var keyword = keywords[i];
        expr2s.push("(contains(substring(" + p_sib + ", string-length(" + p_sib + ") - 35), '" + keyword + "') or contains(substring(" + f_sib + ", string-length(" + f_sib + ")), '" + keyword + "'))");
    }
    var verify_length1 = "string-length(translate(., ' ', '')) <= 20";
    var verify_length2 = "string-length(translate(., ' ', '')) >= 1";
    var xpath_expr = ".//a[@rel='next' or (" + verify_length1 + " and " + verify_length2 + " and (" + expr1s.join(" or ") + " or " + expr2s.join(" or ") + "))]";
    //alert(xpath_expr);
    return function(contextNode) {
        var result = document.evaluate(xpath_expr, contextNode, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
        var nodes = [];
        for(var i = 0; i < result.snapshotLength; i++)
        {
            nodes.push(result.snapshotItem(i));
        }
        return nodes;
    };
};

var $a_text_tester = function(keyword)
{
    keyword += " ";
    var verify_length1 = "string-length(translate(., ' ', '')) <= 20";
    var verify_length2 = "string-length(translate(., ' ', '')) >= 1";
    var starts_with = "starts-with(concat(., ' '), '" + keyword + "')";
    var contains = "contains(concat(., ' '), '" + keyword + "')";
    var maybe_ends_with = "string-length(substring-after(concat(., ' '), '" + keyword + "')) = 0";
    var keyword_expr = "(" + verify_length1 + " and " + verify_length2 + " and (" + starts_with + " or (" + contains + " and " + maybe_ends_with + "))" + ")";
    var xpath_expr = "" + keyword_expr + "";// or ends-with(translate(substring(., 0, 35),' ', ''), '" + keyword + "'))]";
    return function($a){
        var result = document.evaluate(xpath_expr, $a[0], null, XPathResult.BOOLEAN_TYPE, null);
        //not a perfect emulation of ends-with but XPath 1.0 is too FUCKING DUMB.
        return result.booleanValue;
    };
};

var $a_parent_text_tester = function(keyword)
{
    keyword += " ";
    var p_sib = "translate(concat(preceding-sibling::node()[2], preceding-sibling::node()[1], preceding-sibling::node()[0]), ' ', '')";
    var f_sib = "translate(concat(following-sibling::node()[0], following-sibling::node()[1], following-sibling::node()[2]), ' ', '')";
    var xpath_expr = "string-length(translate(., ' ', '')) <= 20 and string-length(translate(., ' ', '')) >= 1 and ((contains(substring(" + p_sib + ", string-length(" + p_sib + ") - 35), '" + keyword + "')) or (contains(substring(" + f_sib + ", string-length(" + f_sib + ")), '" + keyword + "')))";
    //alert(xpath_expr);
    return function($a){
        var result = document.evaluate(xpath_expr, $a[0], null, XPathResult.BOOLEAN_TYPE, null);
        return result.booleanValue;
    };
};    
var $a_adjust_weight_on_text = function(weight, feat_len)
{
    return function($a)
    {
        var text_len = $a.text().length;
        return text_len ? weight * feat_len / text_len : 0;
    };
};

var $a_identity = function(val)
{
    return function($a) {
        return val;
    };
};

var features = [
    [function($a){
        return $a.attr("rel") == "next";
    }, 
        $a_identity(5000)],//sometimes abused :(
    [$a_text_tester("next"), //   /^.{0,5}next.{0,5}$/),
        $a_adjust_weight_on_text(6000, 4)],
    [$a_text_tester("Next"), //   /^.{0,5}next.{0,5}$/),
        $a_adjust_weight_on_text(5000, 4)],
    [$a_text_tester("\u2039"), //'SINGLE LEFT-POINTING ANGLE QUOTATION MARK'
        $a_identity(4050)],
    [$a_text_tester("\u203a"),
        $a_identity(4000)],

    [$a_text_tester("\u4e0b\u4e00\u9875"), //Chinese for Next Page
        $a_adjust_weight_on_text(5000, 4)],
    [$a_text_tester("Vorw\u00E4rts"), //German for Next Page
        $a_adjust_weight_on_text(5000, 4)],
    [$a_text_tester("vorw\u00E4rts"), //German for Next Page
        $a_adjust_weight_on_text(5000, 4)],
    [$a_text_tester("Suivant"), //French for Next Page
        $a_adjust_weight_on_text(5000, 4)],
    [$a_text_tester("suivant"), //French for Next Page
        $a_adjust_weight_on_text(5000, 4)],
    [$a_text_tester("Volgende"), //Dutch for Next
        $a_adjust_weight_on_text(5000, 4)],
    [$a_text_tester("volgende"), //Dutch for Next
        $a_adjust_weight_on_text(5000, 4)],
    [$a_text_tester("\u0421\u043b\u0435\u0434\u0443\u044e\u0449\u0430\u044f"), //Russian for "forward" or next
        $a_adjust_weight_on_text(5000, 4)],
    [$a_text_tester("\ub2e4\uc74c"), //Korean for next
        $a_adjust_weight_on_text(5000, 4)],
    [$a_text_tester("Mais"), //pt-BR for next
        $a_adjust_weight_on_text(5000, 4)],
    [$a_text_tester("mais"), //pt-BR for next
        $a_adjust_weight_on_text(5000, 4)],
    [$a_text_tester("Siguiente"), //Spanish for next
        $a_adjust_weight_on_text(5000, 4)],
    [$a_text_tester("siguiente"), //Spanish for next
        $a_adjust_weight_on_text(5000, 4)],

    [$a_text_tester("\u00bb"),//&#x00bb; //>>|\u00bb
        $a_identity(4000)],
    [$a_text_tester("\u2190"),//'LEFTWARDS ARROW'
        $a_identity(4500)], 
    [$a_text_tester("\u2192"),//'RIGHTWARDS ARROW'
        $a_identity(4450)], 
    [$a_text_tester("more"),
        $a_adjust_weight_on_text(800, 4)],
    [$a_text_tester("More"),
        $a_adjust_weight_on_text(1000, 4)],
    [$a_text_tester("newer"),
        $a_adjust_weight_on_text(900, 5)],
    [$a_text_tester("Newer"),
        $a_adjust_weight_on_text(1100, 5)],
    [$a_text_tester(">>"),
        $a_identity(1000)],
    [$a_text_tester(">"),
        $a_identity(600)],
    [$a_text_tester("\u00AB"),
        $a_identity(1500)],
    [$a_text_tester("older"),
        $a_adjust_weight_on_text(600, 5)],
    [$a_text_tester("Older"),
        $a_adjust_weight_on_text(700, 5)],
    [$a_text_tester("Older Posts"),
        $a_adjust_weight_on_text(800, 5)],
    [$a_text_tester("Older posts"),
        $a_adjust_weight_on_text(780, 5)],
    [$a_text_tester("<"),
        $a_identity(350)],


    [$a_parent_text_tester("next"),
        $a_identity(500)],
    [$a_parent_text_tester("Next"),
        $a_identity(550)],

    [$a_parent_text_tester("\u4e0b\u4e00\u9875"), //Chinese for Next Page
        $a_identity(550)],
    [$a_parent_text_tester("Vorw\u00E4rts"), //German for Next Page
        $a_identity(550)],
    [$a_parent_text_tester("vorw\u00E4rts"), //German for Next Page
        $a_identity(550)],
    [$a_parent_text_tester("Suivant"), //French for Next Page
        $a_identity(550)],            
    [$a_parent_text_tester("suivant"), //French for Next Page
        $a_identity(550)],            
    [$a_parent_text_tester("Volgende"), //Dutch for Next Page
        $a_identity(550)],
    [$a_parent_text_tester("volgende"), //Dutch for Next Page
        $a_identity(550)],
    [$a_parent_text_tester("\u0421\u043b\u0435\u0434\u0443\u044e\u0449\u0430\u044f"), //Russian for next
        $a_identity(550)],            
    [$a_parent_text_tester("\ub2e4\uc74c"), //Korean for next
        $a_identity(550)],            
    [$a_parent_text_tester("Mais"), //pt-BR for next
        $a_identity(550)],            
    [$a_parent_text_tester("mais"), //pt-BR for next
        $a_identity(550)],            
    [$a_parent_text_tester("Siguiente"), //Spanish for next
        $a_identity(550)],            
    [$a_parent_text_tester("siguiente"), //Spanish for next
        $a_identity(550)],            

    [$a_parent_text_tester("\u00bb"),//&#x00bb; //>>|\u00bb
        $a_identity(500)],
    [$a_parent_text_tester("more"),
        $a_identity(300)],
    [$a_parent_text_tester("More"),
        $a_identity(300)],
    [$a_parent_text_tester("newer"),
        $a_identity(300)],
    [$a_parent_text_tester("Newer"),
        $a_identity(300)],
    [$a_parent_text_tester(">>"),
        $a_identity(400)],
    [$a_parent_text_tester(">"),
        $a_identity(100)],
    [$a_parent_text_tester("\u00AB"),
        $a_identity(200)],
    [$a_parent_text_tester("older"),
        $a_identity(100)],
    [$a_parent_text_tester("Older"),
        $a_identity(100)],
    [$a_parent_text_tester("<"),
        $a_identity(100)],
];
var find_matching_as = get_a_matcher(["next", "Next", //"\u00bb", 
            "\u4e0b\u4e00\u9875", //Chinese for next page
            "Vorw\u00E4rts", //German Next page
            "vorw\u00E4rts", //German Next page
            "Suivant", //french next page
            "suivant", //french next page
            "Volgende", //dutch next
            "volgende", //dutch next
            "\u0421\u043b\u0435\u0434\u0443\u044e\u0449\u0430\u044f", //Russian for 'forward' or next
            "\ub2e4\uc74c", //Korean for next
            "Mais", //pt-BR for next
            "mais", //pt-BR for next
            "Siguiente", //Spanish for next
            "siguiente", //Spanish for next
            "more", "More", "newer", "Newer", ">>", ">", "\u00AB",
            "older", "Older", "<"]);
            //do NOT include "\u203a" (>) because it should not be enough on its own

            
            
            
            
            
var prev_best_has_feature = null;            
var prev_features_count = null;
var guess_next_page_link = function(last_loaded_page_node)
{
    //special cases //DELETE
    //if(new RegExp("^http(|s)://(www|encrypted).google.[a-z.]*/(#|search|webhp)").test(window.location.href)) {
    //    var links = $("td.navend a.pn");
    //    return links.length > 0 ? $(links[links.length - 1]) : null;
    //}        
    

    var is_valid_url = function(url)
    {
        return url.indexOf(window.location.host) != -1 && 
                url.indexOf("#") == -1 && 
                url != window.location.href && 
                num_path_diff(url, window.location.href) <= 6 && 
                url.indexOf("random") == -1;
    };
    
    var startTime = new Date().getTime();
    
    var features_count = [];
    for(var i = 0; i < features.length; i++)
    {
        features_count.push(0);
    }
    
    var $links = $(find_matching_as(last_loaded_page_node));
    $links.each(function(){
        var url = this.toString();
        if(is_valid_url(url))
        {
            var $a = $(this);
            var $a_has_feature = [];
            for(var i = 0; i < features.length; i++)
            {
                if(features[i][0]($a))
                {
                    $a_has_feature.push(true);
                    features_count[i] += 1;
                }
                else
                {
                    $a_has_feature.push(false);
                }                    
            }
            $a.data("has_feature", $a_has_feature);
            //alert($a[0].toString() + " " + $a_has_feature);
        }
    });
    
    
    var compute_score = function(url, $a, features_count)
    {
        var $a_has_feature = $a.data("has_feature");
        var score = 0;
        for(var i = 0; i < $a_has_feature.length; i++) {
            if($a_has_feature[i]) {
                score += features[i][1]($a) / (features_count[i] ? features_count[i] : 1);
            }
        }
        LOG_ERROR("before: " + score + " " + url);
        var adjustment = ((1 / num_path_diff(url, window.location.href)) +  
            (shared_prefix_len(url, window.location.href) / Math.min(url.length, window.location.href.length))) / 2;//favor longer urls over shorter ones
        score = score * adjustment;
        LOG_ERROR("after: " + score + " " + url);
        $a.addClass("score-" + score);
        return score;
    };
    
    
    var max_score = 0;
    var best_candidate = null;
    $links.each(function(){
        var url = this.toString();
        if(is_valid_url(url))
        {
            var $a = $(this);
            var $a_has_feature = $a.data("has_feature");
            if(prev_best_has_feature)
            {
                if(is_subset_of(prev_best_has_feature, $a_has_feature))
                {
                    var score = compute_score(url, $a, prev_features_count);
                    if(score > max_score)
                    {
                        max_score = score;
                        best_candidate = $a;
                    }
                    LOG_ERROR("matched previous");
                }
            }
            else
            {
                var score = compute_score(url, $a, features_count);
                if(score > max_score)
                {
                    max_score = score;
                    best_candidate = $a;
                }
            }
        }
    });

    var endTime = new Date().getTime();
    if(max_score >= 400)
    {
        LOG_ERROR("time: " + (endTime - startTime) + " score: " + max_score + ": " + best_candidate + ": " + best_candidate[0].toString() + ": " + best_candidate.text());
    }
    
    if(max_score >= 400)
    {
        //alert(": " + features_count);
        if(!prev_best_has_feature)
        {
            prev_best_has_feature = best_candidate.data("has_feature");
            prev_features_count = features_count;
        }
        return best_candidate;
    }
    else
    {
        return null;
    }
};

var guess_is_invalid_page = function()
{
    var is_invalid = $("a").length > 1500;
    if(!is_invalid)
    {
        $("body > *").each(function() {
            $this = $(this);
            if($this.css("position")   == "absolute" && 
               $this.css("display")    != "none" && 
               $this.css("width")      != "0px" && 
               $this.css("height")     != "0px" && 
               $this.css("visibility") != "hidden" &&
               $this.attr('id')        != "dp_swf_engine" &&
               !$this.hasClass("dealply-toast")
            ) // && $(this).css("top") != "" && $(this).attr("id") != "qlauncher-floater"
            {
                $this.addClass("broke-endless-pages");
                is_invalid = true;
                return false;
            }
        });
    }
    if(new RegExp("^http(|s)://(www|encrypted).google.[a-z.]*/(#|search|webhp)").test(window.location.href)) {
        is_invalid = false;
    }
    return is_invalid;
};    


var get_body_html = function(doc_str)
{
    var match = new RegExp("<\\s*body[^<>]*>([\\s\\S]*)<\\s*/\\s*body\\s*>").exec(doc_str);
    if(!match) { //some people, like Google, are retarded and are too fucking penny pinching to pay for 7 bytes.
        match = new RegExp("<\\s*body[^<>]*>([\\s\\S]*)$").exec(doc_str);
    }
    if(match)
    {
        var inner_source = match[1];
        if(inner_source)
        {
            //get rid of scripts
            inner_source = inner_source.replace(new RegExp("<\\s*script[^<>]*>([\\s\\S]*?)<\\s*/\\s*script\\s*>", ["gi"]), "");
            inner_source = inner_source.replace(new RegExp("(<\\s*noscript[^<>]*>)|(<\\s*/\\s*noscript\\s*>)", ["gi"]), "");
            inner_source = inner_source.replace(new RegExp("(<\\s*noscript[^<>]*>)|(<\\s*/\\s*noscript\\s*>)", ["gi"]), "");
            inner_source = inner_source.replace(new RegExp("(<\\s*meta[^<>]*>)(([\\s\\S]*?)(<\\s*/\\s*meta\\s*>))?", ["gi"]), "");
            //inner_source = inner_source.replace(new RegExp("<\\s*object[^<>]*>([\\s\\S]*?)<\\s*/\\s*object\\s*>", ["gi"]), "");
            //inner_source = inner_source.replace(new RegExp("<\\s*embed[^<>]*>([\\s\\S]*?)<\\s*/\\s*embed\\s*>", ["gi"]), "");
            //<meta HTTP-EQUIV="refresh" content="0;url=http://images.google.com/images?hl=en&client=firefox-a&rls=org.mozilla:en-US:official&um=1&q=a&sa=N&start=63&ndsp=21&gbv=1&ei=8Jd8StPqOIuYsgPboqjvCg">
            //LOG_ERROR(inner_source);
            return inner_source;
        }
    }
    return null;
};

var get_meta_refresh = function(doc_str)
{
    var match = new RegExp('(<\\s*meta[^<>]*HTTP-EQUIV="refresh"[^<>]*content="[^<>]*url=([^<>;]*)(;[^<>]+|)"[^<>]*>)', ["gi"]).exec(doc_str);
    return match ? match[2] : null;
};