/*/////////////////////////////////////////////////////////////////////////
//                                                                       //
//   iReader! (c) 2010 Samabox. All rights reserved.                     //
//                                                                       //
/////////////////////////////////////////////////////////////////////////*/

var extension;
var Settings;
var Utils;
var anyValueModified = false;

function init() {
	extension = chrome.extension.getBackgroundPage();
	Settings = extension.Settings;
	Utils = extension.Utils;
	
	initUI();
	loadOptions();
}

function initUI() {
	$("#body input, #body select").change(function() {
		anyValueModified = true;
	});
	
	$("#chkHotkey").change(function(event) {
		$("#txtHotkey")[0].disabled = this.checked ? "" : "disabled";
		if (this.checked)
			$("#txtHotkey").focus();
	});
	
	$("#txtHotkey")[0].addEventListener("keydown", function(event) {
		var hotkey = new Hotkey(event);
		$("#txtHotkey").val(hotkey.toString(true))[0].hotkey = hotkey;
		return true;
	});
	
	$("#txtHotkey")[0].addEventListener("keyup", function(event) {
		$("#txtHotkey").val(this.hotkey.toString());
		return true;
	});
	
	$("#txtBackgroundOpacity").change(function() {
		$("#preview table").css("background-color", "rgba(0, 0, 0, " + (this.value / 100) + ")");
	});
	
	$("#cmbArticleWidth").change(function() {
		var percent = parseInt($("#cmbArticleWidth option:selected").val());
		var maxWidth = 250;
		var width = percent * maxWidth / 100;
		$("#preview .page").css("width", width + "px").css("margin-left", (-width / 2) + "px");
	});
	
	$("#cmbArticleMargin").change(function() {
		var percent = parseInt($("#cmbArticleMargin option:selected").val());
		var pageWidth = $("#preview .page").width();
		var width = percent * pageWidth / 100;
		$("#preview .page div").css("margin", width + "px");
	});
	
	$("#cmbFontFamily").change(function() {
		$("#preview .page").css("font-family", $("#cmbFontFamily option:selected").val());
	});
	
	$("#chkJustifyText").change(function() {
		if ($(this).is(":checked"))
			$("#preview .page").css("text-align", "justify");
		else
			$("#preview .page").css("text-align", "");
	});
	
	$("#version").text("v " + extension.appVersion);
	
	// Reverse buttons order on Linux and Mac OS X
	if (!Utils.OS.isWindows) {
		var btnSaveContainer = $("#btnSave").parent();
		btnSaveContainer.next().next().insertBefore(btnSaveContainer);
		btnSaveContainer.next().insertBefore(btnSaveContainer);
	}
}

function loadOptions() {
	if (Settings.getValue("hotkeyEnabled", "false") != "false")
		$("#chkHotkey").attr("checked", "checked").change();
	
	var hotkey = Settings.getObject("hotkey");
	if (hotkey)
		hotkey = new Hotkey(hotkey);
	else
		hotkey = new Hotkey(true, true, false, "U+0050", 80);
	
	$("#txtHotkey").val(hotkey.toString())[0].hotkey = hotkey;
	
	$("#txtBackgroundOpacity").val(Settings.getValue("backgroundOpacity", "80")).change();
	
	if (Settings.getValue("useGmail", "false") != "false")
		$("#chkUseGmail").attr("checked", "checked");
	
	if (Settings.getValue("smoothScrollEnabled", "false") == "true")
		$("#chkSmoothScroll").attr("checked", "checked");
	
	if (Settings.getValue("animationsEnabled", "false") == "true")
		$("#chkAnimations").attr("checked", "checked");
	
	var fontFamily = Settings.getValue("currentFontFamily", "Palatino");
	$("#cmbFontFamily option[value='" + fontFamily + "']").attr("selected", "selected").change();
	
	var articleWidth = Settings.getValue("articleWidth", "70%");
	$("#cmbArticleWidth option[value='" + articleWidth + "']").attr("selected", "selected").change();
	
	var articleMargin = Settings.getValue("articleMargin", "10%");
	$("#cmbArticleMargin option[value='" + articleMargin + "']").attr("selected", "selected").change();
	
	if (Settings.getValue("justifyTextEnabled", "true") != "false")
		$("#chkJustifyText").attr("checked", "checked").change();
}

function saveOptions() {
	Settings.setValue("hotkeyEnabled", $("#chkHotkey").is(":checked"));
	var hotkey = $("#txtHotkey")[0].hotkey;
	Settings.setObject("hotkey", hotkey.isValid() ? hotkey : new Hotkey());
	Settings.setValue("backgroundOpacity", $("#txtBackgroundOpacity").val());
	Settings.setValue("useGmail", $("#chkUseGmail").is(":checked"));
	Settings.setValue("smoothScrollEnabled", $("#chkSmoothScroll").is(":checked"));
	Settings.setValue("animationsEnabled", $("#chkAnimations").is(":checked"));
	
	Settings.setValue("currentFontFamily", $("#cmbFontFamily option:selected").val());
	Settings.setValue("articleWidth", $("#cmbArticleWidth option:selected").val());
	Settings.setValue("articleMargin", $("#cmbArticleMargin option:selected").val());
	Settings.setValue("justifyTextEnabled", $("#chkJustifyText").is(":checked"));

	InfoTip.showMessage("Options Saved..", InfoTip.types.success);
	loadOptions();
	
	anyValueModified = false;
}

function closeWindow() {
	if (anyValueModified && InfoTip.confirm("Save changed values?"))
		saveOptions();
	
	chrome.tabs.getSelected(undefined, function(tab) {
		chrome.tabs.remove(tab.id);
	});
}

/**
 * @constructor
 */
function Hotkey(ctrlKey, shiftKey, altKey, keyIdentifier, keyCode) {
	if (typeof arguments[0] == "object") {
		var hotkey = arguments[0];
		this.ctrlKey = !!hotkey.ctrlKey;
		this.shiftKey = !!hotkey.shiftKey;
		this.altKey = !!hotkey.altKey;
		this.keyIdentifier = hotkey.keyIdentifier;
		this.keyCode = hotkey.keyCode;
	} else {
		this.ctrlKey = !!ctrlKey;
		this.shiftKey = !!shiftKey;
		this.altKey = !!altKey;
		this.keyIdentifier = keyIdentifier;
		this.keyCode = keyCode;
	}
	
	this.isValid = function() {
		return (this.keyCode >= 32 && (this.ctrlKey || this.shiftKey || this.altKey));
	};
	
	this.toString = function(dontCheckValidity) {
		if (!dontCheckValidity && !this.isValid())
			return "";
		
		var result = [];
		if (this.ctrlKey)
			result.push(Utils.OS.isMac ? "⌘" : "Ctrl");
		
		if (this.shiftKey)
			result.push("Shift");
		
		if (this.altKey)
			result.push(Utils.OS.isMac ? "⌥" : "Alt");
		
		if (this.keyCode) {
			var keyChar = String.fromCharCode(this.keyCode);
			result.push(keyChar.trim().length > 0 ? keyChar : "Key(" + this.keyCode + ")");	
		}
		return result.join(Utils.OS.isMac ? "-" : "+");
	};
}