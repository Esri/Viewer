/*global define,location */
/*jslint sloppy:true */
/*
 | Copyright 2014 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
define({
    //Default configuration settings for the application. This is where you'll define things like a bing maps key,
    //default web map, default app color theme and more. These values can be overwritten by template configuration settings and url parameters.
        "appid":  null, //
             //"0d877e183a5e4754adac1a88cd15749f",
             //"c8077b61b6f94fd29371a7cbac6923ba",
             //"5147e7fbc6394546a3b6f58f0c944cb9",
             //"f2d19e3559444846ac5839c5d83ded60", //old Incident Map
             //"440b2da51b2b42878e8cb946c2de0326", //Farmers Markets
             //"3c15248875324167b38bc1525d623ecd", // Incident Map xxx
             //"142adb5e5e1d4bddb578aefc6f6e6deb", // TH Demo
    "webmap":  "8ddeecbe106344efb9ce2bcb87537351", 
    		 //"fe35efe129f845ef8de5296c15325118", // MAtt English 
             //"326320c9eab3489d8d17bc389ce1e023",

    "oauthappid": "", //"7PTVuv3XrYx5M5l6", 
    "portalUrl": "https://www.arcgis.com",
    //Group templates must support a group url parameter. This will contain the id of the group.
    //group: "",
    //Enter the url to the proxy if needed by the application. See the 'Using the proxy page' help topic for details
    //http://developers.arcgis.com/en/javascript/jshelp/ags_proxy.html
    "proxyurl": "",
    "bingKey": "", //Enter the url to your organizations bing maps key if you want to use bing basemaps
    //Defaults to arcgis.com. Set this value to your portal or organization host name.
    "sharinghost": location.protocol + "//" + "www.arcgis.com",
    //If you need localization set the localize value to true to get the localized strings
    //from the javascript/nls/resource files.
    //Note that we've included a placeholder nls folder and a resource file with one error string
    //to show how to setup the strings file.
    "localize": true,
    "units": null,
    //Theme defines the background color of the title area and tool dialog
    //Color defines the text color for the title and details. Note that
    //both these values must be specified as hex colors.
    "theme": "#037EAF",
    "color": "#ffffff",
    "hoverColor": "#00A9E6",
    "focusColor": "#00FFC5",
    "activeColor": "#00C5FF",
    "animated_marker":true,
    "marker":"images/ripple-dot1.gif",
    "marker_size":"35",
    "alt_keys":true,

    //Specify the tool icon color for the tools on the toolbar and the menu icon.
    // Valid values are white and black.
    "icons": "white",
    "new_icons": true,
    "logo": "images/logo.png",
    //Set of tools that will be added to the toolbar
    "tools": [
        {"name": "instructions", "enabled": true},
        {"name": "details", "enabled": true},
        {"name": "overview", "enabled": true},
        {"name": "legend", "enabled": true},
        {"name": "layers", "enabled": true},
        {"name": "basemap", "enabled": true},
        {"name": "features", "enabled": true},
        {"name": "filter", "enabled": true},
        {"name": "measure", "enabled": true},
        {"name": "edit", "enabled": true, "toolbar": true}, 
        {"name": "share", "enabled": true},
        {"name": "bookmarks", "enabled": true},
        {"name": "print", "enabled": true, "legend": false, "layouts":false, "format":"pdf"}
    ],
    //Set the active tool on the toolbar. Note home and locate can't be the active tool.
    //Set to "" to display no tools at startup
    "activeTool": "instructions",
    //Add the geocoding tool next to the title bar.
    "search": true,
    "locationSearch": true,
    //When searchExtent is true the locator will prioritize results within the current map extent.
    "searchExtent": true,
    "searchLayers":[{
        "id": "Incidents",
        "fields": ["Incident Type", "Province", "Company", "Status", "Substance"]
    }],
    //Add the home extent button to the toolbar
    "home": true,
    //Add the geolocation button on the toolbar. Only displayed if browser supports geolocation
    "locate": true,
    //When true display a scalebar on the map
    "scalebar": false,
    //Specify a title for the application. If not provided the web map title is used.
    "title": "",
    "level": null,
    "center": null,
    //Replace these with your own bitly key
    "bitlyLogin": "",
    "bitlyKey": ""
});
