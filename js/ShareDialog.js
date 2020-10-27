define([
  "dojo/Evented",
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/has",
  "esri/kernel",
  "esri/config",
  "dijit/_WidgetBase",
  "dijit/a11yclick",
  "dijit/_TemplatedMixin",
  "dojo/on",
  "dojo/dom",
  "dojo/query",
  "dojo/mouse",
  "dojo/Deferred",
  // load template
  "dojo/text!application/dijit/templates/ShareDialog.html",
  "dojo/i18n!application/nls/ShareDialog",
  "dojo/dom-class",
  "dojo/dom-style",
  "dojo/dom-attr",
  "dojo/dom-construct",
  "dijit/Tooltip",
  "esri/request",
  "esri/geometry/webMercatorUtils",
  "esri/SpatialReference",
  "esri/tasks/ProjectParameters",
  "esri/urlUtils",
  "dijit/Dialog",
  "dojo/number",
  "dojo/_base/event",
  "dojo/domReady!"
], function (
  Evented,
  declare,
  lang,
  has,
  esriNS,
  esriConfig,
  _WidgetBase,
  a11yclick,
  _TemplatedMixin,
  on,
  dom,
  query,
  mouse,
  Deferred,
  dijitTemplate,
  i18n,
  domClass,
  domStyle,
  domAttr,
  domConstruct,
  Tooltip,
  esriRequest,
  webMercatorUtils,
  SpatialReference,
  ProjectParametrs,
  urlUtils,
  Dialog,
  number,
  event) {
  var Widget = declare("esri.dijit.ShareDialog", [_WidgetBase, _TemplatedMixin, Evented], {
    templateString: dijitTemplate,
    options: {
      theme: "ShareDialog",
      dialog: null,
      useExtent: true,
      embedVisible: false,
      map: null,
      url: window.location.href,
      image: "",
      // title: window.document.title,
      summary: "",
      hashtags: "",
      mailURL: "mailto:%20?subject={title}&body={summary}%20{url}",
      facebookURL: "https://www.facebook.com/sharer/sharer.php?s=100&u={url}",
      twitterURL: "https://twitter.com/intent/tweet?url={url}&text={title}&hashtags={hashtags}",
      bitlyAPI: "https://arcg.is/prod/shorten",
      embedSizes: [{
          "width": "100%",
          "height": "640px"
        },
        {
          "width": "100%",
          "height": "480px"
        },
        {
          "width": "100%",
          "height": "320px"
        },
        {
          "width": "800px",
          "height": "600px"
        },
        {
          "width": "640px",
          "height": "480px"
        },
        {
          "width": "480px",
          "height": "320px"
        }
      ]
    },
    // lifecycle: 1
    constructor: function (options, srcRefNode) {
      // mix in settings and defaults
      var defaults = lang.mixin({}, this.options, options);
      // widget node
      this.domNode = srcRefNode;
      this._i18n = i18n;

      // properties
      this.set("theme", defaults.theme);
      this.set("url", defaults.url);
      this.set("visible", defaults.visible);
      this.set("dialog", defaults.dialog);
      this.set("embedSizes", defaults.embedSizes);
      this.set("embedHeight", defaults.embedHeight);
      this.set("embedWidth", defaults.embedWidth);
      this.set("mailURL", defaults.mailURL);
      this.set("facebookURL", defaults.facebookURL);
      this.set("twitterURL", defaults.twitterURL);
      this.set("bitlyAPI", defaults.bitlyAPI);
      this.set("image", defaults.image);
      this.set("title", defaults.title);
      this.set("summary", defaults.summary);
      this.set("hashtags", defaults.hashtags);
      this.set("useExtent", defaults.useExtent);
      // listeners
      this.watch("theme", this._updateThemeWatch);
      this.watch("url", this._updateUrl);
      this.watch("visible", this._visible);
      this.watch("embedSizes", this._setSizeOptions);
      this.watch("embed", this._updateEmbed);
      this.watch("bitlyUrl", this._updateBitlyUrl);
      this.watch("useExtent", this._useExtentChanged);
      // classes
      // embed class
      var embedClasses = "embed-page";
      if (!defaults.embedVisible) {
        embedClasses = "embed-page hide";
      }
      this.css = {
        container: "button-container",
        embed: embedClasses,
        button: "toggle-grey",
        buttonSelected: "toggle-grey-on",
        icon: "icon-share",
        linkIcon: "icon-link share-dialog-icon",
        facebookIcon: "icon-facebook-squared share-dialog-icon",
        twitterIcon: "icon-twitter share-dialog-icon",
        emailIcon: "icon-mail-alt share-dialog-icon",
        mapSizeLabel: "map-size-label",
        shareMapURL: "share-map-url",
        iconContainer: "icon-container",
        embedMapSizeDropDown: "embed-map-size-dropdown",
        shareDialogContent: "dialog-content",
        shareDialogSubHeader: "share-dialog-subheader",
        shareDialogTextarea: "share-dialog-textarea",
        shareDialogExtent: "share-dialog-extent",
        shareDialogExtentChk: "share-dialog-checkbox",
        mapSizeContainer: "map-size-container",
        embedMapSizeClear: "embed-map-size-clear",
        iconClear: "icon-clear"
      };
    },
    // bind listener for button to action
    postCreate: function () {
      this.inherited(arguments);
      this._setExtentChecked();
      this.own(on(this._extentInput, a11yclick, lang.hitch(this, this._useExtentUpdate)));

      domAttr.set("pageBody_share_extent_checkbox", "checked", true);
      this._setupCopyHTML();
    },
    // start widget. called by user
    startup: function () {
      this._init();
    },
    // connections/subscriptions will be cleaned up during the destroy() lifecycle phase
    destroy: function () {
      this.inherited(arguments);
    },
    /* ---------------- */
    /* Public Events */
    /* ---------------- */
    // load
    /* ---------------- */
    /* Public Functions */
    /* ---------------- */

    /* ---------------- */
    /* Private Functions */
    /* ---------------- */
    _setExtentChecked: function () {
      domAttr.set(this._extentInput, "checked", this.get("useExtent"));
    },
    _useExtentUpdate: function () {
      var value = domAttr.get(this._extentInput, "checked");
      this.useExtent = value;
    },
    useExtentChanged: function () {
      this.updateUrl();
    },
    _setSizeOptions: function () {
      // clear select menu
      this._comboBoxNode.innerHTML = "";
      // if embed sizes exist
      if (this.get("embedSizes") && this.get("embedSizes").length) {
        // map sizes
        for (var i = 0; i < this.get("embedSizes").length; i++) {
          if (i === 0) {
            this.set("embedWidth", this.get("embedSizes")[i].width);
            this.set("embedHeight", this.get("embedSizes")[i].height);
          }
          var option = domConstruct.create("option", {
            value: i,
            innerHTML: this.get("embedSizes")[i].width + " x " + this.get("embedSizes")[i].height
          });
          domConstruct.place(option, this._comboBoxNode, "last");
        }
      }
    },
    updateUrl: function () {
      // nothing currently shortened
      this._shortened = null;
      // no bitly shortened
      this.set("bitlyUrl", null);
      // vars
      var map = this.get("map"),
        url = this.get("url"),
        useSeparator;
      // get url params
      var urlObject = urlUtils.urlToObject(window.location.href);
      urlObject.query = urlObject.query || {};
      if (urlObject.query.locale) {
        delete urlObject.query.locale;
      }
      this._getProjectedExtent(map).then(lang.hitch(this, function (gExtent) {
        if (gExtent) {
          urlObject.query.extent = gExtent.xmin.toFixed(4) + "," + gExtent.ymin.toFixed(4) + "," + gExtent.xmax.toFixed(4) + "," + gExtent.ymax.toFixed(4);
        } else {
          urlObject.query.extent = null;
        }

        // create base url
        url = window.location.protocol + "//" + window.location.host + window.location.pathname;
        // each param
        for (var i in urlObject.query) {
          if (urlObject.query[i]) {
            // use separator
            if (useSeparator) {
              url += "&";
            } else {
              url += "?";
              useSeparator = true;
            }

            url += i + "=" + urlObject.query[i];
          }
        }
        this.url = url;
        // reset embed code
        this._setEmbedCode();
        this._shareLink().then(lang.hitch(this, function () {
          // set url value
          domAttr.set(this._shareMapUrlText, "value", this.bitlyUrl);
        }));

      }));
    },
    _getProjectedExtent: function (map) {

      var deferred = new Deferred();
      // include extent in url
      if (this.useExtent && map) {
        // get map extent in geographic
        if (map.geographicExtent) {
          deferred.resolve(map.geographicExtent);
        } else {
          var sr = new SpatialReference(4326);
          if (webMercatorUtils.canProject(map.extent, sr)) {
            deferred.resolve(webMercatorUtils.project(map.extent, sr));
          } else {
            var params = new ProjectParametrs();
            params.geometries = [map.extent];
            params.outSR = sr;
            esriConfig.defaults.geometryService.project(params).then(function (results) {
              if (results && results.length && results.length > 0) {
                deferred.resolve(results[0]);
              } else {
                deferred.resolve();
              }
            });
          }
        }
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    },
    _init: function () {
      // set sizes for select box
      this._setSizeOptions();

      var dialog = new Dialog({
        title: i18n.widgets.ShareDialog.title,
        draggable: false
      }, domConstruct.create("div"));
      this.set("dialog", dialog);

      // select menu change
      this.own(on(this._comboBoxNode, "change", lang.hitch(this, function (evt) {
        this.set("embedWidth", this.get("embedSizes")[parseInt(evt.currentTarget.value, 10)].width);
        this.set("embedHeight", this.get("embedSizes")[parseInt(evt.currentTarget.value, 10)].height);
        this._setEmbedCode();
      })));
      // facebook click
      this.own(on(this._facebookButton, a11yclick, lang.hitch(this, function () {
        this._configureShareLink(this.get("facebookURL"));
      })));
      // twitter click
      this.own(on(this._twitterButton, a11yclick, lang.hitch(this, function () {
        this._configureShareLink(this.get("twitterURL"));
      })));

      // email click
      this.own(on(this._emailButton, a11yclick, lang.hitch(this, function () {
        this._configureShareLink(this.get("mailURL"), true);
      })));

      this.own(on(this._shareMapUrlText, a11yclick, lang.hitch(this, function () {
        //this._shareLink();
        this._shareMapUrlText.setSelectionRange(0, 9999);
      })));
      // link box mouseup stop for touch devices
      this.own(on(this._shareMapUrlText, "mouseup", function (evt) {
        event.stop(evt);
      }));
      // embed box click
      this.own(on(this._embedNode, a11yclick, lang.hitch(this, function () {
        this._embedNode.setSelectionRange(0, 9999);
      })));
      // embed box mouseup stop for touch devices
      this.own(on(this._embedNode, "mouseup", function (evt) {
        event.stop(evt);
      }));

      // loaded
      this.set("loaded", true);
      this.emit("load", {});
    },
    _updateEmbed: function () {
      domAttr.set(this._embedNode, "value", this.get("embed"));
    },
    _setEmbedCode: function () {
      var es = "<iframe width='" + this.get("embedWidth") + "' height='" + this.get("embedHeight") + "' src='" + this.get("url") + "' frameborder='0' scrolling='no'></iframe>";
      this.set("embed", es);
    },
    _updateBitlyUrl: function () {
      var bitly = this.get("bitlyUrl");
      if (bitly) {
        domAttr.set(this._shareMapUrlText, "value", bitly);
      }
    },
    _shareLink: function () {
      var deferred = new Deferred();
      var currentUrl = this.get("url");

      this._shortened = currentUrl;
      // make request
      esriRequest({
        url: this.get("bitlyAPI"),
        callbackParamName: "callback",
        content: {
          longUrl: currentUrl,
          f: "json"
        },
        load: lang.hitch(this, function (response) {
          if (response && response.data && response.data.url) {
            this.set("bitlyUrl", response.data.url);

            this._shareMapUrlText.select();
            deferred.resolve();
          } else {
            deferred.resolve(null);
          }

        }),
        error: function (error) {
          deferred.resolve(null);
          console.log(error);
        }
      });

      return deferred.promise;
    },
    _configureShareLink: function (Link, isMail) {
      // replace strings
      var fullLink = lang.replace(Link, {
        url: encodeURIComponent(this.get("bitlyUrl") ? this.get("bitlyUrl") : this.get("url")),
        image: encodeURIComponent(this.get("image")),
        title: encodeURIComponent(this.get("title")),
        summary: encodeURIComponent(this.get("summary")),
        hashtags: encodeURIComponent(this.get("hashtags"))
      });
      // email link
      if (isMail) {
        window.location.href = fullLink;
      } else {
        var w = 650;
        var h = 400;
        var left = (screen.width / 2) - (w / 2);
        var top = (screen.height / 2) - (h / 2);
        window.open(fullLink, "share", 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left, true);
      }
    },

    _setupCopyHTML: function () {
      var copySupported = document.queryCommandSupported("copy");
      if (!copySupported) {
        domAttr(this._shareButton, "disabled", true);
      }
      this.own(on(this._shareButton, a11yclick, lang.hitch(this, function () {
        // this._shareLink().then(lang.hitch(this, function () {
        try {
          this._shareMapUrlText.select();
          document.execCommand("copy");
          Tooltip.show(this._i18n.widgets.ShareDialog.copied, this._shareButton);
        } catch (e) {
          console.log("Copy to clipboard not supported");
        }

        //Tooltip.show(this.i18n.shareDialog.copied, this._shareUrlButton);
        on.once(this._shareButton, mouse.leave, lang.hitch(this, function () {
          this._shareMapUrlText.blur();
          Tooltip.hide(this._shareButton);
        }));
        //}));

      })));

    }
  });
  if (has("extend-esri")) {
    lang.setObject("dijit.ShareDialog", Widget, esriNS);
  }
  return Widget;
});
