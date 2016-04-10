define(["dojo/Evented", "dojo/_base/declare", "dojo/_base/lang", "dojo/has", "dojo/dom", "esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin",  "dijit/_AttachMixin", "dojo/on",
    "dojo/Deferred", "dojo/promise/all", 
    "dojo/query", 
    "esri/tasks/query", "esri/tasks/QueryTask",
    "dojo/text!application/dijit/templates/FilterItemTemplate.html", 
    "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", "dojo/dom-construct", "dojo/_base/event", 
    "dojo/string", 
    "esri/dijit/InfoWindow",
    "dojo/NodeList-dom", "dojo/NodeList-traverse"
    
    ], function (
        Evented, declare, lang, has, dom, esriNS,
        _WidgetBase, _TemplatedMixin, _AttachMixin, on,
        Deferred, all, 
        query,
        Query, QueryTask,
        FilterItemTemplate, 
        domClass, domAttr, domStyle, domConstruct, event, 
        string,
        InfoWindow
    ) {
    var Widget = declare("esri.dijit.FilterItem", [_WidgetBase, _TemplatedMixin, _AttachMixin, Evented], {
        // defaults
        templateString: FilterItemTemplate,

        options: {
            map: null,
            layers: null,
            visible: true
        },

        constructor: function (options, srcRefNode) {
            var defaults = lang.mixin({}, this.options, options);
            this.field = options.field;
            this.domNode = srcRefNode;
        },

        startup: function () {

        },
        
    });
    if (has("extend-esri")) {
        lang.setObject("dijit.FilterItem", Widget, esriNS);
    }
    return Widget;
});