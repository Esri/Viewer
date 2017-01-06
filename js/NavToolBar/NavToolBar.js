define([
    "dojo/Evented", "dojo/_base/declare", "dojo/_base/lang", "dojo/has", "dojo/dom","esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/on", 
    "dojo/query", 
    "dojo/text!application/NavToolBar/templates/NavToolBar.html", 
    "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", 
    "dojo/dom-construct", "dojo/_base/event", 
    "dojo/NodeList-dom", "dojo/NodeList-traverse"
    
    ], function (
        Evented, declare, lang, has, dom, esriNS,
        _WidgetBase, _TemplatedMixin, on,  
        query,
        NavToolBarTemplate, 
        domClass, domAttr, domStyle, 
        domConstruct, event
    ) {
    var Widget = declare("esri.dijit.NavToolBar", [_WidgetBase, _TemplatedMixin, Evented], {
        templateString: NavToolBarTemplate,

        options: {
            map: null,
            navToolBar:null
        },

        constructor: function (options, srcRefNode) {
            var defaults = lang.mixin({}, this.options, options);

            this.domNode = srcRefNode;

            this.set("map", defaults.map);
            this.set("navToolBar", defaults.navToolBar);
        },

        startup: function () {
            if (this.map.loaded) {
                this._init();
            } else {
                on.once(this.map, "load", lang.hitch(this, function () {
                    this._init();
                }));
            }

        },
        
        _init: function () {
            //dojo.empty(this.navToolBar);
            domConstruct.place(this.domNode, this.navToolBar);
            on(dom.byId("navZoomIn"), "click", lang.hitch(this, function(e) {
                this.map.setLevel(this.map.getLevel()+1);
            }));
            on(dom.byId("navZoomOut"), "click", lang.hitch(this, function(e) {
                this.map.setLevel(this.map.getLevel()-1);
            }));
        },

    });

    if (has("extend-esri")) {
        lang.setObject("dijit.NavToolBar", Widget, esriNS);
    }
    return Widget;
});
