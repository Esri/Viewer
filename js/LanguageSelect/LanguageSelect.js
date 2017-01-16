define([
    "dojo/Evented", "dojo/_base/declare", "dojo/_base/lang", "dojo/has", "dojo/dom","esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/on",
    "dojo/query", "dijit/registry",
    "dojo/text!application/LanguageSelect/templates/LanguageSelect.html", 
    //"dojo/i18n!application/nls/LanguageSelect",
    "dijit/form/DropDownButton", "dijit/DropDownMenu", "dijit/MenuItem",
    "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", 
    "dojo/dom-construct", "dojo/_base/event", 
    "dojo/NodeList-dom", "dojo/NodeList-traverse"
    
    ], function (
        Evented, declare, lang, has, dom, esriNS,
        _WidgetBase, _TemplatedMixin, on, 
        query, registry,
        LanguageSelectTemplate, //i18n,
        DropDownButton, DropDownMenu, MenuItem,
        domClass, domAttr, domStyle, 
        domConstruct, event
    ) {
    var Widget = declare("esri.dijit.LanguageSelect", [_WidgetBase, _TemplatedMixin, Evented], {
        templateString: LanguageSelectTemplate,

        options: {
            locale: 'en-us',
            params: '',
            languages:{}
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

        startup: function () {
            if(this.button) return;

            var menu = new DropDownMenu({ style: "display: none;"});
            var menuItem1 = new MenuItem({
                label: "Item1",
                //iconClass:"dijitEditorIcon dijitEditorIconSave",
                onClick: function(){ alert('Item1'); }
            });
            menu.addChild(menuItem1);

            var menuItem2 = new MenuItem({
                label: "Item2",
                //iconClass:"dijitEditorIcon dijitEditorIconCut",
                onClick: function(){ alert('Item2'); }
            });

            menu.addChild(menuItem2);

            var menuItem3 = new MenuItem({
                label: "Item3",
                //iconClass:"dijitEditorIcon dijitEditorIconCut",
                onClick: function(){ alert('Item3'); }
            });

            menu.addChild(menuItem3);

            menu.startup();

            this.button = new DropDownButton({
                label: this.defaults.locale.substring(0,2).toUpperCase(),
                name: "languageSelect",
                dropDown: menu,
                // id: "languageSelect"
            });
            this.button.startup();

            dom.byId("languageSelectNode").appendChild(this.button.domNode);
        }
    });

    if (has("extend-esri")) {
        lang.setObject("dijit.LanguageSelect", Widget, esriNS);
    }
    return Widget;
});
