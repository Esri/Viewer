## Load a webmap configuration from a local definition

Use [this fork](https://github.com/jsomerville/Viewer) for enabling the implementer to define a webmap locally, rather than have the template retrieve the webmap definition from ArcGIS.com.

In the version, if the "itemInfo" property is present in the default.js (as discussed below), then that web map will be loaded. If the itemInfo property is not present, then the standard functionality of the template will apply (i.e. the webmap id included in default.js or in the URL query string will be retrieved from ArcGIS.com).

## To define locally
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
      1. If you did not share the webmap as Public, then this step will reject your request if you do not have a token parameter in the URL's query string.

    1. Enter this JSON object in the default.js file's `itemInfo.itemData` property- as shown in the commit linked above.
    1. The JSON object can be edited as needed in the default.js file, and the webmap can be deleted on ArcGIS Online.