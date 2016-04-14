define([
    "dojo/Evented", "dojo/_base/declare", "dojo/dom-construct", "dojo/parser", "dojo/ready", 
    "dojo/on", "dojo/_base/connect",
    "esri/tasks/query", "esri/tasks/QueryTask", "esri/graphicsUtils",
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/_base/lang", "dojo/has", "esri/kernel", 
    "dojo/dom-style",
    "dojo/text!application/Filters/templates/FilterTab.html"
], function(
    Evented, declare, domConstruct, parser, ready, 
    on, connect,
    Query, QueryTask, graphicsUtils,
    _WidgetBase, _TemplatedMixin, lang, has, esriNS,
    domStyle,
    FilterTab
    ){
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
            var exps = [];
            this.FilterItems.filter(function(f) { return f.Active.checked;}).forEach(function(f) {
                try {
                    var exp = f.filterField.getFilterExpresion();
//                     console.log(exp);
                    if(exp) {
                        exps.push(exp);
                    }
                }
                catch (er) {
                }
            });
            if(exps.length === 1) {
                this.showBadge(true);
                this.getDefinitionExtensionExtent(layer,exps[0]);
            } else if (exps.length >= 1) {
                var op ='';
                var inList=exps.reduce(function(previousValue, currentValue) {
                    if(previousValue && previousValue!=='') 
                        op = ' AND ';
                    return previousValue+")"+op+"("+currentValue;
                });
                this.showBadge(true);
                this.getDefinitionExtensionExtent(layer,"("+inList+")");
            } else {
                this.showBadge(false);
                this.getDefinitionExtensionExtent(layer,'');
            }
        },

        getDefinitionExtensionExtent: function(layer, expression) {
            layer.layerObject.setDefinitionExpression(expression);
            var task = new QueryTask(layer.url);
            var q = new Query();
            q.where = expression ? expression : '1=1';
            q.outFields = [];
            q.returnGeometry = true;
            task.execute(q).then(function(ev) {
//                 console.log(ev);
                var myExtent = graphicsUtils.graphicsExtent(ev.features);
                var ext = myExtent.expand(1.5);
                console.log(myExtent, ext);
                filter.map.setExtent(ext);
            });
        },

        filterIgnore: function(btn) {
            var layer = this.filter.layer;
            this.getDefinitionExtensionExtent(layer, null);
            this.showBadge(false);
        },

        showBadge: function(show) {
            if (show) {
                domStyle.set(this.setIndicator,'display','');
            } else {
                domStyle.set(this.setIndicator,'display','none');
            }
            connect.publish("somefilters", [{id:this.id, show:show}]);
        },
    });

    if (has("extend-esri")) {
        lang.setObject("dijit.FilterTab", Widget, esriNS);
    }
    return Widget;
});