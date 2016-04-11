define([
    "dojo/_base/declare", "dojo/dom-construct", "dojo/parser", "dojo/ready",
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/_base/lang", "dojo/has", "esri/kernel",
    "dojo/text!./templates/FilterItemTemplate.html",
    "application/Filters/FilterString",
], function(
    declare, domConstruct, parser, ready, 
    _WidgetBase, _TemplatedMixin, lang, has, esriNS,
    FilterItemTemplate,
    FilterString){
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

            this.set("field_label", this.field.label);
            this.set('field_Type', this.layer.layerObject.fields.find(lang.hitch(this, function(f){return f.name == this.field.fieldName;})).type);
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
            switch(this.field_Type) {
                case "esriFieldTypeString" :
                    var filterString = new FilterString({map:this.map, layer:this.layer, field:this.field}, this.content);
                    filterString.startup();
                    break;
                default : 
                    this.content.innerHTML = "Unknown Field Type: '"+this.field_Type+"'";
                    break;
            }
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