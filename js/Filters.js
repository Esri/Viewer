define(["dojo/Evented", "dojo/_base/declare", "dojo/_base/lang", "dojo/has", "dojo/dom","esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/on",
    "dojo/Deferred", "dojo/promise/all", 
    "dojo/query", 
    "esri/tasks/query", "esri/tasks/QueryTask",
    "dojo/text!application/dijit/templates/FilterTemplate.html", 
    "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", "dojo/dom-construct", "dojo/_base/event", 
    "dojo/string", 
    "dojo/text!application/dijit/templates/FilterTabTemplate.html",
    "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/graphic",
    "esri/dijit/InfoWindow",
    "dojo/NodeList-dom", "dojo/NodeList-traverse"
    
    ], function (
        Evented, declare, lang, has, dom, esriNS,
        _WidgetBase, _TemplatedMixin, on,
        Deferred, all, 
        query,
        Query, QueryTask,
        FilterTemplate, 
        domClass, domAttr, domStyle, domConstruct, event, 
        string,
        filterTabTemplate,
        SimpleMarkerSymbol, PictureMarkerSymbol, Graphic,
        InfoWindow
    ) {
    var Widget = declare("esri.dijit.Filters", [_WidgetBase, _TemplatedMixin, Evented], {
        // defaults
        templateString: FilterTemplate,

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
            this.set("layers", defaults.layers.filter(function(l){return l.visibility;}));
            window.filters = [];
            defaults.layers.filter(function(l){return l.visibility;}).forEach(lang.hitch(this,function(layer){
                window.filters.push({id: layer.id, "layer": layer, fields:layer.popupInfo.fieldInfos.filter(function(l){return l.visible;})});
            }));
            this.css = {
            };
        },

        startup: function () {
            if (!this.map) {
                this.destroy();
                console.log("Filter::map required");
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
            var filtersTabs = dom.byId("filtersTabs");
            var addTab = function(filter, template) {
                var tab = string.substitute(template, {id:filter.layer.id, name:filter.layer.layerObject.name});
                filtersTabs.innerHTML += tab;
            };
            window.filters.forEach(function(filter){
                addTab(filter, filterTabTemplate);
                var fieldsCombo = dom.byId("fields_"+filter.layer.id);
                filter.fields.forEach(lang.hitch(this, function(fl){
                    fieldsCombo.innerHTML += '<option value="'+fl.fieldName+'">'+fl.label+'</option>';
                }));
            });

            window.filterAdd = function(btn, id) {
                var fieldId = dom.byId('fields_'+id).value;
                var field = window.filters.find(function(i) {return i.id === id;}).fields.find(function(f) {return f.fieldName === fieldId});
                var fieldItem = '<li><div>'+field.label+'</div></li>';
                var filtersList = dom.byId("filtersList_"+id);
                filtersList.innerHTML+=fieldItem;
            };
        },

    });
    if (has("extend-esri")) {
        lang.setObject("dijit.Filters", Widget, esriNS);
    }
    return Widget;
});
