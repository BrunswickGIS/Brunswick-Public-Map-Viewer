///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2018 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/Deferred',
  'dojo/promise/all',
  'jimu/WidgetManager',
  'jimu/portalUrlUtils',
  'esri/lang',
  './NlsStrings'
], function(declare, array, lang, Deferred, all, WidgetManager, portalUrlUtils, esriLang,
  NlsStrings) {
  var clazz = declare([], {

    _candidateMenuItems: null,
    //_deniedItems: null,
    _displayItems: null,
    _layerInfo: null,
    _layerType: null,
    _appConfig: null,

    constructor: function(layerInfo, displayItemInfos, layerType, layerListWidget) {
      this.nls = NlsStrings.value;
      this._layerInfo = layerInfo;
      this._layerType = layerType;
      this.layerListWidget = layerListWidget;
      this._initCandidateMenuItems();
      this._initDisplayItems(displayItemInfos);
    },

    _getATagLabel: function() {
      var url;
      var label;
      var layerUrl = this._layerInfo.getUrl();
      var basicItemInfo = this._layerInfo.isItemLayer();
      if (basicItemInfo) {
        url = this._getItemDetailsPageUrl(basicItemInfo) || layerUrl;
        label = this.nls.itemShowItemDetails;
      } else if (layerUrl &&
        (this._layerType === "CSVLayer" || this._layerType === "KMLLayer")) {
        url = layerUrl;
        label = this.nls.itemDownload;
      } else if (layerUrl && this._layerType === "WMSLayer") {
        url = layerUrl + (layerUrl.indexOf("?") > -1 ? "&" : "?") + "SERVICE=WMS&REQUEST=GetCapabilities";
        label = this.nls.itemDesc;
      } else if (layerUrl && this._layerType === "WFSLayer") {
        url = layerUrl + (layerUrl.indexOf("?") > -1 ? "&" : "?") + "SERVICE=WFS&REQUEST=GetCapabilities";
        label = this.nls.itemDesc;
      } else if (layerUrl) {
        url = layerUrl;
        label = this.nls.itemDesc;
      } else {
        url = '';
        label = this.nls.itemDesc;
      }
      this._ATagLabelUrl = url;
      return '<a class="menu-item-description" target="_blank" href="' +
        url + '">' + label + '</a>';
    },

    _getItemDetailsPageUrl: function(basicItemInfo) {
      var itemUrl = "";
      itemUrl = portalUrlUtils.getItemDetailsPageUrl(basicItemInfo.portalUrl, basicItemInfo.itemId);
      return itemUrl;
    },

    _initCandidateMenuItems: function() {
      //descriptionTitle: NlsStrings.value.itemDesc,
      // var layerObjectUrl = (this._layerInfo.layerObject && this._layerInfo.layerObject.url) ?
      //                       this._layerInfo.layerObject.url :
      //                       '';
      this._candidateMenuItems = [{
        key: 'separator',
        label: ''
      }, {
        key: 'empty',
        label: this.nls.empty
      }, {
        key: 'zoomto',
        label: this.nls.itemZoomTo
      }, {
        key: 'transparency',
        label: this.nls.itemTransparency
      },  {
        key: 'setVisibilityRange',
        label: this.nls.itemSetVisibilityRange
      }
      , {
        key: 'moveup',
        label: this.nls.itemMoveUp
      }, {
        key: 'movedown',
        label: this.nls.itemMoveDown
      },
      {
        key: 'table',
        label: this.nls.itemToAttributeTable
      }, {
        key: 'controlPopup',
        label: this.nls.removePopup
      }, {
        key: 'controlLabels',
        label: this.nls.showLabels
      }, {
        key: 'url',
        label: this._getATagLabel()
      }];
    },

    _initDisplayItems: function(displayItemInfos) {
      this._displayItems = [];
      // according to candidate itmes to init displayItems
      array.forEach(displayItemInfos, function(itemInfo) {
        array.forEach(this._candidateMenuItems, function(item) {
          if (itemInfo.key === item.key) {
            this._displayItems.push(lang.clone(item));
            if (itemInfo.onClick) {
              this._displayItem.onClick = itemInfo.onClick;
            }
          }
        }, this);
      }, this);
    },

    _isSupportedByAT: function() {
      return true;
    },

    _isSupportedByAT_bk: function(attributeTableWidget, supportTableInfo) {
      var isSupportedByAT;
      var isLayerHasBeenConfigedInAT;
      var ATConfig = attributeTableWidget.config;

      if(ATConfig.layerInfos.length === 0) {
        isLayerHasBeenConfigedInAT = true;
      } else {
        isLayerHasBeenConfigedInAT = array.some(ATConfig.layerInfos, function(layerInfo) {
          if(layerInfo.id === this._layerInfo.id && layerInfo.show) {
            return true;
          }
        }, this);
      }
      if (!supportTableInfo.isSupportedLayer ||
          !supportTableInfo.isSupportQuery ||
          supportTableInfo.otherReasonCanNotSupport ||
          !isLayerHasBeenConfigedInAT) {
        isSupportedByAT = false;
      } else {
        isSupportedByAT = true;
      }
      return isSupportedByAT;
    },

    getDeniedItems: function (layerlistConfig) {
        // summary:
        //    the items that will be denied.
        // description:
        //    return Object = [{
        //   key: String, popupMenuInfo key,
        //   denyType: String, "disable" or "hidden"
        // }]
        var defRet = new Deferred();
        var dynamicDeniedItems = [];
        var lyrdisplayIndex = -1;
        var isLastLayer = false;

        var currentLayerObj = layerlistConfig.layerOptions[this._layerInfo.id];
        if (typeof (currentLayerObj) != "undefined") {


            lyrdisplayIndex = currentLayerObj.displayindex;



            var maxIndexinFolder = 0;
            //check for whether this is last layer
            for (var propt in layerlistConfig.layerOptions) {
                var LayerObj = layerlistConfig.layerOptions[propt]

                if (LayerObj.folder == currentLayerObj.folder) {
                    if (maxIndexinFolder < LayerObj.displayindex) {
                        maxIndexinFolder = LayerObj.displayindex;
                    }
                }
            }
            if (maxIndexinFolder == lyrdisplayIndex) {
                isLastLayer = true;

            }
        }
        if (this.layerListWidget.layerListView.isFirstDisplayedLayerInfo(this._layerInfo) || lyrdisplayIndex == 0) {
            dynamicDeniedItems.push({
                'key': 'moveup',
                'denyType': 'disable'
            });
        }
        if (this.layerListWidget.layerListView.isLastDisplayedLayerInfo(this._layerInfo) || isLastLayer == true) {
            dynamicDeniedItems.push({
                'key': 'movedown',
                'denyType': 'disable'
            });
        }

        if (!this._ATagLabelUrl) {
            dynamicDeniedItems.push({
                'key': 'url',
                'denyType': 'disable'
            });
        }

        // deny controlLabels
        if (!this._layerInfo.canShowLabel()) {
            dynamicDeniedItems.push({
                'key': 'controlLabels',
                'denyType': 'hidden'
            });
        }

        // deny setVisibilityRange
        if (this._layerInfo.originOperLayer.featureCollection) {
            dynamicDeniedItems.push({
                'key': 'setVisibilityRange',
                'denyType': 'hidden'
            });
        } else if (!this._layerInfo.isRootLayer() &&
            this._layerInfo.getRootLayerInfo().layerObject.declaredClass === "esri.layers.ArcGISTiledMapServiceLayer") {
            dynamicDeniedItems.push({
                'key': 'setVisibilityRange',
                'denyType': 'hidden'
            });
        } else if (!this._layerInfo.isRootLayer() &&
            this._layerInfo.getRootLayerInfo().layerObject.declaredClass === "esri.layers.ArcGISDynamicMapServiceLayer" &&
            !this._layerInfo.getRootLayerInfo().layerObject.supportsDynamicLayers) {
            dynamicDeniedItems.push({
                'key': 'setVisibilityRange',
                'denyType': 'disable'
            });
        }

        var loadInfoTemplateDef = this._layerInfo.loadInfoTemplate();
        var getSupportTableInfoDef = this._layerInfo.getSupportTableInfo();

        all({
            infoTemplate: loadInfoTemplateDef,
            supportTableInfo: getSupportTableInfoDef
        }).then(lang.hitch(this, function (result) {

            // deny controlPopup
            if (!result.infoTemplate) {
                dynamicDeniedItems.push({
                    'key': 'controlPopup',
                    'denyType': 'disable'
                });
            }

            // deny table.
            var supportTableInfo = result.supportTableInfo;
            var attributeTableWidget =
                  this.layerListWidget.appConfig.getConfigElementsByName("AttributeTable")[0];

            if (!attributeTableWidget || !attributeTableWidget.visible) {
                dynamicDeniedItems.push({
                    'key': 'table',
                    'denyType': 'hidden'
                });
            } else if (!this._isSupportedByAT(attributeTableWidget, supportTableInfo)) {
                if (this._layerInfo.parentLayerInfo &&
                   this._layerInfo.parentLayerInfo.isMapNotesLayerInfo()) {
                    dynamicDeniedItems.push({
                        'key': 'table',
                        'denyType': 'hidden'
                    });
                } else {
                    dynamicDeniedItems.push({
                        'key': 'table',
                        'denyType': 'disable'
                    });
                }

            }
            defRet.resolve(dynamicDeniedItems);
        }), function () {
            defRet.resolve(dynamicDeniedItems);
        });

        return defRet;

    },

    getDisplayItems: function() {
      return this._displayItems;
    },

    onPopupMenuClick: function(evt) {
      var result = {
        closeMenu: true
      };
      switch (evt.itemKey) {
        case 'zoomto' /*this.nls.itemZoomTo'Zoom to'*/ :
          this._onItemZoomToClick(evt);
          break;
        case 'moveup' /*this.nls.itemMoveUp'Move up'*/ :
          this._onMoveUpItemClick(evt);
          break;
        case 'movedown' /*this.nls.itemMoveDown'Move down'*/ :
          this._onMoveDownItemClick(evt);
          break;
        case 'table' /*this.nls.itemToAttributeTable'Open attribute table'*/ :
          this._onTableItemClick(evt);
          break;
        case 'transparencyChanged':
          this._onTransparencyChanged(evt);
          result.closeMenu = false;
          break;
        case 'controlPopup':
          this._onControlPopup();
          break;
        case 'controlLabels':
          this._onControlLabels();
          break;

      }
      return result;
    },

    /**********************************
     * Respond events respectively.
     *
     * event format:
      // evt = {
      //   itemKey: item key
      //   extraData: estra data,
      //   layerListWidget: layerListWidget,
      //   layerListView: layerListView
      // }, result;
     **********************************/
    _onItemZoomToClick: function(evt) {
      /*jshint unused: false*/
      this._layerInfo.zoomTo();
    },

    _isValidExtent: function(extent){
      var isValid = false;
      if(esriLang.isDefined(extent)){
        if(esriLang.isDefined(extent.xmin) && isFinite(extent.xmin) &&
           esriLang.isDefined(extent.ymin) && isFinite(extent.ymin) &&
           esriLang.isDefined(extent.xmax) && isFinite(extent.xmax) &&
           esriLang.isDefined(extent.ymax) && isFinite(extent.ymax)){
          isValid = true;
        }
      }
      return isValid;
    },

    _onMoveUpItemClick: function(evt) {
      if (!this._layerInfo.isFirst) {
        evt.layerListView.moveUpLayer(this._layerInfo);
      }
    },

    _onMoveDownItemClick: function(evt) {
      if (!this._layerInfo.isLast) {
        evt.layerListView.moveDownLayer(this._layerInfo);
      }
    },

    _onTableItemClick: function(evt) {
      this._layerInfo.getSupportTableInfo().then(lang.hitch(this, function(supportTableInfo) {
        var widgetManager;
        var attributeTableWidgetEle =
                    this.layerListWidget.appConfig.getConfigElementsByName("AttributeTable")[0];
        if(this._isSupportedByAT(attributeTableWidgetEle, supportTableInfo)) {
          widgetManager = WidgetManager.getInstance();
          widgetManager.triggerWidgetOpen(attributeTableWidgetEle.id)
          .then(lang.hitch(this, function() {
            evt.layerListWidget.publishData({
              'target': 'AttributeTable',
              'layer': this._layerInfo
            });
          }));
        }
      }));
    },

    _onTransparencyChanged: function(evt) {
      this._layerInfo.setOpacity(1 - evt.extraData.newTransValue);
    },

    _onControlPopup: function(evt) {
      /*jshint unused: false*/
      if (this._layerInfo.controlPopupInfo.enablePopup) {
        this._layerInfo.disablePopup();
      } else {
        this._layerInfo.enablePopup();
      }
      this._layerInfo.map.infoWindow.hide();
    },

    _onControlLabels: function(evt) {
      /*jshint unused: false*/
      if(this._layerInfo.canShowLabel()) {
        if(this._layerInfo.isShowLabels()) {
          this._layerInfo.hideLabels();
        } else {
          this._layerInfo.showLabels();
        }
      }
    }
  });

  clazz.create = function(layerInfo, layerListWidget) {
    var retDef = new Deferred();
    var isRootLayer = layerInfo.isRootLayer();
    var defaultItemInfos = [{
      key: 'url',
      onClick: null
    }];

    var itemInfoCategoreList = {
      'RootLayer': [{
        key: 'zoomto'
      }, {
        key: 'transparency'
      }, {
        key: 'setVisibilityRange'
      }, {
        key: 'separator'
      }, {
        key: 'moveup'
      }, {
        key: 'movedown'
      }, {
        key: 'separator'
      }, {
        key: 'url'
      }],
      'RootLayerAndFeatureLayer': [{
        key: 'zoomto'
      }, {
        key: 'transparency'
      }, {
        key: 'setVisibilityRange'
      }, {
        key: 'separator'
      }, {
        key: 'controlPopup'
      }, {
        key: 'separator'
      }, {
        key: 'controlLabels'
      }, {
        key: 'separator'
      }, {
        key: 'moveup'
      }, {
        key: 'movedown'
      }, {
        key: 'separator'
      }, {
        key: 'table'
      }, {
        key: 'separator'
      }, {
        key: 'url'
      }],
      'FeatureLayer': [{
        key: 'setVisibilityRange'
      }, {
        key: 'separator'
      },{
        key: 'controlPopup'
      }, {
        key: 'separator'
      }, {
        key: 'table'
      }, {
        key: 'separator'
      }, {
        key: 'url'
      }],
      'SublayerOfDynamicMapserviceLayer': [{
        key: 'setVisibilityRange'
      }, {
        key: 'separator'
      }, {
        key: 'url'
      }],
      'GroupLayer': [{
        key: 'setVisibilityRange'
      }, {
        key: 'separator'
      },{
        key: 'url'
      }],
      'Table': [{
        key: 'table'
      }, {
        key: 'separator'
      }, {
        key: 'url'
      }],
      'BasemapLayer': [{
        key: 'zoomto'
      }, {
        key: 'transparency'
      }, {
        key: 'separator'
      }, {
        key: 'url'
      }],
      'default': defaultItemInfos
    };

    layerInfo.getLayerType().then(lang.hitch(this, function(layerType) {
      var itemInfoCategory = "";
      if (layerInfo.isBasemap() && layerInfo.isRootLayer()) {
        itemInfoCategory = "BasemapLayer";
      } else if(layerInfo.isBasemap()) {
        itemInfoCategory = "default";
      } else if (isRootLayer &&
          (layerType === "FeatureLayer" ||
            layerType === "CSVLayer" ||
            layerType === "ArcGISImageServiceLayer" ||
            layerType === "StreamLayer" ||
            layerType === "ArcGISImageServiceVectorLayer")) {
        itemInfoCategory = "RootLayerAndFeatureLayer";
      } else if (isRootLayer) {
        itemInfoCategory = "RootLayer";
      } else if (layerType === "FeatureLayer" || layerType === "CSVLayer") {
        itemInfoCategory = "FeatureLayer";
      } else if (layerInfo.isLeaf() &&
                layerInfo.getRootLayerInfo() &&
                layerInfo.getRootLayerInfo().layerObject &&
                layerInfo.getRootLayerInfo().layerObject.declaredClass === "esri.layers.ArcGISDynamicMapServiceLayer") {
        itemInfoCategory = "SublayerOfDynamicMapserviceLayer";
      } else if (layerType === "GroupLayer") {
        itemInfoCategory = "GroupLayer";
      } else if (layerType === "Table") {
        itemInfoCategory = "Table";
      } else {
        //default condition
        itemInfoCategory = "default";
      }
      retDef.resolve(new clazz(layerInfo,
        itemInfoCategoreList[itemInfoCategory],
        layerType,
        layerListWidget));
    }), lang.hitch(this, function() {
      //return default popupmenu info.
      retDef.resolve(new clazz(layerInfo, [{
        key: 'empty'
      }]));
    }));
    return retDef;
  };


  return clazz;
});
