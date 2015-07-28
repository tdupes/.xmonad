/*/////////////////////////////////////////////////////////////////////////
//                                                                       //
//   iReader! (c) 2010 Samabox. All rights reserved.                     //
//                                                                       //
/////////////////////////////////////////////////////////////////////////*/

var Settings = {};

Settings.keyExists = function keyExists(key) {
	return (key in localStorage);
};

Settings.setValue = function setValue(key, value) {
	localStorage[key] = value;
};

Settings.getValue = function getValue(key, defaultValue) {
	if (!Settings.keyExists(key))
		return defaultValue;

	return localStorage[key];
};

Settings.setObject = function setObject(key, object) {
	localStorage[key] = JSON.stringify(object);
};

Settings.getObject = function getObject(key) {
	if (!Settings.keyExists(key))
		return undefined;

	try {
		return JSON.parse(localStorage[key]);
	} catch (ex) {
		Logger.log("Error @Settings.getObject() > " + ex.toString(), Logger.Types.error);
		return undefined;
	}
};

Settings.getAll = function getAll() {
	var settings = JSON.parse(JSON.stringify(localStorage));
	return settings;
};
