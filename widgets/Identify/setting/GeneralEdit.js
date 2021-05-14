/*global define*/
/*jshint maxlen: 250*/
define(
  ['dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/on',
    'dijit/_WidgetsInTemplateMixin',
    'jimu/BaseWidgetSetting',
    'dojo/text!./GeneralEdit.html',
    'esri/symbols/jsonUtils',
    'jimu/dijit/SymbolPicker',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin'
  ],
  function(
    declare,
    lang,
    on,
    _WidgetsInTemplateMixin,
    BaseWidgetSetting,
    template,
    jsonUtils
    ) {
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
      baseClass: 'general-edit',
      templateString: template,
      config: null,
      nls: null,
      dnls: null,

      postCreate: function() {
        this.inherited(arguments);
        // this.own(on(this.defaultPointSymbolPicker,'change',lang.hitch(this,this._onPointSymbolChange)));
        // this.own(on(this.defaultLineSymbolPicker,'change',lang.hitch(this,this._onLineSymbolChange)));
        // this.own(on(this.defaultPolySymbolPicker,'change',lang.hitch(this,this._onPolySymbolChange)));
        this.setConfig(this.config);
      },

      startup: function() {
        this.inherited(arguments);
      },

      setConfig:function(config){
        this.config = config;
        if(!this.config){
          return;
        }

        this.zoomScale.set('value',this.config.defaultzoomscale);
        this.selectIdentifyOption.set('value', this.config.identifylayeroption);
        this.identTolerance.set('value',this.config.identifytolerance);
        this.keepActiveCbx.setValue(this.config.keepidentifyactive);
        this.returnGeomCbx.setValue(this.config.returngeometryforzoom);

        this.enableLineCbx.setValue(this.config.enablelineselect);
        this.enablePolyLineCbx.setValue(this.config.enablepolylineselect);
        this.enableFHLineCbx.setValue(this.config.enablefreehandlineselect);
        this.enableExtentCbx.setValue(this.config.enableextentselect);
        this.enableCircleCbx.setValue(this.config.enablecircleselect);
        this.enableEllipseCbx.setValue(this.config.enableellipseselect);
        this.enablePolygonCbx.setValue(this.config.enablepolyselect);
        this.enableFHPolygonCbx.setValue(this.config.enablefreehandpolyselect);
        this.enableTriangleCbx.setValue(this.config.enabletriangleselect);

        this.mouseOverGraCbx.setValue(this.config.enablemouseovergraphicsinfo);
        this.mouseOverResultCbx.setValue(this.config.enablemouseoverrecordinfo);
        this.useMapTimeCbx.setValue(this.config.usemaptime);
        this.replaceNullCbx.setValue(this.config.replacenullswithemptystring);
        this.disableLayerDDCbx.setValue(this.config.disablelayerdropdown);
        this.disableAllLayersChoiceCbx.setValue(this.config.disablealllayerschoice);
        this.autoClose.set('value', (parseInt(this.config.infoautoclosemilliseconds, 10)/1000));
        this.selectDefaultTool.set('value',this.config.autoactivatedtool || 'none');
        if(this.config.fixedPosition){
          this.fixedPosCbx.setValue(true);
          var values = this.config.fixedPosition.split(",");
          this.fixedTopPos.set('value', (parseInt(values[1])));
          this.fixedRightPos.set('value', (parseInt(values[0])));
        }else{
          this.fixedPosCbx.setValue(false);
          this.fixedTopPos.set('value', null);
          this.fixedRightPos.set('value', null);
        }
      },

      getConfig: function() {
        var config = {};
        if(this.selectDefaultTool.get('value') !== 'none'){
          config.autoactivatedtool = this.selectDefaultTool.get('value');
        }else{
          delete config.autoactivatedtool;
        }
        config.infoautoclosemilliseconds = parseInt(this.autoClose.get('value'), 10) * 1000;
        config.disablealllayerschoice = this.disableAllLayersChoiceCbx.getValue();

        config.enablemouseovergraphicsinfo = this.mouseOverGraCbx.getValue();
        config.enablemouseoverrecordinfo = this.mouseOverResultCbx.getValue();
        config.usemaptime = this.useMapTimeCbx.getValue();
        config.replacenullswithemptystring = this.replaceNullCbx.getValue();
        config.disablelayerdropdown = this.disableLayerDDCbx.getValue();

        config.enablelineselect = this.enableLineCbx.getValue();
        config.enablepolylineselect = this.enablePolyLineCbx.getValue();
        config.enablefreehandlineselect = this.enableFHLineCbx.getValue();
        config.enableextentselect = this.enableExtentCbx.getValue();
        config.enablecircleselect = this.enableCircleCbx.getValue();
        config.enableellipseselect = this.enableEllipseCbx.getValue();
        config.enablepolyselect = this.enablePolygonCbx.getValue();
        config.enablefreehandpolyselect = this.enableFHPolygonCbx.getValue();
        config.enabletriangleselect = this.enableTriangleCbx.getValue();

        config.defaultzoomscale = this.zoomScale.get('value');
        config.identifylayeroption = this.selectIdentifyOption.get('value');
        config.identifytolerance = this.identTolerance.get('value');
        config.keepidentifyactive = this.keepActiveCbx.getValue();
        config.returngeometryforzoom = this.returnGeomCbx.getValue();

        if(this.fixedPosCbx.getValue()){
          config.fixedPosition = this.fixedRightPos.get('value') + "," + this.fixedTopPos.get('value');
        }else{
          delete config.fixedPosition;
        }
        return config;
      }
    });
  });
