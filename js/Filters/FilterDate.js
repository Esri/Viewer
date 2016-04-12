define([
    "dojo/_base/declare", "dojo/dom-construct", "dojo/parser", "dojo/ready",
    "dijit/form/DateTextBox",
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin",
    "dojo/_base/lang", "dojo/has", "esri/kernel",
    "dojo/dom-style", "esri/tasks/query", "esri/tasks/QueryTask",
    "dojo/text!./templates/FilterDate.html"
], function(
    declare, domConstruct, parser, ready, 
    DateTextBox,
    _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
    lang, has, esriNS,
    domStyle, Query, QueryTask,
    FilterItemTemplate){
    var Widget = declare("FilterDate", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: FilterItemTemplate,

        options: {
        },        


        constructor: function(options, srcRefNode){
            var defaults = lang.mixin({}, this.options, options);

            this.domNode = srcRefNode;
            this.set("map", defaults.map);
            this.set("layer", defaults.layer);
            this.set("field", defaults.field);
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
                var minDate = this.minValue.value.getSQLDate();
                var maxDate = this.maxValue.value.getSQLDate();
                if(minDate && maxDate) {
                    var where = this.field.fieldName+this.criteria.value+"'"+minDate+"' AND '"+maxDate+"'";
                    console.log(where);
                    return where;
                }
                else {
                    return null;
                }
            } else {
                var date = this.minValue.value.getSQLDate();
                if(date) {
                    var where = this.field.fieldName+this.criteria.value+"'"+date+"'";
                    //console.log(where);
                    return where;
                }
                else {
                    return null;
                }
            }
        }    
    });

    if (has("extend-esri")) {
        lang.setObject("dijit.FilterDate", Widget, esriNS);
    }
    return Widget;
});