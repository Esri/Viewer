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
            location: '',
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

            for(var i = 0; i<this.defaults.languages.length; i++)
            {
                var lang = this.defaults.languages[i];
                if(!lang.code || lang.code==='') continue;

                // var label = (lang.img && lang.img !== '') ?
                //    '<div class="langMenuItem"><img alt="" role="presentation" src="'+lang.img+'"> '+lang.name+'</div>'
                // :  lang.name;
                var menuItem = new MenuItem({
                    label: lang.name,
                    //onClick: function(){ alert('Item1'); }
                });
                if(lang.img && lang.img !== '') {
                    var iconCell = query(".dijitMenuItemIconCell",menuItem.domNode)[0];
                    domConstruct.create("img",{
                        src:lang.img,
                        alt:'',
                        class: 'langMenuItemIcon',
                    }, iconCell);
                }
                dojo.attr(menuItem.domNode,'aria-label', 'Change the language to '+lang.name);
                menu.addChild(menuItem);
            }

            menu.startup();

            this.button = new DropDownButton({
                label: this.defaults.locale.substring(0,2).toUpperCase(),
                image: 'images/flag.fr.22.png',
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
