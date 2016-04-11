define(["dojo/_base/declare", "dojo/_base/lang", "dojo/has", "dojo/dom","esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/on", "dijit/form/DateTextBox",
    "dojo/Deferred", "dojo/promise/all", 
    "dojo/query", 
    "esri/tasks/query", "esri/tasks/QueryTask",
    "dojo/text!application/Filters/templates/FilterTemplate.html", 
    "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", "dojo/dom-construct", "dojo/_base/event", 
    "dojo/string", 
    "application/Filters/FilterTab","application/Filters/FilterItem", 
    "dojo/text!application/Filters/templates/FilterTab.html",
    "dojo/text!application/Filters/templates/FilterString.html",
    "dojo/text!application/Filters/templates/FilterDate.html",
    "dojo/text!application/Filters/templates/FilterInteger.html",
    "dojo/text!application/Filters/templates/FilterDouble.html",
    "dojo/text!application/Filters/templates/FilterOID.html",
    "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/graphic",
    "esri/dijit/InfoWindow",
    "dojo/NodeList-dom", "dojo/NodeList-traverse"
    
    ], function (
        declare, lang, has, dom, esriNS,
        _WidgetBase, _TemplatedMixin, on, DateTextBox, 
        Deferred, all, 
        query,
        Query, QueryTask,
        FilterTemplate, 
        domClass, domAttr, domStyle, domConstruct, event, 
        string,
        FilterTab, FilterItem,
        filterTab, 
        filterString, filterDate, filterInteger, filterDouble, filterOID,
        SimpleMarkerSymbol, PictureMarkerSymbol, Graphic,
        InfoWindow
    ) {
    var Widget = declare("esri.dijit.Filters", [_WidgetBase, _TemplatedMixin], {
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
                window.filters.push({
                    id: layer.id, 
                    layer: layer, 
                    fields:layer.popupInfo.fieldInfos.filter(function(l){return l.visible;})
                });
            }));
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
            var ck='checked';
            window.filters.forEach(lang.hitch(this, function(filter){
                var filterTabW = new FilterTab({filter:filter, checked:ck});
                filterTabW.startup();

                dojo.place(filterTabW.domNode, this.filterTabs);
                ck='';
            }));

        },

    });
    if (has("extend-esri")) {
        lang.setObject("dijit.Filters", Widget, esriNS);
    }
    return Widget;
});
