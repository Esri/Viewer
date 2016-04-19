define(["dojo/_base/declare", "dojo/_base/lang", "dojo/has", "dojo/dom","esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/on", "dijit/form/DateTextBox",
    "dojo/Deferred", "dojo/promise/all", 
    "dojo/query", 
    // "dijit/layout/BorderContainer", "dijit/layout/TabContainer", "dijit/layout/ContentPane", 
    "dojo/text!application/Filters/templates/FilterTemplate.html", 
    "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", "dojo/dom-construct", "dojo/_base/event", 
    "application/Filters/FilterTab","application/Filters/FilterItem", 
    "dojo/NodeList-dom", "dojo/NodeList-traverse"
    
    ], function (
        declare, lang, has, dom, esriNS,
        _WidgetBase, _TemplatedMixin, on, DateTextBox, 
        Deferred, all, 
        query,
        // BorderContainer, TabContainer, ContentPane,
        FilterTemplate, 
        domClass, domAttr, domStyle, domConstruct, event, 
        FilterTab, FilterItem
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
                var filterTab = new FilterTab({filter:filter, checked:ck});
                dojo.place(filterTab.domNode, this.filterTabs);
                filterTab.startup();
                ck='';
            }));

            // var tc = new TabContainer({tabStrip:'true', nested:'true'}, this.filterTabs);:

            // var tc = new TabContainer({
            //     style: "width:100%;height:100%;",
            //     tabStrip:true, nested:true
            // }, this.filterTabs);
            // // domConstruct.place(tc.domNode, this.filterTabs);
            // // tc.setTheme(dojoxTheme);

            // var ck='checked';
            // window.filters.forEach(lang.hitch(this, function(filter){
            //     //var filterTab = new FilterTab({filter:filter, checked:ck});
            //     var cp1 = new ContentPane({
            //          title: filter.layer.layerObject.name,
            //          content: "content for "+filter.layer.layerObject.name
            //     });
            //     tc.addChild(cp1);
            //     ck='';
            // }));
            // setTimeout(function(){ tc.startup();} ,5000);
        },
    });
    if (has("extend-esri")) {
        lang.setObject("dijit.Filters", Widget, esriNS);
    }
    return Widget;
});
