//Copyright: 2012 Yongqian Li

var activate_rule_creator = function()
{
   show_hovered_elem();
   addListeners();
   injectUI();
};

var SELECT_NEXT_LINK = 0;
var SELECT_MAIN_CONTENT = 1;
var curr_state = SELECT_NEXT_LINK;
var SELECTED_CLASS = 'fastestfox-elem-hovered';

var injectUI = function()
{
    var ui_code = '' + 
            '<div id="infinite-scroll-rule-creator-ui">' +
            '    <a href="#" title="close" id="close-rule-creator-ui"></a>' + 
            '    <label class="title">' +
            '        Specify CSS selectors:' +
            '    </label><br />' +
            '    <label>URL regex pattern: </label><label id="url-regex-pattern-error-label" class="error-label"></label><br />' + 
            '        <input type="text" id="url-regex-pattern-text-input" /><br />' +
            '    <label>Next page link: </label><label id="next-page-link-selector-error-label" class="error-label"></label><br />' + 
            '        <input type="text" id="next-page-link-selector-text-input" /><br />' +
            '    <label>Main content area: </label><label id="main-content-area-selector-error-label" class="error-label"></label><br />' + 
            '        <input type="text" id="main-content-area-selector-text-input" /><br />' +
            '    <a href="#" id="submit-infinite-scroll-rule">Submit</a><br />' + 
            '</div>';
    $('body').append(ui_code);
    $('#url-regex-pattern-text-input').val(window.location.href);
    $('#submit-infinite-scroll-rule').click(function(e)
    {
        
        return false;
    });
    $('#next-page-link-selector-text-input').click(function() {
        curr_state = SELECT_NEXT_LINK;
    });
    $('#main-content-area-selector-text-input').click(function() {
        curr_state = SELECT_MAIN_CONTENT;
    });
    $('#close-rule-creator-ui').click(function() {
        deactivate_rule_creator();
    });
};

var show_hovered_elem = function()
{
    $('*').bind('mouseenter.fastestfox', function(e)
    {
        $(this).addClass(SELECTED_CLASS).parents().removeClass(SELECTED_CLASS);
        return false;
    }).bind('mouseleave.fastestfox', function()
    {
        $(this).removeClass(SELECTED_CLASS);
    });    
};

var addListeners = function()
{
    $('*').bind('click.fastestfox', function(e)
    {
        var selector = get_css_selector($(this));
        if(selector)
        {
            if(curr_state == SELECT_NEXT_LINK) {
                $('#next-page-link-selector-text-input').val(selector);
                curr_state = SELECT_MAIN_CONTENT;
            }
            else {
                $('#main-content-area-selector-text-input').val(selector);
            }
        }
        test_rule_evaluation();
        return false;
    });
};

var test_rule_evaluation = function()
{
    $('.fastestfox-selected-next-link').each(function() {
        $(this).removeClass('fastestfox-selected-next-link');
    });
    $('.fastestfox-selected-main-content').each(function() {
        $(this).removeClass('fastestfox-selected-main-content');
    });

    $('#next-page-link-selector-error-label, #main-content-area-selector-error-label').text('');
    var selected_elements = $($('#next-page-link-selector-text-input').val());
    selected_elements.addClass('fastestfox-selected-next-link');
    if(selected_elements.length > 1) {
        $('#next-page-link-selector-error-label').text('more than one matches!');
    }

    var selected_elements = $($('#main-content-area-selector-text-input').val());
    selected_elements.addClass('fastestfox-selected-main-content');
    if(selected_elements.length > 1) {
        $('#main-content-area-selector-error-label').text('more than one matches!');
    }
};

var deactivate_rule_creator = function()
{
    $('*').unbind('mouseenter.fastestfox mouseleave.fastestfox');
    $('*').unbind('click.fastestfox');
    $('#infinite-scroll-rule-creator-ui').remove();
    $('.fastestfox-selected-next-link').each(function(i){
        $(this).removeClass('fastestfox-selected-next-link');
    });
    $('.fastestfox-selected-main-content').each(function(i){
        $(this).removeClass('fastestfox-selected-main-content');
    });
};    


var get_css_selector = function($elem, selector)
{
    var num_matches = function(sel) {
        return sel && $(sel) ? $(sel).length : 1000000000; //+inf is actually only 1000000000 
    };

    if($elem[0] == $('body')[0] || num_matches(selector) == 1) {
        return selector;
    }
    
    if(!selector) {
        selector = '';
    }
    var this_sel = '';
    
    var combine_sel = function(sel, sub_sel) {
        var a = [];
        if(sel) {
            a.push(sel);
        }
        if(sub_sel) {
            a.push(sub_sel);
        }
        return a.join(' ');
    }
    var better_sel = function(sel1, sel2) { //sel2 is the default
        return num_matches(combine_sel(sel1, selector)) < num_matches(combine_sel(sel2, selector)) ? sel1 : sel2;
    }

    //try id first
    if($elem.attr('id')) { 
        this_sel = better_sel(this_sel + '#' + $elem.attr('id'), this_sel);
    }
    
    //try classes
    var classes = $elem.attr('class') ? $elem.attr('class').split(' ') : [];
    for(var i = 0; i < classes.length; ++i) {
        if (/^[a-zA-Z-_]*$/.test(classes[i]) && !/^fastestfox-/.test(classes[i]) && !/^endless-pages/.test(classes[i])) {
            this_sel = better_sel(this_sel + '.' + classes[i], this_sel);
        }
    }    
    
    //try tag name
    var tag_name = $elem[0].nodeName.toLowerCase();
    this_sel = better_sel(tag_name + this_sel, this_sel);
    
    //try nth element
    var idx = $elem.parent().children().toArray().indexOf($elem[0]);
    if(idx != 0) {
        this_sel = better_sel((this_sel||tag_name) + ':nth-child(' + (idx+1) + ')', this_sel);
    }
    
    return get_css_selector($elem.parent(), combine_sel(this_sel, selector));
};

/*
deactivate():
   remove UI()
   removeListeners()


injectUI():
   inject html code to bottom


addListeners():
   onHover ...
   onClick:
       if state == specfiy next link:
           update text input to selector
       if state == specfiy main content:
           update text input to selector
       updateColors + warnings
   onTextInput:
       updateColors + warnings

updateColors + warnings:
   remove all coloring
   if more than one link matched:
       color them all red + show red warning in UI
   else:
       color it green
   if more than one content area matched:
       color them all organge + show red warning in UI
   else:
       color it yellow
*/