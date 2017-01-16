define([
    "dojo/_base/declare", "dojo/dom-construct", "dojo/parser", "dojo/ready",
    "dijit/form/ValidationTextBox",
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin",
    "dojo/_base/lang", "dojo/has", "esri/kernel",
    "dojo/dom-style", "esri/tasks/query", "esri/tasks/QueryTask",
    "dojo/text!./templates/FilterNumber.html",
    "dojo/i18n!application/nls/FilterDialog",
], function(
    declare, domConstruct, parser, ready, 
    ValidationTextBox,
    _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
    lang, has, esriNS,
    domStyle, Query, QueryTask,
    FilterItemTemplate, i18n){
    var Widget = declare("FilterNumber", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: FilterItemTemplate,

        options: {
        },        


        constructor: function(options, srcRefNode){
            var defaults = lang.mixin({format:"integer"}, this.options, options);
            this._i18n = i18n;
            this.domNode = srcRefNode;
            this.set("map", defaults.map);
            this.set("layer", defaults.layer);
            this.set("field", defaults.field);
            this.set("format", defaults.NumberFormat);
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

        getBetweenMode : function() {
            return this.criteria.value === ' BETWEEN ' || this.criteria.value === ' NOT BETWEEN ';
        },

        criteriaChanged: function(ev) {
            switch(this.getBetweenMode()) {
                case false: 
                    domStyle.set(this.divMaxValue,'display', 'none');
                    break;
                case true: 
                    domStyle.set(this.divMaxValue,'display', 'inline');
                    break;
            }
        },

        getFilterExpresion: function() {
            if(this.getBetweenMode()) {
                var minNumb = this.minValue.value;
                var maxNumb = this.maxValue.value;
                if(minNumb && maxNumb) {
                    var where = this.field.fieldName+this.criteria.value+"'"+minNumb+"' AND '"+maxNumb+"'";
                    //console.log(where);
                    return where;
                }
                else {
                    return null;
                }
            } else {
                var numb = this.minValue.value;
                if(numb) {
                    var where1 = this.field.fieldName+this.criteria.value+"'"+numb+"'";
                    //console.log(where1);
                    return where1;
                }
                else {
                    return null;
                }
            }
        }    
    });

    if (has("extend-esri")) {
        lang.setObject("dijit.FilterNumber", Widget, esriNS);
    }
    return Widget;
});