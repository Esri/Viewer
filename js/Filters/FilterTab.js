define([
    "dojo/Evented", "dojo/_base/declare", "dojo/dom-construct", "dojo/parser", "dojo/ready", "dojo/on", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/_base/lang", "dojo/has", "esri/kernel", 
    "dojo/dom-style",
    "dojo/text!application/Filters/templates/FilterTab.html",
    "application/Filters/FilterString",
], function(
    Evented, declare, domConstruct, parser, ready, on,
    _WidgetBase, _TemplatedMixin, lang, has, esriNS,
    domStyle,
    FilterTab,
    FilterString){
    var Widget = declare("FilterTab", [_WidgetBase, _TemplatedMixin, Evented], {
        templateString: FilterTab,

        options: {
        },        

        constructor: function(options, srcRefNode){
            var defaults = lang.mixin({}, this.options, options);

            this.domNode = srcRefNode;
            this.set("filter", defaults.filter);

            this.set("filter_name", this.filter.layer.resourceInfo.name);
            this.set("checked", defaults.checked);
            this.set("FilterItems", []);

        },
        
        FilterItems: [],

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

            var filterItem = new FilterItem({map:layer.layerObject._map, layer:layer, field:field});//, myItem);
            this.filterList.appendChild(filterItem.domNode);
            filterItem.startup(); 
            this.FilterItems.push(filterItem); 
            filterItem.on("removeFilterItem", lang.hitch(this, function (id) {
                this.FilterItems.splice(this.FilterItems.indexOf(filterItem), 1);
            }));
            filterItem.domNode.focus();
        },

        filterApply: function(btn) {
            var layer = this.filter.layer;
            domStyle.set(this.setIndicator,'display','');
            this.FilterItems.forEach(function(f) {
                try {
                    var exp = f.filterField.getFilterExpresion();
                    console.log(exp);
                    if(exp) {
                        layer.layerObject.setDefinitionExpression(exp);
                    }
                }
                catch (er) {
                }
            });
        },

        filterIgnore: function(btn) {
            var layer = this.filter.layer;
            layer.layerObject.setDefinitionExpression(null);
            domStyle.set(this.setIndicator,'display','none');
        },
    });

    if (has("extend-esri")) {
        lang.setObject("dijit.FilterTab", Widget, esriNS);
    }
    return Widget;
});