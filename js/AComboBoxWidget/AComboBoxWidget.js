define(["dojo/_base/declare", "dojo/_base/lang", "dojo/has", "dojo/dom","esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/on", "dijit/form/DateTextBox",
    "dojo/Deferred", "dojo/promise/all", 
    "dojo/query", "dojo/_base/fx", "dojo/dom-style",
    "dojo/text!application/AComboBoxWidget/templates/AComboBoxWidget.html", 
    "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", "dojo/dom-construct", "dojo/_base/event", 
    "dojo/NodeList-dom", "dojo/NodeList-traverse"
    
    ], function (
        declare, lang, has, dom, esriNS,
        _WidgetBase, _TemplatedMixin, on, DateTextBox, 
        Deferred, all, 
        query, fx, style,
        AComboBox, 
        domClass, domAttr, domStyle, domConstruct, event
    ) {
    var Widget = declare("esri.dijit.AComboBox", [_WidgetBase, _TemplatedMixin], {
        // defaults
        templateString: AComboBox,

        options: {
            visible: true,
            selectedIndex: 0,
            expanded: false,
        },

        constructor: function (options, srcRefNode, labelRefNode) {
            var defaults = lang.mixin({}, this.options, options);
            this.set("ComboItems", defaults.items);
            this.set("SelectedIndex", defaults.selectedIndex);
            if(srcRefNode)
            {
                this.domNode = srcRefNode;
            }
            if(labelRefNode)
            {
                this.labelRefNode = labelRefNode;
            }

            this.set('expanded', defaults.expanded);
        },

        startup: function () {
            this._init();
        },

        _init: function () {
            this.inputControl.onblur = lang.hitch(this, function() { 
                this._expandCombo(true);
            });
            if(this.labelRefNode){
                domAttr.set(this.labelRefNode,'for',this.inputControl.id);
            }
            this.ListItems.innerHTML= '';
            for(var i=0; i<this.ComboItems.length; i++) {
                var item = this.ComboItems[i];
                var itemId = this.id+'_listbox__option__'+i;

                var li = domConstruct.create("li", {
                    id: itemId,
                    role:"option",
                    tabindex: 0,
                    value: item.value,
                    'data-index':i,
                    innerHTML: item.name,
                    class: (i === this.SelectedIndex) ? 'selected' : '',
                    'aria-selected': (i === this.SelectedIndex) ? 'true' : 'false',
                });
                on(li, 'click', lang.hitch(this, this.selectItem));
                
                domConstruct.place(li, this.ListItems);

                if(i === this.SelectedIndex) {
                    this._setSelectedIndex(i);
                }
            }

        },

        selectItem : function(ev) {
            this._setSelectedIndex(ev.currentTarget.dataset.index);
        },

        _setSelectedIndex : function(index) {
            var item = this.ComboItems[index];
            var itemId = this.id+'_listbox__option__'+index;
            this.SelectedIndex = index;
            domAttr.set(this.inputControl, 'aria-activedescendant', itemId);
            domAttr.set(this.inputControl, 'value', item.name);
            this.selectedItem = item.name;
            this.selectedValue = item.value;

            var oldSelectedNode = document.querySelector('#'+this.id+' .selected');
            if(oldSelectedNode) {
                domAttr.set(oldSelectedNode, 'class', '');
                domAttr.set(oldSelectedNode, 'aria-selected', 'false');
            }
            
            var node = document.querySelector('#'+itemId);
            domAttr.set(node, 'class', 'selected');
            domAttr.set(node, 'aria-selected', 'true');
            node.scrollIntoView(false);
            return item;
        },

        expandCombo : function(ev) {
            var display = domStyle.get(this.popup_container,'display') !== 'none';
            this._expandCombo(display);
        },

        _expandCombo : function(expand) {

            this.expanded = expand;
            domAttr.set(this.inputControl, 'aria-expanded', !expand+'');
            if(expand) {
                fx.fadeOut({
                    node: this.popup_container,
                    duration: 450,
                    onBegin: lang.hitch(this, function(){
                        style.set(this.popup_container, "opacity", "1");
                    }),
                    onEnd: lang.hitch(this, function(){
                        domStyle.set(this.popup_container,'display', 'none');
                    }),
                }).play();
            } else {
                fx.fadeIn({
                    node: this.popup_container,
                    duration: 450,
                    onBegin: lang.hitch(this, function(){
                        style.set(this.popup_container, "opacity", "0");
                        domStyle.set(this.popup_container,'display', '');
                    }),
                }).play();
            }
        },

        navigateCombo : function(ev) {
            // console.log('keyDown', ev);
            switch(ev.keyIdentifier) {
//                 case "Alt" : //?
//                     ev.preventDefault = true;
//                     break;
                case "Enter" :
                    lang.hitch(this, this._expandCombo(false));
                    ev.preventDefault = true;
                    break;
                case "Down" :
                    if(this.SelectedIndex < this.ComboItems.length-1) {
                        this._setSelectedIndex(++this.SelectedIndex);
                    }
                    ev.preventDefault = true;
                    break;
                case "Up" :
                    if(this.SelectedIndex > 0) {
                        this._setSelectedIndex(--this.SelectedIndex);
                    }
                    ev.preventDefault = true;
                    break;
                case "Home" :
                    this._setSelectedIndex(0);
                    ev.preventDefault = true;
                    break;
                case "End" :
                    this._setSelectedIndex(this.ComboItems.length-1);
                    ev.preventDefault = true;
                    break;
            }
        },

    });
    if (has("extend-esri")) {
        lang.setObject("dijit.AComboBox", Widget, esriNS);
    }
    return Widget;
});
