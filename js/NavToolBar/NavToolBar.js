define([
    "dojo/Evented", "dojo/_base/declare", "dojo/_base/lang", "dojo/has", "dojo/dom","esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/on",
    "dojo/query", "esri/toolbars/navigation", "dijit/registry",
    "esri/dijit/HomeButton", "esri/dijit/LocateButton", 
    "esri/symbols/SimpleLineSymbol", "esri/Color",
    "dojo/text!application/NavToolBar/templates/NavToolBar.html", 
    "dojo/i18n!application/nls/NavToolBar",
    "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", 
    "dojo/dom-construct", "dojo/_base/event", 
    "dojo/NodeList-dom", "dojo/NodeList-traverse"
    
    ], function (
        Evented, declare, lang, has, dom, esriNS,
        _WidgetBase, _TemplatedMixin, on, 
        query, Navigation, registry,
        HomeButton, LocateButton, 
        SimpleLineSymbol, Color,
        NavToolBarTemplate, i18n,
        domClass, domAttr, domStyle, 
        domConstruct, event
    ) {
    var Widget = declare("esri.dijit.NavToolBar", [_WidgetBase, _TemplatedMixin, Evented], {
        templateString: NavToolBarTemplate,

        options: {
            map: null,
            navToolBar:null,
            iconColor:"white",
            newIcons:'',
            zoomColor:'red',
        },

        constructor: function (options, srcRefNode) {
            var defaults = lang.mixin({}, this.options, options);
            this._i18n = i18n;
            this.domNode = srcRefNode;

            this.set("map", defaults.map);
            this.set("navToolBar", defaults.navToolBar);
            this.set("nav", new Navigation(this.map));
            this.set("iconColor", defaults.iconColor);
            this.set("newIcons", defaults.newIcons);
            this.set("zoomColor", defaults.zoomColor);
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
            this.nav.setZoomSymbol(new SimpleLineSymbol("SOLID", new Color(this.zoomColor), 4));

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
                dojo.removeAttr(homen, 'role');
                var homeNode = dojo.query(".home")[0];
                dojo.empty(homeNode);
                var homeHint = "Default Extent";

                var btnHome = domConstruct.create("input", {
                    type: 'image',
                    src: 'images/icons_'+this.iconColor+'/home.png',
                    alt: homeHint,
                    title: homeHint,
                }, homeNode);
            } else {
                dojo.destroy("navHome");
            }

            var isLocationEnabled = !(!!window.chrome && !!window.chrome.webstore) || 
                (window.location.protocol === "https:") || 
                (window.location.hostname === "localhost");
            if (has("locate") && isLocationEnabled) {
                var geoLocate = new LocateButton({
                    map: this.map
                }, domConstruct.create("div",{},dom.byId("navLocate")));
                geoLocate.startup();

                var locateButton = dojo.query(".locateContainer")[0];
                var zoomLocateButton = dojo.query(".zoomLocateButton")[0];
                //dojo.removeAttr(zoomLocateButton, 'title');
                var locateHint = dojo.attr(zoomLocateButton, 'title');
                dojo.removeAttr(zoomLocateButton, 'role');

                dojo.empty(zoomLocateButton);

                domConstruct.create("input", {
                    type: 'image',
                    src: 'images/icons_white/locate.png',
                    alt: locateHint,
                    title: locateHint,
                }, zoomLocateButton);
            } else {
                dojo.destroy("navLocate");
            }

            if(has("navigation")) {
                on(dom.byId("navPrev"), "click", lang.hitch(this, function(e) {
                    this.nav.zoomToPrevExtent();
                }));

                on(dom.byId("navNext"), "click", lang.hitch(this, function(e) {
                    this.nav.zoomToNextExtent();
                }));

                on(dom.byId("navZoomInTool"), "click", lang.hitch(this, function(e) {
                    this.map.setMapCursor("url(images/ZoomIn.cur),auto");
                    this.nav.activate("zoomin");
                }));

                on(dom.byId("navZoomOutTool"), "click", lang.hitch(this, function(e) {
                    this.map.setMapCursor("url(images/ZoomOut.cur),auto");
                    this.nav.activate("zoomout");
                }));

                on(dom.byId("extenderNavLabel"), "keypress", lang.hitch(this, function(e) {
                    if(e.key === " " || e.char === " ") {
                        e.target.click();
                    }
                }));

                on(dom.byId("extenderNavCheckbox"), "change", lang.hitch(this, function(e) {
                    var ck = e.target.checked;

                    dojo.setStyle(dom.byId("extendedTools"), "display", ck?"inherit":"none");
                    this.nav.deactivate();
                    this.map.setMapCursor("default");
                }));

            } else {
                dojo.destroy("navPrevNext");
                dojo.destroy("ZoomTools");
                dojo.destroy("extenderNav");
                dojo.setStyle(dom.byId("extendedTools"), "display", "inherit");
            }

            this.nav.on("extent-history-change", lang.hitch(this, function () {
                var zoom = this.map.getZoom();
                this.tryDisableBtn("navZoomIn", zoom == this.map.getMaxZoom());
                this.tryDisableBtn("navZoomOut", zoom == this.map.getMinZoom());
                this.tryDisableBtn("navHome",window.initExt === this.map.extent);
                if(has("navigation")) {
                    this.tryDisableBtn("navPrev",this.nav.isFirstExtent());
                    this.tryDisableBtn("navNext",this.nav.isLastExtent());
                    this.nav.deactivate();
                    this.map.setMapCursor("default");
                }
            }));

            // on(dom.byId("testBtn"), "click", lang.hitch(this, function(e) {
            //     this.map._createLabelLayer();
            // }));


        },

        //disTabs : 1,

        tryDisableBtn:function(id, disable) {
            var div = query("#"+id)[0];
            var btn = query("input", div)[0];
            var dis = query(".disabledBtn", div)[0];
            var crs = disable ? "not-allowed": "pointer";
            dojo.setStyle(btn, "cursor", crs);
            dojo.setStyle(div, "cursor", crs);
            dojo.setStyle(dis, "cursor", crs);
            dojo.setAttr(btn, "tabIndex", disable?-1:0);
            // if(this.disTabs>=0 && disable) {
            //     this.disTabs-=1;
            // } else {
            //     dojo.setAttr(dis, "tabIndex", disable?-1:0);
            // }
            //dojo.setStyle(btn, "pointer-events", disable?"none":"all");
            // if(disable && dojo.getStyle(dis, "display") !== "none" )
            //     this.blurAll();//dojo.getAttr(dis, 'aria-label'));
            dojo.setStyle(dis, "display", disable?"inherit":"none");
            return disable;
        },

        blurAll: function(text) {
            if(text===undefined) 
                text='';
            var tmp = domConstruct.create("div", {tabindex:0, 'aria-label':text}, document.body);
            //document.body.appendChild(tmp);
            tmp.focus();
            document.body.removeChild(tmp);
        }

    });

    if (has("extend-esri")) {
        lang.setObject("dijit.NavToolBar", Widget, esriNS);
    }
    return Widget;
});
