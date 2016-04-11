define([
    "dojo/_base/declare", "dojo/dom-construct", "dojo/parser", "dojo/ready",
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/_base/lang", "dojo/has", "esri/kernel",
    "dojo/dom-style", "esri/tasks/query", "esri/tasks/QueryTask",
    "dojo/text!./templates/FilterString.html"
], function(
    declare, domConstruct, parser, ready, 
    _WidgetBase, _TemplatedMixin, lang, has, esriNS,
    domStyle, Query, QueryTask,
    FilterItemTemplate){
    var Widget = declare("FilterString", [_WidgetBase, _TemplatedMixin], {
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

        getListMode : function() {
            return this.criteria.value === ' In ' || this.criteria.value === ' Not In ';
        },

        criteriaChanged: function(ev) {
//             var listMode = ev.target.value === 'In' || ev.target.value === 'NotIn';
            switch(this.getListMode()) {
                case false: 
                    domStyle.set(this.textInput,'display', '');
                    domStyle.set(this.listInput,'display', 'none');
                    break;
                case true: 
                    domStyle.set(this.textInput,'display', 'none');
                    domStyle.set(this.listInput,'display', '');

                    if(this.listInput.innerHTML === '') {
                        var _query = new Query();
                        _query.outFields = [this.field.fieldName];
                        _query.returnGeometry = false;
                        _query.where = "1=1";
                        _query.spatialRelationship = "esriSpatialRelIntersects";
                        _query.returnDistinctValues = true;
                        _query.orderByFields = [this.field.fieldName];
                        var task = new QueryTask(this.layer.layerObject.url);
                        task.execute(_query).then(lang.hitch(this, function(results) {
                            console.log(results);
                            results.features.map(lang.hitch(this, function(f) { 
                                return f.attributes[this.field.fieldName];})).forEach(lang.hitch(this, function(v) {
                                if(v) {
//                                     console.log(v);
                                    this.listInput.innerHTML += '<input type="checkbox" value="'+v+'" />'+v+'<br />';
                                }
                            }));
                        }));
                    }
                    break;
            }
        },

        getFilterExpresion: function() {
            if(this.getListMode()) {
                var list = Array.prototype.slice.call(this.listInput.children).filter(function(c) {
                    return c.nodeName=="INPUT" && c.checked;
                    }).map(function(c) { return c.value; });
                if(list.length == 1) {
                    return this.field.fieldName+" = '"+list[0]+"'";
                }
                return this.criteria.value;
            } else {
                if(this.textInput.value !== '') {
                    return this.field.fieldName+this.criteria.value+"'"+this.textInput.value+"'";
                }
                else {
                    return null;
                }
            }
        }    
    });

    if (has("extend-esri")) {
        lang.setObject("dijit.FilterString", Widget, esriNS);
    }
    return Widget;
});