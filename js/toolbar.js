define(["dojo/Evented", "dojo/_base/declare", "dojo/_base/window", "dojo/_base/fx", "dojo/_base/html", "dojo/_base/lang", "dojo/has", "dojo/dom", "dojo/dom-class", "dojo/dom-style", "dojo/dom-attr", "dojo/dom-construct", "dojo/dom-geometry", "dojo/on", "dojo/mouse", "dojo/query", "dojo/Deferred"], function (
Evented, declare, win, fx, html, lang, has, dom, domClass, domStyle, domAttr, domConstruct, domGeometry, on, mouse, query, Deferred) {
    return declare([Evented], {

        map: null,
        tools: [],
        toollist: [],
        snap: true,
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
            deferred.then(lang.hitch(this, function (config) {
                // optional ready event to listen to
                this.emit("ready", config);
            }), lang.hitch(this, function (error) {
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
                    var p = dom.byId("panelContent");
                    if (p) {
                        domClass.add(p, "modal-scrollbar");
                    }
                }
                domStyle.set(win.body(), "overflow", "hidden");

            }));
            on(this.pPages, mouse.leave, lang.hitch(this, function () {
                if (this._hasScrollbar === false) {
                    var p = dom.byId("panelContent");
                    if (p) {
                        domClass.remove(p, "modal-scrollbar");
                    }
                    domStyle.set(win.body(), "overflow-y", "auto");
                }


            }));
            domConstruct.empty(this.pPages);
            // add blank page
            domConstruct.create("div", {
                className: "pageblank",
                id: "page_blank"
            }, this.pPages);

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
        createTool: function (tool, panelClass) {
            var name = tool.name;

            // add tool
            var tip = this.config.i18n.tooltips[name] || name;
            var pTool = domConstruct.create("input", {
                type:"image",
                className: "panelTool",
                id: "panelTool_" + name,
                "aria-label": tip,
                alt: tip,
                src: "images/icons_" + this.config.icons + "/" + name + ".png",
            }, this.pTools);

            if (!has("touch")) 
            {
                domAttr.set(pTool, "title", tip);
            }

            on(pTool, "click", lang.hitch(this, this._toolClick, name));
            this.tools.push(name);

            // add page
            var page = domConstruct.create("div", {
                className: "page",
                id: "page_" + name,
            }, this.pPages);

            var pageContent = domConstruct.create("div", {
                className: "pageContent rounded shadow",
                id: "pageContent_" + name,
                role: "dialog",
                "aria-labelledby": "pagetitle_" + name,
            }, page);

            var pageHeader = domConstruct.create("div", {
                id: "pageHeader_" + name,
                className: "pageHeader bg roundedTop",
                //tabindex: 0,
            }, 
            pageContent);

            domConstruct.create("h1", {
                className: "pageTitle fc",
                innerHTML: this.config.i18n.tooltips[name] || name,
                id: "pagetitle_" + name
            }, pageHeader);

            domConstruct.create("div", {
                className: "pageHeaderImg",
                innerHTML: "<img class='pageIcon' src ='images/icons_" + this.config.icons + "/" + name + ".png' alt=''/>"
            }, pageHeader);


            var pageBody = domConstruct.create("div", {
                className: "pageBody",
                //tabindex: 0,
                id: "pageBody_" + name,
            }, 
            pageContent);
            domClass.add(pageBody, panelClass);

            return pageBody;
        },

        updatePageNavigation: function () {
            //Adds the up/down and close tools to the page header. 
            for (var i = 0; i < this.tools.length; i++) {
                var name = this.tools[i];
                var pageClose = domConstruct.create("input", {
                    type: "image",
                    className: "pageClose",
                    "aria-label": "Close Page",
                    src: 'images/close.png',
                    alt: 'Close',
                    title: 'Close',
                }, "pageHeader_" + name);
                on(pageClose, "click", lang.hitch(this, this._closePage, name));

                var pageUp = domConstruct.create("input", {
                    type: "image",
                    className: "pageUp",
                    "aria-label": "Previous Page",
                    src: 'images/up.png',
                    alt: 'Previous Page',
                    title: 'Previous Page',
                }, "pageHeader_" + name);
                on(pageUp, "click", lang.hitch(this, this._showPreviousPage, name));

                if (name != this.tools[this.tools.length - 1]) {
                    var pageDown = domConstruct.create("input", {
                        type: "image",
                        className: "pageDown",
                        "aria-label": "Next Page",
                        src: 'images/down.png',
                        alt: 'Next Page',
                        title: 'Next Page',
                    }, "pageHeader_" + name);
                    on(pageDown, "click", lang.hitch(this, this._showNextPage, name));
                }

                var pageContent = dom.byId("pageContent_" + name);
                domAttr.set(pageContent, 'data-name', name);
                on(pageContent, 'keydown', lang.hitch(this, function(event) {
                    var name = domAttr.get(event.currentTarget, 'data-name');
                    var pageHeader = dom.byId("pageHeader_" + name);
                    switch (event.keyCode) {
                        case 27:
                            var pageClose = pageHeader.querySelector(".pageClose");
                            if(pageClose)
                                pageClose.click();
                        break;
                        case 33: // PgUp
                            var pageUp = pageHeader.querySelector(".pageUp");
                            if(pageUp)
                                event.stopPropagation();
                                pageUp.click();
                            break;
                        case 34: // PgDn
                            var pageDown = pageHeader.querySelector(".pageDown");
                            if(pageDown)
                                event.stopPropagation();
                                pageDown.click();
                            break;
                        //case 36: // Home
                        case 35: 
                            event.stopPropagation();
                            this.showInstructions();
                            break;
                    };
                }));
            }
        },

        showInstructions: function() {
            this._showPage("instructions");
            var Instructions = dom.byId("pageBody_instructions");
            if(Instructions)        
            {
                //var pageHeader = dom.byId("pageHeader_" + name);
                var pagedown = Instructions.querySelector(".pageDown");
                if(pagedown)
                    pagedown.focus();
                var desc = Instructions.querySelector(".desc");
                if(desc)
                {
                    desc.focus();
                    //if(has("ie")) 
                    //    this.selectText(desc);
                }
            }
        },


        selectText: function(text) {
            var doc = document,
                //text = doc.getElementById(element),
                range, selection;    
            if (doc.body.createTextRange) {
                range = document.body.createTextRange();
                range.moveToElementText(text);
                range.select();
            } else if (window.getSelection) {
                selection = window.getSelection();        
                range = document.createRange();
                range.selectNodeContents(text);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        },
    
        setContent: function (name, content) {
            domConstruct.place(content, "pageBody_" + name, "last");
        },

        activateTool: function (name) {
            //Instead of scrolling to the tool just go there. 
            var num = this._getPageNum(name) + 1;
            var box = html.getContentBox(dom.byId("panelContent"));

            var endPos = num * box.h;

            document.body.scrollTop = endPos;
            document.documentElement.scrollTop = endPos;

            this._updateMap();

            this.curTool = num;
            this._updateTool(num);
        },

        _toolClick: function (name) {
            this._showPage(name);
        },

        _atachEnterKey: function(onButton, clickButton) {
            on(onButton, 'keydown', lang.hitch(clickButton, function(event){
            if(event.keyCode=='13')
                this.click();
            }));
        },

        _getPageNum: function (name) {
            for (var i = 0; i < this.tools.length; i++) {
                if (this.tools[i] == name) {
                    return i;
                }
            }
            return 0;
        },

        _showPage: function (name) {
            var num = this._getPageNum(name) + 1;

            if (num != this.curTool) {
                this._scrollToPage(num);
            } else {
                this._scrollToPage(0);
            }
        },

        _showPreviousPage: function (name) {
            var num = this._getPageNum(name);
            this._scrollToPage(num);
        },

        _showNextPage: function (name) {
            var num = this._getPageNum(name) + 2;
            this._scrollToPage(num);
        },

        _closePage: function (name) {
            this._scrollToPage(0);
            var tool = dom.byId("panelTool_" + name);
            if(tool)
            {
                tool.focus();
            }
        },

        _scrollToPage: function (num) {
            var box = html.getContentBox(dom.byId("panelContent"));

            var startPos = this.curTool * box.h;
            var endPos = num * box.h;
            var diff = Math.abs(num - this.curTool);
            this.snap = false;
            if (diff == 1) {
                this._animateScroll(startPos, endPos);
            } else {
                document.body.scrollTop = endPos;
                document.documentElement.scrollTop = endPos;
                this._updateMap();
                this.snap = true;
            }
            this.curTool = num;
            this._updateTool(num);

            var name = this.tools[num - 1];
            var pageBody = dom.byId("pageBody_" + name);
            if(pageBody)        
            {
                var pageHeader = dom.byId("pageHeader_" + name);
                var pageDown = pageHeader.querySelector(".pageDown");
                if(pageDown)
                    pageDown.focus();
                else {
                    var pageClose = pageHeader.querySelector(".pageClose");
                    if(pageClose)
                        pageClose.focus();
                }
            }
        },

        // window scrolled
        _windowScrolled: function (evt) {
            if (this.scrollTimer) {
                clearTimeout(this.scrollTimer);
            }
            if (this.snap === true) {
                this.scrollTimer = setTimeout(lang.hitch(this, this._snapScroll), 300);
            }
        },

        _snapScroll: function () {
            var startPos = domGeometry.docScroll().y;
            var box = html.getContentBox(dom.byId("panelContent"));
            var numActual = startPos / box.h;
            var num = Math.round(numActual);

            if (numActual > this.curTool) {
                if (numActual - this.curTool > 0.2) {
                    num = Math.ceil(startPos / box.h);
                }
                if (num > this.tools.length - 1) {
                    num = this.tools.length - 1;
                }
            } else if (numActual < this.curPage) {
                if (this.curTool - numActual > 0.2) {
                    num = Math.floor(startPos / box.h);
                }
                if (num < 0) {
                    num = 0;
                }
            }
            var endPos = num * box.h;

            this.curTool = num;
            this._updateTool(num);

            if (num != numActual) {
                this._animateScroll(startPos, endPos);
            }
        },

        _animateScroll: function (start, end) {
            //var me = this;
            var anim = new fx.Animation({
                duration: 500,
                curve: [start, end]
            });
            on(anim, "Animate", function (v) {
                document.body.scrollTop = v;
                document.documentElement.scrollTop = v;
            });

            on(anim, "End", lang.hitch(this, function () {
                setTimeout(lang.hitch(this, this._resetSnap), 500);
                this._updateMap();
            }));

            anim.play();
        },

        // highlight the active tool on the toolbar
        _updateTool: function (num) {
            query(".panelTool").removeClass("panelToolActive");
            var name = this.tools[num - 1];
            if (name) {
                domClass.add("panelTool_" + name, "panelToolActive");
            }
            this.emit("updateTool", name);
        },

        _updateMap: function () {
            if (this.map) {
                this.map.resize();
                this.map.reposition();
            }
        },

        _resetSnap: function () {
            this.snap = true;
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
