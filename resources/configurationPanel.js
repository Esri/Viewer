{  
   "configurationSettings":[
      {  
         "category":"<b>App Settings</b>",
         "fields":[  
            {
               "type": "appproxies"
            },
            {  
               "type":"webmap"
            },
            {  
               "placeHolder":"Defaults to web map title",
               "label":"Title:",
               "fieldName":"title",
               "type":"string",
               "tooltip":"Defaults to web map title"
            },
            {  
               "placeHolder":"Optional subtitle text",
               "label":"SubTitle:",
               "fieldName":"subtitle",
               "type":"string",
               "tooltip":"Optional subtitle text"
            },
            {  
               "label":"Title logo:",
               "fieldName":"logo",
               "type":"string",
               "tooltip":"Defaults to sample logo"
            },
            {  
               "type":"string",
               "fieldName":"description",
               "label":"Details",
               "placeHolder":"Defaults to web map description.",
               "tooltip":"Enter content for the details panel",
               "stringFieldOption":"richtext"
            },
            {  
               "type":"color",
               "fieldName":"theme",
               "tooltip":"Color theme to use",
               "label":"Color Theme:"
            },
            {  
               "type":"color",
               "fieldName":"color",
               "tooltip":"Title bar text color",
               "label":"Title Color:"
            },
            {  
               "type":"string",
               "fieldName":"icons",
               "tooltip":"Icon color",
               "label":"Icon color:",
               "options":[  
                  {  
                     "label":"White",
                     "value":"white"
                  },
                  {  
                     "label":"Black",
                     "value":"black"
                  }
               ]
            }
         ]
      },
      {  
         "category":"Tools",
         "fields":[  
            {  
               "type":"string",
               "fieldName":"activeTool",
               "tooltip":"Active Tool",
               "label":"Active Tool:",
               "options":[  
                  {  
                     "label":"None",
                     "value":""
                  },
                  {  
                     "label":"Bookmarks",
                     "value":"bookmarks"
                  },
                  {  
                     "label":"Basemap",
                     "value":"basemap"
                  },
                  {  
                     "label":"Details",
                     "value":"details"
                  },
                  {  
                     "label":"Edit",
                     "value":"edit"
                  },
                  {  
                     "label":"Layers",
                     "value":"layers"
                  },
                  {  
                     "label":"Legend",
                     "value":"legend"
                  },
                  {  
                     "label":"Measure",
                     "value":"measure"
                  },
                  {  
                     "label":"Overview",
                     "value":"overview"
                  },
                  {  
                     "label":"Print",
                     "value":"print"
                  },
                  {  
                     "label":"Share",
                     "value":"share"
                  }
               ]
            },
            {  
               "type":"boolean",
               "fieldName":"tool_basemap",
               "label":"Basemap Gallery"
            },
            {  
               "type":"boolean",
               "fieldName":"tool_bookmarks",
               "label":"Bookmarks"
            },
            {  
               "type":"boolean",
               "fieldName":"tool_locate",
               "label":"Find Location"
            },
            {  
               "type":"boolean",
               "fieldName":"tool_home",
               "label":"Home Extent Button"
            },
            {  
               "type":"boolean",
               "fieldName":"scalebar",
               "label":"Scalebar"
            },
            {  
               "type":"boolean",
               "fieldName":"tool_layers",
               "label":"Layer List"
            },
            {  
               "type":"boolean",
               "fieldName":"tool_legend",
               "label":"Legend"
            },
            {  
               "type":"boolean",
               "fieldName":"tool_details",
               "label":"Map Details"
            },
            {  
               "type":"boolean",
               "fieldName":"tool_measure",
               "label":"Measure Tool"
            },
            {  
               "type":"boolean",
               "fieldName":"tool_overview",
               "label":"Overview Map"
            },
            {  
               "type":"boolean",
               "fieldName":"tool_share",
               "label":"Share Tools"
            }
         ]
      },{
         "category": "Search Settings",
         "fields": [
            {
               "type":"paragraph",
               "value": "Enable search to allow users to find a location or data in the map. Configure the search settings to refine the experience in your app by setting the default search resource, placeholder text, etc."
            },
            {  
               "type":"boolean",
               "fieldName":"tool_search",
               "label":"Enable search tool"
            },{
               "type":"search",
               "fieldName": "searchConfig",
               "label": "Configure Search"
            }
         ]
      },
      {  
         "category":"Editor Settings",
         "fields":[  
            {  
               "type":"paragraph",
               "value":"Display the Editor tool and optionally display the Editor toolbar that provides additional editing options."
            },
            {  
               "type":"boolean",
               "fieldName":"tool_edit",
               "label":"Editor"
            },
            {  
               "type":"boolean",
               "fieldName":"tool_edit_toolbar",
               "label":"Display Editor Toolbar"
            }
         ]
      },
      {  
         "category":"Print Settings",
         "fields":[  
            {  
               "type":"paragraph",
               "value":"Display the print tool and optionally display a legend on the print page and all the print layouts associated with the print service used by the template."
            },
            {  
               "type":"boolean",
               "fieldName":"tool_print",
               "label":"Print Tool"
            },
            {  
               "type":"boolean",
               "fieldName":"tool_print_layouts",
               "label":"Display all Layout Options"
            },
            {  
               "type":"paragraph",
               "value":"Specify the print format. Check your print service to see a list of valid values. The following values are valid for the default print service: PDF, PNG32, PNG8, JPG, GIF, EPS, SVG, SVGZ"
            },
            {  
               "placeHolder":"Default value is PDF",
               "label":"Format:",
               "fieldName":"tool_print_format",
               "type":"string",
               "tooltip":"Defaults to PDF"
            },
            {  
               "type":"boolean",
               "fieldName":"tool_print_legend",
               "label":"Add Legend to Output"
            }
         ]
      },{
         "category": "Custom URL Parameter",
         "fields": [
            {
               "type": "paragraph",
               "value": "Setup the app to support a custom url parameter. For example if your map contains a feature layer with parcel information and you'd like to be able to find parcels using a url parameter you can use this section to do so. Select a layer and search field then define the name of a custom param. Once you've defined these values you can append the custom search to your application url using the custom parameter name you define. For example, if I set the custom param value to parcels a custom url would look like this index.html?parcel=3045"
            },{
               "placeHolder":"i.e. parcels",
               "label":"URL param name:",
               "fieldName":"customUrlParam",
               "type":"string",
               "tooltip":"Custom URL param name"
            },{  
               "type":"layerAndFieldSelector",
               "fieldName":"customUrlLayer",
               "label":"Layer to search for custom url param value",
               "tooltip":"Url param search layer",
               "fields":[  
                  {  
                     "multipleSelection":false,
                     "fieldName":"urlField",
                     "label":"URL param search field",
                     "tooltip":"URL param search field"
                  }
               ],
               "layerOptions":{  
                  "supportedTypes":[  
                     "FeatureLayer"
                  ],
                  "geometryTypes":[  
                     "esriGeometryPoint",
                     "esriGeometryLine",
                     "esriGeometryPolygon"
                  ]
               }
            }

         ]
      }
   ],
   "values":{  
      "icons":"white",
      "logo":"images/logo.png",
      "color":"#fff",
      "theme":"80ab00",
      "activeTool":"legend",
      "scalebar":false,
      "tool_print":true,
      "tool_print_layouts":false,
      "tool_print_legend":false,
      "tool_share":true,
      "tool_overview":true,
      "tool_measure":true,
      "tool_details":true,
      "tool_legend":true,
      "tool_layers":true,
      "tool_home":true,
      "tool_locate":true,
      "tool_edit":true,
      "tool_edit_toolbar":false,
      "tool_bookmarks":true,
      "tool_basemap":true,
      "tool_search":true,
      "locationSearch": true
   }
}
