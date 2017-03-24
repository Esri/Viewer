define(["dojo/_base/declare", "dojo/Deferred", "dojo/promise/all", "dojo/_base/lang", "dojo/_base/array", "esri/arcgis/utils", "esri/lang", "esri/tasks/PrintTemplate", "esri/request"], function (
declare, Deferred, all, lang, array, arcgisUtils, esriLang, PrintTemplate, esriRequest) {
    return declare(null, {
        constructor: function (parameters) {
            lang.mixin(this.printConfig, parameters);
        },
        //*********
        //Variables
        //************
        //defaultFormat: "pdf",
        printConfig: {
            templates: null,
            layouts: false,
            legendLayers: [],
            printi18n: null,
            format: "pdf",
            printTaskUrl: null,
            layoutOptions: {
                "titleText": null,
                "scalebarUnit": null,
                "legendLayers": []
            }
        },
        templates: [],
        legendLayers: [],
        //optional array of additional search layers to configure from the application config process
        createPrintOptions: function () {
            var deferred = new Deferred();
            all([
            this._buildPrintLayouts(), this._createPrintLegend()]).then(lang.hitch(this, function (results) {
                deferred.resolve({
                    templates: this.templates,
                    legendLayers: this.legendLayers
                });
            }));

            return deferred.promise;

        },
        _createPrintLegend: function () {
            var deferred = new Deferred();

            var layers = arcgisUtils.getLegendLayers(this.printConfig.legendLayers);
            this.legendLayers = array.map(layers, function (layer) {
                return {
                    "layerId": layer.layer.id
                };
            });

            deferred.resolve(true);
            return deferred.promise;
        },
        _buildPrintLayouts: function () {
            var deferred = new Deferred();
            if(this.printConfig.templates){
                this.templates = this.printConfig.templates;
                array.forEach(this.templates, lang.hitch(this, function(template){
                    if(template.layout === "MAP_ONLY"){
                        template.exportOptions = {
                            width:670,
                            height:500,
                            dpi:96
                        };
                    }
                    template.layoutOptions = this.printConfig.layoutOptions;
                }));
                deferred.resolve(true);
            }else if (this.printConfig.layouts) {
                esriRequest({
                    url: this.printConfig.printTaskUrl,
                    content: {
                        "f": "json"
                    },
                    callbackParamName: "callback"
                }).then(lang.hitch(this, function (response) {

                    var layoutTemplate, templateNames, mapOnlyIndex;

                    layoutTemplate = array.filter(response.parameters, function (param, idx) {
                        return param.name === "Layout_Template";
                    });

                    if (layoutTemplate.length === 0) {
                        console.log("print service parameters name for templates must be \"Layout_Template\"");
                        return;
                    }
                    templateNames = layoutTemplate[0].choiceList;


                    // remove the MAP_ONLY template then add it to the end of the list of templates
                    mapOnlyIndex = array.indexOf(templateNames, "MAP_ONLY");
                    if (mapOnlyIndex > -1) {
                        var mapOnly = templateNames.splice(mapOnlyIndex, mapOnlyIndex + 1)[0];
                        templateNames.push(mapOnly);
                    }

                    // create a print template for each choice
                    this.templates = array.map(templateNames, lang.hitch(this, function (name) {
                        var plate = new PrintTemplate();
                        plate.layout = plate.label = name;
                        plate.format = this.printConfig.format;
                        plate.layoutOptions = this.printConfig.layoutOptions;
                        return plate;
                    }));
                    deferred.resolve(true);
                }));
            } else {
                //var letterAnsiAPlate = new PrintTemplate();
                // letterAnsiAPlate.layout = "Letter ANSI A Landscape";
                var landscapeFormat = new PrintTemplate();
                landscapeFormat.layout = "Letter ANSI A Landscape";
                landscapeFormat.layoutOptions = this.printConfig.layoutOptions;
                landscapeFormat.format = this.printConfig.format;
                landscapeFormat.label = this.printConfig.printi18n.layouts.label1 + " ( " + this.printConfig.format + " )";

                var portraitFormat = new PrintTemplate();
                portraitFormat.layout = "Letter ANSI A Portrait";
                portraitFormat.layoutOptions = this.printConfig.layoutOptions;
                portraitFormat.format = this.printConfig.format;
                portraitFormat.label = this.printConfig.printi18n.layouts.label2 + " ( " + this.printConfig.format + " )";


                var landscapeImage = new PrintTemplate();
                landscapeImage.layout = "Letter ANSI A Landscape";
                landscapeImage.layoutOptions = this.printConfig.layoutOptions;
                landscapeImage.format = "png32";
                landscapeImage.label = this.printConfig.printi18n.layouts.label3 + " ( image )";


                var portraitImage = new PrintTemplate();
                portraitImage.layout = "Letter ANSI A Portrait";
                portraitImage.layoutOptions = this.printConfig.layoutOptions;
                portraitImage.format = "png32";
                portraitImage.label = this.printConfig.printi18n.layouts.label4 + " ( image )";



                this.templates = [landscapeFormat, portraitFormat, landscapeImage, portraitImage];

                deferred.resolve(true);

            }
            return deferred.promise;


        }

    });
});