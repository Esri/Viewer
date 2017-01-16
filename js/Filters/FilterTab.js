define([
    "dojo/Evented", "dojo/_base/declare", "dojo/dom-construct", "dojo/dom-class", "dojo/parser", "dojo/ready", 
    "dojo/on", "esri/tasks/query", "esri/tasks/QueryTask", "esri/graphicsUtils",
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/_base/lang", "dojo/has", "esri/kernel", 
    "dojo/dom", "dojo/query", "dojo/dom-attr", "dojo/dom-style",
    "dojo/text!application/Filters/templates/FilterTab.html",
    "dojo/i18n!application/nls/FilterDialog"
], function(
    Evented, declare, domConstruct, domClass, parser, ready, 
    on, Query, QueryTask, graphicsUtils,
    _WidgetBase, _TemplatedMixin, lang, has, esriNS,
    dom, query, domAttr, domStyle, 
    FilterTabTemplate,
    i18n
    ){
    var Widget = declare("FilterTab", [_WidgetBase, _TemplatedMixin, Evented], {
        templateString: FilterTabTemplate,

        options: {
        },        

        constructor: function(options, srcRefTabsZone, srcRefTabsContent){
            var defaults = lang.mixin({}, this.options, options);
            this._i18n = i18n;

            //this.domNode = srcRefNode;
            this.set("filter", defaults.filter);

            this.set("filter_name", this.filter.layer.resourceInfo.name);
            // this.set("checked", defaults.checked);
            this.set("FilterItems", []);
            //this.set("filtersOn", []);


            if(window.filtersOn === undefined) {
                window.filtersOn = [];
            }
        },
        
        FilterItems: [],

        startup: function () {
            this._init();
        },

        fieldSelect:null,

        _init: function () {
            var items = [];
            this.filter.fields.forEach(lang.hitch(this, function(fl){
                this.fieldsCombo.innerHTML += '<option value="'+fl.fieldName+'">'+fl.label+'</option>';
            }));
        },

        filterKeyPress: function(btn) {
            // console.log(btn, btn.currentTarget.parentElement);
            if(btn.keyCode == 13 || btn.keyCode == 32) {
                btn.currentTarget.parentElement.click();
            }
        },

        filterChange: function(ev) {
            var pageId = ev.target.value;
            var pages = document.querySelectorAll('.tabContent');
            for(var i = 0; i< pages.length; i++) {
                var page = pages[i];
                if(page.id === pageId) {
                    domClass.add(page, 'tabShow');
                    domClass.remove(page, 'tabHide');
                } else {
                    domClass.add(page, 'tabHide');
                    domClass.remove(page, 'tabShow');
                }
            }
        },

        check: function() {
            this.btn.checked=true;
        },

        _filterAdd: function(fieldId) {
            var field = this.filter.fields.find(function(f) {return f.fieldName === fieldId;});
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
        
        filterAdd: function(ev) {
            var fieldId = this.fieldsCombo.value;
            this._filterAdd(fieldId);
        },

        filterApply: function(btn) {
            var layer = this.filter.layer;
            var exps = [];
            this.FilterItems.filter(function(f) { return f.Active.checked;}).forEach(function(f) {
                try {
                    var exp = f.filterField.getFilterExpresion();
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
                var myExtent = graphicsUtils.graphicsExtent(ev.features);
                if(myExtent.xmin===myExtent.xmax && myExtent.ymin===myExtent.ymax) {
                    filter.map.centerAndZoom(myExtent.getCenter(), 13);
                }
                else {
                    var ext = myExtent.expand(1.5);
                    filter.map.setExtent(ext);
                }
            });
        },

        filterIgnore: function(btn) {
            var layer = this.filter.layer;
            this.getDefinitionExtensionExtent(layer, null);
            this.showBadge(false);
        },

        showBadge: function(show) {
            var tabIndex = window.filtersOn.indexOf(this.id);
            var tabIndicator = query('#'+this.id+"_img")[0];
            if(show) {
                domStyle.set(tabIndicator,'display','');
                if(tabIndex<0)
                {
                    window.filtersOn.push(this.id);   
                }
            } else {
                domStyle.set(tabIndicator,'display','none');
                if(tabIndex>=0)
                {
                    window.filtersOn.splice(tabIndex, 1);  
                }                          
            }
            
            var badgeindicator = query('#badge_somefilters')[0];
                if (window.filtersOn.length>0) {
                    domStyle.set(badgeindicator,'display','');
                    domAttr.set(badgeindicator, "title", i18n.widgets.FilterTab.someFilters);
                    domAttr.set(badgeindicator, "alt", i18n.widgets.FilterTab.someFilters);
                } else {
                    domStyle.set(badgeindicator,'display','none');
                }

        },
    });

    if (has("extend-esri")) {
        lang.setObject("dijit.FilterTab", Widget, esriNS);
    }
    return Widget;
});