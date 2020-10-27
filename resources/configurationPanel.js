{
  "displayType": "tabs",
  "configurationSettings": [{
    "category": "General",
    "fields": [{
      "type": "webmap"
    }, {
      "type": "appproxies"
    }, {
      "placeHolder": "Defaults to web map title",
      "label": "Application title",
      "fieldName": "title",
      "type": "string",
      "tooltip": "Defaults to web map title"
    }, {
      "placeHolder": "Optional subtitle text",
      "label": "Application subtitle",
      "fieldName": "subtitle",
      "type": "string",
      "tooltip": "Optional subtitle text"
    }, {
      "type": "string",
      "fieldName": "description",
      "label": "Details",
      "placeHolder": "Defaults to web map description.",
      "tooltip": "Enter content for the details panel",
      "stringFieldOption": "richtext"
    }, {
      "type": "conditional",
      "fieldName": "splashModal",
      "tooltip": "Enable Splash Screen",
      "label": "Splash Screen",
      "condition": false,
      "items": [{
        "type": "string",
        "fieldName": "splashTitle",
        "label": "Splash screen title",
        "tooltip": "Define splash screen title"
      }, {
        "type": "string",
        "fieldName": "splashContent",
        "label": "Splash screen content text",
        "tooltip": "Define splash screen content",
        "stringFieldOption": "richtext"
      }, {
        "type": "string",
        "fieldName": "splashButtonText",
        "label": "Define custom button text",
        "tooltip": "Define button text"
      }]
    }, {
      "type": "subcategory",
      "label": "Accessibility Options"
    }, {
      "type": "paragraph",
      "value": "The primary purpose of alternative map text is to be read by screen readers to allow the content and function of the map to be accessible to users with visual or certain cognitive disabilities.  For more information see this article on <a href='http://webaim.org/techniques/alttext/' target='_blank'>Alt Text</a>. "
    }, {
      "type": "string",
      "stringFieldOption": "richtext",
      "label": "Alternate Map Text",
      "tooltip": "Define text that will be read by screen reader",
      "fieldName": "altMapText"
    }]
  }, {
    "category": "Theme",
    "fields": [{
      "type": "subcategory",
      "label": "Colors"
    }, {
      "type": "color",
      "fieldName": "theme",
      "tooltip": "Header background color",
      "label": "Header color",
      "sharedThemeProperty": "header.background"
    }, {
      "type": "color",
      "fieldName": "color",
      "tooltip": "Title bar text color",
      "label": "Header text color",
      "sharedThemeProperty": "header.text"
    }, {
      "type": "color",
      "fieldName": "iconColor",
      "tooltip": "Icon color",
      "label": "Button icon color",
      "sharedThemeProperty": "button.background"
    }, {
      "type": "color",
      "fieldName": "panelBackground",
      "tooltip": "Panel body background color",
      "label": "Panel background",
      "sharedThemeProperty": "body.background"
    }, {
      "type": "color",
      "fieldName": "panelColor",
      "tooltip": "Panel body text color",
      "label": "Panel text color",
      "sharedThemeProperty": "body.text"
    }, {
      "label": "Title logo",
      "fieldName": "logo",
      "type": "string",
      "sharedThemeProperty": "logo.small",
      "tooltip": "Defaults to shared theme logo if defined in org settings."
    }, {
      "label": "Logo link",
      "fieldName": "logolink",
      "type": "string",
      "sharedThemeProperty": "logo.link",
      "tooltip": "Click through url for logo"
    }, {
      "label": "Logo alternate text",
      "fieldName": "logoAltText",
      "type": "string",
      "tooltip": "Text that indicates to screen readers where the clickable logo navigates."
    }, {
      "type": "subcategory",
      "label": "Custom Layout Options"
    }, {
      "type": "radio",
      "fieldName": "customLayout",
      "label": "Choose a layout",
      "items": [{
        "label": "Default",
        "value": "default",
        "checked": true
      }, {
        "label": "Tool sidebar",
        "value": "sidetools"
      }, {
        "label": "Menu bar",
        "value": "menubar"
      }, {
        "label": "Default with Rounded corners",
        "value": "rounded"
      }]
    }, {
      "type": "paragraph",
      "value": "Use the Custom css option to paste css that overwrites rules in the app."
    }, {
      "type": "string",
      "fieldName": "customstyle",
      "tooltip": "Custom css",
      "label": "Custom css"
    }]
  }, {
    "category": "Options",
    "fields": [{
        "type": "boolean",
        "fieldName": "popupPanel",
        "label": "Show pop-up content panel instead of pop-up window"
      }, {
        "type": "boolean",
        "fieldName": "scalebar",
        "label": "Display scalebar on map"
      }, {
        "type": "paragraph",
        "value": "Add a Locate button to the map. Note that the Locate button is only available if site is using https"
      }, {
        "type": "conditional",
        "fieldName": "locate",
        "label": "Display locate button on map",
        "tooltip": "Display locate button",
        "condition": false,
        "items": [{
          "type": "boolean",
          "fieldName": "locate_track",
          "label": "Enable tracking of users location"
        }, {
          "type": "scaleList",
          "fieldName": "locate_scale",
          "label": "Optionally set a scale level for location display"
        }]
      }, {
        "type": "subcategory",
        "label": "Toolbar Options"
      }, {
        "type": "paragraph",
        "value": "Select tools for the app toolbar. <br> <br> Note: if the web map doesn't support the enabled capability the tool will not appear."
      }, {
        "type": "boolean",
        "fieldName": "tool_basemap",
        "label": "Basemap Gallery"
      }, {
        "type": "boolean",
        "fieldName": "tool_bookmarks",
        "condition": "bookmark",
        "label": "Bookmarks"
      }, {
        "type": "boolean",
        "fieldName": "tool_legend",
        "label": "Legend"
      }, {
        "type": "boolean",
        "fieldName": "tool_details",
        "label": "Map Details"
      }, {
        "type": "boolean",
        "fieldName": "tool_measure",
        "label": "Measure Tool"
      }, {
        "type": "boolean",
        "fieldName": "tool_overview",
        "label": "Overview Map"
      }, {
        "type": "conditional",
        "condition": false,
        "fieldName": "tool_share",
        "label": "Share Tools",
        "items": [{
          "type": "boolean",
          "fieldName": "tool_share_embed",
          "label": "Add embed option to share dialog"
        }]
      }, {
        "type": "paragraph",
        "value": "The Layer List widget displays a list of layers in the map. The layers visibility can be toggled on and off. Optionally you can include sub layers a legend and opacity slider as part of the Layer List widget."
      }, {
        "type": "conditional",
        "condition": false,
        "fieldName": "tool_layers",
        "label": "Display layer list",
        "items": [{
          "type": "boolean",
          "fieldName": "tool_sublayers",
          "label": "Include sublayers in Layer List"
        }, {
          "type": "boolean",
          "fieldName": "tool_layerlegend",
          "label": "Include legend in Layer List"
        }, {
          "type": "boolean",
          "fieldName": "tool_opacity",
          "label": "Include opacity slider in Layer List"
        }]
      }, {
        "type": "paragraph",
        "value": "Display the Editor tool and optionally add a toolbar that provides additional editing capabilities including cut, merge and reshape."
      }, {
        "type": "conditional",
        "condition": false,
        "fieldName": "tool_edit",
        "label": "Display Editor",
        "items": [{
          "type": "boolean",
          "fieldName": "tool_edit_toolbar",
          "label": "Add Toolbar to Editor"
        }]
      }, {
        "type": "paragraph",
        "value": "Display the print tool and optionally display a legend on the print page and all the print layouts associated with the print service used by the template."
      }, {
        "type": "conditional",
        "condition": false,
        "fieldName": "tool_print",
        "label": "Print Tool",
        "items": [{
          "type": "boolean",
          "fieldName": "tool_print_layouts",
          "label": "Display all Layout Options"
        }, {
          "type": "paragraph",
          "value": "Specify the print format. Check your print service to see a list of valid values. The following values are valid for the default print service: PDF, PNG32, PNG8, JPG, GIF, EPS, SVG, SVGZ"
        }, {
          "placeHolder": "Default value is PDF",
          "label": "Format",
          "fieldName": "tool_print_format",
          "type": "string",
          "tooltip": "Defaults to PDF"
        }, {
          "type": "boolean",
          "fieldName": "tool_print_legend",
          "label": "Add Legend to Output"
        }]
      },
      {
        "type": "string",
        "fieldName": "activeTool",
        "tooltip": "Active Tool",
        "label": "Specify active tool at app startup",
        "options": [{
          "label": "None",
          "value": ""
        }, {
          "label": "Bookmarks",
          "value": "bookmarks"
        }, {
          "label": "Basemap",
          "value": "basemap"
        }, {
          "label": "Details",
          "value": "details"
        }, {
          "label": "Edit",
          "value": "edit"
        }, {
          "label": "Layers",
          "value": "layers"
        }, {
          "label": "Legend",
          "value": "legend"
        }, {
          "label": "Measure",
          "value": "measure"
        }, {
          "label": "Overview",
          "value": "overview"
        }, {
          "label": "Print",
          "value": "print"
        }, {
          "label": "Share",
          "value": "share"
        }]
      }, {
        "type": "boolean",
        "fieldName": "toolbarLabels",
        "label": "Add toolbar labels",
        "tooltip": "Add text next to toolbar icon"
      }
    ]
  }, {
    "category": "Search",
    "fields": [{
      "type": "subcategory",
      "label": "Search Settings"
    }, {
      "type": "paragraph",
      "value": "Enable search to allow users to find a location or data in the map. Configure the search settings to refine the experience in your app by setting the default search resource, placeholder text, etc."
    }, {
      "type": "conditional",
      "condition": false,
      "fieldName": "tool_search",
      "label": "Enable search tool",
      "items": [{
        "type": "search",
        "fieldName": "searchConfig",
        "label": "Configure Search"
      }]
    }, {
      "type": "subcategory",
      "label": "Custom URL Parameter"
    }, {
      "type": "paragraph",
      "value": "Setup the app to support a custom url parameter. For example if your map contains a feature layer with parcel information and you'd like to be able to find parcels using a url parameter you can use this section to do so. Select a layer and search field then define the name of a custom param. Once you've defined these values you can append the custom search to your application url using the custom parameter name you define. For example, if I set the custom param value to parcels a custom url would look like this index.html?appid=012121213123&fieldName="
    }, {
      "placeHolder": "i.e. parcels",
      "label": "URL param name",
      "fieldName": "customUrlParam",
      "type": "string",
      "tooltip": "Custom URL param name"
    }, {
      "type": "layerAndFieldSelector",
      "fieldName": "customUrlLayer",
      "label": "Layer to search for custom url param value",
      "tooltip": "Url param search layer",
      "fields": [{
        "multipleSelection": false,
        "fieldName": "urlField",
        "label": "URL param search field",
        "tooltip": "URL param search field"
      }],
      "layerOptions": {
        "supportedTypes": ["FeatureLayer"],
        "geometryTypes": ["esriGeometryPoint", "esriGeometryLine", "esriGeometryPolyline", "esriGeometryPolygon"]
      }
    }]
  }],
  "values": {
    "color": "#fff",
    "theme": "#105e78",
    "iconColor": "#fff",
    "activeTool": "",
    "scalebar": false,
    "splashModal": false,
    "toolbarLabels": false,
    "tool_print": true,
    "tool_print_layouts": false,
    "tool_print_legend": false,
    "tool_share": true,
    "tool_share_embed": false,
    "tool_overview": false,
    "tool_measure": false,
    "tool_details": true,
    "tool_legend": false,
    "tool_layers": true,
    "tool_sublayers": true,
    "tool_opacity": true,
    "tool_layerlegend": true,
    "locate": false,
    "locate_track": false,
    "tool_edit": false,
    "tool_edit_toolbar": false,
    "tool_bookmarks": true,
    "tool_basemap": true,
    "tool_search": true,
    "locationSearch": true,
    "popupPanel": false
  }
}
