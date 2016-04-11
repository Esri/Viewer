define([
    "dojo/_base/declare", "dojo/dom-construct", "dojo/parser", "dojo/ready",
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/_base/lang", "dojo/has", "esri/kernel",
    "dojo/text!application/Filters/templates/FilterTab.html",
    "application/Filters/FilterString",
], function(
    declare, domConstruct, parser, ready, 
    _WidgetBase, _TemplatedMixin, lang, has, esriNS,
    FilterTab,
    FilterString){
    var Widget = declare("FilterTab", [_WidgetBase, _TemplatedMixin], {
        templateString: FilterTab,

        options: {
        },        

        constructor: function(options, srcRefNode){
            var defaults = lang.mixin({}, this.options, options);

            this.domNode = srcRefNode;
//             this.set("map", defaults.map);
//             this.set("layer", defaults.layer);
            this.set("filter", defaults.filter);

            this.set("filter_name", this.filter.layer.resourceInfo.name);
            this.set("checked", defaults.checked);

        },
        
        startup: function () {
            this._init();
        },

        _init: function () {
             this.filter.fields.forEach(lang.hitch(this, function(fl){
                 this.fieldsCombo.innerHTML += '<option value="'+fl.fieldName+'">'+fl.label+'</option>';
             }));

        },

        filterAdd: function(ev) {
            var fieldId = this.fieldsCombo.value;
            var field = this.filter.fields.find(function(f) {return f.fieldName === fieldId;});
//                 console.log(field);
            
            var layer = this.filter.layer;

            var itemItem = new FilterItem({map:layer.layerObject._map, layer:layer, field:field});//, myItem);
            this.filterList.appendChild(itemItem.domNode);
            itemItem.startup();        
        },

        filterApply: function(btn) {
            alert(1);
        },

        filterIgnore: function(btn) {
            alert(2);
        },
    });

    if (has("extend-esri")) {
        lang.setObject("dijit.FilterTab", Widget, esriNS);
    }
    return Widget;
});