//Copyright: 2012 Yongqian Li

(function()
{
    var linkify = function(doc)
    {
        var excludedTags = "a,applet,area,cite,embed,frame,frameset,head,iframe,img,map,meta,noscript,object,option,param,pre,script,select,style,textarea,title,*[@onclick],*[@onmousedown],*[@onmouseup],*[@tiddler],*[@class='linkification-disabled']".split(",");
        //"cite" because of google
        //"pre" because of http://www.tiddlywiki.com/
        var xpath = "//text()[not(ancestor::" + excludedTags.join(') and not(ancestor::') + ")]";
        var result = doc.evaluate(xpath, doc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null); 
        var url_regexp = new RegExp("(((https?|ftp|irc|file)://|www\\.)[^<>'\"\\s]*[^<>)'\"\\s,.])|([^[\\]<>'\"\\s]+@[^<>'\"\\s]+\\.[^<>'\"\\s]+)", "gi");

        for(var i = 0; i < result.snapshotLength; i++)
        {
            var candidate = result.snapshotItem(i);
            if(candidate.nodeName == "#cdata-section")
            {
                continue;//ignore cdata
            }
            var text = candidate.textContent;
            var lastLastIndex = 0;
            var match = url_regexp.exec(text);
            if(match)
            {
                var span = doc.createElement("span");
                while(match)
                {
                    span.appendChild(doc.createTextNode(text.substring(lastLastIndex, match.index)));

                    var url = match[0];
                    if(url.indexOf("www.") == 0) {
                        url = "http://" + url;
                    }
                    else if(url.indexOf("://") == -1 && url.indexOf('@') != -1) {
                        url = "mailto:" + url;
                    }
                    
                    var a = doc.createElement("a");
                    a.className = "smarterwiki-linkify";
                    a.setAttribute("href", url);
                    /*
                    $(a, doc)
                        .css("color", $(candidate.parentNode, doc).css("color"))
                        .css("background-color", $(candidate.parentNode, doc).css("background-color"))
                        .css("text-decoration", $(candidate.parentNode, doc).css("text-decoration"));
                    */
                    a.appendChild(doc.createTextNode(match[0]));

                    span.appendChild(a);
                    lastLastIndex = url_regexp.lastIndex;

                    match = url_regexp.exec(text);
                }

                span.appendChild(doc.createTextNode(text.substring(lastLastIndex)));
                candidate.parentNode.replaceChild(span, candidate);
            }
        }
    };



    $(document).ready(function()
    {
        if(document.designMode == "off")
        {
            getBoolPref("enable_linkify", function(pref_value)
            {
                if(pref_value)
                {
                    //if(document.documentElement.namespaceURI == null) doesn't work on chrome
                    var blacklisted_domains = [/google/, /squarespace.com/, "www.guardian.co.uk", /surfcanyon.com/, "www.motorist.si", /hotmail.com/, /startingtofeelit.com/];
                    for(var i = 0; i < blacklisted_domains.length; i++) {
                        if(blacklisted_domains[i] == window.location.host) {
                            return;
                        }
                        if(blacklisted_domains[i].test && blacklisted_domains[i].test(window.location))
                        {
                            return;
                        }
                    }
                    setTimeout(function()
                    {
                        linkify(document);
                    }, 200);//wait a bit before activating
                }
            });
        }
        else
        {
            // alert("in rich editor");
        }
    });
}());