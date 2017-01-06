define(["dojo/_base/declare", "dojo/_base/lang", "dojo/has", "dojo/dom","esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/on", 
    "dojo/query", 
    "dojo/text!application/Navigation/templates/Navigation.html", 
    "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", "dojo/dom-construct", "dojo/_base/event", 
    "dojo/NodeList-dom", "dojo/NodeList-traverse"
    
    ], function (
        declare, lang, has, dom, esriNS,
        _WidgetBase, _TemplatedMixin, on,  
        Deferred, all, 
        query,
        Navigation, 
        domClass, domAttr, domStyle, domConstruct, event
    ) {
    var Widget = declare("esri.dijit.Navigation", [_WidgetBase, _TemplatedMixin], {
        // defaults
        templateString: Navigation,

        options: {
            map: null,
        },

        constructor: function (options, srcRefNode) {
            var defaults = lang.mixin({}, this.options, options);

            this.domNode = srcRefNode;
            // properties
            this.set("map", defaults.map);

        },

        startup: function () {
        },

    });

    if (has("extend-esri")) {
        lang.setObject("dijit.Navigation", Widget, esriNS);
    }
    return Widget;
});
