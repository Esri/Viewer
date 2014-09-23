{  
   "configurationSettings":[  
      {  
         "category":"<b>Configure template</b>",
         "fields":[  
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
               "label":"Title logo:",
               "fieldName":"logo",
               "type":"string",
               "tooltip":"Defaults to sample logo"
            },
            {  
               "type":"string",
               "fieldName":"description",
               "label":"Details",
               "placeHolder": "Defaults to web map description.",
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
                     "label": "None",
                     "value": ""
                  },
                  {  
                     "label":"Bookmarks",
                     "value":"bookmarks"
                  },{
                     "label": "Basemap",
                     "value": "basemap"
                  },{
                     "label": "Details",
                     "value": "details"
                  },{
                     "label": "Edit",
                     "value": "edit"
                  },
                  {  
                     "label":"Layers",
                     "value":"layers"
                  },
                  {  
                     "label":"Legend",
                     "value":"legend"
                  },{
                     "label": "Measure",
                     "value": "measure"
                  },{
                     "label": "Overview",
                     "value": "overview"
                  },{
                     "label": "Print",
                     "value": "print"
                  },{
                     "label": "Share",
                     "value": "share"
                  }
               ]
            },
            {  
               "type":"boolean",
               "fieldName":"tool_search",
               "label":"Address Finder"
            },
            {  
               "type":"boolean",
               "fieldName":"searchExtent",
               "label":"Prioritize search results in current extent."
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
      }
   ],
   "values":{  
      "icons":"white",
      "logo":"images/logo.png",
      "color":"#fff",
      "theme":"80ab00",
      "activeTool": "legend",
      "scalebar": false,
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
      "searchExtent":false
   }
}
