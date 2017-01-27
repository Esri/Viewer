define([
    "dojo/Evented", "dojo/_base/declare", "dojo/_base/lang", "dojo/has", "dojo/dom","esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/on",
    "dojo/query", "dijit/registry",
    "dojo/text!application/LanguageSelect/templates/LanguageSelect.html", 
    "dojo/i18n!application/nls/LanguageSelect",
    "dijit/form/DropDownButton", "dijit/DropDownMenu", "dijit/MenuItem",
    "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", 
    "dojo/dom-construct", "dojo/_base/event", "esri/lang", 
    "dojo/NodeList-dom", "dojo/NodeList-traverse"
    
    ], function (
        Evented, declare, lang, has, dom, esriNS,
        _WidgetBase, _TemplatedMixin, on, 
        query, registry,
        LanguageSelectTemplate, i18n,
        DropDownButton, DropDownMenu, MenuItem,
        domClass, domAttr, domStyle, 
        domConstruct, event, esriLang
    ) {
    var Widget = declare("esri.dijit.LanguageSelect", [_WidgetBase, _TemplatedMixin, Evented], {
        templateString: LanguageSelectTemplate,

        options: {
            locale: 'en-us',
            languages:{}, 
            textColor:null
        },

        constructor: function (options, srcRefNode) {
            this.defaults = lang.mixin({}, this.options, options);
            //this._i18n = i18n;
            this.domNode = srcRefNode;

            var link = document.createElement("link");
            link.href = "js/LanguageSelect/Templates/LanguageSelect.css";
            link.type = "text/css";
            link.rel = "stylesheet";
            document.getElementsByTagName("head")[0].appendChild(link);

        },

        Click: function(e) { 
            //console.log(e.srcElement.parentElement);
            var locale=e.srcElement.dataset.code || e.srcElement.parentElement.dataset.code || e.srcElement.parentElement.parentElement.dataset.code;
            var appId=e.srcElement.dataset.appid || e.srcElement.parentElement.dataset.appid || e.srcElement.parentElement.parentElement.dataset.appid;
            if(!appId || appId==='' || appId === "undefined" || appId === undefined) {
                appId = /(?:[?|&]appid=)([a-z0-9]*)/gi.exec(window.location.search);
                if(appId && appId.length===2) {
                    appId = appId[1];
                }
            }
            window.location.search=('?appid='+appId+'&locale='+locale).toLowerCase();
        },

        startup: function () {
            if(this.button) return;

            var menu = new DropDownMenu({ style: "display: none;"});
            var currentLocale = this.defaults.locale.substring(0,2).toUpperCase();
            var currentIcon = null;
            var currentLanguage = null;

            for(var i = 0; i<this.defaults.languages.length; i++)
            {
                var lang = this.defaults.languages[i];
                if(!lang.code || lang.code==='') continue;

                var menuItem = new MenuItem({
                    label: lang.name,
                    'data-code': lang.code,
                    'data-appid': lang.appId,
                });
                on(menuItem, 'click', this.Click);

                if(lang.img && lang.img !== '') {
                    var iconCell = query(".dijitMenuItemIconCell",menuItem.domNode)[0];
                    domConstruct.create("img",{
                        src:lang.img,
                        alt:'',
                        class: 'langMenuItemIcon',
                        'data-code': lang.code,
                        'data-appid': lang.appId,
                    }, iconCell);
                }
                var langHint = i18n.widgets.languageSelect.aria.changeLanguage+" "+lang.name;
                dojo.attr(menuItem.domNode,'aria-label', langHint);
                dojo.attr(menuItem.domNode,'title', esriLang.stripTags(langHint));
                dojo.attr(menuItem.domNode,'data-code', lang.code);
                dojo.attr(menuItem.domNode,'data-appId', lang.appId);
                menu.addChild(menuItem);

                if(lang.code.toUpperCase() === this.defaults.locale.toUpperCase()) {
                    if(lang.img && lang.img !== '') {
                        currentIcon = domConstruct.create("img",{
                            src:lang.img,
                            alt:'',
                            class: 'langIcon',
                            'data-code': lang.code,
                            'data-appid': lang.appId,
                        });
                        if(lang.shortName && lang.shortName !== "") {
                            currentLocale = "";
                        }
                        currentLanguage = lang.name;
                    }
                }
            }

            menu.startup();

            this.button = new DropDownButton({
                label: currentLocale,
                dropDown: menu,
            });
            this.button.startup();

            if(currentIcon) {
                dojo.removeClass(this.button.iconNode, "dijitNoIcon");
                dojo.place(currentIcon, this.button.iconNode);
                var currentHint = i18n.widgets.languageSelect.aria.currentLanguage+" "+currentLanguage;
                dojo.attr(this.button.iconNode,'aria-label', currentHint);
                dojo.attr(this.button.iconNode,'title', esriLang.stripTags(currentHint));
            } else {
                if(this.defaults.textColor)
                    dojo.attr(this.button,'style', 'color:'+this.defaults.textColor+';');
            }

            this.domNode.appendChild(this.button.domNode);

            query('.dijitMenuTable').forEach(function(table){
                dojo.attr(table, "role", "presentation");
            });

            query('.dijitPopup').forEach(function(table){
                dojo.attr(table, "role", "menu");
            });
        }
    });

    if (has("extend-esri")) {
        lang.setObject("dijit.LanguageSelect", Widget, esriNS);
    }
    return Widget;
});
