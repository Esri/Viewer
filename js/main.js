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

define(["dojo/ready", "dojo/json", "dojo/_base/array", "dojo/_base/Color", "dojo/_base/declare", 
    "dojo/_base/lang", "dojo/dom", "dojo/dom-geometry", "dojo/dom-attr", "dojo/dom-class", 
    "dojo/dom-construct", "dojo/dom-style", "dojo/on", "dojo/Deferred", "dojo/promise/all", 
    "dojo/query", "dijit/registry", "dijit/Menu", "dijit/CheckedMenuItem", "application/toolbar", 
    "application/has-config", "esri/arcgis/utils", "esri/lang", 
    "esri/dijit/HomeButton", "esri/dijit/LocateButton", 
    "esri/dijit/Legend", "esri/dijit/BasemapGallery", 
    "esri/dijit/Measurement", "esri/dijit/OverviewMap", "esri/geometry/Extent", 
    "esri/layers/FeatureLayer",
    "application/FeatureList", "application/TableOfContents", "application/ShareDialog"
    ], 
    function (
    ready, JSON, array, Color, declare, 
    lang, dom, domGeometry, domAttr, domClass, 
    domConstruct, domStyle, on, Deferred, all, 
    query, registry, Menu, CheckedMenuItem, Toolbar, 
    has, arcgisUtils, esriLang, 
    HomeButton, LocateButton, 
    Legend, BasemapGallery, 
    Measurement, OverviewMap, Extent, 
    FeatureLayer, 
    FeatureList, TableOfContents, ShareDialog
    ) {

    return declare(null, {
        config: {},
        color: null,
        theme: null,
        map: null,
        initExt: null,
        mapExt: null,
        editorDiv: null,
        editor: null,
        editableLayers: null,
        timeFormats: ["shortDateShortTime", "shortDateLEShortTime", "shortDateShortTime24", "shortDateLEShortTime24", "shortDateLongTime", "shortDateLELongTime", "shortDateLongTime24", "shortDateLELongTime24"],
        
        startup: function (config) {
            // config will contain application and user defined info for the template such as i18n strings, the web map id
            // and application id and any url parameters and any application specific configuration information.
            if (config) {
                this.config = config;
                this.color = this.setColor(this.config.color);
                this.hoverColor = typeof(this.config.hoverColor)=='undefined' ? this.setColor('#000000', 0.4) : this.setColor(this.config.hoverColor, 0.9);
                this.focusColor = typeof(this.config.focusColor)=='undefined' ? this.setColor('#1f1f1f', 0.4) : this.setColor(this.config.focusColor, 0.9);
                this.activeColor = typeof(this.config.activeColor)=='undefined' ? this.focusColor : this.setColor(this.config.activeColor, 0.9);
                this.theme = this.setColor(this.config.theme);
                // document ready
                ready(lang.hitch(this, function () {
                    //supply either the webmap id or, if available, the item info
                    var itemInfo = this.config.itemInfo || this.config.webmap;
                    //If a custom extent is set as a url parameter handle that before creating the map
                    if (this.config.extent) {
                        var extArray = decodeURIComponent(this.config.extent).split(",");

                        if (extArray.length === 4) {
                            itemInfo.item.extent = [
                            [parseFloat(extArray[0]), parseFloat(extArray[1])],
                            [parseFloat(extArray[2]), parseFloat(extArray[3])]
                            ];
                        } else if (extArray.length === 5) {
                            this.initExt = new Extent(JSON.parse(this.config.extent));
                        }
                    }
                    this._createWebMap(itemInfo);
                }));
            } else {
                var error = new Error("Main:: Config is not defined");
                this.reportError(error);
            }
        },

        reportError: function (error) {
            // remove loading class from body
            domClass.remove(document.body, "app-loading");
            domClass.add(document.body, "app-error");
            // an error occurred - notify the user. In this example we pull the string from the
            // resource.js file located in the nls folder because we've set the application up
            // for localization. If you don't need to support multiple languages you can hardcode the
            // strings here and comment out the call in index.html to get the localization strings.
            // set message
            var node = dom.byId("loading_message");

            if (node) {
                if (this.config && this.config.i18n) {
                    node.innerHTML = this.config.i18n.map.error + ": " + error.message;
                } else {
                    node.innerHTML = "Unable to create map: " + error.message;
                }
            }
        },

        setColor: function (color, tr) {
            var rgb = Color.fromHex(color).toRgb();
            var outputColor = null;
            if (has("ie") < 9) {
                outputColor = color;
            } else {
                //rgba supported so add
                rgb.push(tr);
                outputColor = Color.fromArray(rgb);
            }
            return outputColor;
        },

        // Map is ready
        _mapLoaded: function () {
            query(".esriSimpleSlider").style("backgroundColor", this.theme.toString());
            // remove loading class from body
            domClass.remove(document.body, "app-loading");
            on(window, "orientationchange", lang.hitch(this, this._adjustPopupSize));
            this._adjustPopupSize();

            zoomSlider = dojo.query("#mapDiv_zoom_slider")[0];
            //dojo.setAttr(zoomSlider, 'role', 'list');
            //dojo.setAttr(zoomSlider, 'aria-label', 'Zoom Slider');

            esriSimpleSliderIncrementNode = dojo.query(".esriSimpleSliderIncrementButton")[0];
            var zoomIn_click = esriSimpleSliderIncrementNode.OnClick;
            dojo.empty(esriSimpleSliderIncrementNode);
            //dojo.setAttr(esriSimpleSliderIncrementNode, 'data-title', 'Zoom In');

            plusbtn = domConstruct.create("input", {
                className: "esriSimpleSliderIncrementButton",
                type: "image",
                "aria-label": "Zoom In",
                src: 'images/icons_' + this.config.icons + '/plus' + (this.config.new_icons ? ".new" : "") + '.png',
                alt: 'Zoom In',
                title: 'Zoom In',
            }, esriSimpleSliderIncrementNode);
            on(plusbtn, "click", zoomIn_click);

            esriSimpleSliderDecrementNode = dojo.query(".esriSimpleSliderDecrementButton")[0];
            var zoomOut_click = esriSimpleSliderDecrementNode.OnClick;
            dojo.empty(esriSimpleSliderDecrementNode);
            //dojo.setAttr(esriSimpleSliderDecrementNode, 'data-title', 'Zoom Out');

            minusbtn = domConstruct.create("input", {
                className: "esriSimpleSliderDecrementButton",
                type: "image",
                "aria-label": "Zoom Out",
                src: 'images/icons_' + this.config.icons + '/minus' + (this.config.new_icons ? ".new" : "") + '.png',
                alt: 'Zoom Out',
                title: 'Zoom Out',
            }, esriSimpleSliderDecrementNode);
            on(minusbtn, "click", zoomOut_click);


            on(this.map.infoWindow, "show", lang.hitch(this, function() {
                this._initPopup(this.map.infoWindow.domNode);
            }));


            on(this.map.infoWindow, "selection-change", lang.hitch(this, function() {
                this._initPopup(this.map.infoWindow.domNode);
            }));


        },

        _initPopup : function (node) {
            images = node.querySelectorAll('img');
            for (var i = 0; i<images.length; i++) {
                if(!dojo.getAttr(images[i], 'alt'))
                {
                    dojo.setAttr(images[i], 'alt', '');
                } 
            }

            dojo.setAttr(node, "role", "dialog");
            header = node.querySelector('.header');
            if(header) {
                dojo.setAttr(node, "tabindex", 0);
                node.blur();
                label = header.innerHTML;
                title = node.querySelector('.title');
                if(title && title.innerHTML!="&nbsp;") {
                    label=title.innerHTML + ": " + label;
                }
                dojo.setAttr(node, "aria-label", label);
                node.focus();
            }

            attrNames = node.querySelectorAll('.attrName');
            if(attrNames) {
                for(i=0; i<attrNames.length; i++) {
                    attrName = attrNames[i];

                    dojo.create("th", {
                        id: "h_"+i,
                        scope: "row",
                        className: 'attrName',
                        innerHTML: attrName.innerHTML,
                    }, attrName.parentNode, "first");

                    attrValues = attrName.parentNode.querySelectorAll('.attrValue');
                    if(attrValues) {
                        for(j=0; j<attrValues.length; j++) {
                            var attrValue = attrValues[j];
                            dojo.setAttr(attrValue, "headers", "h_"+i);
                        }
                    }
                    dojo.destroy(attrName);
                }
            }

            zoom = node.querySelector('.zoomTo');
            if(zoom) {
                hint = "Zoom to";
                dojo.setAttr(zoom, "aria-label", hint);
                dojo.setAttr(zoom, "title", hint);
                //dojo.setAttr(zoom.parentNode, "data-title", hint);
                dojo.removeAttr(zoom, "to");
                dojo.setAttr(zoom, "role", "button");
            }
        },

        // Create UI
        _createUI: function () {
            domStyle.set("panelPages", "visibility", "hidden");
            //Add tools to the toolbar. The tools are listed in the defaults.js file
            var toolbar = new Toolbar(this.config);
            toolbar.startup().then(lang.hitch(this, function () {

                // set map so that it can be repositioned when page is scrolled
                toolbar.map = this.map;

                var toolList = [];
                for (var i = 0; i < this.config.tools.length; i++) {
                    switch (this.config.tools[i].name) {
                        case "instructions":
                            toolList.push(this._addInstructions(this.config.tools[i], toolbar, "large"));
                            break;
                        case "details":
                            toolList.push(this._addDetails(this.config.tools[i], toolbar, "medium"));
                            break;
                        case "features":
                            toolList.push(this._addFeatures(this.config.tools[i], toolbar, "large"));
                            break;
                        case "legend":
                            toolList.push(this._addLegend(this.config.tools[i], toolbar, "medium"));
                            break;
                        case "layers":
                            toolList.push(this._addLayers(this.config.tools[i], toolbar, "medium"));
                            break;
                        case "basemap":
                            toolList.push(this._addBasemapGallery(this.config.tools[i], toolbar, "large"));
                            break;
                        case "overview":
                            toolList.push(this._addOverviewMap(this.config.tools[i], toolbar, "medium"));
                            break;
                        case "measure":
                            toolList.push(this._addMeasure(this.config.tools[i], toolbar, "small"));
                            break;
                        case "edit":
                            toolList.push(this._addEditor(this.config.tools[i], toolbar, "medium"));
                            break;
                        case "share":
                            toolList.push(this._addShare(this.config.tools[i], toolbar, "medium"));
                            break;
                        case "bookmarks":
                            toolList.push(this._addBookmarks(this.config.tools[i], toolbar, "medium"));
                            break;
                        case "print":
                            toolList.push(this._addPrint(this.config.tools[i], toolbar, "small"));
                            break;
                        default:
                            break;
                    }
                }

                all(toolList).then(lang.hitch(this, function (results) {
                    //If all the results are false and locate and home are also false we can hide the toolbar
                    var tools = array.some(results, function (r) {
                        return r;
                    });

                    var home = has("home");
                    var locate = has("locate");

                    //No tools are specified in the configuration so hide the panel and update the title area styles
                    if (!tools && !home && !locate) {
                        domConstruct.destroy("panelTools");
                        domStyle.set("panelContent", "display", "none");
                        domStyle.set("panelTitle", "border-bottom", "none");
                        domStyle.set("panelTop", "height", "52px");
                        query(".esriSimpleSlider").addClass("notools");
                        this._updateTheme();
                        return;
                    }

                    //Now that all the tools have been added to the toolbar we can add page naviagation
                    //to the toolbar panel, update the color theme and set the active tool.
                    this._updateTheme();
                    toolbar.updatePageNavigation();

                    if(has("instructions")) {
                        //toolbar.activateTool("instructions");
                        setTimeout(lang.hitch(toolbar, toolbar.showInstructions), 400);
                    }
                    else if (this.config.activeTool !== "") {
                        toolbar.activateTool(this.config.activeTool);
                    } else {
                        toolbar._closePage();
                    }


                    on(toolbar, "updateTool", lang.hitch(this, function (name) {
                        if (name === "measure") {
                            this._destroyEditor();
                            this.map.setInfoWindowOnClick(false);
                        } else if (name === "edit") {
                            this._destroyEditor();
                            this.map.setInfoWindowOnClick(false);
                            this._createEditor();
                        } else {
                            //activate the popup and destroy editor if necessary
                            this._destroyEditor();
                            this.map.setInfoWindowOnClick(true);
                        }


                        if (has("measure") && name !== "measure") {
                            query(".esriMeasurement").forEach(lang.hitch(this, function (node) {
                                var m = registry.byId(node.id);
                                if (m) {
                                    m.clearResult();
                                    m.setTool("location", false);
                                    m.setTool("area", false);
                                    m.setTool("distance", false);
                                }
                            }));
                        }
                    }));

                    domStyle.set("panelPages", "visibility", "visible");
                }));
            }));
        },

        _addFeatures: function (tool, toolbar, panelClass) {
            //Add the legend tool to the toolbar. Only activated if the web map has operational layers.
            var deferred = new Deferred();
            if (has("features")) {
                var featuresDiv = toolbar.createTool(tool, "large");

                var layers = this.config.response.itemInfo.itemData.operationalLayers;
                
                var fl = new FeatureList({
                    map: this.map,
                    layers: layers
                }, featuresDiv);
                fl.startup();

                deferred.resolve(true);
            } 
            else {
                // window._prevSelected = null;
                deferred.resolve(false);
            }
        
            return deferred.promise;
        },
        
        _addBasemapGallery: function (tool, toolbar, panelClass) {
            //Add the basemap gallery to the toolbar.
            var deferred = new Deferred();
            if (has("basemap")) {
                var basemapDiv = toolbar.createTool(tool, panelClass);
                var basemap = new BasemapGallery({
                    id: "basemapGallery",
                    map: this.map,
                    showArcGISBasemaps: true,
                    portalUrl: this.config.sharinghost,
                    basemapsGroup: this._getBasemapGroup()
                }, domConstruct.create("div", {}, basemapDiv));

                basemap.startup();
                on(basemap, "load", lang.hitch(basemap, function () {
                    var list = this.domNode.querySelector("div");
                    domAttr.set(list, "role", "list");

                    var nodes = this.domNode.querySelectorAll(".esriBasemapGalleryNode");
                    array.forEach(nodes, function(node){
                        domAttr.set(node, "role", "listitem");
                        img = node.querySelector("img");
                        img.alt='';
                        domAttr.set(img, "tabindex", -1);
                        domAttr.remove(img, "title");

                        aNode = node.querySelector("a");
                        labelNode = node.querySelector(".esriBasemapGalleryLabelContainer");
                        domAttr.remove(labelNode.firstChild, "alt");
                        domAttr.remove(labelNode.firstChild, "title");
                        dojo.place(labelNode, aNode, "last");
                        //domStyle.set(labelNode, "width", img.width);
                        domAttr.set(aNode, "tabindex", -1);
                        domAttr.set(node, "tabindex", 0);
                        domStyle.set(node, "padding", "5px 8px 0px 5px");
                        on(aNode, "focus", function() { node.focus();});
                        on(img, "click", function() { node.focus();});
                    });
                }));
                deferred.resolve(true);
            } else {
                deferred.resolve(false);
            }

            return deferred.promise;
        },

        _addBookmarks: function (tool, toolbar, panelClass) {
            //Add the bookmarks tool to the toolbar. 
            //Only activated if the webmap contains bookmarks.
            var deferred = new Deferred();
            if (this.config.response.itemInfo.itemData.bookmarks) {
                //Conditionally load this module since most apps won't have bookmarks
                require(["application/has-config!bookmarks?esri/dijit/Bookmarks"], lang.hitch(this, function (Bookmarks) {
                    if (!Bookmarks) {
                        deferred.resolve(false);
                        return;
                    }
                    var bookmarkDiv = toolbar.createTool(tool, panelClass);
                    var bookmarks = new Bookmarks({
                        map: this.map,
                        bookmarks: this.config.response.itemInfo.itemData.bookmarks
                    }, domConstruct.create("div", {}, bookmarkDiv));

                    items = bookmarks.bookmarkDomNode.querySelectorAll('.esriBookmarkItem');
                    if(items && items.length>0)
                    {
                        itemsTable = items[0].parentNode.parentNode.parentNode.parentNode;
                        var header = document.createElement("tr");
                        header.innerHTML = "<th style='display:none;'>Bookmarks</th>";
                        itemsTable.insertBefore(header, items[0].parentNode.parentNode.parentNode);
                        domAttr.set(itemsTable,"role","list");

                        for(i=0; i<items.length; i++) {
                            var item = items[i];
                            domAttr.set(item, 'tabindex', 0);
                            label = item.querySelector('.esriBookmarkLabel');
                            this._atachEnterKey(item, label);
                            domStyle.set(label, 'width', '280px');

                            domAttr.set(item.parentNode.parentNode,"role","listitem");
                        }
                    }
                    deferred.resolve(true);
                }));
            } else {
                deferred.resolve(false);
            }

            return deferred.promise;
        },

        _addDetails: function (tool, toolbar, panelClass) {
            //Add the default map description panel
            var deferred = new Deferred();
            if (has("details")) {
                var description = this.config.description || this.config.response.itemInfo.item.description || this.config.response.itemInfo.item.snippet;
                if (description) {
                    var descLength = description.length;
                    //Change the panel class based on the string length
                    if (descLength < 200) {
                        panelClass = "small";
                    } else if (descLength < 400) {
                        panelClass = "medium";
                    } else {
                        panelClass = "large";
                    }

                    var detailDiv = toolbar.createTool(tool, panelClass);
                    detailDiv.innerHTML = "<div class='desc' tabindex='0'>" + description + "</div>";
                }
                deferred.resolve(true);
            } else {
                deferred.resolve(false);
            }

            return deferred.promise;
        },

        _addEditor: function (tool, toolbar, panelClass) {

            //Add the editor widget to the toolbar if the web map contains editable layers
            var deferred = new Deferred();
            this.editableLayers = this._getEditableLayers(this.config.response.itemInfo.itemData.operationalLayers);
            if (has("edit") && this.editableLayers.length > 0) {
                if (this.editableLayers.length > 0) {
                    this.editorDiv = toolbar.createTool(tool, panelClass);
                    return this._createEditor();
                } else {
                    console.log("No Editable Layers");
                    deferred.resolve(false);
                }
            } else {
                deferred.resolve(false);
            }

            return deferred.promise;
        },

        _createEditor: function () {
            var deferred = new Deferred();
            //Dynamically load since many apps won't have editable layers
            require(["application/has-config!edit?esri/dijit/editing/Editor"], lang.hitch(this, function (Editor) {
                if (!Editor) {
                    deferred.resolve(false);
                    return;
                }

                //add field infos if necessary. Field infos will contain hints if defined in the popup and hide fields where visible is set
                //to false. The popup logic takes care of this for the info window but not the edit window.
                array.forEach(this.editableLayers, lang.hitch(this, function (layer) {
                    if (layer.featureLayer && layer.featureLayer.infoTemplate && layer.featureLayer.infoTemplate.info && layer.featureLayer.infoTemplate.info.fieldInfos) {
                        //only display visible fields
                        var fields = layer.featureLayer.infoTemplate.info.fieldInfos;
                        var fieldInfos = [];
                        array.forEach(fields, lang.hitch(this, function (field) {

                            //added support for editing date and time
                            if (field.format && field.format.dateFormat && array.indexOf(this.timeFormats, field.format.dateFormat) > -1) {
                                field.format = {
                                    time: true
                                };
                            }

                            if (field.visible) {
                                fieldInfos.push(field);
                            }

                        }));

                        layer.fieldInfos = fieldInfos;
                    }
                }));

                var settings = {
                    map: this.map,
                    layerInfos: this.editableLayers,
                    toolbarVisible: has("edit-toolbar")
                };
                this.editor = new Editor({
                    settings: settings
                }, domConstruct.create("div", {}, this.editorDiv));

                this.editor.startup();
                deferred.resolve(true);
            }));

            return deferred.promise;
        },

        _destroyEditor: function () {
            if (this.editor) {
                this.editor.destroy();
                this.editor = null;
            }
        },

        _addLayers: function (tool, toolbar, panelClass) {
            //Toggle layer visibility if web map has operational layers
            var deferred = new Deferred();

            var layers = this.config.response.itemInfo.itemData.operationalLayers;

            if (layers.length === 0) {
                deferred.resolve(false);
            } else {
                if (has("layers")) {
                    panelClass = "large";

                    var layersDiv = toolbar.createTool(tool, panelClass);

                    var toc = new TableOfContents({
                        map: this.map,
                        layers: layers
                    }, domConstruct.create("div", {}, layersDiv));
                    toc.startup();

                    deferred.resolve(true);
                } else {
                    deferred.resolve(false);
                }
            }
            return deferred.promise;
        },

        _addInstructions: function (tool, toolbar, panelClass) {
            var deferred = new Deferred();
            if (!has("instructions")) {
               deferred.resolve(false);
            } else 
            {
                var instructionsDiv = toolbar.createTool(tool, "large");

                instructionsText = domConstruct.create("div", {
                    tabindex: '0',
                    class: 'desc',
                }, instructionsDiv);

                domConstruct.create("div", {
                    innerHTML: '<h2>In addition to the mouse you may:</h2>',
                }, instructionsText);

                var list = domConstruct.create("ul", {
                    id:'instructionsList',
                }, instructionsText);

                domConstruct.create("li", {
                    innerHTML : "Use <strong>Tab key</strong> to navigate from item to item."
                }, list);

                domConstruct.create("li", {
                    innerHTML : "Use <strong>SHIFT Tab</strong> to navigate backwards."
                }, list);

                domConstruct.create("li", {
                    innerHTML : "Press <strong>ENTER</strong> to activate the focused item."
                }, list);

                domConstruct.create("li", {
                    innerHTML : "Use <strong>Page&nbsp;Up</strong> or <strong>Page&nbsp;Down</strong> to move from a tool page to the next or to the previous page."
                }, list);

                domConstruct.create("li", {
                    innerHTML : "Use <strong>ESCAPE</strong> to close a tool page and return to the tool bar."
                }, list);

                domConstruct.create("li", {
                    innerHTML : "Hit <strong>SPACE&nbsp;bar</strong> to toggle a focused check box."
                }, list);

                deferred.resolve(true);
            }
            return deferred.promise;
        },

        _addLegend: function (tool, toolbar, panelClass) {
            //Add the legend tool to the toolbar. Only activated if the web map has operational layers.
            var deferred = new Deferred();
            var layers = arcgisUtils.getLegendLayers(this.config.response);

            if (layers.length === 0) {
                deferred.resolve(false);
            } else {
                if (has("legend")) {
                    var legendDiv = toolbar.createTool(tool, "large");
                    dojo.setAttr(legendDiv, 'tabindex', 0);
                    var legend = new Legend({
                        map: this.map,
                        layerInfos: layers
                    }, domConstruct.create("div", {role:'application'}, legendDiv));
                    domClass.add(legend.domNode, "legend");
                    legend.startup();
                    if (this.config.activeTool !== "") {
                        toolbar.activateTool(this.config.activeTool || "legend");
                    }

                    var LegendServiceLabel = legend.domNode.querySelector(".esriLegendServiceLabel");
                    if(LegendServiceLabel)
                    {
                        var h3 = domConstruct.create("h2",{
                            className: LegendServiceLabel.className,
                            innerHTML: LegendServiceLabel.innerHTML,
                            tabindex: 0
                        });
                        LegendServiceLabel.parentNode.replaceChild(h3, LegendServiceLabel);
                    }

                    var LegendLayers = legend.domNode.querySelectorAll(".esriLegendLayer");
                    for(j=0; j<LegendLayers.length; j++) {
                        //var LegendServiceLists = legend.domNode.querySelectorAll(".esriLegendLayer tbody");
                        var LegendServiceList = LegendLayers[j].querySelector("tbody");


                        var header = document.createElement("tr");
                        header.innerHTML = "<th style='display:none;'>Layer</th>";
                        LegendServiceList.insertBefore(header, LegendServiceList.childNodes[0]);


                        domAttr.set(LegendServiceList, "role", "list");
                        //domAttr.set(LegendServiceList, "aria-label", LegendServiceLabel.innerHTML);

                        for(i=0; i<LegendServiceList.childNodes.length; i++) {
                            var item = LegendServiceList.childNodes[i];
                            domAttr.set(item, "role", "listitem");
                            domAttr.set(item, "tabindex", "0");
                        }
                    }

                    var LegendLayerImages = legend.domNode.querySelectorAll(".esriLegendLayer image");
                    for(i = 0; i<LegendLayerImages.length; i++) {
                        domAttr.set(LegendLayerImages[i],'alt','');
                    }

                    deferred.resolve(true);

                } else {
                    deferred.resolve(false);
                }
            }
            return deferred.promise;
        },

        _addMeasure: function (tool, toolbar, panelClass) {
            //Add the measure widget to the toolbar.
            var deferred = new Deferred();
            if (has("measure")) {

                var measureDiv = toolbar.createTool(tool, panelClass);
                var areaUnit = (this.config.units === "metric") ? "esriSquareKilometers" : "esriSquareMiles";
                var lengthUnit = (this.config.units === "metric") ? "esriKilometers" : "esriMiles";

                var measure = new Measurement({
                    map: this.map,
                    defaultAreaUnit: areaUnit,
                    defaultLengthUnit: lengthUnit
                }, domConstruct.create("div", {}, measureDiv));

                measure.startup();

                dijitButtonNodes = measureDiv.querySelectorAll('.dijitButtonNode');
                array.forEach(dijitButtonNodes, function (node) {
                    domAttr.set(node, 'tabindex', 0);
                    domAttr.set(node.querySelector('.dijitButtonContents'), 'tabindex', '');
                });

                var esriMeasurementResultTable = measureDiv.querySelector('.esriMeasurementResultTable');
                var esriMeasurementTableHeaders = esriMeasurementResultTable.querySelectorAll('.esriMeasurementTableHeader');
                for(i = 0; i< esriMeasurementTableHeaders.length; i++)
                {
                    esriMeasurementTableHeader = esriMeasurementTableHeaders[i];
                    //alert(esriMeasurementTableHeader.innerHTML); 
                    var newHeader = document.createElement('th');
                    newHeader.innerHTML = esriMeasurementTableHeader.innerHTML;
                    colspan = esriMeasurementTableHeader.getAttribute('colspan');
                    if(colspan) {
                        newHeader.setAttribute('colspan', colspan);
                    }
                    newHeader.className = esriMeasurementTableHeader.className;
                    esriMeasurementTableHeader.parentNode.replaceChild(newHeader, esriMeasurementTableHeader);
                }

                var AccessAuditMarkers = esriMeasurementResultTable.querySelectorAll('img');
                for(i = 0; i< AccessAuditMarkers.length; i++)
                {
                     AccessAuditMarkers[i].setAttribute('Alt','');  
                }

                areaIconNode = measureDiv.querySelector('.areaIcon');
                domClass.remove(areaIconNode, 'areaIcon');
                areaIconNode.innerHTML = '<img src="images\\area_measure.png" alt="Area"/>';

                distanceIconNode = measureDiv.querySelector('.distanceIcon');
                domClass.remove(distanceIconNode, 'distanceIcon');
                distanceIconNode.innerHTML = '<img src="images\\dist_measure.png" alt="Distance"/>';

                locationIconNode = measureDiv.querySelector('.locationIcon');
                domClass.remove(locationIconNode, 'locationIcon');
                locationIconNode.innerHTML = '<img src="images\\dist_point.png" alt="Distance"/>';

                deferred.resolve(true);
            } else {
                deferred.resolve(false);
            }
            return deferred.promise;
        },

        _addOverviewMap: function (tool, toolbar, panelClass) {
            //Add the overview map to the toolbar
            var deferred = new Deferred();

            if (has("overview")) {
                var ovMapDiv = toolbar.createTool(tool, panelClass);
                domStyle.set(ovMapDiv, {
                    "height": "100%",
                    "width": "100%",
                });

                var panelHeight = this.map.height;
                if (panelClass === "small") {
                    panelHeight = 250;
                } else if (panelClass === "medium") {
                    panelHeight = 350;
                }

                this.createOverviewMap(ovMapDiv, panelHeight);
                
                on(this.map, "layer-add", lang.hitch(this, function (args) {
                    //delete and re-create the overview map if the basemap gallery changes
                    if (args.layer.hasOwnProperty("_basemapGalleryLayerType") && args.layer._basemapGalleryLayerType === "basemap") {
                        registry.byId("overviewMap").destroy();
                        this.createOverviewMap(ovMapDiv, panelHeight);
                    }
                }));
                deferred.resolve(true);
            } else {
                deferred.resolve(false);
            }

            return deferred.promise;
        },

        createOverviewMap: function(div, height) {
            var ovMap = new OverviewMap({
                id: "overviewMap",
                map: this.map,
                height: height,
                visible: false,
                opacity: 1,
                color: '#0000000f'
            }, domConstruct.create("div", {}, div));

            ovMap.startup();

            ovwHighlight = div.querySelector('.ovwHighlight');
            dojo.setAttr(ovwHighlight, 'tabindex', 0);
            dojo.setAttr(ovwHighlight, 'title', 'Drag To Change The Map Extent,\nor focus and use the Arrow keys.');
            this._atachArrowKeys(ovwHighlight, ovMap);

            on(ovMap.overviewMap, "extent-change", lang.hitch(ovMap.overviewMap.container, function() {
                var images = this.querySelectorAll("img");
                for(i=0; i<images.length; i++)
                    domAttr.set(images[i],'alt','');
            }));

        },

        _atachArrowKeys: function(onButton, map) {
            on(onButton, 'keydown', lang.hitch({ div: onButton, map: map}, function(event) {
                switch (event.keyCode) {
                    case 38 : // up
                        var top = dojo.style(this.div, 'top');
                        if(top > -this.div.clientHeight/2) {
                            dojo.style(this.div, 'top', --top + 'px');
                        }
                        break;
                    case 40 : // down
                        var top = dojo.style(this.div, 'top');
                        if(top < this.map.height - this.div.clientHeight/2) {
                            dojo.style(this.div, 'top', ++top + 'px');
                        }
                        break;
                    case 37 : // left
                        var left = dojo.style(this.div, 'left');
                        if(left > -this.div.clientWidth/2) {
                            dojo.style(this.div, 'left', --left + 'px');
                        }
                        break;
                    case 39 : // right
                        var left = dojo.style(this.div, 'left');
                        if(left < this.map.width - this.div.clientWidth/2) {
                            dojo.style(this.div, 'left', ++left + 'px');
                        }
                        break;
                }
                switch (event.keyCode) {
                    case  9: // tab
                    case 33: // PgUp
                    case 34: // PgDn
                    case 27: // Esc
                        break;
                    default:
                        event.stopPropagation();
                        event.preventDefault();
                        break;
                }
            }));

            on(onButton, 'keyup', lang.hitch(map, function(event) {
                switch (event.keyCode) {
                    case 38 : // up
                    case 40 : // down
                    case 37 : // left
                    case 39 : // right
                        var a;
                        this._moveStopHandler(a);
                        break;
                }
                switch (event.keyCode) {
                    case  9: // tab
                    case 33: // PgUp
                    case 34: // PgDn
                    case 27: // Esc
                        break;
                    default:
                        event.stopPropagation();
                        event.preventDefault();
                        break;
                }
            }));
        },

        _addPrint: function (tool, toolbar, panelClass) {
            //Add the print widget to the toolbar. TODO: test custom layouts.
            var deferred = new Deferred(),
            legendNode = null,
            print = null;


            require(["application/has-config!print?esri/dijit/Print"], lang.hitch(this, function (Print) {
                var layoutOptions = {
                    "titleText": this.config.title,
                    "scalebarUnit": this.config.units,
                    "legendLayers": []
                };
                if (!Print) {
                    deferred.resolve(false);
                    return;
                }

                var printDiv = toolbar.createTool(tool, panelClass);

                //get format
                this.format = "PDF"; //default if nothing is specified
                for (var i = 0; i < this.config.tools.length; i++) {
                    if (this.config.tools[i].name === "print") {
                        var f = this.config.tools[i].format;
                        this.format = f.toLowerCase();
                        break;
                    }
                }

                if (this.config.hasOwnProperty("tool_print_format")) {
                    this.format = this.config.tool_print_format.toLowerCase();
                }


                if (has("print-legend")) {
                    legendNode = domConstruct.create("input", {
                        id: "legend_ck",
                        className: "checkbox",
                        type: "checkbox",
                        checked: false
                    }, domConstruct.create("div", {
                        "class": "checkbox"
                    }));
                    var labelNode = domConstruct.create("label", {
                        "for": "legend_ck",
                        "className": "checkbox",
                        "innerHTML": this.config.i18n.tools.print.legend
                    }, domConstruct.create("div"));
                    domConstruct.place(legendNode, printDiv);
                    domConstruct.place(labelNode, printDiv);

                    on(legendNode, "change", lang.hitch(this, function (arg) {

                        if (legendNode.checked) {
                            var layers = arcgisUtils.getLegendLayers(this.config.response);
                            var legendLayers = array.map(layers, function (layer) {
                                return {
                                    "layerId": layer.layer.id
                                };
                            });
                            if (legendLayers.length > 0) {
                                layoutOptions.legendLayers = legendLayers;
                            }
                            array.forEach(print.templates, function (template) {
                                template.layoutOptions = layoutOptions;
                            });

                        } else {
                            array.forEach(print.templates, function (template) {
                                if (template.layoutOptions && template.layoutOptions.legendLayers) {
                                    template.layoutOptions.legendLayers = [];
                                }

                            });
                        }
                    }));
                }

                require(["application/has-config!print-layouts?esri/request", "application/has-config!print-layouts?esri/tasks/PrintTemplate"], lang.hitch(this, function (esriRequest, PrintTemplate) {
                    if (!esriRequest && !PrintTemplate) {
                        //Use the default print templates
                        var templates = [{
                            layout: "Letter ANSI A Landscape",
                            layoutOptions: layoutOptions,
                            label: this.config.i18n.tools.print.layouts.label1 + " ( " + this.format + " )",
                            format: this.format
                        },
                        {
                            layout: "Letter ANSI A Portrait",
                            layoutOptions: layoutOptions,
                            label: this.config.i18n.tools.print.layouts.label2 + " ( " + this.format + " )",
                            format: this.format
                        },
                        {
                            layout: "Letter ANSI A Landscape",
                            layoutOptions: layoutOptions,
                            label: this.config.i18n.tools.print.layouts.label3 + " ( image )",
                            format: "PNG32"
                        },
                        {
                            layout: "Letter ANSI A Portrait",
                            layoutOptions: layoutOptions,
                            label: this.config.i18n.tools.print.layouts.label4 + " ( image )",
                            format: "PNG32"
                        }];

                        print = new Print({
                            map: this.map,
                            id: "printButton",
                            templates: templates,
                            url: this.config.helperServices.printTask.url
                        }, domConstruct.create("div"));
                        domConstruct.place(print.printDomNode, printDiv, "first");

                        print.startup();



                        deferred.resolve(true);
                        return;
                    }

                    esriRequest({
                        url: this.config.helperServices.printTask.url,
                        content: {
                            "f": "json"
                        },
                        "callbackParamName": "callback"
                    }).then(lang.hitch(this, function (response) {
                        var layoutTemplate, templateNames, mapOnlyIndex, templates;

                        layoutTemplate = array.filter(response.parameters, function (param, idx) {
                            return param.name === "Layout_Template";
                        });

                        if (layoutTemplate.length === 0) {
                            console.log("print service parameters name for templates must be \"Layout_Template\"");
                            return;
                        }
                        templateNames = layoutTemplate[0].choiceList;


                        // remove the MAP_ONLY template then add it to the end of the list of templates
                        mapOnlyIndex = array.indexOf(templateNames, "MAP_ONLY");
                        if (mapOnlyIndex > -1) {
                            var mapOnly = templateNames.splice(mapOnlyIndex, mapOnlyIndex + 1)[0];
                            templateNames.push(mapOnly);
                        }

                        // create a print template for each choice
                        templates = array.map(templateNames, lang.hitch(this, function (name) {
                            var plate = new PrintTemplate();
                            plate.layout = plate.label = name;
                            plate.format = this.format;
                            plate.layoutOptions = layoutOptions;
                            return plate;
                        }));


                        print = new Print({
                            map: this.map,
                            templates: templates,
                            url: this.config.helperServices.printTask.url
                        }, domConstruct.create("div"));
                        domConstruct.place(print.printDomNode, printDiv, "first");

                        print.startup();
                        deferred.resolve(true);

                    }));
                }));
            }));

            return deferred.promise;
        },

        _addShare: function (tool, toolbar, panelClass) {
            //Add share links for facebook, twitter and direct linking.
            //Add the measure widget to the toolbar.
            var deferred = new Deferred();

            if (has("share")) {

                var shareDiv = toolbar.createTool(tool, panelClass);

                var shareDialog = new ShareDialog({
                    bitlyLogin: this.config.bitlyLogin,
                    bitlyKey: this.config.bitlyKey,
                    map: this.map,
                    image: this.config.sharinghost + "/sharing/rest/content/items/" + this.config.response.itemInfo.item.id + "/info/" + this.config.response.itemInfo.thumbnail,
                    title: this.config.title,
                    summary: this.config.response.itemInfo.item.snippet || ""
                }, shareDiv);
                domClass.add(shareDialog.domNode, "pageBody");
                shareDialog.startup();

                deferred.resolve(true);
            } else {
                deferred.resolve(false);
            }


            return deferred.promise;
        },

        _getEditableLayers: function (layers) {
            var layerInfos = [];
            array.forEach(layers, lang.hitch(this, function (layer) {

                if (layer && layer.layerObject) {
                    var eLayer = layer.layerObject;
                    if (eLayer instanceof FeatureLayer && eLayer.isEditable()) {
                        layerInfos.push({
                            "featureLayer": eLayer
                        });
                    }
                }
            }));
            return layerInfos;
        },

        _getBasemapGroup: function () {
            //Get the id or owner and title for an organizations custom basemap group.
            var basemapGroup = null;
            if (this.config.basemapgroup && this.config.basemapgroup.title && this.config.basemapgroup.owner) {
                basemapGroup = {
                    "owner": this.config.basemapgroup.owner,
                    "title": this.config.basemapgroup.title
                };
            } else if (this.config.basemapgroup && this.config.basemapgroup.id) {
                basemapGroup = {
                    "id": this.config.basemapgroup.id
                };
            }
            return basemapGroup;
        },

        _createMapUI: function () {
            if (!has("touch")) {
                //remove no-touch class from body
                domClass.remove(document.body, "no-touch");
            }

            require(["application/has-config!scalebar?esri/dijit/Scalebar"], lang.hitch(this, function (Scalebar) {
                if (!Scalebar) {
                    return;
                }
                var scalebar = new Scalebar({
                    map: this.map,
                    scalebarUnit: this.config.units
                });
            }));

            // Add map specific widgets like the Home  and locate buttons. Also add the geocoder.
            if (has("home")) {
                panelHome = domConstruct.create("div", {
                    id: "panelHome",
                    className: "icon-color tool",
                    innerHTML: "<div id='btnHome'></div>"
                }, dom.byId("panelTools"), 0);
                var home = new HomeButton({
                    map: this.map
                }, dom.byId("btnHome"));

                home.startup();

                homeButton = dojo.query(".homeContainer")[0];
                homeNode = dojo.query(".home")[0];
                dojo.empty(homeNode);
                homeHint = dojo.attr(homeButton, 'title');

                btnHome = domConstruct.create("input", {
                    type: 'image',
                    src: 'images/icons_' + this.config.icons + '/home.png',
                    alt: homeHint,
                    //title: homeHint,
                    'aria-label': homeHint,
                }, homeNode);
            }


            if (has("locate")) {
                panelLocate = domConstruct.create("div", {
                    id: "panelLocate",
                    className: "icon-color tool",
                    innerHTML: "<div id='btnLocate'></div>"
                    }, dom.byId("panelTools"), 1);
                var geoLocate = new LocateButton({
                    map: this.map
                }, dom.byId("btnLocate"));

                geoLocate.startup();

                locateButton = dojo.query(".locateContainer")[0];
                zoomLocateButton = dojo.query(".zoomLocateButton")[0];
                dojo.empty(zoomLocateButton);
                locateHint = dojo.attr(zoomLocateButton, 'title');

                domConstruct.create("input", {
                    type: 'image',
                    src: 'images/icons_' + this.config.icons + '/locate.png',
                    alt: locateHint,
                    'aria-label': locateHint,
                }, zoomLocateButton);
            }

            //Add the location search widget
            require(["application/has-config!search?esri/dijit/Search", "application/has-config!search?esri/tasks/locator"], lang.hitch(this, function (Search, Locator) {
                if (!Search && !Locator) {
                    //add class so we know we don't have to hide title since search isn't visible
                    domClass.add("panelTop", "no-search");
                    return;
                }

                var options = {
                    map: this.map,
                    addLayersFromMap: false
                };
                var searchLayers = false;
                var search = new Search(options, domConstruct.create("div", {
                    id: "search"
                }, "mapDiv"));
                var defaultSources = [];

                //setup geocoders defined in common config 
                if (this.config.helperServices.geocode && this.config.locationSearch) {
                    var geocoders = lang.clone(this.config.helperServices.geocode);
                    array.forEach(geocoders, lang.hitch(this, function (geocoder) {
                        if (geocoder.url.indexOf(".arcgis.com/arcgis/rest/services/World/GeocodeServer") > -1) {

                            geocoder.hasEsri = true;
                            geocoder.locator = new Locator(geocoder.url);

                            geocoder.singleLineFieldName = "SingleLine";

                            geocoder.name = geocoder.name || "Esri World Geocoder";

                            if (this.config.searchExtent) {
                                geocoder.searchExtent = this.map.extent;
                                geocoder.localSearchOptions = {
                                    minScale: 300000,
                                    distance: 50000
                                };
                            }
                            defaultSources.push(geocoder);
                        } else if (esriLang.isDefined(geocoder.singleLineFieldName)) {

                            //Add geocoders with a singleLineFieldName defined 
                            geocoder.locator = new Locator(geocoder.url);

                            defaultSources.push(geocoder);
                        }
                    }));
                }

                //add configured search layers to the search widget 
                var configuredSearchLayers = (this.config.searchLayers instanceof Array) ? this.config.searchLayers : JSON.parse(this.config.searchLayers);

                array.forEach(configuredSearchLayers, lang.hitch(this, function (layer) {

                    var mapLayer = this.map.getLayer(layer.id);
                    if (mapLayer) {
                        var source = {};
                        source.featureLayer = mapLayer;

                        if (layer.fields && layer.fields.length && layer.fields.length > 0) {
                            source.searchFields = layer.fields;
                            source.displayField = layer.fields[0];
                            source.outFields = ["*"];
                            searchLayers = true;
                            defaultSources.push(source);
                            if (mapLayer.infoTemplate) {
                                source.infoTemplate = mapLayer.infoTemplate;
                            }
                        }
                    }
                }));

                //Add search layers defined on the web map item 
                if (this.config.response.itemInfo.itemData && this.config.response.itemInfo.itemData.applicationProperties && this.config.response.itemInfo.itemData.applicationProperties.viewing && this.config.response.itemInfo.itemData.applicationProperties.viewing.search) {
                    var searchOptions = this.config.response.itemInfo.itemData.applicationProperties.viewing.search;

                    array.forEach(searchOptions.layers, lang.hitch(this, function (searchLayer) {
                        //we do this so we can get the title specified in the item
                        var operationalLayers = this.config.itemInfo.itemData.operationalLayers;
                        var layer = null;
                        array.some(operationalLayers, function (opLayer) {
                            if (opLayer.id === searchLayer.id) {
                                layer = opLayer;
                                return true;
                            }
                        });

                        if (layer && layer.hasOwnProperty("url")) {
                            var source = {};
                            var url = layer.url;
                            var name = layer.title || layer.name;

                            if (esriLang.isDefined(searchLayer.subLayer)) {
                                url = url + "/" + searchLayer.subLayer;
                                array.some(layer.layerObject.layerInfos, function (info) {
                                    if (info.id == searchLayer.subLayer) {
                                        name += " - " + layer.layerObject.layerInfos[searchLayer.subLayer].name;
                                        return true;
                                    }
                                });
                            }

                            source.featureLayer = new FeatureLayer(url);


                            source.name = name;


                            source.exactMatch = searchLayer.field.exactMatch;
                            source.displayField = searchLayer.field.name;
                            source.searchFields = [searchLayer.field.name];
                            source.placeholder = searchOptions.hintText;
                            defaultSources.push(source);
                            searchLayers = true;
                        }

                    }));
                }

                search.set("sources", defaultSources);

                search.startup();

                //noResultsBody = search.domNode.querySelector('.noResultsBody');
                //debugger;

                //set the first non esri layer as active if search layers are defined. 
                var activeIndex = 0;
                if (searchLayers) {
                    array.some(defaultSources, function (s, index) {
                        if (!s.hasEsri) {
                            activeIndex = index;
                            return true;
                        }
                    });


                    if (activeIndex > 0) {
                        search.set("activeSourceIndex", activeIndex);
                    }
                }


                if (search && search.domNode) {
                    domConstruct.place(search.domNode, "panelGeocoder");
            
                    esriIconDownArrowNode = dojo.query(".esriIconDownArrow")[0];
                    domClass.remove(esriIconDownArrowNode, "esriIconDownArrow");

                    esriIconDownArrowNode.innerHTML = 
                        '<img src="images\\downArrow.png" alt="Search in" width="20" height="20">';

                    searchInput = dojo.query(".searchInput")[0];
                    dojo.setAttr(searchInput, 'role', 'search');

                    esriIconZoomNode = dojo.query(".esriIconZoom")[0];
                    domClass.remove(esriIconZoomNode, "esriIconZoom");
                    esriIconZoomNode.innerHTML = 
                        '<img src="images\\searchZoom.png" alt="Search" width="20" height="20">';

                    esriIconCloseNode = dojo.query(".esriIconClose")[0]; 
                    domClass.remove(esriIconCloseNode, "esriIconClose");
                    esriIconCloseNode.innerHTML = 
                        '<img src="images\\searchClear.png" alt="Clear search" width="16" height="16">';

                }

            }));

            //create the tools
            this._createUI();
        },
 
        _updateTheme: function () {

            //Set the background color using the configured theme value
            query(".bg").style("backgroundColor", this.theme.toString());
            query(".esriPopup .pointer").style("backgroundColor", this.theme.toString());
            query(".esriPopup .titlePane").style("backgroundColor", this.theme.toString());


            //Set the font color using the configured color value
            query(".fc").style("color", this.color.toString());
            query(".esriPopup .titlePane").style("color", this.color.toString());
            query(".esriPopup. .titleButton").style("color", this.color.toString());


            //Set the Slider +/- color to match the icon style. Valid values are white and black
            // White is default so we just need to update if using black.
            //Also update the menu icon to match the tool color. Default is white.
            if (this.config.icons === "black") {
                query(".esriSimpleSlider").style("color", "#000");
                query(".icon-color").style("color", "#000");
            }

            var styleSheetList = document.styleSheets;
            var styleCss = null;
            for(i=0; i<styleSheetList.length; i++) {
                css = styleSheetList[i];
                if(css.href.indexOf('styles1.css')>0) {
                    styleCss = css;
                    break;
                }
            };

            if(styleCss) {
                for(i=0; i<styleCss.cssRules.length; i++) {
                    rule = styleCss.cssRules[i];
                    if(typeof(rule.selectorText)!='undefined' && rule.selectorText!=null) {
                        //hover
                        if(rule.selectorText.indexOf(':hover') >= 0) {
                            rule.style['backgroundColor'] = this.hoverColor;
                        }
                        //focus
                        if(rule.selectorText.indexOf(':focus') >= 0) {
                            rule.style['outlineColor'] = this.focusColor;
                        }
                        //active
                        if(rule.selectorText.indexOf('.activeMarker') >= 0) {
                            rule.style['backgroundColor'] = this.activeColor;
                        }
                    }
                }
            }
            //debugger;
        },

        _checkExtent: function () {
            var pt = this.map.extent.getCenter();
            if (!this.initExt.contains(pt)) {
                this.map.setExtent(this.mapExt);
            } else {
                this.mapExt = this.map.extent;
            }
        },
 
        _adjustPopupSize: function () {
            if (!this.map) {
                return;
            }
            var box = domGeometry.getContentBox(this.map.container);

            var width = 270,
            height = 300,
            newWidth = Math.round(box.w * 0.50),
            newHeight = Math.round(box.h * 0.35);
            if (newWidth < width) {
                width = newWidth;
            }
            if (newHeight < height) {
                height = newHeight;
            }
            this.map.infoWindow.resize(width, height);
        },
 
        _createWebMap: function (itemInfo) {

            window.config = this.config;

            var options = {};
            //specify center and zoom if provided as url params 
            if (this.config.level) {
                options.zoom = this.config.level;
            }
            if (this.config.center) {
                var points = this.config.center.split(",");
                if (points && points.length === 2) {
                    options.center = [parseFloat(points[0]), parseFloat(points[1])];
                }

            }


            // create a map based on the input web map id
            arcgisUtils.createMap(itemInfo, "mapDiv", {
                mapOptions: options,
                editable: has("edit"),
                //is the app editable
                usePopupManager: true,
                bingMapsKey: this.config.bingKey
            }).then(lang.hitch(this, function (response) {

                this.map = response.map;
                domClass.add(this.map.infoWindow.domNode, "light");
                this._updateTheme();

                //Add a logo if provided
                if (this.config.logo) {
                    domConstruct.create("div", {
                        id: "panelLogo",
                        innerHTML: "<img id='logo' src=" + this.config.logo + " alt=''></>"
                    }, dom.byId("panelTitle"), "first");
                    domClass.add("panelTop", "largerTitle");
                }

                //Set the application title
                //this.map = response.map;
                //Set the title - use the config value if provided.
                //var title = (this.config.title === null) ? response.itemInfo.item.title : this.config.title;
                var title;
                if (this.config.title === null || this.config.title === "") {
                    title = response.itemInfo.item.title + " - WCAG Viewer";
                } else {
                    title = this.config.title+': '+response.itemInfo.item.title + " - WCAG Viewer";
                }

                //if title is short make title area smaller
                if (title && title.length && title.length === 0) {
                    domClass.add("panelTop", "smallerTitle");
                } else if (title && title.length && title.length <= 20 && !this.config.logo) {
                    domClass.add("panelTop", "smallerTitle");
                }


                document.title = title;
                if (this.config.title === null || this.config.title === "") {
                    dom.byId("panelText").innerHTML = response.itemInfo.item.title; //title;
                }
                else {
                    dom.byId("panelText").innerHTML = this.config.title;
                }
                this.config.title = title;
                this.config.response = response;
                window.config = this.config;

                if (this.initExt !== null) {
                    this.map.setExtent(this.initExt);
                }
                this.initExt = this.map.extent;
                on.once(this.map, "extent-change", lang.hitch(this, this._checkExtent));
                on(this.map, "extent-change", function() {
                    var imgs = this.container.querySelectorAll("img");
                    for(i=0; i<imgs.length; i++)
                        domAttr.set(imgs[i],'alt','');

                    // // mapDiv_layers
                    // var images = this.container.querySelectorAll("image");
                    // for(i=0; i<images.length; i++)
                    //     domAttr.set(images[i],'tabindex','0');
                });

                this._createMapUI();
                // make sure map is loaded
                if (this.map.loaded) {
                    // do something with the map
                    this._mapLoaded();
                } else {
                    on.once(this.map, "load", lang.hitch(this, function () {
                        // do something with the map
                        this._mapLoaded();
                    }));
                }
            }), this.reportError);
        },

        _atachEnterKey: function(onButton, clickButton) {
            on(onButton, 'keyup', lang.hitch(clickButton, function(event){
            if(event.keyCode=='13')
                this.click();
            }));
        }
    });
});
