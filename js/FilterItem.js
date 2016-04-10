define([
    "dojo/_base/declare", "dojo/dom-construct", "dojo/parser", "dojo/ready",
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/_base/lang", "dojo/has", "esri/kernel",
    "dojo/text!application/dijit/templates/FilterItemTemplate.html"
], function(
    declare, domConstruct, parser, ready, 
    _WidgetBase, _TemplatedMixin, lang, has, esriNS,
    FilterItemTemplate){
    var Widget = declare("FilterItem", [_WidgetBase, _TemplatedMixin], {
        templateString: FilterItemTemplate,

        options: {
        },        

        constructor: function(options, srcRefNode){
            var defaults = lang.mixin({}, this.options, options);

            this.domNode = srcRefNode;
            this.set("map", defaults.map);
            this.set("layer", defaults.layer);
            this.set("field", defaults.field);

            this.set("field_label", this.field.fieldName);
            this.set('field_Type', this.layer.layerObject.fields.find(lang.hitch(this, function(f){return f.name == this.field.fieldName;})).type);
            this.set("content", this.field_Type);
        },
        
        startup: function () {
            if (!this.map) {
                this.destroy();
                console.log("Filter::map required");
            }
            if (this.map.loaded) {
                this._init();
            } else {
                on.once(this.map, "load", lang.hitch(this, function () {
                    this._init();
                }));
            }
        },

        _init: function () {
            this.domNode = domConstruct.create("div", {innerHTML: this.field.fieldName});
        },

        filterRemove: function(btn) {
            this.domNode.remove();
        },
    });

    if (has("extend-esri")) {
        lang.setObject("dijit.FilterItem", Widget, esriNS);
    }
    return Widget;
});