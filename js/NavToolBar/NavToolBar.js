define([
    "dojo/Evented", "dojo/_base/declare", "dojo/_base/lang", "dojo/has", "dojo/dom","esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/on",
    "dojo/query", "esri/toolbars/navigation", "dijit/registry",
    "esri/dijit/HomeButton", "esri/dijit/LocateButton", 
    "dojo/text!application/NavToolBar/templates/NavToolBar.html", 
    "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", 
    "dojo/dom-construct", "dojo/_base/event", 
    "dojo/NodeList-dom", "dojo/NodeList-traverse"
    
    ], function (
        Evented, declare, lang, has, dom, esriNS,
        _WidgetBase, _TemplatedMixin, on, 
        query, Navigation, registry,
        HomeButton, LocateButton, 
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
            this.set("nav", new Navigation(this.map));
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
            dojo.empty(this.navToolBar);

            domConstruct.place(this.domNode, this.navToolBar);

            on(dom.byId("navZoomIn"), "click", lang.hitch(this, function(e) {
                this.map.setLevel(this.map.getLevel()+1);
            }));

            on(dom.byId("navZoomOut"), "click", lang.hitch(this, function(e) {
                this.map.setLevel(this.map.getLevel()-1);
            }));

            if(has("home")) {
                var home = new HomeButton({
                    map: this.map
                }, domConstruct.create("div",{},dom.byId("navHome")));
                home.startup();

                var homeButton = dojo.query(".homeContainer")[0];
                var homen = dojo.query(".homeContainer .home")[0];
                dojo.removeAttr(homen, 'title');
                dojo.removeAttr(homen, 'role');
                // dojo.attr(homeButton, "role", "presentation");
                // dojo.attr(query("div", homeButton)[0], "role", "presentation");
                var homeNode = dojo.query(".home")[0];
                dojo.empty(homeNode);
                var homeHint = "Default Extent";

                var btnHome = domConstruct.create("input", {
                    type: 'image',
                    src: 'images/icons_white/home.png',
                    alt: homeHint,
                    title: homeHint,
                }, homeNode);
            } else {
                dojo.destroy("navHome");
            }

            var isChrome = !!window.chrome && !!window.chrome.webstore;
            if (has("locate") && (!isChrome || (window.location.protocol === "https:"))) {
                var geoLocate = new LocateButton({
                    map: this.map
                }, domConstruct.create("div",{},dom.byId("navLocate")));
                geoLocate.startup();

                var locateButton = dojo.query(".locateContainer")[0];
                var zoomLocateButton = dojo.query(".zoomLocateButton")[0];
                dojo.removeAttr(zoomLocateButton, 'title');
                dojo.removeAttr(zoomLocateButton, 'role');

                dojo.empty(zoomLocateButton);
                var locateHint = dojo.attr(zoomLocateButton, 'title');

                domConstruct.create("input", {
                    type: 'image',
                    src: 'images/icons_white/locate.png',
                    alt: locateHint,
                    title: locateHint,
                }, zoomLocateButton);
            } else {
                dojo.destroy("navLocate");
            }

            on(dom.byId("navPrev"), "click", lang.hitch(this, function(e) {
                this.nav.zoomToPrevExtent();
            }));

            on(dom.byId("navNext"), "click", lang.hitch(this, function(e) {
                this.nav.zoomToNextExtent();
            }));

            on(dom.byId("navZoomInTool"), "click", lang.hitch(this, function(e) {
                this.nav.activate("zoomin");
            }));

            on(dom.byId("navZoomOutTool"), "click", lang.hitch(this, function(e) {
                this.nav.activate("zoomout");
            }));

            on(dom.byId("extenderNavLabel"), "keypress", lang.hitch(this, function(e) {
                if(e.key === " " || e.char === " ") {
                    e.target.click();
                }
            }));

            //registry.byId("zoomprev").disabled = navToolbar.isFirstExtent();

        },
//window.nav.zoomToPrevExtent();
    });

    if (has("extend-esri")) {
        lang.setObject("dijit.NavToolBar", Widget, esriNS);
    }
    return Widget;
});
