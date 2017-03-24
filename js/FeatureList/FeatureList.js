define(["dojo/Evented", "dojo/_base/declare", "dojo/_base/lang", "dojo/has", "esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/on", 
    "dojo/Deferred", "dojo/promise/all", "dojo/query", 
    "esri/tasks/query", "esri/tasks/QueryTask",
    "dojo/text!application/FeatureList/templates/FeatureList.html", 
    "dojo/dom", "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", "dojo/dom-construct", "dojo/_base/event", 
    "dojo/string", 
    "dojo/text!application/FeatureList/templates/FeatureListTemplate.html",
    "dojo/i18n!application/nls/FeatureList",
    "dojo/i18n!application/nls/resources",
    "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", 
    "esri/symbols/CartographicLineSymbol", 
    "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol",
    "esri/graphic", "esri/Color", 
    "dojo/NodeList-dom", "dojo/NodeList-traverse"
    
    ], function (
        Evented, declare, lang, has, esriNS,
        _WidgetBase, _TemplatedMixin, on, 
        Deferred, all, query,
        Query, QueryTask,
        FeatureList, 
        dom, domClass, domAttr, domStyle, domConstruct, event, 
        string,
        listTemplate, i18n, Ri18n,
        SimpleMarkerSymbol, PictureMarkerSymbol, 
        CartographicLineSymbol, 
        SimpleFillSymbol, SimpleLineSymbol,
        Graphic, Color
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
            var defaults = lang.mixin({}, this.options, options);
            this.domNode = srcRefNode;

            dojo.create("link", {
                href : "js/FeatureList/Templates/FeatureList.css",
                type : "text/css",
                rel : "stylesheet",
            }, document.head);

            // properties
            this.set("map", defaults.map);
            var Layers = this._getLayers(defaults.layers);
            this.set("Layers", Layers);

            window._this = this;

            if(options.animatedMarker) {
                window.markerSymbol = new esri.symbol.PictureMarkerSymbol({
                    "angle": 0,
                    "xoffset": 0,
                    "yoffset": 0,
                    "type": "esriPMS",
                    "url": require.toUrl("./"+options.markerImage),
                    "contentType": "image/gif",
                    "width": options.markerSize,
                    "height": options.markerSize
                });
            } else {
                window.markerSymbol = new SimpleMarkerSymbol({
                      "color": [3,126,175,20],
                      "size": options.markerSize,
                      "xoffset": 0,
                      "yoffset": 0,
                      "type": "esriSMS",
                      "style": "esriSMSCircle",
                      "outline": {
                        "color": [3,26,255,220],
                        "width": 2,
                        "type": "esriSLS",
                        "style": "esriSLSSolid"
                      }
                    });
            }
            this.css = {
            };
        },

        _getLayers : function(layers) {
            var l1 = layers.filter(function (l) { return l.hasOwnProperty("url");}); //l => l.hasOwnProperty("url"));
            var l2 = layers.filter(function (l) { return !l.hasOwnProperty("url");}); //l => !l.hasOwnProperty("url"));
            if(l2.length>0) {
                console.info("Feature List - These Layers are not services: ", l2);
            }
            return l1;
        },

        startup: function () {
            if (!this.map) {
                this.destroy();
                console.log("FeaturesList::map required");
            }
            if (this.map.loaded) {
                this._init();
            } else {
                on.once(this.map, "load", lang.hitch(this, function () {
                    this._init();
                }));
            }
        },

        _init: function () {
            this._createList();
            this.set("loaded", true);
            this.emit("load", {});

            on(this.toolbar, 'updateTool_features', lang.hitch(this, function(name) {
                this._reloadList(this.map);
                dom.byId('pageBody_features').focus();
            }));
        },

        FocusDetails: function() {
            if(!this._isVisible()) return;
            
            var details = this.domNode.querySelector('.showAttr');
            if(details) {
                var page = query(details).closest('.borderLi')[0];
                page.querySelector('.checkbox').focus();
            }
        },

        _isVisible : function() {
            var page = query(this.domNode).closest('.page')[0];
            return dojo.hasClass(page, "showAttr");
        },

        __reloadList : function(ext) {
            var deferred = new Deferred();

            var list = query("#featuresList")[0];
            this.map.graphics.clear();
            window.tasks.filter(function(t) { return t.layer.visible && t.layer.visibleAtMapScale;}).forEach(lang.hitch(this.map, function(t) {
                t.query.geometry = ext.extent;
                var exp=t.layer.getDefinitionExpression();
                t.query.where = exp;
                t.result = t.task.execute(t.query);
            }));
            promises = all(window.tasks.map(function(t) {return t.result;}));
            promises.then(
                function(results) {
                    list.innerHTML = "";
                    var preselected = null;
                    if(results) for(var i = 0; i<results.length; i++)
                    {
                        var layer = window.tasks[i].layer;
                        if(layer.visible && layer.visibleAtMapScale && layer.infoTemplate) {
                            r = results[i];
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
                                    var fieldValue = fieldName;
                                    if(pField.format)
                                    { 
                                        if(pField.format.dateFormat) {
                                            fieldValue='FORMAT_DATE('+fieldName+',"'+pField.format.dateFormat+'")';
                                        }
                                        else if(pField.format.time) {
                                            fieldValue='FORMAT_TIME('+fieldName+',"'+pField.format.time+'")';
                                        }
                                        else if(pField.format.hasOwnProperty("digitSeparator")) {
                                            fieldValue='FORMAT_NUM('+fieldName+',"'+pField.format.places+'|'+pField.format.digitSeparator+'")';
                                        }
                                        else {
                                            fieldValue=fieldName;
                                        }
                                    }

                                    content+='<tr class="featureItem_${_layerId}_${_featureId} hideAttr" tabindex="0" aria-label="'+pField.label+', '+fieldValue+',"">\n';
                                    content+='    <td valign="top"></td>\n';
                                    content+='    <td valign="top" align="right">'+pField.label+'</td>\n';
                                    content+='    <td valign="top">:</td>\n';
                                    content+='    <td valign="top">'+fieldValue+'</td>\n';
                                    content+='</tr>\n';
                                }
                            }
                            for(var j = 0; j<r.features.length; j++) {
                                var f = r.features[j];
                                if(window._prevSelected && window._prevSelected.split('_')[1] == f.attributes[r.objectIdFieldName]) {
                                    preselected = f;
                                }

                                var featureListItem = this._getFeatureListItem(i, f, r.objectIdFieldName, layer, content, listTemplate);
                                if(featureListItem)
                                {
                                    domConstruct.create("li", {
                                        // tabindex : 0,
                                        innerHTML : featureListItem
                                    }, list);
                                }
                            }
                        }
                    }
                    if(!preselected) {
                        window._prevSelected = null;
                    } else {
                        var checkbox = query("#featureButton_"+window._prevSelected)[0];
                        checkbox.checked = true;
                        window.featureExpand(checkbox, true);
                        checkbox.focus();
                    }
                deferred.resolve(true);
                }
            );
            return deferred.promise; 
        },

        _reloadList : function(ext) {
            if(!this._isVisible()) return;
            var loading_features = this.domNode.parentNode.parentNode.querySelector('#loading_features');

            domClass.replace(loading_features, "showLoading", "hideLoading");

            this.__reloadList(ext).then(function(results) {
                domClass.replace(loading_features, "hideLoading", "showLoading");
            });
        },

        showBadge : function(show) {
            var indicator = dom.byId('badge_featureSelected');
            if (show) {
                domStyle.set(indicator,'display','');
                domAttr.set(indicator, "title", i18n.widgets.featureList.featureSelected);
                domAttr.set(indicator, "alt", i18n.widgets.featureList.featureSelected);
            } else {
                domStyle.set(indicator,'display','none');
            }
        },

        _createList: function(){
            window.tasks = [];
            for(var l = 0; l<this.Layers.length; l++) {
                layer = this.Layers[l];
                if(layer.visibility)
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

            window.featurePanZoom = function(el, panOnly) {
                var r = window.tasks[el.dataset.layerid];
                var fid = el.dataset.featureid;
                var layer = r.layer;
                var objectIdFieldName = r.layer.objectIdField;

                q = new Query();
                q.where = objectIdFieldName+"="+fid;
                q.outFields = [objectIdFieldName];                    
                q.returnGeometry = true;
                r.task.execute(q).then(function(ev) {
                    var geometry = ev.features[0].geometry;
                    if(panOnly) {
                        if (geometry.type !== "point") {
                            geometry = geometry.getExtent().getCenter();
                        }
                        layer._map.centerAt(geometry);
                    } else {
                        if(geometry.type === "point") {
                            layer._map.centerAndZoom(geometry, 13);
                        } else {
                            var extent = geometry.getExtent().expand(1.5);
                            layer._map.setExtent(extent);
                        }
                    }
                });
            };

            window.featureExpandAndZoom = function(event, checkbox) {
                if(event.charCode === 43 || event.charCode === 45 || event.charCode === 46) { // +,- or .
                    //console.log(event.charCode, checkbox);
                    checkbox.checked = !checkbox.checked;
                    window.featureExpand(checkbox, false);
                    if(checkbox.checked) {
                        var btn = document.querySelector(((event.charCode === 43) ? '#zoomBtn_' : '#panBtn_')+checkbox.value.replace(',','_'));
                        btn.click();
                    }
                }
            };

            window._prevSelected = null;                
            window.featureExpand = function(checkBox, restore) {
                if(_prevSelected && !restore) {
                    dojo.query('.featureItem_'+_prevSelected).forEach(function(e) {
                        dojo.removeClass(e, 'showAttr');
                        dojo.addClass(e, 'hideAttr');
                        var li = query(e).closest('li');
                        li.removeClass('borderLi');

                    });
                    dojo.query('#featureButton_'+_prevSelected).forEach(function(e) {
                        e.checked=false;
                    });
                }
                var values = checkBox.value.split(',');
                var r = window.tasks[values[0]];
                var objectIdFieldName = r.layer.objectIdField;
                var fid = values[1];
                var layer = r.layer;
                layer._map.graphics.clear();

                lang.hitch(window._this, window._this.showBadge(checkBox.checked));
                    
                if(checkBox.checked)
                {
                    _prevSelected = values[0]+'_'+fid;
                    dojo.query('.featureItem_'+_prevSelected).forEach(function(e) {
                        dojo.addClass(e, 'showAttr');
                        dojo.removeClass(e, 'hideAttr');
                        var li = query(e).closest('li');
                        li.addClass('borderLi');
                    });

                    q = new Query();
                    q.where = objectIdFieldName+"="+fid;
                    q.outFields = [objectIdFieldName];
                    q.returnGeometry = true;
                    r.task.execute(q).then(function(ev) {
                        //console.log(ev);

                        var graphic = ev.features[0];
                        var markerGeometry;
                        var marker;

                        switch (graphic.geometry.type) {
                            case "point":
                                markerGeometry = graphic.geometry;
                                marker = markerSymbol;
                                break;
                        case "extent":
                            markerGeometry = graphic.getCenter();
                            // marker = new SimpleMarkerSymbol
                            break;
                        case "polyline" :
                            markerGeometry = graphic.geometry;
                            marker = new CartographicLineSymbol(
                                CartographicLineSymbol.STYLE_SOLID, new Color([0, 127, 255]), 10, 
                                CartographicLineSymbol.CAP_ROUND,
                                CartographicLineSymbol.JOIN_ROUND, 5);
                            break;
                        default:
                            // if the graphic is a polygon
                            markerGeometry = graphic.geometry;
                            marker = new SimpleFillSymbol(
                                SimpleFillSymbol.STYLE_SOLID, 
                                new SimpleLineSymbol(
                                    SimpleLineSymbol.STYLE_SOLID,
                                    new Color([0, 127, 255]), 3),
                                    new Color([0, 127, 255, 0.25]));
                            break;
                        }

                        var gr = new Graphic(markerGeometry, marker);
                        layer._map.graphics.add(gr);
                    });
                    // layer.selectFeatures(q, FeatureLayer.SELECTION_NEW).then(function(f) {
                    //     f[0].symbol.size = 40;
                    // });
                } else {
                    dojo.query('.featureItem_'+_prevSelected).forEach(function(e) {
                        dojo.removeClass(e, 'showAttr');
                        dojo.addClass(e, 'hideAttr');
                    });                        
                    window._prevSelected = null;
                }
            };
            

            on(this.map, "extent-change", lang.hitch(this, this._reloadList), this);

            _getFeatureListItem = function(r, f, objectIdFieldName, layer, content, listTemplate) {
                try {
                    var featureId = f.attributes[objectIdFieldName];
                    var attributes = {
                        _featureId:featureId, 
                        _layerId:r, 
                        _title:layer.infoTemplate.title(f), 
                        _content:content,
                        _panTo: i18n.widgets.featureList.panTo,
                        _zoomTo: i18n.widgets.featureList.zoomTo,
                        hint:Ri18n.skip.featureDetaills,
                    };
                    lang.mixin(attributes, f.attributes);
                    var nulls = window.tasks[r].layer.fields.map(function(f){return f.name;});
                    var nullAttrs ={};
                    nulls.forEach(function(n) {
                        if(!attributes[n])
                        {
                            attributes[n]='';
                        }
                    });
                    content = string.substitute(content, attributes);
                    listTemplate=string.substitute(listTemplate, attributes);
                    var result =  string.substitute(listTemplate, attributes);
                    var re = /((>)((?:http:\/\/www\.|https:\/\/www\.|ftp:\/\/www.|www\.)[a-z0-9]+(?:[\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(?:\/.*)?)(?:<))|(FORMAT_(DATE|TIME|NUM)\((-?\d*\.?\d*),\"(.+)\"\))/gm;
                    do {
                        var matches = re.exec(result);
                        if(!matches) break;
                        if(matches[6] && (!matches[7] || matches[7] === '')) {
                            result = result.replace(matches[5], '');
                        }
                        if(matches[2]===">") {
                            result = result.replace(matches[3], "<a href='"+matches[3]+"' target='_blank'>Follow Link</a>");
                        }
                        else if(matches[6]==="DATE") {
                            var dateNum = matches[7];
                            if(!isNaN(parseFloat(dateNum)) && isFinite(dateNum)) {
                                var date = new Date(Number(dateNum));
                                result = result.replace(matches[5], date.toLocaleDateString(
                                    document.documentElement.lang, 
                                    {
                                        year: "numeric", month: "long", day: "numeric"
                                    }
                                ));
                            } else 
                                result = result.replace(matches[5],'');
                        }
                        else if(matches[6]==="TIME") {
                            var timeNum = matches[7];
                            if(!isNaN(parseFloat(timeNum)) && isFinite(timeNum)) {
                                var time = new Date(Number(timeNum));
                                result = result.replace(matches[5], time.toLocaleDateString(
                                    document.documentElement.lang, 
                                    {
                                        year: "numeric", month: "numeric", day: "numeric",
                                        hour: "2-digit", minute: "2-digit"
                                    }
                                ));
                            } else 
                                result = result.replace(matches[5],'');
                        }
                        else if(matches[6]==="NUM") {
                            var num = matches[7];
                            if(!isNaN(parseFloat(num)) && isFinite(num)) {
                                num = Number(num);
                                var d89=matches[8].split('|');
                                var dec = Number(d89[0]);
                                var useSeparator = d89[1] === "true";
                                num = num.toLocaleString(document.documentElement.lang, 
                                    {
                                        minimumFractionDigits: dec,
                                        maximumFractionDigits: dec,
                                        useGrouping: useSeparator
                                    }
                                );
                                
                                result = result.replace(matches[5], num);
                            } else 
                                result = result.replace(matches[5],'');
                        }

                    } while (true);

                    return result;
                } catch (e) {
                    console.log("Error on feature ("+featureId+")\n\t "+layer.infoTemplate.title(f)+"\n\t",e);
                    return null;
                }
            };
        },
    });
    if (has("extend-esri")) {
        lang.setObject("dijit.FeaturesList", Widget, esriNS);
    }
    return Widget;
});

