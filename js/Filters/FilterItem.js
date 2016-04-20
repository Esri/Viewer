define([
    "dojo/Evented", "dojo/_base/declare", "dojo/dom-construct", "dojo/parser", "dojo/ready",
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/_base/lang", "dojo/has", "esri/kernel",
    "dojo/text!application/Filters/templates/FilterItem.html",
    "application/Filters/FilterString",
    "application/Filters/FilterDate",
    "application/Filters/FilterNumber",
], function(
    Evented, declare, domConstruct, parser, ready, 
    _WidgetBase, _TemplatedMixin, lang, has, esriNS,
    FilterItemTemplate,
    FilterString, FilterDate, FilterNumber){
    var Widget = declare("FilterItem", [_WidgetBase, _TemplatedMixin, Evented], {
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
            this.set('filterField', null);
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
            // esriFieldTypeString, esriFieldTypeDate, esriFieldTypeDouble, 
            // esriFieldTypeInteger, esriFieldTypeOID, 

            switch(this.field_Type) {
                case "esriFieldTypeString" :
                    this.filterField = new FilterString({map:this.map, layer:this.layer, field:this.field}, this.content);
                    this.filterField.startup();
                    break;
                case "esriFieldTypeDate" :
                    this.filterField = new FilterDate({map:this.map, layer:this.layer, field:this.field}, this.content);
                    this.filterField.startup();
                    break;
                case "esriFieldTypeInteger" :
                    this.filterField = new FilterNumber({map:this.map, layer:this.layer, field:this.field, format:"\\\\d+"}, this.content);
                    this.filterField.startup();
                    break;
                case "esriFieldTypeDouble" :
                    this.filterField = new FilterNumber({map:this.map, layer:this.layer, field:this.field, format:"\\\\d+\\\\.?\\\\d*"}, this.content);
                    this.filterField.startup();
                    break;
                default : 
                    this.content.innerHTML = "Unknown Field Type: '"+this.field_Type+"'";
                    break;
            }
        },

        filterRemove: function(btn) {
            var id = this.domNode.id;
            this.emit("removeFilterItem", {id:id});
            this.domNode.remove();
        },
    });

    if (has("extend-esri")) {
        lang.setObject("dijit.FilterItem", Widget, esriNS);
    }
    return Widget;
});