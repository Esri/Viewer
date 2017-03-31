/*This module defines feature tests for Basic Viewer features and
organizes all the conditional checking we have to do for the template in one place.
https://dojotoolkit.org/documentation/tutorials/1.8/device_optimized_builds/
http://dante.dojotoolkit.org/hasjs/tests/runTests.html*/

define(["dojo/has", "esri/lang", "dojo/_base/array"], function(has, esriLang, array) {
  var getTool = function(name, config) {
    var tool = false;
    for (var i = 0; i < config.tools.length; i++) {
      if (config.tools[i].name === name) {
        tool = config.tools[i].enabled;
        break;
      }
    }
    return tool;
  };

  /*App capabilities*/
  has.add("search", function(g) {
    var search = g.config.search || false;
    //overwrite the default with app settings
    if (g.config.hasOwnProperty("tool_search")) {
      search = g.config.tool_search;
    }
    return search;
  }); /*Toolbar tools*/
  has.add("basemap", function(g) {
    var basemap = getTool("basemap", g.config);
    //overwrite the default with app settings
    if (g.config.hasOwnProperty("tool_basemap")) {
      basemap = g.config.tool_basemap;
    }
    return basemap;
  });
  has.add("bookmarks", function(g) {
    var bookmarks = getTool("bookmarks", g.config);
    //overwrite the default with app settings
    if (g.config.hasOwnProperty("tool_bookmarks")) {
      bookmarks = g.config.tool_bookmarks;
    }
    return bookmarks;
  });
  has.add("details", function(g) {
    var details = getTool("details", g.config);
    //overwrite the default with app settings
    if (g.config.hasOwnProperty("tool_details")) {
      details = g.config.tool_details;
    }
    return details;
  });
  has.add("edit", function(g) {
    var edit = getTool("edit", g.config);
    //overwrite the default with app settings
    if (g.config.hasOwnProperty("tool_edit")) {
      edit = g.config.tool_edit;
    }
    // Make sure user priv if exists allows edtiing
    if (esriLang.isDefined(g.config.userPrivileges)) {
      if (array.indexOf(g.config.userPrivileges, "features:user:edit") === -1) {
        edit = false;
      }
    }
    return edit;
  });
  has.add("edit-toolbar", function(g) {
    var toolbar = false;

    for (var i = 0; i < g.config.tools.length; i++) {
      if (g.config.tools[i].name === "edit") {
        toolbar = g.config.tools[i].toolbar;
        break;
      }
    }
    //overwrite the default with app settings
    if (g.config.hasOwnProperty("tool_edit_toolbar")) {
      toolbar = g.config.tool_edit_toolbar;
    }
    return toolbar;
  });
  has.add("scalebar", function(g) {
    var scalebar = g.config.scalebar || false;
    //overwrite the default with app settings
    if (g.config.hasOwnProperty("scalebar")) {
      scalebar = g.config.scalebar;
    }
    return scalebar;
  });
  has.add("home", function(g) {
    var home = g.config.home || false;
    //overwrite the default with app settings
    if (g.config.hasOwnProperty("tool_home")) {
      home = g.config.tool_home;
    }
    return home;
  });
  has.add("layers", function(g) {
    var layers = getTool("layers", g.config);
    //overwrite the default with app settings
    if (g.config.hasOwnProperty("tool_layers")) {
      layers = g.config.tool_layers;
    }
    return layers;
  });

  has.add("layers-sublayers", function(g) {
    var subLayers = false;
    for (var i = 0; i < g.config.tools.length; i++) {
      if (g.config.tools[i].name === "layers") {
        subLayers = g.config.tools[i].sublayers;
        break;
      }
    }
    //overwrite the default with app settings
    if (g.config.hasOwnProperty("tool_sublayers")) {
      subLayers = g.config.tool_sublayers;
    }
    return subLayers;
  });
  has.add("layers-legend", function(g) {
    var layerLegend = false;
    for (var i = 0; i < g.config.tools.length; i++) {
      if (g.config.tools[i].name === "layers") {
        layerLegend = g.config.tools[i].legend;
        break;
      }
    }
    //overwrite the default with app settings
    if (g.config.hasOwnProperty("tool_layerlegend")) {
      layerLegend = g.config.tool_layerlegend;
    }
    return layerLegend;
  });

  has.add("layers-opacity", function(g) {
    var opacity = false;
    for (var i = 0; i < g.config.tools.length; i++) {
      if (g.config.tools[i].name === "layers") {
        opacity = g.config.tools[i].opacityslider;
        break;
      }
    }
    //overwrite the default with app settings
    if (g.config.hasOwnProperty("tool_opacity")) {
      opacity = g.config.tool_opacity;
    }
    return opacity;
  });

  has.add("legend", function(g) {
    var legend = getTool("legend", g.config);
    //overwrite the default with app settings
    if (g.config.hasOwnProperty("tool_legend")) {
      legend = g.config.tool_legend;
    }
    return legend;
  });

  has.add("locate", function(g) {
    var location = has("native-gelocation");
    if (location) {
      location = g.config.locate || false;
      if (g.config.hasOwnProperty("tool_locate")) {
        location = g.config.tool_locate;
      }
    }
    return location;
  });


  has.add("measure", function(g) {
    var measure = getTool("measure", g.config);
    //overwrite the default with app settings
    if (g.config.hasOwnProperty("tool_measure")) {
      measure = g.config.tool_measure;
    }
    return measure;
  });
  has.add("overview", function(g) {
    var overview = getTool("overview", g.config);
    //overwrite the default with app settings
    if (g.config.hasOwnProperty("tool_overview")) {
      overview = g.config.tool_overview;
    }
    return overview;
  });
  has.add("print", function(g) {
    var print = getTool("print", g.config);
    //overwrite the default with app settings
    if (g.config.hasOwnProperty("tool_print")) {
      print = g.config.tool_print;
    }
    if (print) {
      //is there a print service defined? If not set print to false
      if (g.config.helperServices.printTask.url === null) {
        print = false;
      }
    }

    return print;
  });

  has.add("print-legend", function(g) {
    var printLegend = false;
    for (var i = 0; i < g.config.tools.length; i++) {
      if (g.config.tools[i].name === "print") {
        printLegend = g.config.tools[i].legend;
        break;
      }
    }
    //overwrite the default with app settings
    if (g.config.hasOwnProperty("tool_print_legend")) {
      printLegend = g.config.tool_print_legend;
    }
    return printLegend;
  });

  has.add("print-layouts", function(g) {
    var printLayouts = false;

    for (var i = 0; i < g.config.tools.length; i++) {
      if (g.config.tools[i].name === "print") {
        printLayouts = g.config.tools[i].layouts;
        break;
      }
    }
    //overwrite the default with app settings
    if (g.config.hasOwnProperty("tool_print_layouts")) {
      printLayouts = g.config.tool_print_layouts;
    }
    return printLayouts;
  });

  has.add("share", function(g) {
    var share = getTool("share", g.config);
    //overwrite the default with app settings
    if (g.config.hasOwnProperty("tool_share")) {
      share = g.config.tool_share;
    }
    return share;
  });
  has.add("share-embed", function(g) {
    var share_embed = false;

    for (var i = 0; i < g.config.tools.length; i++) {
      if (g.config.tools[i].name === "share") {
        share_embed = g.config.tools[i].embed;
        break;
      }
    }
    //overwrite the default with app settings
    if (g.config.hasOwnProperty("tool_share_embed")) {
      share_embed = g.config.tool_share_embed;
    }
    return share_embed;
  });
  /*Geolocation Feature Detection*/
  has.add("native-gelocation", function(g) {
    return has("native-navigator") && ("geolocation" in g.navigator);
  });
  has.add("native-navigator", function(g) {
    return ("navigator" in g);
  });


  return has;
});
