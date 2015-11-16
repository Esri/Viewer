/**
 * Module to handle managing popup content in a panel
 * @module app/PopupPanel
 */
define(
[
  "dojo/_base/declare",
  
  "dojo/on",
  "dojo/i18n!esri/nls/jsapi",
  "dojo/dom",
  "dojo/dom-class",
  "dojo/dom-style",
  "dojo/dom-construct",
  "dojo/query",
  
  "dojo/_base/lang",
  "dojo/_base/window",

  "dijit/registry",

  "esri/domUtils",
  "esri/lang",
  "esri/dijit/Popup"
],
function(
  declare, 
  
  on, esriStrings, dom, domClass, domStyle, domConstruct, 
  query, lang, win,

  registry, 

  domUtils, esriLang, Popup
) {

  var PopupPanel = declare(null, {
    declaredClass: "application.PopupPanel",

    constructor: function(parameters){
      var defaults = {
        popup: null,
        srcNode: null, 
        toolbar: null
      };
      lang.mixin(this, defaults, parameters);
    },

    initPopup: function(){
      on(this.popup, "selection-change", lang.hitch(this, this._displayPopupContent));
      on(this.popup, "clear-features", lang.hitch(this, this._clearPopupSelection));
      on(this.popup, "set-features", lang.hitch(this, this._displayPopupContent));
      
      //setup title text for popup buttons
      console.log(esriStrings.widgets.popup);
      dom.byId("popupButtonClose").title = esriStrings.widgets.popup.NLS_close;
      dom.byId("popupButtonNext").title = esriStrings.widgets.popup.NLS_nextFeature;
      dom.byId("popupButtonPrev").title = esriStrings.widgets.popup.NLS_prevFeature;
      // make nav links clickable
      on(query(".popupButton"), "click", lang.hitch(this, function(e){
        if(e.target.className === "popupButton close"){
              this._clearPopupSelection();
              this._displayPopupWindow(false);
        }else if(e.target.className === "popupButton next"){
          this.popup.selectNext();
        }else if(e.target.className === "popupButton prev"){
          this.popup.selectPrevious();
        }
      }));

      //add zoom to link to popup window 
      var linkText = esriStrings.widgets.popup.NLS_zoomTo || "Zoom to";
      var link = domConstruct.create("a",{
        "id": "zoomLink",
        "title": linkText,
        "href": "javascript: void(0);"
      },"popupFooter");
      domClass.add(link, ["action"])
      on(link, "click", lang.hitch(this, this._zoomToFeature));

      //control page zooming when mousing-over popup content 
      if(this.toolbar &&  this.toolbar._hasScrollbar()){
        var p = dom.byId("pageContent_popup");
        if(p){
          domClass.add(p, "modal-scrollbar");
        }
      }
      domStyle.set(win.body(), "overflow", "hidden");


    },
    _zoomToFeature: function(e){ 
      var feature = this.popup.getSelectedFeature();
      if(feature){
        // can we make this public? 
        this.popup._zoomToFeature(e);
      }
    },
   _displayPopupContent: function(){
      var feature = this.popup.getSelectedFeature();
      if(feature){ 
        if(this.toolbar){
          this.toolbar.closePage();
          on.once(this.toolbar, "updateTool", lang.hitch(this, function(name){
            if(name){
              this._clearPopupSelection();
              this._displayPopupWindow(false);
            }
          }));
        }
        this._displayPopupWindow(true);
        registry.byId(this.srcNode).set("content", feature.getContent());

        //update selection text 
        var selectionString = esriStrings.widgets.popup.NLS_pagingInfo, 
          count = this.popup.features ? this.popup.features.length : 0,
          title = "";
        if(count > 1){
          title = esriLang.substitute({
            index: this.popup.selectedIndex + 1,
            total: count
          }, selectionString);
        }
        this._updatePagingControls();
        dom.byId("popupTitle").innerHTML = title;
      }else{
         this._displayPopupWindow(false);
      }

    },
    _updatePagingControls: function(){
      var prev = query(".popupButton.prev")[0], 
        next = query(".popupButton.next")[0],
        ptr = this.popup.selectedIndex,
        count = this.popup.features ? this.popup.features.length : 0;
        if(count > 1){
          if(ptr === 0){
           domClass.add(prev, "hidden");
          }else{
            domClass.remove(prev, "hidden");
          }
          if(ptr === (count -1)){
            domClass.add(next, "hidden");
          }else{
            domClass.remove(next, "hidden");
          }
        }else{
          domClass.add(next, "hidden");
          domClass.add(prev, "hidden");
        }
    },
    _displayPopupWindow: function(show){
        query(".panelPopup").forEach(function(node){
          if(show){
            domUtils.show(node);
          }else{
            domUtils.hide(node);
          }
        });
    },
    _clearPopupSelection: function(){
      var feature = this.popup.getSelectedFeature();
      if(feature){
        this.popup.clearFeatures();
      }
    }
  });
  return PopupPanel;
});