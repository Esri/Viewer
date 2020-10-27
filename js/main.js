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
define([
  "dojo/ready",
  "dojo/json",

  "dojo/i18n!esri/nls/jsapi",

  "dojo/_base/array",
  "dojo/_base/Color",
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/_base/kernel",

  "dojo/dom",
  "dojo/dom-geometry",
  "dojo/dom-attr",
  "dojo/dom-class",
  "dojo/dom-construct",
  "dojo/dom-style",

  "dojo/on",
  "dojo/Deferred",
  "dojo/promise/all",
  "dojo/query",

  "dijit/registry",
  "dijit/focus",
  "dijit/a11y",

  "application/toolbar",
  "application/has-config",
  "application/MapUrlParams",

  "esri/arcgis/utils",
  "esri/lang",
  "esri/urlUtils",

  "esri/layers/FeatureLayer",
  "esri/tasks/query",

  "esri/dijit/HomeButton",
  "esri/dijit/LocateButton",
  "esri/dijit/Legend",
  "esri/dijit/BasemapGallery",
  "esri/dijit/Measurement",
  "esri/dijit/OverviewMap",
  "esri/dijit/LayerList"

], function (
  ready, JSON,

  esriBundle,

  array, Color, declare, lang, kernel,

  dom, domGeometry, domAttr, domClass,
  domConstruct, domStyle,

  on, Deferred, all, query,

  registry, focusUtil, a11y,

  Toolbar, has,
  MapUrlParams,

  arcgisUtils, esriLang, urlUtils,
  FeatureLayer, Query

) {
  return declare(null, {
    config: {},
    color: null,
    theme: null,
    map: null,
    mapExt: null,
    editorDiv: null,
    editor: null,
    editableLayers: null,
    focusHandle: null,
    blurHandle: null,
    extentHandle: null,
    shareDialog: null,
    once: true,
    timeFormats: ["shortDateShortTime", "shortDateLEShortTime",
      "shortDateShortTime24", "shortDateLEShortTime24",
      "shortDateLongTime", "shortDateLELongTime",
      "shortDateLongTime24", "shortDateLELongTime24"
    ],
    startup: function (config) {
      // Set lang attribute to current locale
      document.documentElement.lang = kernel.locale;

      // config will contain application and user defined info for the template such as i18n strings, the web map id
      // and application id and any url parameters and any application specific configuration information.
      if (config) {
        this.config = config;
        if (this.config.sharedThemeConfig && this.config.sharedThemeConfig.attributes && this.config.sharedThemeConfig.attributes.theme) {
          var sharedTheme = this.config.sharedThemeConfig.attributes;
          var logo = (sharedTheme && sharedTheme.theme && sharedTheme.theme.logo && sharedTheme.theme.logo.small) ? sharedTheme.theme.logo.small : null
          this.config.logo = sharedTheme.layout.header.component.settings.logoUrl || logo;
          this.config.color = sharedTheme.theme.text.color;
          this.config.theme = sharedTheme.theme.body.bg;
        }
        this.color = this._setColor(this.config.color);
        this.theme = this._setColor(this.config.theme);
        this.iconColor = this._setColor(this.config.iconColor);
        this.panelBackground = this._setColor(this.config.panelBackground);
        this.panelColor = this._setColor(this.config.panelColor);

        // Apply custom theme css
        var customTheme = document.createElement("link");
        customTheme.setAttribute("rel", "stylesheet");
        customTheme.setAttribute("type", "text/css");
        customTheme.setAttribute("href", "css/theme/" + this.config.customLayout + ".css");
        document.head.appendChild(customTheme);

        // Create and add custom style sheet
        if (this.config.customstyle) {
          var style = document.createElement("style");
          style.appendChild(document.createTextNode(this.config.customstyle));
          document.head.appendChild(style);
        }


        // document ready
        ready(lang.hitch(this, function () {
          //supply either the webmap id or, if available, the item info
          var itemInfo = this.config.itemInfo || this.config.webmap;

          var mapParams = new MapUrlParams({
            center: this.config.center || null,
            extent: this.config.extent || null,
            level: this.config.level || null,
            marker: this.config.marker || null,
            mapSpatialReference: itemInfo.itemData.spatialReference,
            defaultMarkerSymbol: this.config.markerSymbol,
            defaultMarkerSymbolWidth: this.config.markerSymbolWidth,
            defaultMarkerSymbolHeight: this.config.markerSymbolHeight,
            geometryService: this.config.helperServices.geometry
              .url
          });


          mapParams.processUrlParams().then(lang.hitch(this,
            function (urlParams) {
              if (!this.config.showSlider) {
                urlParams.mapOptions.slider = false;
              }
              this._createWebMap(itemInfo, urlParams);
            }), lang.hitch(this, function (error) {
              this.reportError(error);
            }));


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
    // Map is ready
    _mapLoaded: function () {
      query(".esriSimpleSlider").style("backgroundColor", this.theme.toString());

      // remove loading class from body
      domClass.remove(document.body, "app-loading");
      if (!this.config.popupPanel) {
        //on(this.map.infoWindow, "selection-change", lang.hitch(this, this._movePopup));
        on(window, "orientationchange", lang.hitch(this, this._adjustPopupSize));
        this._adjustPopupSize();
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

        if (this.config.popupPanel) {
          require(["application/PopupPanel"], lang.hitch(this,
            function (PopupPanel) {
              this.map.infoWindow.set("popupWindow", false);
              var popupPane = new PopupPanel({
                popup: this.map.infoWindow,
                srcNode: "popupContainer",
                toolbar: toolbar
              });
              popupPane.initPopup();
            }));
        }

        var toolList = [];
        for (var i = 0; i < this.config.tools.length; i++) {
          switch (this.config.tools[i].name) {
            case "legend":
              toolList.push(this._addLegend(this.config.tools[i],
                toolbar, "medium"));
              break;
            case "bookmarks":
              toolList.push(this._addBookmarks(this.config.tools[
                i], toolbar, "medium"));
              break;
            case "layers":
              toolList.push(this._addLayers(this.config.tools[i],
                toolbar, "medium"));
              break;
            case "basemap":
              toolList.push(this._addBasemapGallery(this.config.tools[
                i], toolbar, "large"));
              break;
            case "overview":
              toolList.push(this._addOverviewMap(this.config.tools[
                i], toolbar, "medium"));
              break;
            case "measure":
              toolList.push(this._addMeasure(this.config.tools[i],
                toolbar, "small"));
              break;
            case "edit":
              toolList.push(this._addEditor(this.config.tools[i],
                toolbar, "medium"));
              break;
            case "print":
              toolList.push(this._addPrint(this.config.tools[i],
                toolbar, "small"));
              break;
            case "details":
              toolList.push(this._addDetails(this.config.tools[i],
                toolbar, "medium"));
              break;
            case "share":
              toolList.push(this._addShare(this.config.tools[i],
                toolbar, "medium"));
              break;
            default:
              break;
          }
        }

        all(toolList).then(lang.hitch(this, function (results) {
          this._showSplashScreen(toolbar);

          //If all the results are false and locate and home are also false we can hide the toolbar
          var tools = array.some(results, function (r) {
            return r;
          });
          //No tools are specified in the configuration so hide the panel and update the title area styles
          if (!tools) {
            domClass.add(document.body, "notools");
            domConstruct.destroy("panelTools");
            domStyle.set("panelContent", "display",
              "none");
            domStyle.set("panelTitle", "border-bottom",
              "none");
            domStyle.set("panelTop", "height", "75px");
            domStyle.set("panelTitle", "margin-top",
              "12px");
            return;
          }
          // if no tools are active let's setup support for setting
          on(toolbar, "updateTool", lang.hitch(this, this._updateTool));
          domStyle.set("panelPages", "visibility", "visible");
          if (this.config.customLayout === "sidebartools") {
            if (toolbar.pTools.children.length && toolbar.pTools.children.length > 0) {
              var h = (toolbar.pTools.children.length) * 30;
              domStyle.set("panelTools", "height", h + "px");
            }
          }
          //Now that all the tools have been added to the toolbar we can add page naviagation to the toolbar panel
          this.updateAriaInfo();
          toolbar.updatePageNavigation();

        }));
      }));
    },
    _updateTool: function (name) {
      if (name === "measure") {
        this._destroyEditor();
        this.map.setInfoWindowOnClick(false);
      } else if (name === "edit") {
        this._destroyEditor();
        this.map.setInfoWindowOnClick(false);
        this.map.infoWindow.clearFeatures();
        this._createEditor();
        var pageEdit = dom.byId("page_edit");
        if (pageEdit) {
          domClass.remove(pageEdit, "hide");
        }
      } else {
        //activate the popup and destroy editor if necessary
        this._destroyEditor();
        this.map.setInfoWindowOnClick(true);
      }

      // Shorten the url for copied links. Do
      // this once if current view isn't checked
      // Do each time extent changes if extent is checked
      if (name === "share") {
        // clicked on share so setup extent handler
        // setup extent change event if the dialog is open and check box is checked.
        if (this.shareDialog) {
          this.shareDialog.updateUrl();

          if (!this.extentHandle) {
            this.extentHandle = on.pausable(this.map, "extent-change", lang.hitch(this, function () {
              if (this.shareDialog.useExtent) {
                this.shareDialog.updateUrl();
              }
            }));
          } else {
            this.extentHandle.resume();
          }
        }
      } else {
        // destroy extent handler
        if (this.extentHandle) {
          this.extentHandle.pause();
        }
      }
      if (has("measure") && name !==
        "measure") {
        query(".esriMeasurement").forEach(
          lang.hitch(this, function (node) {
            var m = registry.byId(node.id);
            if (m) {
              m.clearResult();
              m.setTool("location", false);
              m.setTool("area", false);
              m.setTool("distance", false);
            }
          }));
      }
      if ((this.config.customLayout === "default" || this.config.customLayout === "rounded") && this.once) {
        this.once = false;
        var panel = dom.byId("panelContent");
        var titlebox = domGeometry.getContentBox(dom.byId("panelTop"));
        var mapbox = domGeometry.getContentBox(dom.byId("mapDiv"));
        if (mapbox.w && titlebox.w) {
          var spacer = mapbox.w - titlebox.w;
          if (spacer < 350) {
            domStyle.set(panel, "top", "90px");
          } else {
            domStyle.set(panel, "top", "10px");
          }
        }
      }
    },
    _setActiveTool: function (toolbar) {
      if (!this.config.activeTool || this.config.activeTool === "") {
        if (toolbar.pTools && toolbar.pTools.children && toolbar.pTools.children.length && toolbar.pTools.children.length > 0) {
          var tool = dom.byId(toolbar.pTools.children[0].id);
          domAttr.set(tool, "tabindex", "0");
          this.config.activeTool = tool.name || "";
        }
      } else if (this.config.activeTool) {
        query(".pressed").forEach(function (n) {
          focusUtil.focus(n);
        });
        toolbar.activateTool(this.config.activeTool);
        this._updateTool(this.config.activeTool);
      }
    },
    _showSplashScreen: function (toolbar) {
      // Setup the modal overlay if enabled
      if (this.config.splashModal) {
        domClass.add(document.body, "noscroll");
        domClass.remove("modal", "hide");
        domAttr.set("modal", "aria-label", this.config.splashTitle || "Splash Screen");
        // set focus to the dialog
        var node = dom.byId("modal");
        var closeOverlay = dom.byId("closeOverlay");
        focusUtil.focus(node);

        var title = this.config.splashTitle || "";
        var content = this.config.splashContent || "";
        dom.byId("modalTitle").innerHTML = title;
        dom.byId("modalContent").innerHTML = content;

        closeOverlay.value = this.config.splashButtonText || this.config.i18n.nav.close;

        // Close button handler for the overlay
        on(closeOverlay, "click", lang.hitch(
          this,
          function () {
            // set focus to active tool if we have one
            this._setActiveTool(toolbar);
            domClass.remove(document.body, "noscroll");
            domClass.add("modal", "hide");
          }));
      } else {
        this._setActiveTool(toolbar);
      }
    },
    _addBasemapGallery: function (tool, toolbar, panelClass) {
      //Add the basemap gallery to the toolbar.
      var deferred = new Deferred();
      if (has("basemap")) {
        require(["esri/dijit/BasemapGallery"], lang.hitch(this, function (BasemapGallery) {
          var basemapDiv = toolbar.createTool(tool, panelClass);
          var basemap = new BasemapGallery({
            id: "basemapGallery",
            bingMapsKey: this.config.orgInfo.bingKey || "",
            map: this.map,
            showArcGISBasemaps: true,
            portalUrl: this.config.sharinghost,
            basemapsGroup: this._getBasemapGroup()
          }, domConstruct.create("div", {}, basemapDiv));
          basemap.startup();
          deferred.resolve(true);
        }));
      } else {
        deferred.resolve(false);
      }
      return deferred.promise;
    },

    _addBookmarks: function (tool, toolbar, panelClass) {
      //Add the bookmarks tool to the toolbar. Only activated if the webmap contains bookmarks.
      var deferred = new Deferred();
      if (this.config.response.itemInfo.itemData.bookmarks) {
        //Conditionally load this module since most apps won't have bookmarks
        require([
          "application/has-config!bookmarks?esri/dijit/Bookmarks"
        ], lang.hitch(this, function (Bookmarks) {
          if (!Bookmarks) {
            deferred.resolve(false);
            return;
          }
          var bookmarkDiv = toolbar.createTool(tool, panelClass);
          var bookmarks = new Bookmarks({
            map: this.map,
            bookmarks: this.config.response.itemInfo.itemData
              .bookmarks
          }, domConstruct.create("div", {}, bookmarkDiv));
          bookmarks.startup();

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
        var description = this.config.description || this.config.response
          .itemInfo.item.description || this.config.response.itemInfo
            .item.snippet;
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
          var altDesc = esriLang.stripTags(description);
          var detailDiv = toolbar.createTool(tool, panelClass);
          domAttr.set(detailDiv, "aria-label", altDesc);
          detailDiv.innerHTML = "<div class='desc' tabindex='0'>" +
            description + "</div>";
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
      this.editableLayers = this._getEditableLayers(this.config.response
        .itemInfo.itemData.operationalLayers);
      if (has("edit") && this.editableLayers.length > 0) {
        if (this.editableLayers.length > 0) {
          this.editorDiv = toolbar.createTool(tool, panelClass);
          this._setupEditablePopup();
          deferred.resolve(true);
        } else {
          deferred.resolve(false);
        }
      } else {
        deferred.resolve(false);
      }
      return deferred.promise;
    },
    _setupEditablePopup: function () {

      function getPointFromGeometry(geometry) {
        if (!geometry) {
          return;
        }
        if (geometry.type === "polygon") {
          return geometry.getCentroid();
        }
        if (geometry.type === "extent") {
          return geometry.getCenter();
        }
        if (geometry.type === "point") {
          return geometry;
        }
        if (geometry.type === "polyline") {
          return geometry.getPoint(0, 0);
        }
        if (geometry.type === "multipoint") {
          return geometry.getPoint(0);
        }
      }

      var link = domConstruct.create("a", {
        "class": "action edit",
        "id": "editLink",
        "innerHTML": this.config.i18n.tooltips.edit,
        "href": "javascript: void(0);"
      }, query(".actionList", this.map.infoWindow.domNode)[0]);
      on(link, "click", lang.hitch(this, function () {
        var selectedFeature = this.map.infoWindow.getSelectedFeature();
        this.map.infoWindow.hide();

        this._createEditor().then(lang.hitch(this, function () {
          var editTool = dom.byId("panelTool_edit");
          editTool.click();
          if (selectedFeature && selectedFeature._layer) {
            domStyle.set(link, "visibility", "hidden");
            var id = selectedFeature.attributes[selectedFeature._layer.objectIdField];
            var query = new Query();
            query.objectIds = [id];
            selectedFeature._layer.selectFeatures(query).then(lang.hitch(this, function (result) {
              // TODO: Research to see if these private properties are needed
              this.editor._currentGraphic = selectedFeature;
              this.editor._activateEditToolbar(selectedFeature);

              this.editor.attributeInspector.showFeature(selectedFeature, selectedFeature._layer);
              var location = getPointFromGeometry(selectedFeature.geometry);
              this.map.infoWindow.show(location);
            }));
          }
        }));
      }));

      on(this.map.infoWindow, "show", lang.hitch(this, function () {
        //   this._updateLink(link);
      }));
      on(this.map.infoWindow, "selection-change", lang.hitch(this, function () {
        this._updateLink(link);
      }));
    },
    _updateLink: function (link) {

      var selected = this.map.infoWindow.getSelectedFeature();
      var isAttributeInspector = false;
      query(".esriAttributeInspector").forEach(function (node) {
        isAttributeInspector = true;
      });

      if (selected && selected._layer && typeof selected._layer.isEditable === "function" && selected._layer.isEditable() && !isAttributeInspector) {
        // show editable link
        domStyle.set(link, "visibility", "visible");
      } else { // hide editable link
        domStyle.set(link, "visibility", "hidden");
      }
    },
    _createEditor: function () {
      var deferred = new Deferred();
      //Dynamically load since many apps won't have editable layers
      require([
        "application/has-config!edit?esri/dijit/editing/Editor"
      ], lang.hitch(this, function (Editor) {
        if (!Editor) {
          deferred.resolve(false);
          return;
        }
        this._destroyEditor();
        //add field infos if necessary. Field infos will contain hints if defined in the popup and hide fields where visible is set
        //to false. The popup logic takes care of this for the info window but not the edit window.
        var editableLayers = [];
        array.forEach(this.editableLayers, lang.hitch(this,
          function (layer) {

            if (layer.featureLayer && layer.featureLayer.infoTemplate &&
              layer.featureLayer.infoTemplate.info && layer
                .featureLayer.infoTemplate.info.fieldInfos && layer.featureLayer.visible) {
              editableLayers.push(layer);
              //only display visible fields
              var fields = layer.featureLayer.infoTemplate.info
                .fieldInfos;
              var fieldInfos = [];
              array.forEach(fields, lang.hitch(this,
                function (field) {
                  //added support for editing date and time
                  if (field.format && field.format.dateFormat &&
                    array.indexOf(this.timeFormats,
                      field.format.dateFormat) > -1) {
                    field.format = {
                      time: true
                    };
                  }
                  //Only add visible fields
                  if (field.visible) {
                    fieldInfos.push(field);
                  }
                }));

              layer.fieldInfos = fieldInfos;
            }
          }));
        var settings = {
          map: this.map,
          layerInfos: editableLayers, //this.editableLayers,
          toolbarVisible: has("edit-toolbar")
        };

        this.map.enableSnapping();
        //show the editor panel so layers render in the widget correctly.

        var editNode = dom.byId("page_edit");
        if (editNode) {
          domClass.remove(editNode, "hide");
        }
        if (this.editor === null) {
          this.editor = new Editor({
            settings: settings
          }, domConstruct.create("div", {}, this.editorDiv));
          this.editor.on("load", lang.hitch(this, function () {
            if (has("edit-toolbar")) {
              query(".templatePicker").addClass("templatePicker-toolbar");
            }
          }), function (error) {
            if (editNode) {
              domClass.add(editNode, "hide");
            }
            deferred.resolve(true);
          });
          this.editor.startup();
          deferred.resolve(true);
        } else {
          deferred.resolve(true);
        }
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

          require(["esri/dijit/LayerList"], lang.hitch(this, function (LayerList) {
            //Use small panel class if layer layer is less than 5
            if (layers.length < 5) {
              panelClass = "small";
            } else if (layers.length < 15) {
              panelClass = "medium";
            } else {
              panelClass = "large";
            }
            var layersDiv = toolbar.createTool(tool, panelClass);

            var toc = new LayerList({
              map: this.map,
              showSubLayers: has("layers-sublayers"),
              subLayers: has("layers-sublayers"),
              showLegend: has("layers-legend"),
              showOpacitySlider: has("layers-opacity"),
              layers: arcgisUtils.getLayerList(this.config.response)
            }, domConstruct.create("div", {}, layersDiv));

            toc.startup();

            toc.on("toggle", lang.hitch(this, function () {
              var legend = registry.byId("mapLegend");
              if (legend) {
                legend.refresh();
              }
            }));
            deferred.resolve(true);
          }));
        } else {
          deferred.resolve(false);
        }
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
          require(["esri/dijit/Legend"], lang.hitch(this, function (Legend) {
            var legendDiv = toolbar.createTool(tool, panelClass);
            domAttr.set(legendDiv, "tabindex", 0);
            var legend = new Legend({
              map: this.map,
              id: "mapLegend",
              layerInfos: layers
            }, domConstruct.create("div", {}, legendDiv));

            domClass.add(legend.domNode, "legend");
            legend.startup();

            deferred.resolve(true);
          }));
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

        require(["esri/dijit/Measurement"], lang.hitch(this, function (Measurement) {
          var measureDiv = toolbar.createTool(tool, panelClass);
          domAttr.set(measureDiv, "tabindex", "0");
          var areaUnit = (this.config.units === "metric") ?
            "esriSquareKilometers" : "esriSquareMiles";
          var lengthUnit = (this.config.units === "metric") ?
            "esriKilometers" : "esriMiles";

          var measure = new Measurement({
            map: this.map,
            defaultAreaUnit: areaUnit,
            defaultLengthUnit: lengthUnit
          }, domConstruct.create("div", {}, measureDiv));

          measure.startup();

          query(".esriMeasurement .dijitButtonNode").forEach(
            function (node) {
              domAttr.set(node, "tabindex", "0");
              domAttr.set(node, "role", "button");
            });
          query(
            ".esriMeasurement .dijitButtonNode .dijitButtonContents")
            .forEach(function (node) {
              domAttr.set(node, "tabindex", "-1");
            });
          deferred.resolve(true);
        }));

      } else {
        deferred.resolve(false);
      }

      return deferred.promise;
    },
    _addOverviewMap: function (tool, toolbar, panelClass) {
      //Add the overview map to the toolbar
      var deferred = new Deferred();

      if (has("overview")) {
        require(["esri/dijit/OverviewMap"], lang.hitch(this, function (OverviewMap) {
          var ovMapDiv = toolbar.createTool(tool, panelClass);
          domStyle.set(ovMapDiv, {
            "height": "100%",
            "width": "100%"
          });
          domAttr.set("pageBody_overview", "tabindex", "-1");

          on.once(dom.byId("panelTool_overview"), "focus", lang.hitch(
            this,
            function () {
              var ovMap = new OverviewMap({
                id: "overviewMap",
                map: this.map,
                height: "auto"
              }, domConstruct.create("div", {}, ovMapDiv));
              ovMap.startup();

              query(".ovwHighlight").forEach(function (node) {
                domAttr.set(node, "tabindex", "0");
                domAttr.set(node, "aria-label", this.config.i18n.map.overviewDetails);
              });
            }));
          on(this.map, "layer-add", lang.hitch(this, function (args) {
            //delete and re-create the overview map if the basemap gallery changes
            if (args.layer.hasOwnProperty(
              "_basemapGalleryLayerType") && args.layer._basemapGalleryLayerType ===
              "basemap") {
              var ov = registry.byId("overviewMap");
              if (ov) {
                ov.destroy();
              }
              on.once(dom.byId("panelTool_overview"), "focus",
                lang.hitch(this, function () {
                  var ovMap = new OverviewMap({
                    id: "overviewMap",
                    map: this.map,
                    //height: panelHeight,
                    visible: false
                  }, domConstruct.create("div", {},
                    ovMapDiv));

                  ovMap.startup();
                }));
            }
          }));
          deferred.resolve(true);
        }));
      } else {
        deferred.resolve(false);
      }

      return deferred.promise;
    },
    _addPrint: function (tool, toolbar, panelClass) {
      //Add the print widget to the toolbar
      var deferred = new Deferred();
      require(["application/has-config!print?application/PrintConfig",
        "application/has-config!print?esri/dijit/Print"
      ], lang.hitch(this, function (PrintConfig, Print) {
        if (!PrintConfig || !Print) {
          deferred.resolve(false);
          return;
        }
        var printDiv = toolbar.createTool(tool, panelClass);
        var format = null;
        array.forEach(this.config.tools, function (tool) {
          if (tool.name === "print") {
            format = tool.format;
          }
        });
        if (this.config.hasOwnProperty("tool_print_format")) {
          format = this.config.tool_print_format;
        }
        var layoutOptions = {
          "titleText": this.config.title,
          "scalebarUnit": this.config.units,
          "legendLayers": []
        };
        var printOptions = {
          legendLayers: this.config.response,
          layouts: has("print-layouts"),
          format: format.toLowerCase() || null,
          printTaskUrl: this.config.helperServices.printTask.url,
          printi18n: this.config.i18n.tools.print,
          layoutOptions: layoutOptions
        };
        if (this.config.helperServices.printTask && this.config
          .helperServices.printTask.templates) {
          printOptions.templates = this.config.helperServices.printTask
            .templates;
        }
        var printConfig = new PrintConfig(printOptions);
        printConfig.createPrintOptions().then(lang.hitch(this,
          function (results) {
            var templates = results.templates;
            var legendLayers = results.legendLayers;

            //add a text box so users can enter a custom title
            var titleNode = domConstruct.create("input", {
              id: "print_title",
              className: "printTitle",
              tabindex: "0",
              role: "textbox",
              type: "text",
              "aria-label": this.config.i18n.tools.print
                .titlePrompt,
              placeholder: this.config.i18n.tools.print
                .titlePrompt
            }, domConstruct.create("div"));

            domConstruct.place(titleNode, printDiv);
            if (has("print-legend")) {
              var legendNode = domConstruct.create("input", {
                id: "legend_ck",
                role: "checkbox",
                tabindex: "0",
                className: "checkbox",
                type: "checkbox",
                checked: false
              }, domConstruct.create("div", {
                "class": "checkbox"
              }));

              var labelNode = domConstruct.create("label", {
                "for": "legend_ck",
                "className": "checkbox",
                "innerHTML": "  " + this.config.i18n.tools
                  .print.legend
              }, domConstruct.create("div"));
              domConstruct.place(legendNode, printDiv);
              domConstruct.place(labelNode, printDiv);

              on(legendNode, "change", lang.hitch(this,
                function (arg) {
                  if (legendNode.checked &&
                    legendLayers.length > 0) {
                    layoutOptions.legendLayers = legendLayers;
                  } else {
                    layoutOptions.legendLayers = [];
                  }
                  array.forEach(this.print.templates,
                    lang.hitch(this, function (
                      template) {
                      template.layoutOptions = layoutOptions;
                    }));
                }));

            } else {
              domStyle.set("pageBody_print", "height",
                "90px");
            }
            var printOptions = {
              map: this.map,
              id: "printButton",
              url: this.config.helperServices.printTask.url
            };
            if (templates) {
              printOptions.templates = templates;
            }
            // Add a loading indicator to the Printing label
            esriBundle.widgets.print.NLS_printing = esriBundle.widgets.print.NLS_printing +
              "<img class='loadPrint' src='./images/loading-small.png'/> ";
            this.print = new Print(printOptions,
              domConstruct.create("div"));

            domConstruct.place(this.print.printDomNode, printDiv, "last");

            this.print.on("print-start", lang.hitch(this,
              function () {
                var printBox = dom.byId("print_title");
                if (printBox.value) {
                  array.forEach(this.print.templates,
                    lang.hitch(this, function (
                      template) {
                      template.layoutOptions.titleText = printBox.value;
                    }));
                }
              }));

            this.print.startup();
          }));
        deferred.resolve(true);
        return;

      }));
      return deferred.promise;
    },
    _addShare: function (tool, toolbar, panelClass) {
      //Add share links for facebook, twitter and direct linking.
      //Add the measure widget to the toolbar.
      var deferred = new Deferred();

      if (has("share")) {
        require(["application/ShareDialog"], lang.hitch(this, function (ShareDialog) {
          var shareDiv = toolbar.createTool(tool, panelClass);

          this.shareDialog = new ShareDialog({
            bitlyLogin: this.config.bitlyLogin,
            bitlyKey: this.config.bitlyKey,
            map: this.map,
            embedVisible: has("share-embed"),
            image: this.config.sharinghost +
              "/sharing/rest/content/items/" + this.config.response
                .itemInfo.item.id + "/info/" + this.config.response.itemInfo
                .thumbnail,
            title: this.config.title,
            summary: this.config.response.itemInfo.item.snippet ||
              ""
          }, shareDiv);
          domClass.add(this.shareDialog.domNode, "pageBody");
          this.shareDialog.startup();
          deferred.resolve(true);
        }));
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

      if (this.config.basemapgroup && this.config.basemapgroup.title &&
        this.config.basemapgroup.owner) {
        basemapGroup = {
          "owner": this.config.basemapgroup.owner,
          "title": this.config.basemapgroup.title
        };
      } else if (this.config.basemapgroup && this.config.basemapgroup
        .id) {
        basemapGroup = {
          "id": this.config.basemapgroup.id
        };
      }
      return basemapGroup;
    },

    _createMapUI: function () {
      // Add map specific widgets like the Home  and locate buttons. Also add the geocoder.
      if (this.config.showSlider) {
        // Don't show home if slider isn't enabled
        require(["esri/dijit/HomeButton"], lang.hitch(this, function (HomeButton) {
          var home = new HomeButton({
            map: this.map
          }, domConstruct.create("div", {}, query(
            ".esriSimpleSliderIncrementButton")[0], "after"));
          home.startup();
          query(".home span").forEach(function (node) {
            domAttr.set(node, {
              "aria-hidden": "true",
              "role": "presentation"
            });
            domConstruct.create("span", {
              className: "icon-home",
              "aria-label": esriBundle.widgets.homeButton.home.title || "Default map view"
            }, node, "after");
          });
          query(".esriSimpleSlider").addClass("homeEnabled");
        }));
      } else {
        domClass.add(document.body, "noslider");
      }

      require(["application/has-config!scalebar?esri/dijit/Scalebar"],
        lang.hitch(this, function (Scalebar) {
          if (!Scalebar) {
            return;
          }
          var scalebar = new Scalebar({
            map: this.map,
            scalebarUnit: this.config.units
          });

        }));
      if (has("locate")) {
        require(["esri/dijit/LocateButton"], lang.hitch(this, function (LocateButton) {
          var geoLocate = new LocateButton({
            map: this.map,
            useTracking: this.config.locate_track
          }, "locateDiv");
          if (this.config.locate_scale) {
            geoLocate.scale = this.config.locate_scale;
          }
          geoLocate.startup();
          query(".LocateButton .zoomLocateButton").addClass("bg");
          query(".LocateButton .zoomLocateButton").addClass("fc");
          query(".zoomLocateButton span").forEach(function (node) {
            domAttr.set(node, {
              "aria-hidden": "true",
              "role": "presentation"
            });
            domConstruct.create("span", {
              className: "icon-locate",
              "aria-label": esriBundle.widgets.locateButton.locate.title || "Find my location"
            }, node, "after");
          });

          domClass.add(document.body, "haslocate");
        }));

      }

      //Add the location search widget
      require(["application/has-config!search?esri/dijit/Search",
        "application/has-config!search?esri/tasks/locator", "application/has-config!search?application/SearchSources"
      ], lang.hitch(this, function (Search, Locator, SearchSources) {
        if (!Search && !Locator) {
          //add class so we know we don't have to hide title since search isn't visible
          domClass.add(document.body, "no-search");
          domClass.add("panelTop", "no-search");
          return;
        }

        var searchOptions = {
          map: this.map,
          useMapExtent: this.config.searchExtent,
          itemData: this.config.response.itemInfo.itemData
        };

        if (this.config.searchConfig) {
          searchOptions.applicationConfiguredSources = this.config.searchConfig.sources || [];
        } else {
          var configuredSearchLayers = (this.config.searchLayers instanceof Array) ?
            this.config.searchLayers : JSON.parse(this.config.searchLayers);
          searchOptions.configuredSearchLayers = configuredSearchLayers;
          searchOptions.geocoders = this.config.locationSearch ?
            this.config.helperServices.geocode : [];
        }
        var searchSources = new SearchSources(searchOptions);

        var createdOptions = searchSources.createOptions();
        if (this.config.searchConfig !== null && this.config.searchConfig !==
          undefined) {
          if (this.config.searchConfig.activeSourceIndex !==
            null && this.config.searchConfig.activeSourceIndex !==
            undefined) {
            createdOptions.activeSourceIndex = this.config.searchConfig
              .activeSourceIndex;
          }
          createdOptions.enableSearchingAll = false;
          if (this.config.searchConfig && this.config.searchConfig.enableSearchingAll && this.config.searchConfig.enableSearchingAll === true) {
            createdOptions.enableSearchingAll = true;
          }
        }
        if (searchSources && searchSources.sources && searchSources.sources.length && searchSources.sources.length > 0) {

          var search = new Search(createdOptions, domConstruct.create(
            "div", {
            id: "search"
          }, "mapDiv"));
          on(query(".arcgisSearch .searchBtn"), "click", function () {
            // Set focus to search if input is empty. This is to resolve issue on
            // android where input wasn't getting focused when button was pressed
            // to expand the search.
            if (!search.value) {
              search.focus();
            }

          });

          if (this.map.width && this.map.width < 600) {
            this._enableButtonMode(search);
          }

          on(this.map, "resize", lang.hitch(this, function (r) {
            if (r && r.width) {
              if (r.width < 600) {
                this._enableButtonMode(search);
              } else {
                this._disableButtonMode(search);
              }
            }
          }));

          search.on("select-result", lang.hitch(this, function () {
            //if edit tool is enabled we'll have to delete/create
            //so info window behaves correctly.
            on.once(this.map.infoWindow, "hide", lang.hitch(
              this,
              function () {
                search.clear();
                if (this.editor) {
                  this._destroyEditor();
                  this._createEditor();
                }
              }));
          }));
          search.startup();

          if (search && search.domNode) {
            domConstruct.place(search.domNode, "panelGeocoder");
          }
          // update the search placeholder text color and dropdown
          // to match the icon text
          if (this.config.icons === "black") {
            query(".arcgisSearch .searchIcon").style("color",
              "#000");
            domClass.add(dom.byId("search_input"), "dark");
          }
        } else {
          console.log("No search sources are configured - Disable search");
        }
      }));

      //Feature Search or find (if no search widget)
      if ((this.config.find || (this.config.customUrlLayer.id !==
        null && this.config.customUrlLayer.fields.length > 0 &&
        this.config.customUrlParam !== null))) {
        require(["esri/dijit/Search"], lang.hitch(this, function (
          Search) {
          var source = null,
            value = null,
            searchLayer = null;

          var urlObject = urlUtils.urlToObject(document.location
            .href);
          urlObject.query = urlObject.query || {};
          urlObject.query = esriLang.stripTags(urlObject.query);
          var customUrl = null;
          for (var prop in urlObject.query) {
            if (urlObject.query.hasOwnProperty(prop) && this.config.customUrlParam) {
              if (prop.toUpperCase() === this.config.customUrlParam.toUpperCase()) {
                customUrl = prop;
              }
            }
          }

          //Support find or custom url param
          if (this.config.find) {
            value = decodeURIComponent(this.config.find);
          } else if (customUrl) {

            value = urlObject.query[customUrl];
            searchLayer = this.map.getLayer(this.config.customUrlLayer
              .id);
            if (searchLayer) {
              var searchFields = this.config.customUrlLayer.fields[0].fields;
              source = {
                exactMatch: true,
                outFields: ["*"],
                featureLayer: searchLayer,
                displayField: searchFields[0],
                searchFields: searchFields
              };
            }
          }
          var urlSearch = new Search({
            map: this.map
          });

          if (source) {
            urlSearch.set("sources", [source]);
          }
          urlSearch.on("load", lang.hitch(this, function () {
            urlSearch.search(value).then(lang.hitch(this,
              function () {
                on.once(this.map.infoWindow, "hide",
                  lang.hitch(this, function () {
                    //urlSearch.clear();
                    urlSearch.destroy();
                    if (this.editor) {
                      this._destroyEditor();
                      this._createEditor();
                    }
                  }));
              }));
          }));
          urlSearch.startup();

        }));
      }
      //create the tools
      this._createUI();

    },
    _enableButtonMode: function (search) {
      search.set("enableButtonMode", true);
      search.set("expanded", false);
      var panelTextNode = dom.byId("panelText");
      if (!this.blurHandle) {
        this.blurHandle = on.pausable(search, "blur", function () {
          domClass.remove(panelTextNode, "hide");
        });
      } else {
        this.blurHandle.resume();
      }
      if (!this.focusHandle) {
        this.focusHandle = on.pausable(search, "focus", function () {
          domClass.add(panelTextNode, "hide");
        });
      } else {
        this.focusHandle.resume();
      }
    },
    _disableButtonMode: function (search) {
      search.set("enableButtonMode", false);
      if (this.blurHandle) {
        this.blurHandle.pause();
      }
      if (this.focusHandle) {
        this.focusHandle.pause();
      }
    },
    _setColor: function (value) {
      var colorValue = null,
        rgb;
      if (!value) {
        colorValue = new Color("transparent");
      } else {
        rgb = Color.fromHex(value).toRgb();
        if (has("ie") == 8) {
          colorValue = value;
        } else {
          rgb.push(0.9);
          colorValue = Color.fromArray(rgb);
        }
      }
      return colorValue;
    },
    _updateTheme: function () {
      var colorObj = {
        iconColor: this.iconColor.toString(),
        backgroundColor: this.theme.toString(),
        color: this.color.toString(),
        panelColor: this.panelColor.toString(),
        panelBackground: this.panelBackground.toString()
      };

      var defaultCss = esriLang.substitute(colorObj, ".esriSimpleSlider{color:${iconColor};} .icon-color{color:${iconColor};}  .LocateButton .zoomLocateButton{color:${iconColor};background-color:${backgroundColor};} .searchIcon{color:${iconColor};} .pageNav{color:${iconColor};} .bg{background-color:${backgroundColor};} .esriPopup .pointer{background-color:${backgroundColor};} .esriPopup.light .titlePane, .esriPopup.dark .titlePane{ background-color:${backgroundColor}; color:${color};}  .esriPopup.light .titleButton, .esriPopup.dark .titleButton{color:${color};} .fc{color:${color};} .pageContent{background-color:${panelBackground};} .pageBody{ background: ${panelBackground}; color:${panelColor};}  .dijitTabPaneWrapper{background:${panelBackground};} .esriLayerList .esriTitle{background-color:${panelBackground};} .esriLayer{background-color:${panelBackground};}.esriLayerList .esriContainer{background-color:${panelBackground};} .esriLayerList .esriContainer{background-color:${panelBackground};} .esriLayerList .esriList{background-color:${panelBackground}; color:${panelColor};} #modal .copy{background-color:${panelBackground}; color:${panelColor};}   .templatePicker .grid .dojoxGridCell, .dojoxGridRow, .dojoxGridCelll, .templatePicker .grid .dojoxGridRowOdd, .templatePicker .grid .dojoxGridRowEven, .dojoxGridView, .templatePicker .dojoxGrid{ background-color:${panelBackground} !important; border:transparent;} ");


      var style = document.createElement("style");
      style.appendChild(document.createTextNode(defaultCss));
      document.head.appendChild(style);

    },
    _adjustPopupSize: function () {
      //Set the popup size to be half the widget and .35% of the map height
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
      on(this.map.infoWindow, "show", lang.hitch(this, function () {
        domClass.add(document.body, "noscroll");
      }));
      on(this.map.infoWindow, "hide", lang.hitch(this, function () {
        domClass.remove(document.body, "noscroll");
      }));
    },
    _createWebMap: function (itemInfo, params) {

      window.config = this.config;
      var options = {
        mapOptions: params.mapOptions || {},
        editable: has("edit"),
        //is the app editable
        usePopupManager: true,
        layerMixins: this.config.layerMixins,
        bingMapsKey: this.config.orgInfo.bingKey || ""
      };
      if (this.config.orgInfo && this.config.orgInfo.user && this.config.orgInfo.user.privileges) {
        options.privileges = this.config.orgInfo.user.privileges;
      }

      // create a map based on the input web map id
      arcgisUtils.createMap(itemInfo, "mapDiv", options).then(lang.hitch(this, function (response) {

        this.map = response.map;
        domClass.add(this.map.infoWindow.domNode, "light");
        if (this.config.customLayout === "default" || this.config.customLayout === "rounded") {
          var panel = dom.byId("panelContent");
          on(window, "resize", lang.hitch(this, function () {
            var titlebox = domGeometry.getContentBox(dom.byId("panelTop"));
            var mapbox = domGeometry.getContentBox(dom.byId("mapDiv"));
            if (mapbox.w && titlebox.w) {
              var spacer = mapbox.w - titlebox.w;
              if (spacer < 350) {
                domStyle.set(panel, "top", "90px");
              } else {
                domStyle.set(panel, "top", "10px");
              }
            }
          }));

        }
        this._updateTheme();
        if (params.markerGraphic) {
          // Add a marker graphic with an optional info window if
          // one was specified via the marker url parameter
          require(["esri/layers/GraphicsLayer"], lang.hitch(
            this,
            function (GraphicsLayer) {
              var markerLayer = new GraphicsLayer();

              this.map.addLayer(markerLayer);
              markerLayer.add(params.markerGraphic);

              if (params.markerGraphic.infoTemplate) {
                this.map.infoWindow.setFeatures([params.markerGraphic]);
                this.map.infoWindow.show(params.markerGraphic
                  .geometry);
              }
            }));

        }
        //Add a logo if provided
        if (this.config.logo) {
          var content;
          const altText = this.config.logoAltText ? "alt = " + this.config.logoAltText : "role =presentation";

          if (this.config.logolink) {

            content = "<a target='_blank' href='" + this.config.logolink + "'><img id='logo'" + altText + " src=" +
              this.config.logo +
              "></a>";
          } else {
            content = "<img id='logo' " + altText + " src=" +
              this.config.logo +
              ">";
          }
          domConstruct.create("div", {
            id: "panelLogo",
            innerHTML: content
          }, dom.byId("panelTitle"), "first");
          domClass.add("panelTop", "largerTitle");
        }

        //Set the application title
        this.map = response.map;
        //Set the title - use the config value if provided.
        var title;
        if (this.config.title === null || this.config.title ===
          "") {
          title = response.itemInfo.item.title;
        } else {
          title = this.config.title;
        }
        // Set the default map summary as the default alt text
        // Can be configured using the config panel in order
        // to provide text that will be read by screen readers.
        var altText = response.itemInfo.item.snippet || response.itemInfo.item.title;
        domAttr.set(this.map.container, "aria-label", this.config
          .altMapText || esriLang.stripTags(altText));

        domAttr.set(this.map.container, "tabindex", "0");
        var titleNode = dom.byId("title");
        this.config.title = title;
        document.title = esriLang.stripTags(title);
        titleNode.innerHTML = title;
        titleNode["aria-label"] = title;

        //Set subtitle if provided
        if (this.config.subtitle) {
          var subtitleNode = dom.byId("subtitle");
          subtitleNode.innerHTML = this.config.subtitle;
          subtitleNode["aria-label"] = this.config.subtitle;
        } else {
          domStyle.set("subtitle", "display", "none");
          domClass.add("title", "nosubtitle");
        }

        this.config.response = response;

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
    updateAriaInfo: function () {
      // update tab index and aria roles for slider buttons
      // Popup Accessiblity updates
      query(".titleButton").forEach(function (node) {
        domAttr.set(node, "role", "button");
        domAttr.set(node, "tabindex", "0");
      });
      query(".titlePane div.title").forEach(function (node) {
        domAttr.set(node, "tabindex", "0");
      });
    }
  });
});
