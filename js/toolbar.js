define([
    "dojo/Evented", "dojo/_base/declare", "dojo/_base/window", "dojo/_base/fx", 
    "dojo/_base/html", "dojo/_base/lang", "dojo/has", "dojo/dom", "dojo/_base/connect",
    "dojo/dom-class", "dojo/dom-style", "dojo/dom-attr", "dojo/dom-construct", "dojo/dom-geometry", 
    "dojo/on", "dojo/mouse", "dojo/query", "dojo/Deferred"], function (
Evented, declare, win, fx, html, lang, has, dom, connect,
domClass, domStyle, domAttr, domConstruct, domGeometry, 
on, mouse, query, Deferred) {
    return declare([Evented], {

        map: null,
        tools: [],
        toollist: [],
        curTool: -1,
        scrollTimer: null,
        config: {},
        pTools: null,
        pMenu: null,
        pPages: null,

        constructor: function (config) {
            this.config = config;
        },

        startup: function () {
            var deferred = this._init();
            deferred.then(
                lang.hitch(this, function (config) {
                    // optional ready event to listen to
                    this.emit("ready", config);
                }), 
                lang.hitch(this, function (error) {
                    // optional error event to listen to
                    this.emit("error", error);
            }));
            return deferred;
        },

        _init: function () {
            //Don't need deferred now setting it up just in case
            var deferred;

            deferred = new Deferred();
            on(window, "scroll", lang.hitch(this, this._windowScrolled));
            on(window, "resize", lang.hitch(this, this._windowScrolled));
            this.pTools = dom.byId("panelTools");
            this.pMenu = dom.byId("panelMenu");
            on(this.pMenu, "click", lang.hitch(this, this._menuClick));
            this.pPages = dom.byId("panelPages");
            //Prevent body scroll when scrolling to the end of the panel content
            on(this.pPages, mouse.enter, lang.hitch(this, function () {

                if (this._hasScrollbar()) {
                    var p = dom.byId("panelPages");
                    if (p) {
                        domClass.add(p, "modal-scrollbar");
                    }
                }
                domStyle.set(win.body(), "overflow", "hidden");

            }));
            on(this.pPages, mouse.leave, lang.hitch(this, function () {
                if (this._hasScrollbar === false) {
                    var p = dom.byId("panelPages");
                    if (p) {
                        domClass.remove(p, "modal-scrollbar");
                    }
                    domStyle.set(win.body(), "overflow-y", "auto");
                }


            }));
//             domConstruct.empty(this.pPages);
            // add blank page
            deferred.resolve();

            return deferred.promise;
        },

        _hasScrollbar: function () {
            // The Modern solution
            if (typeof window.innerWidth === 'number') return window.innerWidth > document.documentElement.clientWidth;

            // rootElem for quirksmode
            var rootElem = document.documentElement || document.body;

            // Check overflow style property on body for fauxscrollbars
            var overflowStyle;

            if (typeof rootElem.currentStyle !== 'undefined') overflowStyle = rootElem.currentStyle.overflow;

            overflowStyle = overflowStyle || window.getComputedStyle(rootElem, '').overflow;

            // Also need to check the Y axis overflow
            var overflowYStyle;

            if (typeof rootElem.currentStyle !== 'undefined') overflowYStyle = rootElem.currentStyle.overflowY;

            overflowYStyle = overflowYStyle || window.getComputedStyle(rootElem, '').overflowY;

            var contentOverflows = rootElem.scrollHeight > rootElem.clientHeight;
            var overflowShown = /^(visible|auto)$/.test(overflowStyle) || /^(visible|auto)$/.test(overflowYStyle);
            var alwaysShowScroll = overflowStyle === 'scroll' || overflowYStyle === 'scroll';

            return (contentOverflows && overflowShown) || (alwaysShowScroll);
        },

        //Create a tool and return the div where you can place content
        createTool: function (tool, panelClass, loaderImg, badgeEvName) {
            var name = tool.name;

            // add tool
            var refNode = this.pTools;
            var tip = this.config.i18n.tooltips[name] || name;
            if(badgeEvName && badgeEvName !== '') {
                var divTool =  domConstruct.create("div", {
                }, refNode);
                var setIndicator = domConstruct.create("img", {
                    src:"images/set.png",
                    class:"setIndicator",
                    style:"margin-left: 16px; display:none;",
                    Alt:"Some Filters Apply",
                    title:"Some Filters Apply",
                    tabindex:0
                }, divTool);
                refNode = divTool;

                filtersOn = [];
                connect.subscribe(badgeEvName, lang.hitch(this, function(message){
                    var tabIndex = filtersOn.indexOf(message.id);
                    if(message.show) {
                        if(tabIndex<0)
                        {
                            filtersOn.push(message.id);   
                        }
                    } else {
                        if(tabIndex>=0)
                        {
                            filtersOn.splice(tabIndex, 1);  
                        }                          
                    }
                    if(filtersOn.length>0) {
                        domStyle.set(setIndicator,'display','');
                    } else {
                        domStyle.set(setIndicator,'display','none');
                    }
                }));
            }
            var pTool = domConstruct.create("input", {
                type:"image",
                className: "panelTool",
                id: "toolButton_" + name,
                "aria-label": tip,
                alt: tip,
                src: "images/icons_" + this.config.icons + "/" + name + ".png",
            }, refNode);

            if (!has("touch")) 
            {
                domAttr.set(pTool, "title", tip);
            }

            on(pTool, "click", lang.hitch(this, this._toolClick, name));
            this.tools.push(name);

            // add page
            var page = domConstruct.create("div", {
                className: "page hideAttr",
                id: "page_" + name,
                // tabindex: 0
            }, this.pPages);

            var pageContent = domConstruct.create("div", {
                className: "pageContent",
                id: "pageContent_" + name,
                role: "dialog",
                "aria-labelledby": "pagetitle_" + name,
            }, page);

            var pageHeader = domConstruct.create("div", {
                id: "pageHeader_" + name,
                className: "pageHeader fr bg",
                //tabindex: 0,
            }, 
            pageContent);

            domConstruct.create("h1", {
                className: "pageTitle fc",
                innerHTML: this.config.i18n.tooltips[name] || name,
                style: 'display:inline; vertical-align:text-bottom;',
                id: "pagetitle_" + name
            }, pageHeader);

            if(loaderImg && loaderImg !=="") {
                domConstruct.create("div", {
                    id: "loading_" + name,
                    class: 'small-loading'
                }, pageHeader);
            }

            // domConstruct.create("div", {
            //     className: "pageHeaderImg",
            //     innerHTML: "<img class='pageIcon' src ='images/icons_" + this.config.icons + "/" + name + ".png' alt=''/>"
            // }, pageHeader);


            var pageBody = domConstruct.create("div", {
                className: "pageBody",
                tabindex: 0,
                id: "pageBody_" + name,
            }, 
            pageContent);
            domClass.add(pageBody, panelClass);

            on(this, "updateTool_" + name, lang.hitch(this, function(name) {
                pageBody.focus();
            }));

            return pageBody;
        },

       _toolClick: function (name) {
            this._updateMap(); // ! out of place

            var active = false;
            var page = dom.byId("page_"+name);
            var hidden = page.classList.contains("hideAttr");
            var pages = query(".page");
            pages.forEach(function(p){
                if(hidden && p === page) {
                    domClass.replace(p, "showAttr","hideAttr");
                    active = true;
                } else {
                    domClass.replace(p,"hideAttr","showAttr");
                }
            });
            
            var tool = dom.byId("toolButton_"+name);
            var tools = query(".panelTool");           
            this.emit("updateTool", name);
            this.emit("updateTool_"+name);
            tools.forEach(function(t){
                if(active && t === tool) {
                    domClass.add(t, "panelToolActive");
                } else {
                    domClass.remove(t,"panelToolActive");
                }
            });

            var fixContent = dom.byId('fixContent');
            if(active) {
                domClass.replace(fixContent, "hideAttr", "showAttr");
            } else {
                domClass.replace(fixContent, "showAttr", "hideAttr");
            }
         },

        _atachEnterKey: function(onButton, clickButton) {
            on(onButton, 'keydown', lang.hitch(clickButton, function(event){
            if(event.keyCode=='13')
                this.click();
            }));
        },

        // // highlight the active tool on the toolbar
        // _updateTool: function (num) {
        //     query(".panelTool").removeClass("panelToolActive");
        //     var name = this.tools[num - 1];
        //     if (name) {
        //         domClass.add("toolButton_" + name, "panelToolActive");
        //     }
        //     this.emit("updateTool", name);
        //     this.emit("updateTool_"+name);
        // },

        _updateMap: function () {
            if (this.map) {
                this.map.resize();
                this.map.reposition();
            }
        },

        // menu click
        _menuClick: function () {
            if (query("#panelTools").style("display") == "block") {
                query("#panelTools").style("display", "none");
                this._closePage();
            } else {
                query("#panelTools").style("display", "block");
            }
            this._updateMap();
        }
    });
});
