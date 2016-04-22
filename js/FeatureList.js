define(["dojo/Evented", "dojo/_base/declare", "dojo/_base/lang", "dojo/has", "esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/on",
    "dojo/Deferred", "dojo/promise/all", 
    "dojo/query", 
    "esri/tasks/query", "esri/tasks/QueryTask",
    "dojo/text!application/dijit/templates/FeatureList.html", 
    "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", "dojo/dom-construct", "dojo/_base/event", 
    "dojo/string", 
    "dojo/text!application/dijit/templates/FeatureListTemplate.html",
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
            var defaults = lang.mixin({}, this.options, options);

            this.domNode = srcRefNode;
            // properties
            this.set("map", defaults.map);
            this.set("layers", defaults.layers);

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
            }));
        },

        FocusDetails: function() {
            if(!this._isVisible()) return;
            
            var details = this.domNode.querySelector('.showAttr');
            if(details) {
                var page = query(details).closest('.borderLi')[0];
                page.focus();
            }
        },

        _isVisible : function() {
            var page = query(this.domNode).closest('.page')[0];
            return dojo.hasClass(page, "showAttr");
        },

        _reloadList : function(ext) {
            if(!this._isVisible()) return;
            var loading_features = this.domNode.parentNode.querySelector('#loading_features');
            domStyle.set(loading_features, 'display', '-webkit-inline-box');
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
                        if(window.tasks[i].layer.visible && window.tasks[i].layer.visibleAtMapScale) {
                            r = results[i];
                            var layer = window.tasks[i].layer;
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
                                    content+='    <td valign="top">\n';
                                    content+='      <!--<img src="..\\images\\Filter0.png" alt="filter" class="filterBtn"/>-->\n';
                                    content+='    </td>\n';
                                    content+='    <td valign="top" align="right">'+pField.label+'</td>\n';
                                    content+='    <td valign="top">:</td>\n';
                                    content+='    <td valign="top">';
                                    if(pField.format)
                                    { 
                                        if(pField.format.dateFormat) {
                                            content+='FORMAT_DATE('+fieldName+',"'+pField.format.dateFormat+'")';
                                        }
                                        else if(pField.format.digitSeparator) {
                                            content+='FORMAT_NUM('+fieldName+',"'+pField.format.places+'")';
                                        }
                                        else {
                                            content+=fieldName;
                                        }
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
                                if(window._prevSelected && window._prevSelected.split('_')[1] == f.attributes[r.objectIdFieldName]) {
                                    preselected = f;
                                }

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
                        var checkbox = query("#featureButton_"+window._prevSelected)[0];
                        checkbox.checked = true;
                        window.featureExpand(checkbox, true);
                    }
                    domStyle.set(loading_features, 'display', 'none');
                }
            );
        },

        _createList: function(){
            window.tasks = [];
            for(var l = 0; l<this.layers.length; l++) {
                layer = this.layers[l];
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

            window.featurePanZoom = function(btn, panOnly) {
                values = btn.attributes.tag.value.split(',');
                var r = window.tasks[values[0]];
                var fid = values[1];
                var layer = r.layer;
                var objectIdFieldName = r.layer.objectIdField;

                    q = new Query();
                    q.where = "["+objectIdFieldName+"]='"+fid+"'";
                    q.outFields = ['"'+objectIdFieldName+'"'];                    
                    q.returnGeometry = true;
                    r.task.execute(q).then(function(ev) {
                        if(panOnly) {
                            layer._map.centerAt(ev.features[0].geometry);
                        } else {
                            layer._map.centerAndZoom(ev.features[0].geometry, 13);
                        }
                    });
            };

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
                var objectIdFieldName = r.layer.objectIdField;
                var fid = values[1];
                var layer = r.layer;
                layer._map.graphics.clear();

                if(checkBox.checked)
                {
                    _prevSelected = fid;//.split('_')[1];
                    dojo.query('.featureItem_'+_prevSelected).forEach(function(e) {
                        dojo.addClass(e, 'showAttr');
                        dojo.removeClass(e, 'hideAttr');
                        query(e).closest('li').addClass('borderLi');
                    });

                    q = new Query();
                    q.where = "["+objectIdFieldName+"]='"+fid.split('_')[1]+"'";
                    q.outFields = ['"'+objectIdFieldName+'"'];
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
                    });                        
                    window._prevSelected = null;
                }
            };

            on(this.map, "extent-change", lang.hitch(this, this._reloadList), this);

            _getFeatureListItem = function(r, f, objectIdFieldName, layer, content, listTemplate) {
                try {
                    var featureId = f.attributes[objectIdFieldName];
                    var attributes = {_featureId:r+'_'+featureId, _layerId:r, _title:layer.infoTemplate.title(f), _content:content};
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
                    var re = /((>)((?:http:\/\/www\.|https:\/\/www\.|ftp:\/\/www.|www\.)[a-z0-9]+(?:[\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(?:\/.*)?)(?:<))|(FORMAT_(DATE|NUM)\((-?\d*\.?\d*),\"(.+)\"\))/gm;
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
                            var date = new Date(Number(matches[7]));
                            result = result.replace(matches[5], date.toLocaleDateString("en-US", {
                                year: "numeric", month: "long", day: "numeric"
                            }));
                        }
                        else if(matches[6]==="NUM") {
                            var num = Number(matches[7]).toFixed(matches[8]);
                            result = result.replace(matches[5], num);
                        }

                    } while (true);

//                     layer.queryAttachmentInfos(featureId).then(function(a) {
//                         result = result.replace("</table>",'<tr><td/><td valign="top" align="right">Attachments</td><td valign="top">:</td><td valign="top"></td></tr></table>');
//                         console.log(a,result);
//                         }
//                     );

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

