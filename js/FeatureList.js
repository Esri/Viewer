define(["dojo/Evented", "dojo/_base/declare", "dojo/_base/lang", "dojo/has", "esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/on",
    "dojo/Deferred", "dojo/promise/all", 
    "dojo/query", 
    "esri/tasks/query", "esri/tasks/QueryTask",
    "dojo/text!application/dijit/templates/FeatureList.html", 
    "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", "dojo/dom-construct", "dojo/_base/event", 
    "dojo/string", 
    "dojo/text!./FeatureListTemplate.html",
    "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/graphic",
    "esri/dijit/InfoWindow",
    "dojo/NodeList-dom", "dojo/NodeList-traverse"
    
    ], function (
        Evented, declare, lang, has, esriNS,
        _WidgetBase, _TemplatedMixin, on, 
        Deferred, all, 
        query,
        Query, QueryTask,
        FeatureList, 
        domClass, domAttr, domStyle, domConstruct, event, 
        string,
        listTemplate,
        SimpleMarkerSymbol, PictureMarkerSymbol, Graphic,
        InfoWindow
    ) {
    var Widget = declare("esri.dijit.FeatureList", [_WidgetBase, _TemplatedMixin, Evented], {
        // defaults
        templateString: FeatureList,

        options: {
            map: null,
            layers: null,
            visible: true
        },

        constructor: function (options, srcRefNode) {
            // mix in settings and defaults
            var defaults = lang.mixin({}, this.options, options);
            // widget node

            this.domNode = srcRefNode;
            // properties
            this.set("map", defaults.map);
            this.set("layers", defaults.layers);
//             this.set("theme", defaults.theme);
//             this.set("visible", defaults.visible);
            // listeners
//             this.watch("theme", this._updateThemeWatch);
//             this.watch("visible", this._visible);
//             this.watch("layers", this._refreshLayers);
//             this.watch("map", this.refresh);

            // this.markerSymbol = new SimpleMarkerSymbol({
                //   "color": [3,126,175,20],
                //   "size": 30,
                //   "xoffset": 0,
                //   "yoffset": 0,
                //   "type": "esriSMS",
                //   "style": "esriSMSCircle",
                //   "outline": {
                //     "color": [3,26,255,220],
                //     "width": 2,
                //     "type": "esriSLS",
                //     "style": "esriSLSSolid"
                //   }
                // });
            window.markerSymbol = new esri.symbol.PictureMarkerSymbol({
                "angle": 0,
                "xoffset": 0,
                "yoffset": 0,
                "type": "esriPMS",
                "url": require.toUrl("./images/ripple-dot1.gif"),
                "contentType": "image/gif",
                "width": 35,
                "height": 35
            });
            this.css = {
                container: "toc-container",
//                 layer: "toc-layer",
//                 firstLayer: "toc-first-layer",
//                 title: "toc-title",
//                 titleContainer: "toc-title-container",
//                 content: "toc-content",
//                 titleCheckbox: "checkbox",
//                 checkboxCheck: "icon-check-1",
//                 titleText: "checkbox",
//                 accountText: "toc-account",
//                 visible: "toc-visible",
//                 settingsIcon: "icon-cog",
//                 settings: "toc-settings",
//                 actions: "toc-actions",
//                 account: "toc-account",
//                 clear: "clear"
            };
        },

        startup: function () {
            // map not defined
            if (!this.map) {
                this.destroy();
                console.log("FeaturesList::map required");
            }
            // when map is loaded
            if (this.map.loaded) {
                this._init();
            } else {
                on.once(this.map, "load", lang.hitch(this, function () {
                    this._init();
                }));
            }
        },

        _init: function () {
//             this._visible();
            this._createList();
            this.set("loaded", true);
            this.emit("load", {});
        },

        _createList: function(){
            window.tasks = [];
            for(var l = 0; l<this.layers.length; l++) {
                layer = this.layers[l];
                if(layer.url && !layer.layerObject._isSnapshot)
                {
                    var _query = new Query();
                    _query.outFields = ["*"];
                    _query.returnGeometry = false;
                    _query.spatialRelationship = "esriSpatialRelIntersects";
                    window.tasks.push({
                        layer : layer.layerObject,
                        task : new QueryTask(this.map._layers[layer.id].url),
                        query : _query
                    });
                }   
            }

            window._prevSelected = null;                
            window.featureExpand = function(checkBox, restore) {
                if(_prevSelected && !restore) {
                    dojo.query('.featureItem_'+_prevSelected).forEach(function(e) {
                        dojo.removeClass(e, 'showAttr');
                        dojo.addClass(e, 'hideAttr');
                        query(e).closest('li').removeClass('borderLi');
                    });
                    dojo.query('#featureButton_'+_prevSelected).forEach(function(e) {
                        e.checked=false;
                    });
                }
                var values = checkBox.value.split(',');
                var r = window.tasks[values[0]];
                var fid = values[1];
                var layer = r.layer;
                layer._map.graphics.clear();

                if(checkBox.checked)
                {
                    _prevSelected = fid;
                    dojo.query('.featureItem_'+_prevSelected).forEach(function(e) {
                        dojo.addClass(e, 'showAttr');
                        dojo.removeClass(e, 'hideAttr');
                        query(e).closest('li').addClass('borderLi');
                    });

                    q = new Query();
                    q.where = "[FID]='"+fid+"'";
                    q.outFields = ["FID"];
                    q.returnGeometry = true;
                    r.task.execute(q).then(function(ev) {
                        //console.log(ev);
                        var graphic = new Graphic(ev.features[0].geometry, markerSymbol);
                        layer._map.graphics.add(graphic);
                    });
                    // layer.selectFeatures(q, FeatureLayer.SELECTION_NEW).then(function(f) {
                    //     f[0].symbol.size = 40;
                    // });
                } else {
                    dojo.query('.featureItem_'+_prevSelected).forEach(function(e) {
                        dojo.removeClass(e, 'showAttr');
                        dojo.addClass(e, 'hideAttr');
                        window._prevSelected = null;
                    });                        
                }
            };

            on(this.map, "extent-change", function(ext) {
                this.graphics.clear();
                // window._prevSelected = null;
                var list = query("#featuresList")[0];
                window.tasks.forEach(lang.hitch(this, function(t) {
                    t.query.geometry = ext.extent;
                    t.result = t.task.execute(t.query);
                }));
                promises = all(window.tasks.map(function(t) {return t.result;}));
                promises.then(function(results) {
                    list.innerHTML = "";
                    var preselected = null;
                    if(results) for(var i = 0; i<results.length; i++)
                    {
                        r = results[i];
                        var layer = window.tasks[i].layer;
                        //layer.clearSelection();
                        var content = '';
                        if(!layer.infoTemplate) {
                            var x = 1;
                        }
                        var fieldsMap = layer.infoTemplate._fieldsMap;
                        for(var p in layer.infoTemplate._fieldsMap) {
                            if(fieldsMap.hasOwnProperty(p) && fieldsMap[p].visible)
                            {
                                var pField = fieldsMap[p];
                                var fieldName = '${'+pField.fieldName+'}';
                                content+='<tr class="featureItem_${_featureId} hideAttr" tabindex="0">\n';
                                content+='    <td/>\n';
                                content+='    <td valign="top" align="right">'+pField.label+'</td>\n';
                                content+='    <td valign="top">:</td>\n';
                                content+='    <td valign="top">';
                                if(pField.format && pField.format.dateFormat) {
                                    content+='FORMAT_DATE('+fieldName+',"'+pField.format.dateFormat+'")';
                                }
                                else {
                                    content+=fieldName;
                                }
                                content+='</td>\n';
                                content+='</tr>\n';
                            }
                        }
                        for(var j = 0; j<r.features.length; j++) {
                            var f = r.features[j];
                            if(window._prevSelected == f.attributes[r.objectIdFieldName]) {
                                preselected = f;
                            }
                            if(f.attributes.Incident_Types && f.attributes.Incident_Types!=="") {
                                var featureListItem = this._getFeatureListItem(i, f, r.objectIdFieldName, layer, content, listTemplate);
                                if(featureListItem)
                                {
                                    domConstruct.create("li", {
                                        tabindex : 0,
                                        innerHTML : featureListItem
                                    }, list);
                                }
                            }
                        }
                    }
                    if(!preselected) {
                        window._prevSelected = null;
                    } else {
                        var checkbox = query("#featureButton_"+preselected.attributes[r.objectIdFieldName])[0];
                        checkbox.checked = true;
                        window.featureExpand(checkbox, true);
                    }
                });
            }, this);

            _getFeatureListItem = function(r, f, objectIdFieldName, layer, content, listTemplate) {
                try {
                    var featureId = f.attributes[objectIdFieldName];
                    var attributes = {_featureId:featureId, _layerId:r, _title:layer.infoTemplate.title(f), _content:content};
                    lang.mixin(attributes, f.attributes);
                    content = string.substitute(content, attributes);
                    listTemplate=string.substitute(listTemplate, attributes);
                    var result =  string.substitute(listTemplate, attributes);
                    var re = /FORMAT_(DATE|NUM)\((\d+),\"(.+)\"\)/gm;
                    do {
                        var matches = re.exec(result);
                        if(!matches) break;
                        if(matches[1]==="DATE") {
                            var date = new Date(Number(matches[2]));
                            result = result.replace(re, date.toLocaleDateString("en-US", {
                                year: "numeric", month: "long", day: "numeric"
                            }));
                        }
                    } while (true);
                    return result;
                } catch (e) {
                    console.log("Error on feature ("+featureId+")\n\t "+layer.infoTemplate.title(f)+"\n\t",e);
                    return null;
                }
            };
            
        },



//         _updateThemeWatch: function () {
//             var oldVal = arguments[1];
//             var newVal = arguments[2];
//             domClass.remove(this.domNode, oldVal);
//             domClass.add(this.domNode, newVal);
//         },

//         _visible: function () {
//             if (this.get("visible")) {
//                 domStyle.set(this.domNode, "display", "block");
//             } else {
//                 domStyle.set(this.domNode, "display", "none");
//             }
//         }
    });
    if (has("extend-esri")) {
        lang.setObject("dijit.FeaturesList", Widget, esriNS);
    }
    return Widget;
});

