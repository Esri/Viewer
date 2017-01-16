{  
   "configurationSettings":[ 
      {  
         "category":"<strong>Configure template</strong>",
         "fields":[  
            {  "type":"webmap"},
            
            {  "type":"string",
               "stringFieldOption": "richtext",
               "label": "<strong>Alternate Map Text</strong>",
               "tooltip": "Define text that will be read by screen reader",
               "fieldName":"altMapText"
            },
            {  "type": "paragraph",
               "value": "The primary purpose of alternative map text is to be read by screen readers to allow the content and function of the map to be accessible to users with visual or certain cognitive disabilities."
            },

            {  "label":"<strong>Description</strong>",
               "type":"string",
               "fieldName":"description",
               "placeHolder":"Defaults to web map description.",
               "stringFieldOption":"richtext"},
            {  "type": "paragraph",
               "value": "When present, this markup will replace the map description in the Details panel."
            },   
            {  "label":"<strong>Title:</strong>",
               "placeHolder":"Defaults to web map title",
               "fieldName":"title",
               "type":"string",
               "tooltip":"Defaults to web map title" },
            {  "label":"<strong>Logo Image:</strong>",
               "fieldName":"logo",
               "type":"string",
               "tooltip":"Defaults to sample logo"},
            {  "label":"<strong>Logo Alternate Text:</strong>",
               "fieldName":"logoAltText",
               "type":"string",
               "tooltip":"Type here the text from the Logo Image"},
            {  "label":"<strong>Animated Marker</strong>",
               "type":"boolean",
               "fieldName":"animated_marker"},
            {  "label":"<strong>Animated Marker File:</strong>",
               "fieldName":"marker",
               "type":"string",
               "tooltip":"Defaults to blue-animated"},
            {  "label":"<strong>Marker size:</strong>",
               "fieldName":"marker_size",
               "type":"int",
               "tooltip":"Size of the Marker"},
            
            {  "label":"<strong>Access Keys</strong>",
               "fieldName":"alt_keys",
               "type":"boolean",
               "tooltip":"Show hints for alternate keys when pressing ALT key."},
            {  "type": "paragraph",
               "value": "The Access Key is a shortcut to activate or focus a screen control. <br/>The way of accessing the shortcut key is varying in different browsers.<br/>Most browsers use the [Alt]+# or [Alt][Shift]+#.<br/>However the shortcut can be set to another combination of keys."
            },

            
            {  "label":"<strong>New Icons</strong>",
               "type":"boolean",
               "fieldName":"new_icons"}
         ]
      },
      {  
         "category":"<strong>Colors</strong>",
         "fields":[  
            {  "label":"Theme Color:",
               "type":"color",
               "fieldName":"theme",
               "tooltip":"Title bar color"},
            {  "label":"Title Color:",
               "type":"color",
               "fieldName":"color",
               "tooltip":"Title bar text color"},
            {  "label":"Hover Color:",
               "type":"color",
               "fieldName":"hoverColor",
               "tooltip":"Hover over color"},
            {  "label":"Focus Color:",
               "type":"color",
               "fieldName":"focusColor",
               "tooltip":"Focus border color"},
            {  "label":"Active Color:",
               "type":"color",
               "fieldName":"activeColor",
               "tooltip":"Selection color"},
            {  "label":"Icon color:",
               "type":"string",
               "fieldName":"icons",
               "tooltip":"Icon color",
               "options":[  
                  {  
                     "label":"White",
                     "value":"white"
                  },
                  {  
                     "label":"Black",
                     "value":"black"
                  }
               ]}
         ]
      },
      {  
         "category":"Tools",
         "fields":[  
            {  "label":"Active Tool:",
               "type":"string",
               "fieldName":"activeTool",
               "tooltip":"Active Tool",
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
                     "label":"Instructions",
                     "value":"instructions"
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
                     "label":"Features",
                     "value":"features"
                  },
                  {  
                     "label":"Filters",
                     "value":"filter"
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
               ]},
            
            {  "label":"Details",
               "type":"boolean",
               "fieldName":"tool_details"},
            {  "label":"Instructions",
               "type":"boolean",
               "fieldName":"tool_instructions"},
            {  "label":"Overview Map",
               "type":"boolean",
               "fieldName":"tool_overview"},
            {  "label":"Basemap Gallery",
               "type":"boolean",
               "fieldName":"tool_basemap"},
            {  "label":"Bookmarks",
               "type":"boolean",
               "fieldName":"tool_bookmarks"},
            {  "label":"Find Location",
               "type":"boolean",
               "fieldName":"tool_locate"},
            {  "label":"Home Button",
               "type":"boolean",
               "tooltip":"(Default Extent)",
               "fieldName":"tool_home"},
            {  "label":"Legend",
               "type":"boolean",
               "fieldName":"tool_legend"},
            {  "label":"Layers",
               "type":"boolean",
               "fieldName":"tool_layers"},
            {  "label":"Feature List",
               "type":"boolean",
               "fieldName":"tool_features"},
            {  "label":"Filters",
               "type":"boolean",
               "fieldName":"tool_filter"},
            {  "label":"Measure Tool",
               "type":"boolean",
               "fieldName":"tool_measure"},
            {  "label":"Share Tools",
               "type":"boolean",
               "fieldName":"tool_share"},
            {  "label":"Print Button",
               "type":"boolean",
               "fieldName":"tool_print"},
            {  "label":"Scalebar",
               "type":"boolean",
               "fieldName":"scalebar"},
            {  "label":"Extended Navigation Tool Bar",
               "type":"boolean",
               "fieldName":"navigation"}
         ]
      },
      {
         "category": "Search Settings",
         "fields": [
            {
               "type": "paragraph",
               "value": "Enable/disable the search tool and optionally select layers (and fields) to add to the search tool."
            },
            {  
               "label":"Select search layers and fields",
               "fieldName":"searchLayers",
               "type":"multilayerandfieldselector",
               "tooltip":"Select layer and fields to search",
               "layerOptions":{  
                  "supportedTypes":[  
                     "FeatureLayer"
                  ],
                  "geometryTypes":[  
                     "esriGeometryPoint",
                     "esriGeometryLine",
                     "esriGeometryPolyline",
                     "esriGeometryPolygon"
                  ]
               },
               "fieldOptions":{  
                  "supportedTypes":[  
                     "esriFieldTypeString"
                  ]
               }
            },{  
               "type":"boolean",
               "fieldName":"tool_search",
               "label":"Address Finder"
            },
            {  
               "type":"boolean",
               "fieldName":"searchExtent",
               "label":"Prioritize search results in current extent."
            },{
               "type":"paragraph",
               "value": "When Location Search is true the search widget will allow users to search for addresses and locations using one or more locators and also search the layers and fields specified in the Search Layers configuration option. Unchecking the Location Search option will remove the locator search and only configured search layers will be displayed."
            },{
               "type": "boolean",
               "fieldName": "locationSearch",
               "label": "Location Search"
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
      },
      {
         "category":"Languages",
         "fields":[
            {  
               "type":"paragraph",
               "value":"<strong>Language 1</strong>"
            },

            {  "label": "Language code",
               "fieldName":"lang1code",
               "type":"string"
            },
            {  "type":"paragraph",
               "value":"Enter the locale of the language. Example: 'en-us'"
            },
            {  "label": "Language Short Name",
               "fieldName":"lang1shortName",
               "type":"string"
            },
            {  "type": "paragraph",
               "value":"The name that will appear on the Language widget as active language.<br/>Note: Leave it blang to display no code."
            },
            {  "label": "Flag Image",
               "fieldName":"lang1imageSrc",
               "type":"string"
            },
            {  "type": "paragraph",
               "value":"The location of the image representing the flag of the country.<br/>Note: Leave it blang to display no image."
            },
            {  "label": "Language name",
               "fieldName":"lang1name",
               "type":"string"
            },
            {  "type":"paragraph",
               "value":"The name that will appear in the combo-box pull-down.<br/>Note: may contain an image."
            },
            {  "label": "Application Id",
               "fieldName":"lang1appId",
               "type":"string"
            },
            {  "type":"paragraph",
               "value":"ID of application that will restart for this language.<br/>Note: you may want another application to customize layers, data and other custom attributes.<br/>Leave blank to use same application."
            },

            {  "type":"paragraph",
               "value":"<strong>Language 2</strong>"

            },
            {  "label": "Language code",
               "fieldName":"lang2code",
               "type":"string",
               "tooltip": "The locale of language 2."
            },
            {  "label": "Language Short Name",
               "fieldName":"lang2shortName",
               "type":"string",
               "tooltip": "The name that will appear on the Language widget."
            },
            {  "label": "Flag Image",
               "fieldName":"lang2imageSrc",
               "type":"string",
               "tooltip": "The location of a 22x22 image."
            },
            {  "label": "Language name",
               "fieldName":"lang2name",
               "type":"string",
               "tooltip": "The name that will appear in the combo-box pull-down."
            },
            {  "label": "Application Id",
               "fieldName":"lang2appId",
               "type":"string",
               "tooltip": "Application ID for language 2."
            },

            {  "type":"paragraph",
               "value":"<strong>Language 3</strong>"
            },
            {  "label": "Language code",
               "fieldName":"lang3code",
               "type":"string",
               "tooltip": "The locale of language 3."
            },
            {  "label": "Language Short Name",
               "fieldName":"lang3shortName",
               "type":"string",
               "tooltip": "The name that will appear on the Language widget."
            },
            {  "label": "Flag Image",
               "fieldName":"lang3imageSrc",
               "type":"string",
               "tooltip": "The location of a 22x22 image."
            },
            {  "label": "Language name",
               "fieldName":"lang3name",
               "type":"string",
               "tooltip": "The name that will appear in the combo-box pull-down."
            },
            {  "label": "Application Id",
               "fieldName":"lang2appId",
               "type":"string",
               "tooltip": "Application ID for language 3."
            }
          ]
      }
   ],
   "values":{  
      "icons":"white",
      "new_icons":false,
      "animated_marker":true,
      "marker":"images/ripple-dot1.gif",
      "marker_size":"35",
      "alt_keys":true,
      "logo":"images/logo.png",
      "logoAltText":"",

      "color":"#ffffff",
      "hoverColor":"#00A9E6",
      "focusColor":"#FF7700",
      "activeColor":"#00b9f6",
      "theme":"#005ce6",

      "activeTool":"details",
      "scalebar":false,
      "navigation":false,
      "tool_print_layouts":false,
      "tool_print_legend":false,
      "tool_share":true,
      "tool_overview":true,
      "tool_measure":true,
      "tool_details":true,
      "tool_instructions":true,
      "tool_filter":true,
      "tool_legend":true,
      "tool_layers":true,
      "tool_home":true,
      "tool_locate":true,
      "tool_edit":true,
      "tool_edit_toolbar":false,
      "tool_bookmarks":true,
      "tool_basemap":true,
      "tool_search":true,
      "tool_print":true,
      "locationSearch": true,
      "searchExtent":false,

      "lang1shortName": "EN",
      "lang1name": "English",
      "lang1code": "EN-US",
      "lang1imageSrc": "images/flag.us.22.png",

      "lang2shortName": "FR",
      "lang2name": "French",
      "lang2code": "FR-CA",
      "lang2imageSrc": "images/flag.fr.22.png",

      "lang3shortName": "",
      "lang3name": "",
      "lang3code": ""
   }
}
