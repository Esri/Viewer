define(["dojo/_base/declare", "dojo/_base/lang", "dojo/has", "dojo/dom","esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/on", "dijit/form/DateTextBox",
    "dojo/Deferred", "dojo/promise/all", 
    "dojo/query", 
    "dojo/text!application/AComboBoxWidget/templates/AComboBoxWidget.html", 
    "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", "dojo/dom-construct", "dojo/_base/event", 
    "dojo/NodeList-dom", "dojo/NodeList-traverse"
    
    ], function (
        declare, lang, has, dom, esriNS,
        _WidgetBase, _TemplatedMixin, on, DateTextBox, 
        Deferred, all, 
        query,
        AComboBox, 
        domClass, domAttr, domStyle, domConstruct, event
    ) {
    var Widget = declare("esri.dijit.AComboBox", [_WidgetBase, _TemplatedMixin], {
        // defaults
        templateString: AComboBox,

        options: {
            visible: true,
            selectedItem: 0
        },

        constructor: function (options, srcRefNode) {
            var defaults = lang.mixin({}, this.options, options);
            this.set("Items", defaults.items);
            this.set("SelectedItem", defaults.selectedItem);
            this.domNode = srcRefNode;
        },

        startup: function () {
            this._init();
        },

        _init: function () {
        },

        expandCombo : function(ev) {
            var display = domStyle.get(this.popup_container,'display') === 'none' ? '' : 'none';
            console.log('expand', display);
            domStyle.set(this.popup_container,'display', display);
        }

    });
    if (has("extend-esri")) {
        lang.setObject("dijit.AComboBox", Widget, esriNS);
    }
    return Widget;
});
