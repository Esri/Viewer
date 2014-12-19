**Update to Esri/Viewer in this fork**:

This fork allows the implementer to define a webmap locally, rather than have the template retrieve the webmap definition from ArcGIS.com.

With this fork, if an "itemInfo" property is present in the default.js (as discussed below), then that web map will be loaded. If the itemInfo property is not present, then the standard functionality of the template will apply (i.e. the webmap id included in default.js or in the URL query string will be retrieved from ArcGIS.com).

* To define locally
Create an "itemInfo" property in the defaults.js file as shown in [this commit](https://github.com/jsomerville/Viewer/commit/476da3aaade082109c87496233f324d5acbef72f).

  * See the help page section
[Create a map using json](https://developers.arcgis.com/javascript/jshelp/intro_webmap.html) for more information on how to construct a webmap JSON object.

  * Another option
for creating the webmap JSON object's "itemData" property (which defines the map's layers, popups, etc.) is to create a web map in the ArcGIS.com viewer, and then retrieve and copy the JSON object into the "itemData" sub-property of the default.js file.

      * Steps:
    
      1. Construct and Save a webmap in ArcGIS.com viewer. Also, share as Public (at least temporarily) if you do not want to worry about a token for the steps below.
      1. Get the webmap's unique id from the URL in the browser: http://`<your org>`.maps.arcgis.com/home/webmap/viewer.html?webmap=`<webmap id>`.
      1. Obtain the JSON object by entering the following in a browser: "http://`<your org>`.maps.arcgis.com/sharing/rest/content/items/`<webmap id>`/data?f=pjson
        1. Note: you can also retrieve the JSON object or URL by opening the dev tools for your browser and finding the Network request that retrieved the webmap's itemData object.
        1. Also, if you did not share the webmap as Public, then this step will reject your request if you do not have a token parameter in the URL's query string.

      1. Enter this JSON object in the default.js file's `itemInfo.itemData` property- as shown in the commit linked above.
      1. The object can be edited as needed in the default.js file, and the webmap can be deleted on ArcGIS Online.



basic-viewer-template
=====================
*Basic Viewer*  is a configurable application template used to display a web map with a specified set of commonly used tools and options.

![Screen Shot](https://dl.dropboxusercontent.com/u/24627279/screenshots/Viewer_screenshot.png)

[View it live] (http://www.arcgis.com/apps/Viewer/index.html?webmap=f5b13dbed07c46cdb783cf361833aa6b)

#Features
The template can be configured using the following options:

- **Map:** Choose the web map used in your application.
- **Color Scheme:** Choose a color scheme for the application.
- **Show Title:** Choose whether to include an application title. 
- **Title Text:** The application title. The default title is the web map name.
- **Logo:** Choose a custom logo for your application.
- **Overview Map:** Display a retractable overview map to add context for panning and zooming.
- **Legend:** Display a legend for map layers. *
- **Details:** Display the web map item description. *
- **Editor:** Allows users to interactively create, modify, or delete features in editable layers. *
- **Print:** Enables printing the map at the current extent. It can be configured to include a legend and supports different layout options.
- **Layer List:** Enables toggling the visibility of operational layers within the web map. *
- **Basemaps:** Enables the display of the basemap gallery. 
- **Bookmarks:** Enables the use of web map bookmarks for navigation. *
- **Measure:** Enables measure tool for interactive area, length, and point measurement.
- **Share:** Allows users to share the application with others via email, Twitter, or Facebook.
- **Search:** Displays the Search box to enable navigation to addresses and places. 


*These options will appear in the application when the web map has properties or layers that support them.



#Instructions

1. Download and unzip the .zip file or clone the repo.
2. Web-enable the directory. 
3. Access the .html page in a browser

Note: If your application edits features in a feature service, contains secure services or web maps that aren't shared publicly or generates requests that exceed 200 characters you may need to setup and use a proxy page. Common situations where you may exceed the URL length are using complex polygons as input to a task or specifying a spatial reference using well-known text (WKT). For details on installing and configuring a proxy page see [Using a proxy page](https://developers.arcgis.com/javascript/jshelp/ags_proxy.html).

For addtional customization options view the [wiki](https://github.com/Esri/basic-viewer-template/wiki). 

#Requirements

- Notepad or HTML editor
- Some background with HTML, CSS and JavaScript
- Experience with the ArcGIS API for JavaScript is helpful. 

#Resources

- [ArcGIS API for JavaScript Resource Center](http://help.arcgis.com/en/webapi/javascript/arcgis/index.html)

#Issues
Found a bug or want to request a new feature? Please let us know by submitting an issue. 

#Contributing
Anyone and everyone is welcome to contribute. 

#Licensing 

Copyright 2012 Esri

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

A copy of the license is available in the repository's license.txt file.
[](Esri Tags: ArcGIS Online Web Application Templates) 
[](Esri Language: JavaScript)
