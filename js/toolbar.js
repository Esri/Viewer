define(["dojo/Evented", "dojo/_base/declare", "dojo/_base/window",
  "dojo/_base/fx", "dojo/_base/html", "dojo/_base/lang", "dojo/has",
  "dojo/dom", "dojo/dom-class", "dojo/dom-style", "dojo/dom-attr",
  "dojo/dom-construct", "dojo/dom-geometry", "dojo/on", "dojo/mouse",
  "dojo/query", "dijit/focus", "dijit/a11y", "dojo/keys", "dojo/Deferred"
], function (
  Evented, declare, win, fx, html, lang, has, dom, domClass, domStyle,
  domAttr, domConstruct, domGeometry, on, mouse, query, focus, a11y, keys,
  Deferred) {
  return declare([Evented], {
    map: null,
    tools: [],
    toollist: [],
    snap: true,
    curTool: 0,
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
      var deferred;

      deferred = new Deferred();
      this.pTools = dom.byId("panelTools");

      on(this.pTools, "keydown", lang.hitch(this, function (event) {
        var title = event.target.name;
        if (title) {
          title = title.toLowerCase();
          if (event.keyCode === keys.ENTER) {
            //  WHen we hit enter key we can focus on first element in page body.
            this.activateTool(title);
            var a = a11y.getFirstInTabbingOrder("pageBody_" + title);
            if (a) {
              focus.focus(a);
            }
            event.preventDefault();
          }
        }
      }));
      on(this.pTools, "keyup", lang.hitch(this, function () {
        if (!this.map.isKeyboardNavigation) {
          this.map.enableKeyboardNavigation();
        }
      }));

      this.pMenu = dom.byId("panelMenu");
      this.pPages = dom.byId("panelPages");

      domConstruct.empty(this.pPages);

      deferred.resolve();

      return deferred.promise;
    },
    //Create a tool and return the div where you can place content
    createTool: function (tool, panelClass) {
      var name = tool.name;
      var pressed = (this.config.activeTool === name) ? true : false;
      // add tool  aria info (https://www.w3.org/WAI/PF/aria-practices/#toolbar)
      // http://heydonworks.com/practical_aria_examples/#toolbar-widget
      var buttonText;
      if (this.config.toolbarLabels) {
        buttonText = "<span aria-hidden=true class='icon-color toolbar-icons " + "icon-" + name + "'><span class='btnText'>" + this.config.i18n.tooltips[name] + "<span></span>";
      } else {
        buttonText = "<span aria-hidden=true class='icon-color toolbar-icons " + "icon-" + name + "'></span>";
      }
      var pTool = domConstruct.create("button", {
        className: "panelTool",
        role: "button",
        name: name,
        title: this.config.i18n.tooltips[name] || name,
        innerHTML: buttonText,
        id: "panelTool_" + name
      }, this.pTools);
      if (this.config.toolbarLabels) {
        domStyle.set(pTool, "width", "auto");
        domClass.add(pTool, "labels");
        domClass.add("panelTools", "labels");
      }
      query(".icon-color").style("color", this.config.iconColor);
      if (pressed) {
        domClass.add(pTool, "pressed");
      }
      on(pTool, "click", lang.hitch(this, this._toolClick, name));
      this.tools.push(name);

      // add page
      var page = domConstruct.create("div", {
        className: "page hide",
        id: "page_" + name
      }, this.pPages);
      on(page, "keydown", lang.hitch(this, function (e) {
        if (e.keyCode === keys.ESCAPE) {
          dom.byId("close_" + name).click();
        }
      }));
      var pageContent = domConstruct.create("div", {
        className: "pageContent shadow",
        id: "pageContent_" + name,
        "tabindex": "-1",
        "role": "dialog",
        "aria-label": name,
        "aria-live": "polite"
      }, page);

      domClass.add(pageContent, panelClass);


      var pageHeader = domConstruct.create("header", {
        id: "pageHeader_" + name,
        "aria-labelledby": "pagetitle_" + name,
        className: "pageHeader bg"
      }, pageContent);

      domConstruct.create("h3", {
        className: "pageTitle fc",
        innerHTML: this.config.i18n.tooltips[name] || name,
        "aria-label": name,
        id: "pagetitle_" + name
      }, pageHeader);

      domConstruct.create("div", {
        className: "pageHeaderImg",
        title: this.config.i18n.tooltips[name] || name,
        role: "presentation",
        innerHTML: "<span aria-hidden=true class='pageIcon icon-color " + "icon-" + name + "'></span>"
      }, pageHeader);

      var pageBody = domConstruct.create("div", {
        className: "pageBody",
        tabindex: "0",
        title: this.config.i18n.tooltips[name] || name,
        id: "pageBody_" + name
      }, pageContent);

      return pageBody;
    },

    updatePageNavigation: function () {
      //Adds the up/down and close tools to the page header.
      for (var i = 0; i < this.tools.length; i++) {
        var name = this.tools[i];
        var pageClose = domConstruct.create("button", {
          className: "pageNav pageClose",
          role: "button",
          name: name,
          id: "close_" + name,
          "aria-label": this.config.i18n.nav.close + " " + name,
          title: this.config.i18n.nav.close + " " + name
        }, "pageHeader_" + name);
        if (this.config.icons === "black") {
          domClass.add(pageClose, "icons-dark");
        }
        on(pageClose, "click, keypress", lang.hitch(this, this.closePage));

        var pageUp = domConstruct.create("button", {
          className: "pageNav pageUp",
          role: "button",
          "aria-label": this.config.i18n.nav.previous,
          title: this.config.i18n.nav.previous
        }, "pageHeader_" + name);
        if (this.config.icons === "black") {
          domClass.add(pageUp, "icons-dark");
        }
        on(pageUp, "click, keypress", lang.hitch(this, this._showPreviousPage,
          name));

        if (name != this.tools[this.tools.length - 1]) {
          var pageDown = domConstruct.create("button", {
            className: "pageNav pageDown",
            role: "button",
            "aria-label": this.config.i18n.nav.next,
            title: this.config.i18n.nav.next
          }, "pageHeader_" + name);
          if (this.config.icons === "black") {
            domClass.add(pageDown, "icons-dark");
          }
          on(pageDown, "click, keypress", lang.hitch(this, this._showNextPage,
            name));
        }
      }
    },
    setContent: function (name, content) {
      domConstruct.place(content, "pageBody_" + name, "last");
    },

    activateTool: function (name) {
      var num = this._getPageNum(name);
      this._goToPage(num);
    },

    _toolClick: function (name) {
      this.activateTool(name);
    },

    _getPageNum: function (name) {
      for (var i = 0; i < this.tools.length; i++) {
        if (this.tools[i] == name) {
          return i;
        }
      }
      return 0;
    },
    _goToPage: function (num) {
      query(".page").addClass("hide");
      query("#page_" + this.tools[num]).removeClass("hide");
      this._updateMap();

      this.curTool = num;
      this._updateTool(num);

    },
    _showPreviousPage: function (name) {
      var num = this._getPageNum(name) - 1;
      this._goToPage(num);
    },

    _showNextPage: function (name) {
      var num = this._getPageNum(name) + 1;
      this._goToPage(num);
    },
    closePage: function (e) {
      var num = -1;
      this._goToPage(num);

      // Handle setting focus back to parent on toolbar
      if (e && e.target && e.target.name) {
        var tool = dom.byId("panelTool_" + e.target.name);
        if (tool) {
          focus.focus(tool);
        }
      }
    },
    // highlight the active tool on the toolbar
    _updateTool: function (num) {
      query(".panelTool").forEach(function (node) {
        domClass.remove(node, "panelToolActive");
      });

      var name = this.tools[num]; // was -1
      if (name) {
        var n = dom.byId("panelTool_" + name);
        domClass.add(n, "panelToolActive");
        focus.focus(n);
      }
      this.emit("updateTool", name);
    },
    _updateMap: function () {
      if (this.map) {
        this.map.resize();
        this.map.reposition();
      }
    }
  });
});