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
  "appid": "", //"73909e939be34d2b931f0765ba3bf4a6",
  "webmap": "14ab61d83557477daac4e36fae8c992e",
  "oauthappid": "arcgisWebApps", //"AFTKRmv16wj14N3z",
  //Group templates must support a group url parameter. This will contain the id of the group.
  //group: "",
  //Enter the url to the proxy if needed by the application. See the 'Using the proxy page' help topic for details
  //http://developers.arcgis.com/en/javascript/jshelp/ags_proxy.html
  "proxyurl": "",
  "bingKey": "", //Enter the url to your organizations bing maps key if you want to use bing basemaps
  //Defaults to arcgis.com. Set this value to your portal or organization host name.
  "sharinghost": "www.arcgis.com",
  // Define alt text for the map that can be read by screen readers
  "altMapText": null, // by default we'll read the web map snippet
  // Set splashModal to display a splash screen when the app loads
  // Define the splash content using splashTitle and splashContent.
  // Add labels to the toolbar buttons
  "toolbarLabels": false,
  "splashModal": false,
  "splashTitle": null,
  "splashContent": null,
  "splashButtonText": null,
  "find": null,
  "localize": true,
  "units": null,
  // This is an option added so that developers working with the
  // hosted version of the application can apply custom styles
  // not used in the download version.
  "customstyle": null, //'#mapDiv { background-color: #cfdfec; } .arcgisSearch .searchGroup .searchInput { border: 0px solid #BDBDBD; background-color: #fff!important; height: 27px; font-size: 16px; color: #333; } .esriIconZoom:before { color: white; } .arcgisSearch .searchBtn { border: 0px solid #57585A; rgba(0, 0, 0, 0.41); } #mapDiv_graphics_layer path { stroke: rgba(221, 0, 32, 1); stroke-width: 4px; opacity: 0.01; } .icon-menu:before { opacity: 0.01; } input#search_input:focus { outline: none; } .arcgisSearch .searchMenu { border: 0px solid #57585A; } .esriIconClose:before { color: white; } #panelLogo img { max-width: 80px; max-height: 68px; } #panelLogo { width: 81px; padding-top: 3px; } .titleButton.maximize:before { visibility: hidden!important; } .pageHeaderImg { display: none; } .pageTitle { display: none; } .arcgisSearch .hasMultipleSources .searchToggle { display: none!important; } #search_input::-webkit-input-placeholder { color: #3B3C3D; } #search_input::-moz-placeholder { color: #3B3C3D; } #search_input:-ms-input-placeholder { color: #3B3C3D; } #panelTop { height: 79px!important; } #search > div > div.searchBtn.searchSubmit { height: 27px; } .arcgisSearch .searchIcon { line-height: 29px; } #panelSearch { margin: 10px 10px 10px 20px!important; } .esriIconClose:before { color: rgb(134, 134, 134); padding-right: 7px; } #panelTitle { border-bottom: none; } .no-search #panelLogo { width: 87px; padding-right: 19px; } .no-search #panelLogo img { max-width: 86px !important; } #panelText { max-width: 500px; }',
  //Theme defines the background color of the title area and tool dialog
  //Color defines the text color for the title and details. Note that
  //both these values must be specified as hex colors.
  "customLayout": "default", // default, sidetools, menubar, rounded
  "theme": "#105e78",
  "color": "#fff",
  "iconColor": "#fff",
  "panelBackground": "#fff",
  "panelColor": "#000",
  "logo": null,
  "logolink": null,
  "logoAltText": null,
  //Set of tools that will be added to the toolbar
  "tools": [{
    "name": "legend",
    "enabled": false
  }, {
    "name": "bookmarks",
    "enabled": true
  }, {
    "name": "layers",
    "enabled": true,
    "sublayers": true,
    "legend": true,
    "opacityslider": true
  }, {
    "name": "basemap",
    "enabled": true
  }, {
    "name": "overview", // wcag - can't interact with map
    "enabled": false
  }, {
    "name": "measure",
    "enabled": false
  }, {
    "name": "edit", // wcag - no keyboard map access
    "enabled": false,
    "toolbar": false
  }, {
    "name": "print",
    "enabled": true,
    "legend": false,
    "layouts": false,
    "format": "pdf"
  }, {
    "name": "details",
    "enabled": true
  }, {
    "name": "share",
    "enabled": true,
    "embed": false
  }],
  //Set the active tool on the toolbar.
  //Set to "" to display no tools at startup
  "activeTool": null,
  //Add the geocoding tool next to the title bar.
  "search": true,
  "locationSearch": true,
  "popupPanel": false,
  //When searchExtent is true the locator will prioritize results within the current map extent.
  "searchExtent": false,
  "searchLayers": [{
    "id": "",
    "fields": []
  }],
  //Setup the app to support a custom url parameter. Use this if you want users
  //to be able to search for a string field in a layer. For example if the web map
  //has parcel data and you'd like to be able to zoom to a feature using its parcel id
  //you could add a custom url param named parcel then users could enter
  //a value for that param in the url. index.html?parcel=3203
  "customUrlLayer": {
    "id": null, //id of the search layer as defined in the web map
    "fields": [] //Name of the string field to search
  },
  "customUrlParam": null, //Name of url param. For example parcels
  // when false hide the zoom (and home) buttons
  "showSlider": true,
  //Add the geolocation button on the toolbar. Only displayed if browser supports geolocation
  "locate": false,
  "locate_track": false,
  "locate_scale": null,

  //When true display a scalebar on the map
  "scalebar": false,
  //Specify a title for the application. If not provided the web map title is used.
  "title": "",
  //Optionally specify some sub title text.
  "subtitle": null,
  "level": null,
  "center": null,
  "markerSymbol": "./images/EsriBluePinCircle26.png",
  "markerSymbolWidth": 26,
  "markerSymbolHeight": 26
});
