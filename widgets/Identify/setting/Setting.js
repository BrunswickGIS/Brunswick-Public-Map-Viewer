///////////////////////////////////////////////////////////////////////////
// Robert Scheitlin WAB Identify Widget
///////////////////////////////////////////////////////////////////////////
/*global define, setTimeout, window*/
/*jshint maxlen: 250*/
define([
    'dojo/_base/declare',
    'dijit/_WidgetsInTemplateMixin',
    'jimu/BaseWidgetSetting',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/html',
    'dojo/_base/query',
    'dojo/on',
    'jimu/dijit/Message',
    'jimu/dijit/Popup',
    'dojo/keys',
    './GeneralEdit',
    './SymbologyEdit',
    './ResultFormatEdit',
    './IdentifyLayerEdit',
    './ExcludeLayerEdit',
    'jimu/dijit/SimpleTable',
    'dijit/form/NumberSpinner',
    'dijit/form/Select',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin'
  ],
  function(
    declare,
    _WidgetsInTemplateMixin,
    BaseWidgetSetting,
    lang,
    array,
    html,
    query,
    on,
    Message,
    Popup,
    keys,
    GeneralEdit,
    SymbologyEdit,
    ResultFormatEdit,
    IdentifyLayerEdit,
    ExcludeLayerEdit) {
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
      //these two properties is defined in the BaseWidget
      baseClass: 'widget-identify-setting',
      dnls: null,
      popupgeneraledit: null,
      popupsymedit: null,
      popupformatedit: null,
      popuplayeredit: null,
      popupexcludelayeredit: null,
      popup: null,
      popup2: null,
      popup3: null,
      popup4: null,
      popupState: null,
      layerInfoCache: null,
      generalOps: null,

      postMixInProperties:function(){
        this.dnls = window.jimuNls.drawBox;
      },

      postCreate:function(){
        this.inherited(arguments);
        this.layerInfoCache = {};
        this._bindEvents();
        this.setConfig(this.config);
      },

      _bindEvents: function() {
        this.own(on(this.btnGeneralSettings,'click',lang.hitch(this,function(){
          this._openGeneralEdit(this.nls.editGeneralSettings);
        })));
        this.own(on(this.btnSymIdentify,'click',lang.hitch(this,function(){
          this._openSymEdit(this.nls.editDefaultSym);
        })));
        this.own(on(this.btnFormatResults,'click',lang.hitch(this,function(){
          this._openFormatEdit(this.nls.editResultFormat);
        })));
        this.own(on(this.btnAddLayer,'click',lang.hitch(this,function(){
          var args = {
            config: null
          };
          this.popupState = 'ADD';
          var tr = this._createLayer(args);
          if (tr) {
            this._openILEdit(this.nls.addLayer, tr);
          }
        })));
        this.own(on(this.btnAddExcludeLayer,'click',lang.hitch(this,function(){
          var args = {
            config: {}
          };
          this.popupState = 'ADD';
          var tr = this._createELayer(args);
          if (tr) {
            this._openIELEdit(this.nls.addExcludeLayer, tr);
          }
        })));
        this.own(on(this.LayersTable,'actions-edit',lang.hitch(this,function(tr){
          var editLayer = tr.singleLayer;
          this.popupState = 'EDIT';
          this._openILEdit(this.nls.editLayer + ': ' + editLayer.name , tr);
        })));
        this.own(on(this.LayersTable,'row-delete',lang.hitch(this,function(tr){
          delete tr.singleLayer;
        })));
        this.own(on(this.ExcludeLayersTable,'actions-edit',lang.hitch(this,function(tr){
          var editLayer = tr.singleLayer;
          this.popupState = 'EDIT';
          var label;
          if(editLayer.hasOwnProperty('name')){
            label = editLayer.name;
          }else if(editLayer.hasOwnProperty('url') && editLayer.hasOwnProperty('id')){
            label = editLayer.url + '/' + editLayer.id;
          }else if(editLayer.hasOwnProperty('url')){
            label = editLayer.url;
          }
          this._openIELEdit(this.nls.editExcludeLayer + ': ' + label , tr);
        })));
        this.own(on(this.ExcludeLayersTable,'row-delete',lang.hitch(this,function(tr){
          delete tr.singleLayer;
        })));
      },

      setConfig: function(config) {
        //hack the 'Learn more about this widget link'
        setTimeout(function(){
          var helpLink = query('.help-link');
          helpLink[0].href = this.configWindow.esri._appBaseUrl + 'widgets/Identify/help/identify_Help.htm';
          html.setStyle(helpLink[0],'display','block');
        },600);
        this.config = config;
        this.onlyTheseCbx.setValue(this.config.layers.onlythese);
        this.generalOps = {};
        this.generalOps.defaultzoomscale = this.config.defaultzoomscale;
        this.generalOps.identifylayeroption = this.config.identifylayeroption;
        this.generalOps.identifytolerance = this.config.identifytolerance;
        this.generalOps.keepidentifyactive = this.config.keepidentifyactive;
        this.generalOps.returngeometryforzoom = this.config.returngeometryforzoom;

        this.generalOps.enablelineselect = this.config.enablelineselect;
        this.generalOps.enablepolylineselect = this.config.enablepolylineselect;
        this.generalOps.enablefreehandlineselect = this.config.enablefreehandlineselect;
        this.generalOps.enableextentselect = this.config.enableextentselect;
        this.generalOps.enablecircleselect = this.config.enablecircleselect;
        this.generalOps.enableellipseselect = this.config.enableellipseselect;
        this.generalOps.enablepolyselect = this.config.enablepolyselect;
        this.generalOps.enablefreehandpolyselect = this.config.enablefreehandpolyselect;
        this.generalOps.enabletriangleselect = this.config.enabletriangleselect;

        this.generalOps.enablemouseovergraphicsinfo = this.config.enablemouseovergraphicsinfo;
        this.generalOps.enablemouseoverrecordinfo = this.config.enablemouseoverrecordinfo;
        this.generalOps.usemaptime = this.config.usemaptime;
        this.generalOps.replacenullswithemptystring = this.config.replacenullswithemptystring;
        this.generalOps.disablelayerdropdown = this.config.disablelayerdropdown;
        this.generalOps.disablealllayerschoice = this.config.disablealllayerschoice;
        this.generalOps.infoautoclosemilliseconds = (parseInt(this.config.infoautoclosemilliseconds, 10)/1000);
        this.generalOps.autoactivatedtool = this.config.autoactivatedtool || 'none';
        this.generalOps.fixedPosition = this.config.fixedPosition;

        this._initLayersTable();
        this._initELayersTable();
      },

      getConfig: function() {
        if(this.generalOps.autoactivatedtool !== 'none'){
          this.config.autoactivatedtool = this.generalOps.autoactivatedtool;
        }else{
          delete this.config.autoactivatedtool;
        }
        this.config.infoautoclosemilliseconds = this.generalOps.infoautoclosemilliseconds;
        this.config.disablealllayerschoice = this.generalOps.disablealllayerschoice;

        this.config.enablemouseovergraphicsinfo = this.generalOps.enablemouseovergraphicsinfo;
        this.config.enablemouseoverrecordinfo = this.generalOps.enablemouseoverrecordinfo;
        this.config.usemaptime = this.generalOps.usemaptime;
        this.config.replacenullswithemptystring = this.generalOps.replacenullswithemptystring;
        this.config.disablelayerdropdown = this.generalOps.disablelayerdropdown;

        this.config.enablelineselect = this.generalOps.enablelineselect;
        this.config.enablepolylineselect = this.generalOps.enablepolylineselect;
        this.config.enablefreehandlineselect = this.generalOps.enablefreehandlineselect;
        this.config.enableextentselect = this.generalOps.enableextentselect;
        this.config.enablecircleselect = this.generalOps.enablecircleselect;
        this.config.enableellipseselect = this.generalOps.enableellipseselect;
        this.config.enablepolyselect = this.generalOps.enablepolyselect;
        this.config.enablefreehandpolyselect = this.generalOps.enablefreehandpolyselect;
        this.config.enabletriangleselect = this.generalOps.enabletriangleselect;

        this.config.defaultzoomscale = this.generalOps.defaultzoomscale;
        this.config.identifylayeroption = this.generalOps.identifylayeroption;
        this.config.identifytolerance = this.generalOps.identifytolerance;
        this.config.keepidentifyactive = this.generalOps.keepidentifyactive;
        this.config.returngeometryforzoom = this.generalOps.returngeometryforzoom;
        if(this.generalOps.fixedPosition){
          this.config.fixedPosition = this.generalOps.fixedPosition;
        }else{
          delete this.config.fixedPosition
        }

        this.config.layers.layer =  this._getAllLayers();
        this.config.layers.excludelayer =  this._getAlleLayers();
        this.config.layers.onlythese = this.onlyTheseCbx.getValue();

        return this.config;
      },

      _getAllLayers: function () {
        var trs = this.LayersTable._getNotEmptyRows();
        var allLayers = array.map(trs, lang.hitch(this, function (item) {
          return item.singleLayer;
        }));
        return allLayers;
      },

      _getAlleLayers: function () {
        var trs = this.ExcludeLayersTable._getNotEmptyRows();
        var allLayers = array.map(trs, lang.hitch(this, function (item) {
          return item.singleLayer;
        }));
        return allLayers;
      },

      _initLayersTable: function() {
        this.LayersTable.clear();
        var layers = this.config && this.config.layers.layer;
        array.forEach(layers, lang.hitch(this, function(layerConfig, index) {
          var args = {
            config: layerConfig,
            layerindex: index
          };
          this._createLayer(args);
        }));
      },

      _initELayersTable: function() {
        this.ExcludeLayersTable.clear();
        var layers = this.config && this.config.layers.excludelayer;
        array.forEach(layers, lang.hitch(this, function(layerConfig, index) {
          var args = {
            config: layerConfig,
            layerindex: index
          };
          this._createELayer(args);
        }));
      },

      _createLayer: function(args) {
        args.layerSetting = this;
        args.nls = this.nls;
        var rowData = {
          name: (args.config && args.config.name) || ''
        };

        var result = this.LayersTable.addRow(rowData);
        if(!result.success){
          return null;
        }
        result.tr.singleLayer = args.config;
        return result.tr;
      },

      _createELayer: function(args) {
        args.layerSetting = this;
        args.nls = this.nls;
        var label;
        if(args.config.name){
          label = args.config.name;
        }else if(args.config.url && args.config.hasOwnProperty('id')){
          label = args.config.url + '/' + args.config.id;
        }else if(args.config.url){
          label = args.config.url;
        }
        var rowData = {
          name: label || ''
        };
        var result = this.ExcludeLayersTable.addRow(rowData);
        if(!result.success){
          return null;
        }
        result.tr.singleLayer = args.config;
        return result.tr;
      },

      _onGeneralEditOk: function() {
        this.generalOps = this.popupgeneraledit.getConfig();
        this.popup.close();
        this.popupState = '';
      },

      _onGeneralEditClose: function() {
        this.popupgeneraledit = null;
        this.popup = null;
      },

      _openGeneralEdit: function(title) {
        this.popupgeneraledit = new GeneralEdit({
          nls: this.nls,
          dnls: this.dnls,
          config: this.config || {}
        });

        this.popup = new Popup({
          titleLabel: title,
          autoHeight: true,
          content: this.popupgeneraledit,
          container: 'main-page',
          buttons: [{
            label: this.nls.ok,
            key: keys.ENTER,
            onClick: lang.hitch(this, '_onGeneralEditOk')
          }, {
            label: this.nls.cancel,
            key: keys.ESCAPE
          }],
          onClose: lang.hitch(this, '_onGeneralEditClose')
        });
        html.addClass(this.popup.domNode, 'widget-setting-symbology');
        this.popupgeneraledit.startup();
      },

      _onSymEditOk: function() {
        this.config.symbols = this.popupsymedit.getConfig().symbols;
        this.popup.close();
        this.popupState = '';
      },

      _onSymEditClose: function() {
        this.popupsymedit = null;
        this.popup = null;
      },

      _openSymEdit: function(title) {
        this.popupsymedit = new SymbologyEdit({
          nls: this.nls,
          config: this.config || {}
        });

        this.popup = new Popup({
          titleLabel: title,
          autoHeight: true,
          content: this.popupsymedit,
          container: 'main-page',
          width: 540,
          buttons: [{
            label: this.nls.ok,
            key: keys.ENTER,
            onClick: lang.hitch(this, '_onSymEditOk')
          }, {
            label: this.nls.cancel,
            key: keys.ESCAPE
          }],
          onClose: lang.hitch(this, '_onSymEditClose')
        });
        html.addClass(this.popup.domNode, 'widget-setting-symbology');
        this.popupsymedit.startup();
      },

      _onFormatEditOk: function() {
        this.config.resultFormat = this.popupformatedit.getConfig().format;
        this.popup4.close();
        this.popupState = '';
      },

      _onFormatEditClose: function() {
        this.popupfromatedit = null;
        this.popup4 = null;
      },

      _openFormatEdit: function(title) {
        this.popupformatedit = new ResultFormatEdit({
          nls: this.nls,
          config: this.config || {}
        });

        this.popup4 = new Popup({
          titleLabel: title,
          autoHeight: true,
          content: this.popupformatedit,
          container: 'main-page',
          width: 540,
          buttons: [{
            label: this.nls.ok,
            key: keys.ENTER,
            onClick: lang.hitch(this, '_onFormatEditOk')
          }, {
            label: this.nls.cancel,
            key: keys.ESCAPE
          }],
          onClose: lang.hitch(this, '_onFormatEditClose')
        });
        html.addClass(this.popup4.domNode, 'widget-setting-format');
        this.popupformatedit.startup();
      },

      _onILEditOk: function() {
        var layerConfig = this.popuplayeredit.getConfig();
        if (layerConfig.length < 0) {
          new Message({
            message: this.nls.warning
          });
          return;
        }
        if(this.popupState === 'ADD'){
          this.LayersTable.editRow(layerConfig[1], {
            name: layerConfig[0].name
          });
          layerConfig[1].singleLayer = layerConfig[0];
          this.popupState = '';
        }else{
          this.LayersTable.editRow(layerConfig[1], {
            name: layerConfig[0].name
          });
          layerConfig[1].singleLayer = layerConfig[0];
        }

        this.popup2.close();
        this.popupState = '';
      },

      _onILEditClose: function() {
        var layerConfig = this.popuplayeredit.getConfig();
        if(this.popupState === 'ADD'){
          this.LayersTable.deleteRow(layerConfig[1]);
        }
        this.popuplayeredit = null;
        this.popup2 = null;
      },

      _openILEdit: function(title, tr) {
        this.popuplayeredit = new IdentifyLayerEdit({
          nls: this.nls,
          config: (this.popupState === 'ADD') ? null : tr.singleLayer,
          tr: tr,
          layerInfoCache: this.layerInfoCache,
          adding: (this.popupState === 'ADD')
        });

        this.popup2 = new Popup({
          titleLabel: title,
          autoHeight: true,
          content: this.popuplayeredit,
          container: 'main-page',
          buttons: [{
            label: this.nls.ok,
            key: keys.ENTER,
            onClick: lang.hitch(this, '_onILEditOk')
          }, {
            label: this.nls.cancel,
            key: keys.ESCAPE
          }],
          onClose: lang.hitch(this, '_onILEditClose')
        });
        this.popuplayeredit.startup();
      },

      _onIELEditOk: function() {
        var layerConfig = this.popupexcludelayeredit.getConfig();
        if (layerConfig.length < 0) {
          new Message({
            message: this.nls.warning
          });
          return;
        }

        var label;
        if(layerConfig[0].name){
          label = layerConfig[0].name;
        }else if(layerConfig[0].url && layerConfig[0].hasOwnProperty('id')){
          label = layerConfig[0].url + '/' + layerConfig[0].id;
        }else if(layerConfig[0].url){
          label = layerConfig[0].url;
        }

        if(this.popupState === 'ADD'){
          this.ExcludeLayersTable.editRow(layerConfig[1], {
            name: label
          });
          layerConfig[1].singleLayer = layerConfig[0];
          this.popupState = '';
        }else{
          this.ExcludeLayersTable.editRow(layerConfig[1], {
            name: label
          });
          layerConfig[1].singleLayer = layerConfig[0];
        }

        this.popup3.close();
        this.popupState = '';
      },

      _onIELEditClose: function() {
        var layerConfig = this.popupexcludelayeredit.getConfig();
        if(this.popupState === 'ADD'){
          this.ExcludeLayersTable.deleteRow(layerConfig[1]);
        }
        this.popupexcludelayeredit = null;
        this.popup3 = null;
      },

      _openIELEdit: function(title, tr) {
        this.popupexcludelayeredit = new ExcludeLayerEdit({
          nls: this.nls,
          config: (this.popupState === 'ADD') ? null : tr.singleLayer,
          tr: tr,
          layerInfoCache: this.layerInfoCache
        });

        this.popup3 = new Popup({
          titleLabel: title,
          autoHeight: true,
          content: this.popupexcludelayeredit,
          container: 'main-page',
          buttons: [{
            label: this.nls.ok,
            key: keys.ENTER,
            onClick: lang.hitch(this, '_onIELEditOk')
          }, {
            label: this.nls.cancel,
            key: keys.ESCAPE
          }],
          onClose: lang.hitch(this, '_onIELEditClose')
        });
        this.popupexcludelayeredit.startup();
      }

    });
  });
