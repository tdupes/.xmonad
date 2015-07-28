/*/////////////////////////////////////////////////////////////////////////
//                                                                       //
//   iReader! (c) 2010 Samabox. All rights reserved.                     //
//                                                                       //
/////////////////////////////////////////////////////////////////////////*/

var appName;
var appVersion;
var readerPageHTML;

function init() {
	loadManifestInfo();
	readerPageHTML = fetchUrl(chrome.extension.getURL("reader.html"));

	chrome.extension.onRequest.addListener(onRequest);
	chrome.pageAction.onClicked.addListener(onPageActionClicked);
	
	//checkNewVersion();
}

function checkNewVersion() {
	if (Settings.getValue("version") != appVersion) {
		Settings.setValue("version", appVersion);
		chrome.tabs.create({ url: "http://www.samabox.com/blog/2010/07/ireader-1-3-is-out/" });
	}
}


function onRequest(request, sender, sendResponse) {
	switch (request.action) {
	case "showPageAction":
		chrome.pageAction.show(sender.tab.id);
		sendResponse({ settings: Settings.getAll() });
		break;

	case "handlePageActionClicked":
		onPageActionClicked(sender.tab);
		sendResponse();
		break;

	case "newWindow":
		chrome.windows.create({ url: request.url, width: request.width, height: request.height });
		sendResponse();
		break;

	case "newTab":
		chrome.tabs.create({ url: request.url });
		sendResponse();
		break;

	case "openOptions":
		openOptions();
		sendResponse();
		break;

	case "saveSettings":
		var settings = request.settings;
		for (key in settings)
			Settings.setValue(key, settings[key]);
		
		sendResponse();
		break;

	case "shortenUrl":
		var url = encodeURIComponent(request.url);
		fetchJSON("http://ggl-shortener.appspot.com/?url=" + url, function(result) {
			if (result)
				sendResponse({ url: result.short_url });
			else
				sendResponse({});
		});
		break;

	default:
		sendResponse();
		break;
	}
}

function onPageActionClicked(tab) {
	chrome.tabs.sendRequest(tab.id, {
		action: "toggleReader",
		pageHTML: readerPageHTML,
		settings: Settings.getAll(),
		favIconUrl: tab.favIconUrl 
	});
}

function loadManifestInfo() {
	var manifest = fetchJSON(chrome.extension.getURL("manifest.json"));
	appName = manifest.name;
	appVersion = manifest.version;
}

function openOptions() {
	var url = "options.html";
	var fullUrl = chrome.extension.getURL(url);
	chrome.tabs.getAllInWindow(null, function(tabs) {
		for (var i in tabs) { // check if Options page is already open
			var tab = tabs[i];
			if (tab.url == fullUrl) {
				chrome.tabs.update(tab.id, { selected : true }); // select the tab
				return;
			}
		}
		chrome.tabs.getSelected(null, function(tab) { // open a new tab next to currently selected tab
			chrome.tabs.create({
				url : url,
				index : tab.index + 1
			});
		});
	});
}

function fetchJSON(url, callback) {
	return fetchUrl(url, callback, "JSON");
}

function fetchXML(url, callback) {
	return fetchUrl(url, callback, "XML");
}

function fetchUrl(url, callback, contentType) {
	var results = null;
	var request = new XMLHttpRequest();
	request.open("GET", url, callback != undefined);
	request.onreadystatechange = function() {
		if (this.readyState == XMLHttpRequest.DONE) {
			if (contentType == "JSON")
				results = JSON.parse(this.responseText);
			else if (contentType == "XML")
				results = this.responseXML;
			else
				results = this.responseText;

			if (callback)
				callback(results);
		}
	};
	request.send();
	return results;
}
