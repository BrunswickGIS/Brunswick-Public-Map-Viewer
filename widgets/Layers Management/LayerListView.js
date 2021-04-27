
define([
    'dijit/_WidgetBase',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-construct',
    'dojo/on',
    'dojo/query',
	 'dojox/json/query',
    'dijit/registry',
    'jimu/dijit/CheckBox',
    'jimu/dijit/DropMenu',
    'jimu/dijit/LoadingShelter',
    './PopupMenu',
    'dijit/_TemplatedMixin',
    'dojo/text!./LayerListView.html',
    'dojo/dom-class',
    'dojo/dom-style',
    './NlsStrings'
], function (_WidgetBase, declare, lang, array, domConstruct, on, query, dojoJsonQuery,
    registry, CheckBox, DropMenu, LoadingShelter, PopupMenu, _TemplatedMixin, template,
    domClass, domStyle, NlsStrings) {
    return declare([_WidgetBase, _TemplatedMixin], {
        templateString: template,
        _currentSelectedLayerRowNode: null,
        operationsDropMenu: null,
        _layerNodeHandles: null,
        _layerDomNodeStorage: null,
        eXpanAndCollapseFalg: false,
        widthDiv: false,
        layervisibility: false,
        onNewaddedlayer: false,
        modifiedLayerArray: [],
        NSLayers: [],
        global_layerInfoArrayAtStartup: {},
        postMixInProperties: function () {
            this.inherited(arguments);
            this.nls = NlsStrings.value;
            this._layerDomNodeStorage = {};
        },
        //sort the layers based on display index
        dynamicSort: function (property) {
            var sortOrder = 1;
            if (property[0] === "-") {
                sortOrder = -1;
                property = property.substr(1);
            }
            return function (a, b) {
                return a[property] - b[property];
            }
        },
        //push the layer into temp arrary
        PushlayertoTemparray: function (tempArray, layerid, layerdisplay, layerDisplayindex, foldername, layervisibility) {
            tempArray.push({
                id: layerid,
                display: layerdisplay,
                displayindex: layerDisplayindex,
                folder: foldername,
                visible: layervisibility
            });
        },
        //This method is used to arrange the layers on based on the settings.
        rearangeLayersBasedOnConfig: function (layerInfosObj) {
            var tempconfigarray = [];
            //get the layers from folders 
            if (typeof (this.config.customFolder) == "undefined")
                return;
            if (this.config.customFolder.length > 0) {  // for soring folders based on display index
                this.config.customFolder.sort(this.dynamicSort("displayIndex"));
            }
            //check for newly added layers from webmap / add data widget.
            for (var i = 0; i < layerInfosObj.length; i++) {
                var layerobj = this.config.layerOptions[layerInfosObj[i].id];
                if (typeof (layerobj) === "undefined") {
                    this.onNewaddedlayer = true;
                    break;
                }
            }
            //   for loop to arrange the layers based on the settings widget inside the custom folders.
            for (var j = 0; j < this.config.customFolder.length; j++) {
                var tempArray = [];
                var layerDisplayindex = 0;
                for (var i = 0; i < layerInfosObj.length; i++) {
                    var layerInfo = this.config.layerOptions[layerInfosObj[i].id];
                    if (this.config.customFolder[j].displayIndex == 0) { //push the newly added orders into the first folder
                        if (!this.onNewaddedlayer) { //if newly added layers not found, then consider the order set in settigns widget
                            if (this.config.customFolder[j].name == layerInfo.folder) {
                                this.PushlayertoTemparray(tempArray, layerInfosObj[i].id, this.config.layerOptions[layerInfosObj[i].id].display, this.config.layerOptions[layerInfosObj[i].id].displayindex, this.config.layerOptions[layerInfosObj[i].id].folder, this.config.layerOptions[layerInfosObj[i].id].visible);
                            }
                        }
                        else { //otherwise recreate new display order by considering newly added layers.
                            if (typeof (layerInfo) === "undefined") {
                                this.PushlayertoTemparray(tempArray, layerInfosObj[i].id, true, layerDisplayindex, this.config.customFolder[j].name, layerInfosObj[i]._visible)
                                layerDisplayindex++;
                                continue;
                            }
                            var folderName = layerInfo.folder;
                            if (folderName == this.config.customFolder[j].name) {
                                if (folderName != "WithoutFolder") {
                                    this.PushlayertoTemparray(tempArray, layerInfosObj[i].id, this.config.layerOptions[layerInfosObj[i].id].display, layerDisplayindex, this.config.layerOptions[layerInfosObj[i].id].folder, this.config.layerOptions[layerInfosObj[i].id].visible)
                                    layerDisplayindex++;
                                }
                            }
                        }

                    }
                    else { //if not the first folder, consider the display order set in settings widget.
                        if (typeof (layerInfo) === "undefined")
                            continue;
                        var folderName = layerInfo.folder;
                        if (folderName == this.config.customFolder[j].name) {
                            if (folderName != "WithoutFolder") {
                                this.PushlayertoTemparray(tempArray, layerInfosObj[i].id, this.config.layerOptions[layerInfosObj[i].id].display, this.config.layerOptions[layerInfosObj[i].id].displayindex, this.config.layerOptions[layerInfosObj[i].id].folder, this.config.layerOptions[layerInfosObj[i].id].visible)
                            }
                        }
                    }
                }
                tempArray.sort(this.dynamicSort("displayindex"));
                for (var x = 0; x < tempArray.length; x++) {
                    tempconfigarray.push(tempArray[x]);
                }
            }
            //get the layers from outside folders
            tempArray = [];
            var layerDisplayindex = 0;
            for (var i = 0; i < layerInfosObj.length; i++) {
                var layerInfo = this.config.layerOptions[layerInfosObj[i].id];
                if (this.config.customFolder.length == 0) {
                    if (!this.onNewaddedlayer) {
                        if (layerInfo.folder == "WithoutFolder")
                            this.PushlayertoTemparray(tempArray, layerInfosObj[i].id, this.config.layerOptions[layerInfosObj[i].id].display, this.config.layerOptions[layerInfosObj[i].id].displayindex, this.config.layerOptions[layerInfosObj[i].id].folder, this.config.layerOptions[layerInfosObj[i].id].visible)
                    }
                    else {
                        // if layer are not assigned to folders
                        if (typeof (layerInfo) === "undefined") {
                            this.PushlayertoTemparray(tempArray, layerInfosObj[i].id, true, layerDisplayindex, "WithoutFolder", layerInfosObj[i]._visible);
                            layerDisplayindex++;
                            continue;
                        }
                        var folderName = layerInfo.folder;
                        if (folderName === "WithoutFolder") {
                            this.PushlayertoTemparray(tempArray, layerInfosObj[i].id, this.config.layerOptions[layerInfosObj[i].id].display, layerDisplayindex, this.config.layerOptions[layerInfosObj[i].id].folder, this.config.layerOptions[layerInfosObj[i].id].visible)
                            layerDisplayindex++;
                        }
                    }
                }
                else {  //layers are assigned to folders & without folder
                    if (typeof (layerInfo) === "undefined") {
                        continue;
                    }
                    var folderName = layerInfo.folder;
                    if (folderName === "WithoutFolder") {
                        this.PushlayertoTemparray(tempArray, layerInfosObj[i].id, this.config.layerOptions[layerInfosObj[i].id].display, this.config.layerOptions[layerInfosObj[i].id].displayindex, this.config.layerOptions[layerInfosObj[i].id].folder, this.config.layerOptions[layerInfosObj[i].id].visible)
                        layerDisplayindex++;
                    }
                }

            }
            tempArray.sort(this.dynamicSort("displayindex"));
            for (var x = 0; x < tempArray.length; x++) {
                tempconfigarray.push(tempArray[x]);
            }
            //Merge all the layers into modified array object.
            for (var i = 0; i < tempconfigarray.length; i++) {
                for (var j = 0; j < layerInfosObj.length; j++) {
                    if (tempconfigarray[i].id === layerInfosObj[j].id) {
                        this.modifiedLayerArray.push(layerInfosObj[j]);
                    }
                }
            }

            //based on the newly arragned order display the layers on map
            //for (var i = 0; i < this.modifiedLayerArray.length; i++) {
            //    var stepstomove = this.calculateLayerUpdateSteps(layerInfosObj, this.modifiedLayerArray[i], i);
            //    if (stepstomove > 0) {
            //        this.operLayerInfos.moveUpLayer(this.modifiedLayerArray[i], stepstomove);
            //        layerInfosObj = this.operLayerInfos.getLayerInfoArray();
            //    }
            //    else if (stepstomove < 0) { //move down
            //        this.operLayerInfos.moveDownLayer(this.modifiedLayerArray[i], stepstomove * (-1));
            //        layerInfosObj = this.operLayerInfos.getLayerInfoArray();
            //    }
            //}
        },
        //   Dynamically calucalte the steps to move each service on map
        //calculateLayerUpdateSteps: function (layerInfosObj, ModifiedLayerObj, requiredPositioninlist) {
        //    var stepstoMove = 0;
        //    var dynmicLayerPositioninMap = 0;
        //    var requiredPosition = 0;
        //    if (ModifiedLayerObj.originOperLayer.layerType == "ArcGISFeatureLayer") {
        //        //loop through the list to find the required new position as per layer type
        //        for (var i = 0; i <= requiredPositioninlist; i++) {

        //            if (this.modifiedLayerArray[i].originOperLayer.layerType == "ArcGISFeatureLayer") {
        //                requiredPosition++;
        //            }
        //        }
        //        for (var j = 0; j < layerInfosObj.length; j++) {
        //            //current layer position as per layer type
        //            if (layerInfosObj[j].originOperLayer.layerType == "ArcGISFeatureLayer") {
        //                dynmicLayerPositioninMap++;
        //            }
        //            if (ModifiedLayerObj.id == layerInfosObj[j].id) {
        //                //console.log(ModifiedLayerObj.id, requiredPosition, dynmicLayerPositioninMap, "required-vs current");
        //                stepstoMove = dynmicLayerPositioninMap - requiredPosition;
        //                break;
        //            }
        //        }
        //    }
        //    else { //for dynamic and other layer
        //        //loop through the list to find the required new position as per layer type
        //        for (var i = 0; i <= requiredPositioninlist; i++) {
        //            if (this.modifiedLayerArray[i].originOperLayer.layerType != "ArcGISFeatureLayer") {
        //                requiredPosition++;
        //            }
        //        }
        //        for (var j = 0; j < layerInfosObj.length; j++) {
        //            //current layer position as per layer type
        //            if (layerInfosObj[j].originOperLayer.layerType != "ArcGISFeatureLayer") {
        //                dynmicLayerPositioninMap++;
        //            }
        //            if (ModifiedLayerObj.id == layerInfosObj[j].id) {
        //                //console.log(ModifiedLayerObj.id, requiredPosition, dynmicLayerPositioninMap, "required-vs current");
        //                stepstoMove = dynmicLayerPositioninMap - requiredPosition;
        //                break;
        //            }
        //        }
        //    }
        //    return stepstoMove;
        //},
        postCreate: function () {

            this.NSLayers = dojoJsonQuery("[=NS_Layer]", this.config.layerDisplaySyncOptions);
            console.log("CUSTOM LAYERLIST WIDGET===================");
            //   this.modifiedLayerArray = [];
            var layerInfoArray = this.operLayerInfos.getLayerInfoArray();


            //  this.rearangeLayersBasedOnConfig(layerInfoArray);

            this.refresh();
            this._initOperations();
            this.AddlayerDisable();
            this.hideFoldersIfLayersNotFound();
            //var layerInfoArray = this.operLayerInfos.getLayerInfoArray();

        },




        //Public methods to change the folders display status dynamically.
        // Send Object Array As parameter -- [{ foldername: "Second", status: true }];
        changeFolderVisibility: function (objFolderArr) {
            for (var i = 0; i < objFolderArr.length; i++) {
                var folderName = objFolderArr[i].foldername; folderName = folderName.replace(/^\s+|\s+$/gm, ''); folderName = folderName.replace(/\s+/g, '-'); folderName = this.replaceSpecialCharacters(folderName); var layerTrNodeClass = "layer-tr-node-" + folderName; var layerTrNode = domConstruct.create('tr', {
                    'class': 'jimu-widget-row layer-row ' + ( /*visible*/ false ? 'jimu-widget-row-selected ' : ' ') + layerTrNodeClass, 'layerTrNodeId': folderName, 'id': folderName
                }); var folderCheckbox = dojo.query(".folder" + folderName, this.domNode);
                if (folderCheckbox.length > 0) {
                    var chkboxwidget = registry.byNode(folderCheckbox[0]);
                    if (typeof (objFolderArr[i].status) != "undefined") {// == chkboxwidget.checked) { //if same status
                        //do nothing
                        // }
                        //else {
                        //trigger click
                        var chkBoxNode = chkboxwidget.domNode;

                        if (objFolderArr[i].status) {
                            chkboxwidget.check();
                        }
                        else {
                            chkboxwidget.uncheck();
                        }


                        // IE does things differently-fire event
                        if (dojo.isIE) {
                            chkBoxNode.fireEvent("onclick");
                        }
                        else { // Not IE
                            //chkboxwidget.setStatus(objFolderArr[i].status);
                            var event = document.createEvent("HTMLEvents");
                            event.initEvent("click", true, true);
                            console.debug(event);
                            chkBoxNode.dispatchEvent(event);
                        }



                    }



                }



            }
        },
        //This method is used to hide the folder nodes, if layerinfos not found after performing filter
        hideFoldersIfLayersNotFound: function () {
            for (var i = this.config.customFolder.length - 1; i >= 0; i--) {
                var folderName = this.config.customFolder[i].name;
                folderName = folderName.replace(/\s+/g, '-');
                folderName = this.replaceSpecialCharacters(folderName);
                var rootObj = dojo.byId(this.layerListTable);
                var table = dojo.query("table[subnodeid='" + folderName + "'] ", rootObj);
                if (table.length > 0) {
                    if (table.children() == 0) {
                        var folderNode = dojo.query("#" + folderName, rootObj);
                        domStyle.set(folderNode[0], "display", "none");
                    }
                }
            }
        },
        consturctTreeView1: function (foldername, status, configLayers, LayerInfoArray, node) { // method for creating folder node & folder order as config
            array.forEach(LayerInfoArray, function (layerInfo) {
                this.layervisibility = false;
                var configLayerInfo = configLayers[layerInfo.id];
                if (typeof (configLayerInfo) != "undefined") {
                    var folderName = configLayerInfo["folder"];
                    if (foldername === folderName) {
                        if (typeof (folderName) != "undefined" && folderName != "" && folderName != "WithoutFolder" && folderName != "TabWithoutFolder") {
                            //  if (configLayerInfo.display) {
                            var tableNode = this.createFolderNode(folderName, status, 0, node);
                            if (!status) {
                                this.layervisibility = true;
                            }
                            this.drawListNode(layerInfo, 1, tableNode);
                            //}
                        }
                    }
                }
            }, this);
            array.forEach(LayerInfoArray, function (layerInfo) {
                var configLayerInfo = configLayers[layerInfo.id];
                if (typeof (configLayerInfo) != "undefined") {
                    var folderName = configLayerInfo["folder"];
                    if (typeof (folderName) == "undefined" || folderName == "" || folderName == "WithoutFolder" || folderName == "TabWithoutFolder") {
                        if (configLayerInfo.display) {

                            this.drawListNode(layerInfo, 0, node);
                        }
                    }
                }
            }, this);
        },
        consturctTreeView: function (layerInfo, configLayers) {  // method for creating Layers node
            var configLayerInfo = configLayers[layerInfo.id];
            if (typeof (configLayerInfo) != "undefined") {
                var folderName = configLayerInfo["folder"];
                if (typeof (folderName) != "undefined" && folderName != "" && folderName != "WithoutFolder" && folderName != "TabWithoutFolder") {
                    if (configLayerInfo.display) {
                        var tableNode = this.createFolderNode(folderName, 0, this.layerListTable);
                        this.drawListNode(layerInfo, 1, tableNode);
                    }
                }
                else {
                    this.drawListNode(layerInfo, 0, this.layerListTable);
                }
            }
        },
        disableAllcheckboxes: function (contentId) {
            var rootObj = dojo.byId(this.layerListTable);
            contentId = contentId.replace(/\s+/g, '-');
            //contentId = contentId.replace(/[^a-zA-Z0-9 ]/g, '-');
            var layerTablerow = dojo.query("tr[layertrnodeid='" + contentId + "']", rootObj);
            var layercontentrow = dojo.query("tr[layercontenttrnodeid='" + contentId + "']", rootObj);
            if (layercontentrow) {
                dojo.query(".checkbox", layercontentrow[0]).forEach(function (node) {
                    if (dojo.hasClass(node, "jimu-icon-checked"))
                        dojo.addClass(node, "disbledClass");
                    else
                        dojo.addClass(node, "disableduncheckClass");
                });
            }
        },
        //display the layers based on the visibility functionality set in the settings widget.
        AddlayerDisable: function () {
            var oprLayers = this.operLayerInfos.getLayerInfoArray();
            for (var a = 0; a < this.config.customFolder.length; a++) {
                if (this.config.customFolder[a].visible === false) {
                    var foldername = this.config.customFolder[a].name;
                    this.disableAllcheckboxes(foldername);
                }
            }
            for (var i = 0; i < oprLayers.length; i++) {
                var layerInfo = this.config.layerOptions[oprLayers[i].id];
                if (typeof (layerInfo) === "undefined")
                    continue;
                if (layerInfo.visible === false && layerInfo.visible != undefined) {
                    this.disableAllcheckboxes(oprLayers[i].id);
                }
            }
        },
        refresh: function () {
            this._removeLayerNodes();
            var layerInfoArray = this.operLayerInfos.getLayerInfoArray();

            array.forEach(layerInfoArray, function (currentLayerInfo, index) {
                this.global_layerInfoArrayAtStartup[currentLayerInfo.id] = currentLayerInfo._visible;  //store the status of layers
            }, this)


            //this.global_layerInfoArrayAtStartup = this.operLayerInfos.getLayerInfoArray().slice(0);
            this.modifiedLayerArray = [];
            this.rearangeLayersBasedOnConfig(layerInfoArray);
            this.updateConfigWithNewLayer(this.modifiedLayerArray);

            var configLayers = this.config.layerOptions;
            if (configLayers == null) {
                return;
            }
            if (this.config.customFolder.length == 0) {  // for layer node creation with out folder
                //array.forEach(this.operLayerInfos.getLayerInfoArray(), function (layerInfo) {
                array.forEach(this.modifiedLayerArray, function (layerInfo) {
                    this.consturctTreeView(layerInfo, configLayers);
                }, this);

                if (this.config.showBasemap) {
                    this.configureBasemap(configLayers);
                }
                array.forEach(this.operLayerInfos.getTableInfoArray(), function (layerInfo) {
                    this.consturctTreeView(layerInfo, configLayers);
                }, this);
            }
            else {  // layer node creation with in the folder

                for (var i = this.config.customFolder.length - 1; i >= 0; i--) {
                    //this.consturctTreeView1(this.config.customFolder[i].name, this.config.customFolder[i].status, configLayers, this.operLayerInfos.getLayerInfoArray(), this.layerListTable);
                    this.consturctTreeView1(this.config.customFolder[i].name, this.config.customFolder[i].status, configLayers, this.modifiedLayerArray, this.layerListTable);
                    this.layervisibility = false;
                    if (this.config.showBasemap) {
                        this.configureBasemap(configLayers);
                    }
                    this.consturctTreeView1(this.config.customFolder[i].name, this.config.customFolder[i].status, configLayers, this.operLayerInfos.getTableInfoArray(), this.layerListTable);
                };

            }
        },
        //method for creating basemap node
        configureBasemap: function (configLayers) {
            var basemapdisplayindex = 0;
            array.forEach(this.operLayerInfos.getBasemapLayerInfoArray(), function (layerInfo) {

                this.config.layerOptions[layerInfo.id] = { "display": true, "folder": "WithoutFolder", "displayindex": basemapdisplayindex, "visible": true };
                this.consturctTreeView(layerInfo, configLayers);
                if (layerInfo.newSubLayers.length > 0) {
                    var sublayers = layerInfo._jsapiLayerInfos;
                    for (var m = 0; m < sublayers.length; m++) {
                        this.config.layerOptions[layerInfo.id + "_" + m] = { "display": true };
                    }
                }
                basemapdisplayindex++;
            }, this);

        },
        updateConfigWithNewLayer: function (layerInfosObj) {
            // update the config with new layers
            var isNewlyUpdatedLayers = false;
            var layerDisplayIndex = 0;
            for (var j = 0; j < this.config.customFolder.length; j++) {

                var folderName = this.config.customFolder[j].name;
                var displayIndex = this.config.customFolder[j].displayIndex;
                if (displayIndex == 0) {

                    for (var i = 0; i < layerInfosObj.length; i++) {
                        var layerInfo = this.config.layerOptions[layerInfosObj[i].id];
                        var layerID = layerInfosObj[i].id;
                        if (typeof (layerInfo) === "undefined") {
                            this.config.layerOptions[layerID] = { display: true, folder: folderName, displayindex: layerDisplayIndex };
                        }
                        else
                            this.config.layerOptions[layerID].displayindex = layerDisplayIndex;

                        layerDisplayIndex++;
                    }

                }
            }
            if (this.config.customFolder.length == 0) {
                for (var i = 0; i < layerInfosObj.length; i++) {
                    var layerInfo = this.config.layerOptions[layerInfosObj[i].id];
                    var layerID = layerInfosObj[i].id;
                    if (typeof (layerInfo) === "undefined") {
                        this.config.layerOptions[layerID] = { display: true, folder: "WithoutFolder", displayindex: layerDisplayIndex };
                    }
                    else
                        this.config.layerOptions[layerID].displayindex = layerDisplayIndex;

                    layerDisplayIndex++;
                }

            }

        },
        getMaxDisplayIndex: function (rootFolder, layerObj) {
            var maxIndexinFolder = 0;
            var layerInfosObj = this.operLayerInfos.getLayerInfoArray();
            for (var i = 0; i < layerInfosObj.length; i++) {
                var layerInfo = this.config.layerOptions[layerInfosObj[i].id];
                if (typeof (layerInfo) === "undefined")
                    continue;
                var folderName = layerInfo.folder;
                if (folderName == rootFolder) {

                    if (parseInt(this.config.layerOptions[layerInfosObj[i].id].displayindex) > maxIndexinFolder)
                        maxIndexinFolder = parseInt(this.config.layerOptions[layerInfosObj[i].id].displayindex);
                }
            }
            return maxIndexinFolder;
        },
        drawListNode: function (layerInfo, level, toTableNode, position) {
            var nodeAndSubNode, showLegendDiv;
            if (this.isLayerHiddenInWidget(layerInfo) || !this.layerFilter.isValidLayerInfo(layerInfo)) {
                if (this.layervisibility) {
                    var layer = this.layerListWidget.map.getLayer(layerInfo.id);
                    if (layer)
                        layer.setVisibility(false);
                }
                return;
            }
            nodeAndSubNode = this._layerDomNodeStorage[layerInfo.getObjectId()];
            if ((layerInfo.isRootLayer() || layerInfo.isTable) && nodeAndSubNode) {
                domConstruct.place(nodeAndSubNode.layerTrNode, toTableNode, position);
                domConstruct.place(nodeAndSubNode.layerContentTrNode, toTableNode, position);
            } else if (layerInfo.newSubLayers.length === 0) {
                //addLayerNode
                nodeAndSubNode = this.addLayerNode(layerInfo, level, toTableNode, position);
                //add legend node
                if (this.config.showLegend) {
                    this.addLegendNode(layerInfo, level, nodeAndSubNode.subNode);
                } else {
                    showLegendDiv = query(".showLegend-div", nodeAndSubNode.layerTrNode)[0];
                    if (showLegendDiv) {
                        domClass.add(showLegendDiv, 'hidden');
                    }
                }
            } else {
                //addLayerNode
                nodeAndSubNode = this.addLayerNode(layerInfo, level, toTableNode, position);
                array.forEach(layerInfo.newSubLayers, lang.hitch(this, function (level, subLayerInfo) {
                    this.drawListNode(subLayerInfo, level + 1, nodeAndSubNode.subNode);
                }, level));
            }
        },
        createFolderNode: function (folderName, status, level, toTableNode) {
            var layerTrNode, layerTdNode, ckSelectDiv, ckSelect;
            var folderclassName = folderName.replace(/\s+/g, '-');
            folderclassName = this.replaceSpecialCharacters(folderclassName);
            var layerTrNodeClass = "layer-tr-node-" + folderName;
            for (var i = 0; i < toTableNode.childNodes.length; i++) {
                if ((toTableNode.childNodes[i].className.endsWith("jimu-widget-row-selected"))) {
                    dojo.removeClass(toTableNode.childNodes[i], "jimu-widget-row-selected");
                }
                if ((toTableNode.childNodes[i].className.endsWith(layerTrNodeClass)))
                    return tableNode = toTableNode.childNodes[i + 1].childNodes[0].childNodes[0];
            }
            layerTrNode = domConstruct.create('tr', {
                'class': 'jimu-widget-row layer-row ' +
                    ( /*visible*/ false ? 'jimu-widget-row-selected ' : ' ') + layerTrNodeClass,
                'layerTrNodeId': folderclassName,
                'id': folderclassName
            });
            domConstruct.place(layerTrNode, toTableNode, 0);
            layerTdNode = domConstruct.create('td', {
                'class': 'col col1'
            }, layerTrNode);
            imageShowLegendDiv = domConstruct.create('div', {
                'class': 'showLegend-div jimu-float-leading ',
                'imageShowLegendDivId': folderclassName
            }, layerTdNode);

            ckSelectDiv = domConstruct.create('div', {
                'class': 'div-select jimu-float-leading'
            }, layerTdNode);

            ckSelect = new CheckBox({
                checked: status,
                'class': "visible-checkbox-folder folder" + folderclassName //+ folderclassName
            });


            domConstruct.place(ckSelect.domNode, ckSelectDiv);
            ////divLabel = domConstruct.create('div', {
            ////    'innerHTML': '<span style="background-size: 23px" class="showFolder-div" ></span>', //&nbsp;&nbsp;
            ////    'imageFolderDivId': 'img' + folderName,
            ////    'style': 'margin-top: -3px'
            ////}, layerTdNode);
            var layerTitleTdNode = domConstruct.create('td', {
                'class': 'col col2'
            }, layerTrNode);
            divLabel = domConstruct.create('div', {
                'innerHTML': '<span style="background-size: 23px" class="showFolder-div" ></span>', //&nbsp;&nbsp;
                'imageFolderDivId': 'img' + folderName,
                'style': 'margin-top: -3px;float:left;width:30px;'
            }, layerTitleTdNode);

            var layerTitleDivIdClass = 'layer-title-div-' + folderclassName;
            divLabel = domConstruct.create('div', {
                'innerHTML': folderName,
                'class': layerTitleDivIdClass + ' div-content jimu-float-leading folderStyle',
                'title': folderName
            }, layerTitleTdNode);

            layerTdNode = domConstruct.create('td', {
                'class': 'col col3'
            }, layerTrNode);
            //add a tr node to toTableNode.
            var layerContentTrNode = domConstruct.create('tr', {
                'class': '',
                'layerContentTrNodeId': folderclassName
            });
            domConstruct.place(layerContentTrNode, toTableNode, 1);
            var tdNode = domConstruct.create('td', {
                'class': '',
                'colspan': '3'
            }, layerContentTrNode);
            var tableNode = domConstruct.create('table', {
                'class': 'layer-sub-node',
                'subNodeId': folderclassName
            }, tdNode);
            handle = this.own(on(imageShowLegendDiv,
                'click',
                lang.hitch(this,
                    this._onRowFolderTrClick,
                    folderclassName,
                    imageShowLegendDiv,
                    layerTrNode,
                    tableNode)));
            //bind event
            handle = this.own(on(layerTitleTdNode,
                'click',
                lang.hitch(this,
                    this._onRowFolderTrClick,
                    folderclassName,
                    imageShowLegendDiv,
                    layerTrNode,
                    tableNode)));
            handle = this.own(on(ckSelect.domNode, 'click', lang.hitch(this,
                this._onCkSelectFolderNodeClick,
                folderName,
                ckSelect)));
            return tableNode;
        },
        addLayerNode: function (layerInfo, level, toTableNode, position) {

            var layerTrNode, layerTdNode, ckSelectDiv, ckSelect, imageNoLegendDiv, handle,
                imageGroupDiv, imageNoLegendNode, popupMenuNode, i, imageShowLegendDiv, divLabel;
            var rootLayerInfo = layerInfo.getRootLayerInfo();
            var checkboxStatus = true;
            // init _layerDomNodeStorage for rootLayerInfo.
            if (layerInfo.isRootLayer() || layerInfo.isTable) {
                this._layerDomNodeStorage[layerInfo.getObjectId()] = {
                    layerTrNode: null,
                    layerContentTrNode: null,
                    layerNodeEventHandles: [],
                    layerNodeReferredDijits: []
                };
            }

            if (!layerInfo.isRootLayer()) {
                if (array.indexOf(this.NSLayers, rootLayerInfo.id) >= 0) {
                    checkboxStatus = false;
                }
            }

            var layerTrNodeClass = "layer-tr-node-" + layerInfo.id;
            layerTrNode = domConstruct.create('tr', {
                'class': 'jimu-widget-row layer-row ' +
                    ( /*visible*/ false ? 'jimu-widget-row-selected ' : ' ') + layerTrNodeClass,
                'layerTrNodeId': layerInfo.id
            });
            domConstruct.place(layerTrNode, toTableNode, position);
            layerTdNode = domConstruct.create('td', {
                'class': 'col col1'
            }, layerTrNode);
            for (i = 0; i < level; i++) {
                domConstruct.create('div', {
                    'class': 'begin-blank-div jimu-float-leading',
                    'innerHTML': ''
                }, layerTdNode);
            }
            imageShowLegendDiv = domConstruct.create('div', {
                'class': 'showLegend-div jimu-float-leading',
                'imageShowLegendDivId': layerInfo.id
            }, layerTdNode);
            ckSelectDiv = domConstruct.create('div', {
                'class': 'div-select jimu-float-leading'
            }, layerTdNode);

            ckSelect = new CheckBox({
                checked: layerInfo.isVisible(), //layerInfo.visible
                //checked: true,
                'class': "visible-checkbox-" + layerInfo.id,
                //status: checkboxStatus
            });
            if (this.layervisibility) {
                var layer = this.layerListWidget.map.getLayer(layerInfo.id);
                if (layer)
                    layer.setVisibility(false);
            }


            domConstruct.place(ckSelect.domNode, ckSelectDiv);
            imageNoLegendDiv = domConstruct.create('div', {
                'class': 'noLegend-div jimu-float-leading'
            }, layerTdNode);
            var imageName;
            if (layerInfo.isTable) {
                imageName = 'images/table.png';
            } else if (layerInfo.isBasemap()) {
                imageName = 'images/basemap.png';
            } else {
                imageName = 'images/noLegend.png';
            }
            imageNoLegendNode = domConstruct.create('img', {
                'class': 'noLegend-image',
                'src': this.layerListWidget.folderUrl + imageName,
                'alt': 'l'
            }, imageNoLegendDiv);
            if (layerInfo.isTiled || layerInfo.isTable || layerInfo.isBasemap()) {
                domStyle.set(imageShowLegendDiv, 'display', 'none');
                domStyle.set(ckSelectDiv, 'display', 'none');
                domStyle.set(imageNoLegendDiv, 'display', 'block');
            }
            var layerTitleTdNode = domConstruct.create('td', {
                'class': 'col col2'
            }, layerTrNode);
            var grayedTitleClass = '';
            try {
                if (!layerInfo.isInScale()) {
                    grayedTitleClass = 'grayed-title';
                }
            } catch (err) {
                console.warn(err.message);
            }
            var layerTitleDivIdClass = 'layer-title-div-' + layerInfo.id;
            divLabel = domConstruct.create('div', {
                'innerHTML': '&nbsp;'+layerInfo.title,
                'class': layerTitleDivIdClass + ' div-content jimu-float-leading ' + grayedTitleClass,
                'title': layerInfo.title
            }, layerTitleTdNode);
            layerTdNode = domConstruct.create('td', {
                'class': 'col col3'
            }, layerTrNode);
            var popupMenuDisplayStyle = this.hasContentMenu() ? "display: block" : "display: none";
            // add popupMenu
            popupMenuNode = domConstruct.create('div', {
                'class': 'layers-list-popupMenu-div',
                'style': popupMenuDisplayStyle
            }, layerTdNode);
            //add a tr node to toTableNode.
            var layerContentTrNode = domConstruct.create('tr', {
                'class': '',
                'layerContentTrNodeId': layerInfo.id
            });
            domConstruct.place(layerContentTrNode, toTableNode, position);

            var tdNode = domConstruct.create('td', {
                'class': '',
                'colspan': '3'
            }, layerContentTrNode);
            var tableNode = domConstruct.create('table', {
                'class': 'layer-sub-node',
                'subNodeId': layerInfo.id
            }, tdNode);
            //bind event
            handle = this.own(on(layerTitleTdNode,
                'click',
                lang.hitch(this,
                    this._onRowTrClick,
                    layerInfo,
                    imageShowLegendDiv,
                    layerTrNode,
                    tableNode)));
            this._storeLayerNodeEventHandle(rootLayerInfo, handle[0]);
            handle = this.own(on(imageShowLegendDiv,
                'click',
                lang.hitch(this,
                    this._onRowTrClick,
                    layerInfo,
                    imageShowLegendDiv,
                    layerTrNode,
                    tableNode)));
            this._storeLayerNodeEventHandle(rootLayerInfo, handle[0]);
            handle = this.own(on(ckSelect.domNode, 'click', lang.hitch(this,
                this._onCkSelectNodeClick,
                layerInfo,
                ckSelect)));

            this._storeLayerNodeEventHandle(rootLayerInfo, handle[0]);
            handle = this.own(on(popupMenuNode, 'click', lang.hitch(this,
                this._onPopupMenuClick,
                layerInfo,
                popupMenuNode,
                layerTrNode)));
            this._storeLayerNodeEventHandle(rootLayerInfo, handle[0]);
            if (layerInfo.isRootLayer() || layerInfo.isTable) {
                this._layerDomNodeStorage[layerInfo.getObjectId()].layerTrNode = layerTrNode;
                this._layerDomNodeStorage[layerInfo.getObjectId()].layerContentTrNode = layerContentTrNode;
            }
            if (this.layerFilter.isExpanded(layerInfo)) {
                this._foldOrUnfoldLayer(layerInfo, false, imageShowLegendDiv, tableNode);
            }
            //if (typeof (this.config.layerOptions) != "undefined") {  // for disabling layers / folder                   
            //    if (typeof (this.config.layerOptions[layerInfo.id]) != "undefined") {
            //        if (typeof (this.config.layerOptions[layerInfo.id].visible) != "undefined") {
            //            if (this.config.layerOptions[layerInfo.id].folder != "WithoutFolder") {
            //                if (this.config.layerOptions[layerInfo.id].visible === false) {
            //                    dojo.addClass(dojo.query(layerTrNode.childNodes[0].childNodes[2].childNodes[0].childNodes[0])[0], "disbledClass");
            //                }
            //            }
            //            else {
            //                if (this.config.layerOptions[layerInfo.id].visible === false) {
            //                    dojo.addClass(dojo.query(layerTrNode.childNodes[0])[0].childNodes[1].childNodes[0].childNodes[0], "disbledClass");
            //                }
            //            }

            //        }
            //    }
            //}
            return {
                layerTrNode: layerTrNode,
                subNode: tableNode
            };
        },
        hasContentMenu: function () {
            var hasContentMenu = false;
            var item;
            if (this.config.contextMenu) {
                for (item in this.config.contextMenu) {
                    if (this.config.contextMenu.hasOwnProperty(item) &&
                        (typeof this.config.contextMenu[item] !== 'function')) {
                        hasContentMenu = hasContentMenu || this.config.contextMenu[item];
                    }
                }
            } else {
                hasContentMenu = true;
            }
            return hasContentMenu;
        },
        addLegendNode: function (layerInfo, level, toTableNode) {
            var legendTrNode = domConstruct.create('tr', {
                'class': 'legend-node-tr'
            }, toTableNode),
                legendTdNode;

            legendTdNode = domConstruct.create('td', {
                'class': 'legend-node-td'
            }, legendTrNode);
            try {
                var legendsNode = layerInfo.createLegendsNode();
                domStyle.set(legendsNode, 'font-size', (level + 1) * 12 + 'px');
                domConstruct.place(legendsNode, legendTdNode);
            } catch (err) {
                console.error(err);
            }
        },
        redrawLegends: function (layerInfo) {
            var legendsNode = query("div[legendsDivId='" + layerInfo.id + "']", this.layerListTable)[0];
            if (legendsNode) {
                if (legendsNode._legendDijit && legendsNode._legendDijit.destroy) {
                    legendsNode._legendDijit.destroy();
                }
                layerInfo.drawLegends(legendsNode, this.layerListWidget.appConfig.portalUrl);
            }
        },
        /***************************************************
         * methods for refresh layerListView
         ***************************************************/
        _storeLayerNodeEventHandle: function (rootLayerInfo, handle) {
            var rootLayerStorage = this._layerDomNodeStorage[rootLayerInfo.getObjectId()];
            if (rootLayerStorage) {
                rootLayerStorage.layerNodeEventHandles.push(handle);
            }
        },
        _storeLayerNodeDijit: function (rootLayerInfo, dijit) {
            var rootLayerStorage = this._layerDomNodeStorage[rootLayerInfo.getObjectId()];
            if (rootLayerStorage) {
                rootLayerStorage.layerNodeReferredDijits.push(dijit);
            }
        },
        _clearLayerDomNodeStorage: function () {
            //jshint unused:false
            var layerInfoArray = this.operLayerInfos.getLayerInfoArray();
            var tableInfoArray = this.operLayerInfos.getTableInfoArray();
            var layerAndTableInfoArray = layerInfoArray.concat(tableInfoArray);
            var findElem;
            for (var elem in this._layerDomNodeStorage) {
                if (this._layerDomNodeStorage.hasOwnProperty(elem) &&
                    (typeof this._layerDomNodeStorage[elem] !== 'function')) {
                    /* jshint loopfunc: true */
                    findElem = array.some(layerAndTableInfoArray, function (layerInfo) {
                        if (layerInfo.getObjectId().toString() === elem) {
                            return true;
                        }
                    }, this);
                    if (!findElem) {
                        //release layer node.
                        array.forEach(this._layerDomNodeStorage[elem].layerNodeEventHandles, function (handle) {
                            handle.remove();
                        }, this);
                        array.forEach(this._layerDomNodeStorage[elem].layerNodeReferredDijits, function (dijit) {
                            dijit.destroy();
                        }, this);
                        domConstruct.destroy(this._layerDomNodeStorage[elem].layerTrNode);
                        domConstruct.destroy(this._layerDomNodeStorage[elem].layerContentTrNode);
                        delete this._layerDomNodeStorage[elem];
                    }
                }
            }
        },
        _removeLayerNodes: function () {
            var nodeAndSubNode, parentNode;
            this._clearLayerDomNodeStorage();
            for (var elem in this._layerDomNodeStorage) {
                if (this._layerDomNodeStorage.hasOwnProperty(elem) &&
                    (typeof this._layerDomNodeStorage[elem] !== 'function')) {
                    nodeAndSubNode = this._layerDomNodeStorage[elem];
                    if (nodeAndSubNode.layerContentTrNode && nodeAndSubNode.layerTrNode) {
                        parentNode = nodeAndSubNode.layerTrNode.parentNode;
                        if (parentNode) {
                            parentNode.removeChild(nodeAndSubNode.layerTrNode);
                        }
                        parentNode = nodeAndSubNode.layerContentTrNode.parentNode;
                        if (parentNode) {
                            parentNode.removeChild(nodeAndSubNode.layerContentTrNode);
                        }
                    }
                }
            }
        },
        /***************************************************
         * methods for control layerListView
         ***************************************************/
        // return current state:
        //   true:  fold,
        //   false: unfold
        _foldSwitch: function (layerInfo, imageShowLegendDiv, subNode) {
            /*jshint unused: false*/
            var state;
            if (domStyle.get(subNode, 'display') === 'none') {
                state = this._foldOrUnfoldLayer(layerInfo, false, imageShowLegendDiv, subNode);
            } else {
                state = this._foldOrUnfoldLayer(layerInfo, true, imageShowLegendDiv, subNode);
            }
            return state;
        },
        _foldSwitchFolder: function (folderName, imageShowLegendDiv, subNode) {
            var state;
            if (domStyle.get(subNode, 'display') === 'none') {
                state = this._foldOrUnfoldFolder(folderName, false, imageShowLegendDiv, subNode);
            } else {
                state = this._foldOrUnfoldFolder(folderName, true, imageShowLegendDiv, subNode);
            }
            return state;
        },
        _foldOrUnfoldFolder: function (folderName, isFold, imageShowLegendDivParam, subNodeParam) {
            folderName = folderName.replace(" ", "-");
            folderName = this.replaceSpecialCharacters(folderName);
            var imageShowLegendDiv =
                imageShowLegendDiv ?
                imageShowLegendDivParam :
                    query("div[imageShowLegendDivId='" + folderName + "']", this.layerListTable)[0];
            var subNode =
                subNode ?
                subNodeParam :
                    query("table[subNodeId='" + folderName + "']", this.layerListTable)[0];
            var state = null;
            if (imageShowLegendDiv && subNode) {
                if (isFold) {
                    //fold
                    domStyle.set(subNode, 'display', 'none');
                    domClass.remove(imageShowLegendDiv, 'unfold');
                    dojo.query(".layers-list-body > tr .col1", this.domNode).forEach(function (node) {

                        if (!(node.children[0].className.indexOf("unfold") > -1)) {

                            //dojo.query(node.childNodes[2].childNodes[0]).removeClass("openFolderIcon");
                            dojo.query(node.nextElementSibling.childNodes[0].childNodes[0]).removeClass("openFolderIcon");

                        }
                    });
                    state = true;
                } else {
                    //unfold
                    domStyle.set(subNode, 'display', 'table');
                    domClass.add(imageShowLegendDiv, 'unfold');
                    dojo.query(".layers-list-body > tr .col1", this.domNode).forEach(function (node) {
                        if ((node.children[0].className.indexOf("unfold") > -1)) {

                            //dojo.query(node.childNodes[2].childNodes[0]).addClass("openFolderIcon");
                            dojo.query(node.nextElementSibling.childNodes[0].childNodes[0]).addClass("openFolderIcon");

                        }
                    });
                    state = false;
                }
            }
            return state;
        },
        _foldOrUnfoldLayer: function (layerInfo, isFold, imageShowLegendDivParam, subNodeParam) {
            var imageShowLegendDiv =
                imageShowLegendDiv ?
                imageShowLegendDivParam :
                    query("div[imageShowLegendDivId='" + layerInfo.id + "']", this.layerListTable)[0];
            var subNode =
                subNode ?
                subNodeParam :
                    query("table[subNodeId='" + layerInfo.id + "']", this.layerListTable)[0];
            var state = null;
            if (imageShowLegendDiv && subNode) {
                if (isFold) {
                    //fold
                    domStyle.set(subNode, 'display', 'none');
                    domClass.remove(imageShowLegendDiv, 'unfold');
                    state = true;
                } else {
                    //unfold
                    domStyle.set(subNode, 'display', 'table');
                    domClass.add(imageShowLegendDiv, 'unfold');
                    state = false;
                    if (layerInfo.isLeaf()) {
                        var legendsNode = query(".legends-div", subNode)[0];
                        var loadingImg = query(".legends-loading-img", legendsNode)[0];
                        if (legendsNode && loadingImg) {
                            layerInfo.drawLegends(legendsNode, this.layerListWidget.appConfig.portalUrl);
                        }
                    }
                }
            }
            return state;
        },
        _foldOrUnfoldLayers: function (layerInfos, isFold) {
            array.forEach(layerInfos, function (layerInfo) {
                this._foldOrUnfoldLayer(layerInfo, isFold);
            }, this);
        },

        setFolderLevelVisibility: function (folderStatus, folderName) {
            var cusfolder = this.config.customFolder;
            var configLayers = this.config.layerOptions;
            var layerInfoArray = this.operLayerInfos.getLayerInfoArray();

            for (var i = 0; i < cusfolder.length; i++) {
                if (cusfolder[i].name === folderName) {
                    array.forEach(layerInfoArray, function (layerInfo) {

                        if (configLayers[layerInfo.id].folder != undefined) {
                            if (configLayers[layerInfo.id].folder === folderName) {

                                var layer = this.layerListWidget.map.getLayer(layerInfo.id);
                                if (typeof (layer) == "undefined" || layer == null) {
                                    return
                                }
                                //update the config status object
                                cusfolder[i].status = folderStatus;
                                var checkState = false;

                                var checkbox = dojo.query(".visible-checkbox-" + layerInfo.id + " .checkbox", this.domNode); //get the node inside in the control

                                if (checkbox.length > 0) {

                                    if (dojo.hasClass(checkbox[0], "jimu-icon-checked"))
                                        checkState = true;
                                    if (layer) {
                                        if (folderStatus) {
                                            layer.setVisibility(checkState);
                                        }
                                        else {
                                            layer.setVisibility(false);
                                            if (checkState) {
                                                dojo.addClass(checkbox[0], "jimu-icon-checked");
                                            }

                                        }
                                    }
                                }
                                else {

                                    if (this.config.layerOptions[layerInfo.id]) {

                                        //array.forEach(layerInfoArray, function (currentLayerInfo, index) {
                                        //		this.global_layerInfoArrayAtStartup[currentLayerInfo.id] = currentLayerInfo._visible;  //store the status of layers
                                        //	}, this);

                                        var LayerMapDisplay = false;
                                        var associatedLayerDisplayStatus = false;
                                        LayerMapDisplay = this.global_layerInfoArrayAtStartup[layerInfo.id]; //layer display status                                       
                                        var NSLAYERDATA = dojoJsonQuery("?VT_Layer = '" + layerInfo.id + "'", this.config.layerDisplaySyncOptions);
                                        var NSLayerId = null;
                                        if (NSLAYERDATA[0])
                                            NSLayerId = (NSLAYERDATA[0].NS_Layer);

                                        //if the lasyer has associated layer and it is display oN then make this layer oN
                                        if (NSLayerId) {

                                            var checkbox = dojo.query(".visible-checkbox-" + NSLayerId + " .checkbox", this.domNode);

                                            if (checkbox.length > 0) {

                                                if (dojo.hasClass(checkbox[0], "jimu-icon-checked"))
                                                    associatedLayerDisplayStatus = true;


                                                if (associatedLayerDisplayStatus && folderStatus) {

                                                    layer.setVisibility(true);
                                                }
                                                else {
                                                    layer.setVisibility(false);
                                                }


                                            }



                                        }
                                        else {
                                            if (LayerMapDisplay && folderStatus) {

                                                layer.setVisibility(true);
                                            }
                                            else {
                                                layer.setVisibility(false);
                                            }

                                        }




                                    }
                                }
                            }
                        }

                    }, this);
                }
            }


        },

        _onCkSelectFolderNodeClick: function (folderName, ckSelect) {   // method for folder level check / uncheck
            dojo.query(ckSelect.checkNode).addClass("jimu-icon-checkbox");
            this.setFolderLevelVisibility(ckSelect.checked, folderName);



        },
        _onCkSelectNodeClick: function (layerInfo, ckSelect, evt) {  // method for layer level check/uncheck  
            var folderCheckStatus = true;
            if (evt.currentTarget.childNodes[0].outerHTML.indexOf('disbledClass') > -1) {
                return;
            }
            if (evt.ctrlKey || evt.metaKey) {
                if (layerInfo.isRootLayer()) {
                    this.turnAllRootLayers(ckSelect.checked);
                } else {
                    this.turnAllSameLevelLayers(layerInfo, ckSelect.checked);
                }
            } else {
                // debugger;
                this.layerListWidget._denyLayerInfosIsVisibleChangedResponseOneTime = true;
                var folderName = this.config.layerOptions[layerInfo.id].folder;
                if (folderName) {
                    //var folderStatus = this.config.customFolder.find(x => x.name == folderName).status;
                    var folderclassName = folderName.replace(/\s+/g, '-');
                    folderclassName = this.replaceSpecialCharacters(folderclassName);
                    var foldercheckbox = dojo.query(".folder" + folderclassName, this.domNode);
                    //folder check status
                    var folderChecked = dojo.query(".jimu-icon-checked", foldercheckbox[0], this.domNode);
                    if (folderChecked.length == 0) {
                        folderCheckStatus = false;
                    }
                    var layerid = layerInfo.id;
                    var layer = this.layerListWidget.map.getLayer(layerid);
                    var checkbox = dojo.query(".visible-checkbox-" + layerInfo.id + " .checkbox", this.domNode);
                    if (foldercheckbox.length > 0) {

                        this.HandleLayersOnCheckclick(ckSelect, folderCheckStatus, layer, checkbox);
                        //if (folderCheckStatus) {

                        //    if (ckSelect.checked) {
                        //        dojo.addClass(checkbox[0], "jimu-icon-checked");
                        //        layer.setVisibility(true);
                        //    }
                        //    else {
                        //        dojo.removeClass(checkbox[0], "jimu-icon-checked");
                        //        dojo.addClass(checkbox[0], "jimu-icon-checkbox");
                        //        layer.setVisibility(false);

                        //    }
                        //}
                        //else {
                        //    if (!ckSelect.checked) {
                        //        dojo.addClass(checkbox[0], "jimu-icon-checked");
                        //        layer.setVisibility(false);
                        //    }
                        //    else {
                        //        dojo.removeClass(checkbox[0], "jimu-icon-checked");
                        //        dojo.addClass(checkbox[0], "jimu-icon-checkbox");
                        //        layer.setVisibility(false);

                        //    }
                        //}

                    }
                    else {

                        if (ckSelect.checked)
                            dojo.addClass(checkbox[0], "jimu-icon-checked");
                        else {
                            dojo.removeClass(checkbox[0], "jimu-icon-checked");
                            dojo.addClass(checkbox[0], "jimu-icon-checkbox");
                        }

                        layerInfo.setTopLayerVisible(ckSelect.checked);
                    }

                }
                else {

                    layerInfo.setTopLayerVisible(ckSelect.checked);

                }
            }
            if (array.indexOf(this.NSLayers, layerInfo.id) >= 0) {
                //  if (folderCheckStatus) {
                var VTLayerId = (dojoJsonQuery("?NS_Layer = '" + layerInfo.id + "'", this.config.layerDisplaySyncOptions)[0].VT_Layer);
                var VTLayer = this.layerListWidget.map.getLayer(VTLayerId);


                if (VTLayer) {
                    var checkbox = dojo.query(".visible-checkbox-" + VTLayer.id + " .checkbox", this.domNode);

                    this.HandleLayersOnCheckclick(ckSelect, folderCheckStatus, VTLayer, checkbox);
                    //if (folderCheckStatus == true) {
                    //    if (dojo.hasClass(checkbox[0], "jimu-icon-checked")) {

                    //        dojo.removeClass(checkbox[0], "jimu-icon-checked");
                    //        dojo.addClass(checkbox[0], "jimu-icon-checkbox");
                    //        VTLayer.setVisibility(false);
                    //        //layerInfo.setTopLayerVisible(true);
                    //    }
                    //    else {
                    //        dojo.addClass(checkbox[0], "jimu-icon-checked");
                    //        VTLayer.setVisibility(true);
                    //    }
                    //}

                    //else {
                    //    //dojo.removeClass(checkbox[0], "jimu-icon-checked");
                    //    //dojo.addClass(checkbox[0], "jimu-icon-checkbox");
                    //    //VTLayer.setVisibility(false);

                    //    if (dojo.hasClass(checkbox[0], "jimu-icon-checked")) {

                    //        //   dojo.addClass(checkbox[0], "jimu-icon-checked");
                    //        dojo.removeClass(checkbox[0], "jimu-icon-checked");
                    //        dojo.addClass(checkbox[0], "jimu-icon-checked");
                    //        VTLayer.setVisibility(false);

                    //    }
                    //    else {
                    //        //  dojo.addClass(checkbox[0], "jimu-icon-checked");
                    //        dojo.addClass(checkbox[0], "jimu-icon-checked");
                    //        //   dojo.addClass(checkbox[0], "jimu-icon-checkbox");
                    //        VTLayer.setVisibility(false);
                    //    }


                    //}

                    //if (folderCheckStatus) {

                    //   // ckSelect.checked ? VTLayer.show() : VTLayer.hide();
                    //}
                    //else {
                    //   // ckSelect.checked ? VTLayer.hide() : VTLayer.hide();
                    //}
                }
                // }

            }
            evt.stopPropagation();
        },

        ////HandleLayersOnCheckclick: function (ckSelect, folderCheckStatus, layer, checkbox) {

        ////    if (folderCheckStatus) {

        ////        if (ckSelect.checked) {
        ////            dojo.addClass(checkbox[0], "jimu-icon-checked");
        ////            layer.setVisibility(true);
        ////        }
        ////        else {
        ////            dojo.removeClass(checkbox[0], "jimu-icon-checked");
        ////            dojo.addClass(checkbox[0], "jimu-icon-checkbox");
        ////            layer.setVisibility(false);

        ////        }
        ////    }
        ////    else {
        ////        if (!ckSelect.checked) {
        ////            dojo.addClass(checkbox[0], "jimu-icon-checked");
        ////            layer.setVisibility(false);
        ////        }
        ////        else {
        ////            dojo.removeClass(checkbox[0], "jimu-icon-checked");
        ////            dojo.addClass(checkbox[0], "jimu-icon-checkbox");
        ////            layer.setVisibility(false);

        ////        }
        ////    }

        ////},

        ////HandleLayersOnCheckclick: function (ckSelect, folderCheckStatus, layer, checkbox) {

        ////    if (folderCheckStatus) {

        ////        if (ckSelect.checked) {
        ////            dojo.addClass(checkbox[0], "jimu-icon-checked");
        ////            layer.setVisibility(true);
        ////        }
        ////        else {
        ////            dojo.removeClass(checkbox[0], "jimu-icon-checked");
        ////            dojo.addClass(checkbox[0], "jimu-icon-checkbox");
        ////            layer.setVisibility(false);

        ////        }
        ////    }
        ////    else {
        ////        if (!ckSelect.checked) {
        ////            dojo.addClass(checkbox[0], "jimu-icon-checked");
        ////            layer.setVisibility(false);
        ////        }
        ////        else {
        ////            dojo.removeClass(checkbox[0], "jimu-icon-checked");
        ////            dojo.addClass(checkbox[0], "jimu-icon-checkbox");
        ////            layer.setVisibility(false);

        ////        }
        ////    }

        ////},

        HandleLayersOnCheckclick: function (ckSelect, folderCheckStatus, layer, checkbox) {

            if (folderCheckStatus) {

                if (ckSelect.checked) {
                    if (!this.config.layerOptions[layer.id].display) {
                        layer.setVisibility(true);
                    }
                    else {
                        if (checkbox[0]) dojo.addClass(checkbox[0], "jimu-icon-checked");

                        layer.setVisibility(true);
                    }
                }
                else {
                    if (!this.config.layerOptions[layer.id].display) {
                        layer.setVisibility(false);
                    }
                    else {
                        if (checkbox[0]) dojo.removeClass(checkbox[0], "jimu-icon-checked");
                        if (checkbox[0]) dojo.addClass(checkbox[0], "jimu-icon-checkbox");
                        layer.setVisibility(false);
                    }


                }
            }
            else {
                if (!ckSelect.checked) {
                    if (!this.config.layerOptions[layer.id].display) {
                        layer.setVisibility(false);
                    }
                    else {
                        if (checkbox[0]) dojo.addClass(checkbox[0], "jimu-icon-checked");
                        layer.setVisibility(false);
                    }

                }
                else {
                    if (!this.config.layerOptions[layer.id].display) {
                        layer.setVisibility(false);
                    }
                    else {
                        if (checkbox[0]) dojo.removeClass(checkbox[0], "jimu-icon-checked");
                        if (checkbox[0]) dojo.addClass(checkbox[0], "jimu-icon-checkbox");
                        layer.setVisibility(false);
                    }


                }
            }

        },

        _onPopupMenuClick: function (layerInfo, popupMenuNode, layerTrNode, evt) {
            var rootLayerInfo = layerInfo.getRootLayerInfo();
            var popupMenu = popupMenuNode.popupMenu;
            if (!popupMenu) {
                popupMenu = new PopupMenu({
                    //items: layerInfo.popupMenuInfo.menuItems,
                    _layerInfo: layerInfo,
                    box: this.layerListWidget.domNode.parentNode,
                    popupMenuNode: popupMenuNode,
                    layerListWidget: this.layerListWidget,
                    _config: this.config
                }).placeAt(popupMenuNode);
                popupMenuNode.popupMenu = popupMenu;
                this._storeLayerNodeDijit(rootLayerInfo, popupMenu);
                var handle = this.own(on(popupMenu,
                    'onMenuClick',
                    lang.hitch(this, this._onPopupMenuItemClick, layerInfo, popupMenu)));
                this._storeLayerNodeEventHandle(rootLayerInfo, handle[0]);
            }

            /*jshint unused: false*/
            this._changeSelectedLayerRow(layerTrNode);
            if (popupMenu && popupMenu.state === 'opened') {
                popupMenu.closeDropMenu();
            } else {
                this._hideCurrentPopupMenu();
                if (popupMenu) {
                    this.currentPopupMenu = popupMenu;
                    popupMenu.openDropMenu();
                }
            }
            //hidden operation mene if that is opened.
            if (this.operationsDropMenu && this.operationsDropMenu.state === 'opened') {
                this.operationsDropMenu.closeDropMenu();
            }
            evt.stopPropagation();
        },
        _hideCurrentPopupMenu: function () {
            if (this.currentPopupMenu && this.currentPopupMenu.state === 'opened') {
                this.currentPopupMenu.closeDropMenu();
            }
        },
        _onLayerListWidgetPaneClick: function () {
            if (this.operationsDropMenu) {
                this.operationsDropMenu.closeDropMenu();
            }
        },
        _onRowFolderTrClick: function (folderName, imageShowLegendDiv, layerTrNode, subNode, evt) {  // on folder row click
            this._changeSelectedLayerRow(layerTrNode);
            var fold = this._foldSwitchFolder(folderName, imageShowLegendDiv, subNode);
        },
        _onRowTrClick: function (layerInfo, imageShowLegendDiv, layerTrNode, subNode, evt) {
            this._changeSelectedLayerRow(layerTrNode);
            var fold = this._foldSwitch(layerInfo, imageShowLegendDiv, subNode);
            if (evt.ctrlKey || evt.metaKey) {
                if (layerInfo.isRootLayer()) {
                    this.foldOrUnfoldAllRootLayers(fold);
                } else {
                    this.foldOrUnfoldSameLevelLayers(layerInfo, fold);
                }
            }
        },
        _changeSelectedLayerRow: function (layerTrNode) {
            if (this._currentSelectedLayerRowNode && this._currentSelectedLayerRowNode === layerTrNode) {
                return;
            }
            if (this._currentSelectedLayerRowNode) {
                domClass.remove(this._currentSelectedLayerRowNode, 'jimu-widget-row-selected');
            }
            domClass.add(layerTrNode, 'jimu-widget-row-selected');
            this._currentSelectedLayerRowNode = layerTrNode;
        },
        _onPopupMenuItemClick: function (layerInfo, popupMenu, item, data) {
            var evt = {
                itemKey: item.key,
                extraData: data,
                layerListWidget: this.layerListWidget,
                layerListView: this
            },
                result;
            if (item.key === 'transparency') {
                if (domStyle.get(popupMenu.transparencyDiv, 'display') === 'none') {
                    popupMenu.showTransNode(layerInfo.getOpacity());
                } else {
                    popupMenu.hideTransNode();
                }
            } else if (item.key === 'setVisibilityRange') {
                if (domStyle.get(popupMenu.setVisibilityRangeNode, 'display') === 'none') {
                    popupMenu.showSetVisibilityRangeNode(layerInfo);
                } else {
                    popupMenu.hideSetVisibilityRangeNode();
                }
            } else {
                result = popupMenu.popupMenuInfo.onPopupMenuClick(evt);
                if (result.closeMenu) {
                    popupMenu.closeDropMenu();
                }
            }
        },
        /***************************************************
         * methods for control moveUp/moveDown.
         ***************************************************/
        // befor exchange:  id1 -> id2
        // after exchanged: id2 -> id1
        _exchangeLayerTrNode: function (layerInfo1, layerInfo2) {
            var layer1TrNode = query("tr[layerTrNodeId='" + layerInfo1.id + "']", this.layerListTable)[0];
            var layer2TrNode = query("tr[layerTrNodeId='" + layerInfo2.id + "']", this.layerListTable)[0];
            var layer2ContentTrNode = query("tr[layerContentTrNodeId='" + layerInfo2.id + "']",
                this.layerListTable)[0];
            if (layer1TrNode && layer2TrNode && layer2ContentTrNode) {
                // change layerTr
                this.layerListTable.removeChild(layer2TrNode);
                this.layerListTable.insertBefore(layer2TrNode, layer1TrNode);
                // change LayerContentTr
                this.layerListTable.removeChild(layer2ContentTrNode);
                this.layerListTable.insertBefore(layer2ContentTrNode, layer1TrNode);
            }
        },
        _getMovedSteps: function (layerInfo, upOrDown) {
            // summary:
            //   according to hidden layers to get moved steps.
            var steps = 1;
            var layerInfoIndex;
            var layerInfoArray = this.operLayerInfos.getLayerInfoArray();
            array.forEach(layerInfoArray, function (currentLayerInfo, index) {
                if (layerInfo.id === currentLayerInfo.id) {
                    layerInfoIndex = index;
                }
            }, this);
            if (upOrDown === "moveup") {
                while (!layerInfoArray[layerInfoIndex].isFirst) {
                    layerInfoIndex--;
                    if ((this.isLayerHiddenInWidget(layerInfoArray[layerInfoIndex]) ||
                        !this.layerFilter.isValidLayerInfo(layerInfoArray[layerInfoIndex])) &&
                        !layerInfoArray[layerInfoIndex].isFirst) {
                        steps++;
                    } else {
                        break;
                    }
                }
            } else {
                while (!layerInfoArray[layerInfoIndex].isLast) {
                    layerInfoIndex++;
                    if ((this.isLayerHiddenInWidget(layerInfoArray[layerInfoIndex]) ||
                        !this.layerFilter.isValidLayerInfo(layerInfoArray[layerInfoIndex])) &&
                        !layerInfoArray[layerInfoIndex].isLast) {
                        steps++;
                    } else {
                        break;
                    }
                }
            }
            return steps;
        },
        //moveUpLayer: function (layerInfo) {
        //    //// summary:
        //    ////    move up layer in layer list.
        //    //// description:
        //    ////    call the moveUpLayer method of LayerInfos to change the layer order in map,
        //    ////    and update the data in LayerInfos
        //    ////    then, change layerNodeTr and layerContentTr domNode
        //    //var steps = this._getMovedSteps(layerInfo, 'moveup');
        //    //this.layerListWidget._denyLayerInfosReorderResponseOneTime = true;
        //    //var beChangedLayerInfo = this.operLayerInfos.moveUpLayer(layerInfo, steps);
        //    //if (beChangedLayerInfo) {
        //    //	this._exchangeLayerTrNode(beChangedLayerInfo, layerInfo);
        //    //}
        //    //update the display index in the config
        //    var totallayers = this.operLayerInfos._finalLayerInfos.length;
        //    for (n = 0; n < totallayers; n++) {
        //        var currentLayer, nextLayer, PrevLayer;
        //        currentLayer = this.operLayerInfos._finalLayerInfos[n];
        //        if (currentLayer.id == layerInfo.id) {
        //            if (n > 0)
        //                PrevLayer = this.operLayerInfos._finalLayerInfos[n - 1];
        //            //update displayindex for current layer and next Layer
        //            this.config.layerOptions[layerInfo.id].displayindex = this.config.layerOptions[layerInfo.id].displayindex - 1;
        //            this.config.layerOptions[PrevLayer.id].displayindex = this.config.layerOptions[PrevLayer.id].displayindex + 1;
        //            break;
        //        }
        //    }
        //    var steps = this._getMovedSteps(layerInfo, 'moveup');
        //    this.layerListWidget._denyLayerInfosReorderResponseOneTime = true;
        //    var beChangedLayerInfo = this.operLayerInfos.moveUpLayer(layerInfo, steps);
        //    this.layerListWidget._denyLayerInfosReorderResponseOneTime = true;
        //    //Code added by ispatialTec to move up and down layers within folder and outside of the folder.              
        //    var layerTrNode = query("tr[layerTrNodeId='" + layerInfo.id + "']", this.layerListTable)[0];
        //    var node = layerTrNode;
        //    var parent = node.parentNode;
        //    if (node.previousSibling === null) {
        //        return;
        //    }
        //    var prevNode = node.previousSibling.previousSibling;
        //    var childparentNode = layerTrNode.nextSibling;
        //    var oldChild = parent.removeChild(node);
        //    parent.insertBefore(oldChild, prevNode);
        //    var oldSubChild = parent.removeChild(childparentNode);
        //    parent.insertBefore(oldSubChild, oldChild.nextSibling);
        //},
        //moveDownLayer: function (layerInfo) {
        //    //// summary:
        //    ////    move down layer in layer list.
        //    //// description:
        //    ////    call the moveDownLayer method of LayerInfos to change the layer order in map,
        //    ////    and update the data in LayerInfos
        //    ////    then, change layerNodeTr and layerContentTr domNode
        //    //var steps = this._getMovedSteps(layerInfo, 'movedown');
        //    //this.layerListWidget._denyLayerInfosReorderResponseOneTime = true;
        //    //var beChangedLayerInfo = this.operLayerInfos.moveDownLayer(layerInfo, steps);
        //    //if (beChangedLayerInfo) {
        //    //	this._exchangeLayerTrNode(layerInfo, beChangedLayerInfo);
        //    //}
        //    //update the display index in the config
        //    var totallayers = this.operLayerInfos._finalLayerInfos.length;
        //    for (n = 0; n < totallayers; n++) {
        //        var currentLayer, nextLayer, PrevLayer;
        //        currentLayer = this.operLayerInfos._finalLayerInfos[n];
        //        if (currentLayer.id == layerInfo.id) {
        //            if (n < totallayers - 1)
        //                nextLayer = this.operLayerInfos._finalLayerInfos[n + 1];
        //            //update displayindex for current layer and next Layer
        //            this.config.layerOptions[layerInfo.id].displayindex = this.config.layerOptions[layerInfo.id].displayindex + 1;
        //            this.config.layerOptions[nextLayer.id].displayindex = this.config.layerOptions[nextLayer.id].displayindex - 1;
        //        }
        //    }
        //    var steps = this._getMovedSteps(layerInfo, 'movedown');
        //    this.layerListWidget._denyLayerInfosReorderResponseOneTime = true;
        //    var beChangedLayerInfo = this.operLayerInfos.moveDownLayer(layerInfo, steps);
        //    //Code added by ispatialTec to move up and down layers within folder and outside of the folder.   
        //    this.layerListWidget._denyLayerInfosReorderResponseOneTime = true;
        //    var layerTrNode = query("tr[layerTrNodeId='" + layerInfo.id + "']", this.layerListTable)[0];
        //    var node = layerTrNode;
        //    var parent = node.parentNode;
        //    if (node.nextSibling.nextSibling === null) {
        //        return;
        //    }
        //    var childparentNode = layerTrNode.nextSibling;
        //    var prev = node.nextSibling.nextSibling.nextSibling;
        //    var oldChild = parent.removeChild(node);
        //    parent.insertBefore(oldChild, prev.nextSibling);
        //    var oldSubChild = parent.removeChild(childparentNode);
        //    parent.insertBefore(oldSubChild, oldChild.nextSibling);
        //},
        isLayerHiddenInWidget: function (layerInfo) {
            var isHidden = false;
            var currentLayerInfo = layerInfo;
            if (layerInfo &&
                this.config.layerOptions &&
                this.config.layerOptions[layerInfo.id] !== undefined) {
                while (currentLayerInfo) {
                    isHidden = isHidden || !this.config.layerOptions[currentLayerInfo.id].display;
                    if (isHidden) {
                        break;
                    }
                    currentLayerInfo = currentLayerInfo.parentLayerInfo;
                }
            } else {
                // if config has not been configured, default value is 'true'.
                // if config has been configured, but new layer of webmap is ont in config file,
                //   default value is 'true'.
                isHidden = false;
            }
            return isHidden;
        },
        isFirstDisplayedLayerInfo: function (layerInfo) {
            var isFirst;
            var steps;
            var layerInfoIndex;
            var layerInfoArray;
            if (layerInfo.isFirst || !layerInfo.isRootLayer() || layerInfo.isBasemap()) {
                isFirst = true;
            } else {
                steps = this._getMovedSteps(layerInfo, "moveup");
                layerInfoArray = this.operLayerInfos.getLayerInfoArray();
                layerInfoIndex = this.operLayerInfos._getTopLayerInfoIndexById(layerInfo.id);
                if (this.isLayerHiddenInWidget(layerInfoArray[layerInfoIndex - steps]) ||
                    !this.layerFilter.isValidLayerInfo(layerInfoArray[layerInfoIndex - steps])) {
                    isFirst = true;
                } else {
                    isFirst = false;
                }
            }
            return isFirst;
        },
        isLastDisplayedLayerInfo: function (layerInfo) {
            var isLast;
            var steps;
            var layerInfoIndex;
            var layerInfoArray;
            if (layerInfo.isLast || !layerInfo.isRootLayer() || layerInfo.isBasemap()) {
                isLast = true;
            } else {
                steps = this._getMovedSteps(layerInfo, "movedown");
                layerInfoArray = this.operLayerInfos.getLayerInfoArray();
                layerInfoIndex = this.operLayerInfos._getTopLayerInfoIndexById(layerInfo.id);
                if (this.isLayerHiddenInWidget(layerInfoArray[layerInfoIndex + steps]) ||
                    !this.layerFilter.isValidLayerInfo(layerInfoArray[layerInfoIndex + steps])) {
                    isLast = true;
                } else {
                    isLast = false;
                }
            }
            return isLast;
        },
        /***************************************************
         * methods for control operation.
         ***************************************************/
        _initOperations: function () {
            this.operationsDropMenu = new DropMenu({
                items: [{
                    key: "turnAllLayersOn",
                    label: this.nls.turnAllLayersOn
                }, {
                    key: "turnAllLayersOff",
                    label: this.nls.turnAllLayersOff
                }, {
                    key: "separator"
                }, {
                    key: "expandAllLayers",
                    label: this.nls.expandAllLayers
                }, {
                    key: "collapseAlllayers",
                    label: this.nls.collapseAlllayers
                }],
                box: this.layerListWidget.domNode.parentNode
            }).placeAt(this.layerListOperations);
            var operationIconBtnNode = query('div.jimu-dropmenu > div:first-child',
                this.layerListOperations)[0];
            if (operationIconBtnNode) {
                domClass.remove(operationIconBtnNode, ['jimu-icon-btn', 'popup-menu-button']);
                domClass.add(operationIconBtnNode, ['feature-action', 'icon-operation']);
            }
            if (this.operationsDropMenu.btnNode) {
                this.own(on(this.operationsDropMenu.btnNode,
                    'click', lang.hitch(this, this._onLayerListOperationsClick)));
            }
            this.own(on(this.operationsDropMenu,
                'onMenuClick',
                lang.hitch(this, this._onOperationsMenuItemClick)));
            this.operationsDropMenuLoading = new LoadingShelter({
                hidden: true
            }).placeAt(this.operationsDropMenu.domNode);
        },
        _onLayerListOperationsClick: function () {
            this._hideCurrentPopupMenu();
        },
        _onOperationsMenuItemClick: function (item) {
            switch (item.key) {
                case 'turnAllLayersOn':
                    this.turnAllFolders(true);
                    this.turnAllRootLayers(true);
                    return;
                case 'turnAllLayersOff':
                    this.turnAllFolders(false);
                    this.turnAllRootLayers(false);
                    return;
                case 'expandAllLayers':
                    this.foldOrUnfoldAllLayers(false);
                    return;
                case 'collapseAlllayers':
                    this.collapseLayers(true);
                    return;
                default:
                    return;
            }
        },
        ExpandFolders: function () {  // method for expanding folder 
            var node = dojo.query("#LayerListBody", this.domNode)[0].childNodes;
            var loopflag = false;
            if (node.length > 0) {
                for (var i = 0; i < node.length; i++) {
                    if (node[i].id.length > 0) {
                        loopflag = false;
                        var folderName = node[i].id;
                        var layerTrNode = node[i];
                        var subNode = node[i].nextSibling.childNodes[0].childNodes[0];
                        var imageShowLegendDiv = node[i].childNodes[0].childNodes[0]
                        for (var j = 0; j < imageShowLegendDiv.classList.length; j++) {
                            if (imageShowLegendDiv.classList[j] === "unfold") {
                                loopflag = true;
                            }
                        }
                        if (!loopflag) {
                            this._changeSelectedLayerRow(layerTrNode);
                            var fold = this._foldSwitchFolder(folderName, imageShowLegendDiv, subNode);
                        }

                    }
                }
            }
        },
        collapseFolders: function () {  //method for  collapsing the folders
            var node = dojo.query("#LayerListBody", this.domNode)[0].childNodes;
            if (node.length > 0) {
                for (var i = 0; i < node.length; i++) {

                    if (node[i].id.length > 0) {

                        var folderName = node[i].id;
                        var layerTrNode = node[i];
                        var subNode = node[i].nextSibling.childNodes[0].childNodes[0];
                        var imageShowLegendDiv = node[i].childNodes[0].childNodes[0]
                        for (var j = 0; j < imageShowLegendDiv.classList.length; j++) {

                            if (imageShowLegendDiv.classList[j] === "unfold") {
                                this._changeSelectedLayerRow(layerTrNode);
                                var fold = this._foldSwitchFolder(folderName, imageShowLegendDiv, subNode);
                            }
                        }

                    }
                }
            }
        },
        turnAllFolders: function (isOnOrOff) { //method for turn on/off the folders
            if (isOnOrOff) {
                dojo.query(".visible-checkbox-folder >   .jimu-icon-checkbox", this.domNode).addClass("jimu-icon-checked");
            }
            else {
                dojo.query(".visible-checkbox-folder >   .jimu-icon-checkbox", this.domNode).removeClass("jimu-icon-checked")
            }
            var cusfolder = this.config.customFolder;
            for (var i = 0; i < cusfolder.length; i++) {
                cusfolder[i].status = isOnOrOff;
            }

        },
        turnAllRootLayers: function (isOnOrOff) { // method for turn on/off the layers
            var layerInfoArray = this.operLayerInfos.getLayerInfoArray();
            array.forEach(layerInfoArray, function (layerInfo) {
                var layerid = layerInfo.id;
                var layer = this.layerListWidget.map.getLayer(layerid);
                // if (!this.isLayerHiddenInWidget(layerInfo)) {
                if (this.config.customFolder.length > 0) {
                    if (this.config.layerOptions[layerInfo.id].folder != undefined && this.config.layerOptions[layerInfo.id].folder.length > 0 && this.config.layerOptions[layerInfo.id].folder != "WithoutFolder") {
                        for (var i = 0; i < this.config.customFolder.length; i++) {
                            if (this.config.layerOptions[layerInfo.id].folder === this.config.customFolder[i].name) {
                                this.handlelayerVisibility(isOnOrOff, layerid, layer);
                            }
                        }
                    }
                    else {
                        if (this.config.layerOptions[layerInfo.id].folder === "WithoutFolder") {

                            this.handlelayerVisibility(isOnOrOff, layerid, layer);
                        }
                    }
                }
                else {
                    this.handlelayerVisibility(isOnOrOff, layerid, layer);
                }
                //}
            }, this);

        },

        handlelayerVisibility: function (isOnOrOff, layerid, layer) {

            var checkbox = dojo.query(".visible-checkbox-" + layerid + " .checkbox", this.domNode);
            if (checkbox.length > 0) {
                if (isOnOrOff) {
                    dojo.addClass(checkbox[0], "jimu-icon-checked");
                }
                else {
                    dojo.removeClass(checkbox[0], "checked jimu-icon-checked");
                    dojo.addClass(checkbox[0], "jimu-icon-checkbox");
                }
                layer.setVisibility(isOnOrOff);
            }
            if (!this.config.layerOptions[layerid].display) {
                if (layer) {

                    layer.setVisibility(isOnOrOff);


                }
            }
        },
        turnAllSameLevelLayers: function (layerInfo, isOnOrOff) {
            var layerOptions = {};
            var rootLayerInfo = layerInfo.getRootLayerInfo();
            rootLayerInfo.traversal(lang.hitch(this, function (subLayerInfo) {
                if (subLayerInfo.parentLayerInfo &&
                    subLayerInfo.parentLayerInfo.id === layerInfo.parentLayerInfo.id &&
                    !this.isLayerHiddenInWidget(subLayerInfo)) {
                    layerOptions[subLayerInfo.id] = { visible: isOnOrOff };
                } else {
                    layerOptions[subLayerInfo.id] = { visible: subLayerInfo.isVisible() };
                }
            }));
            rootLayerInfo.resetLayerObjectVisibility(layerOptions);
        },
        foldOrUnfoldAllRootLayers: function (isFold) {
            var layerInfoArray = array.filter(this.operLayerInfos.getLayerInfoArray(),
                function (layerInfo) {
                    return !this.isLayerHiddenInWidget(layerInfo);
                }, this);
            this._foldOrUnfoldLayers(layerInfoArray, isFold);
        },
        foldOrUnfoldSameLevelLayers: function (layerInfo, isFold) {
            var layerInfoArray;
            if (layerInfo.parentLayerInfo) {
                layerInfoArray = array.filter(layerInfo.parentLayerInfo.getSubLayers(),
                    function (layerInfo) {
                        return !this.isLayerHiddenInWidget(layerInfo);
                    }, this);
                this._foldOrUnfoldLayers(layerInfoArray, isFold);
            }
        },
        foldOrUnfoldAllLayers: function (isFold) {
            this.eXpanAndCollapseFalg = true;
            var layerInfoArray = [];
            var rootLayerInfoArray = [];
            this.operationsDropMenuLoading.show();
            this.operLayerInfos.traversal(lang.hitch(this, function (layerInfo) {
                if (!this.isLayerHiddenInWidget(layerInfo)) {
                    if (layerInfo.isRootLayer()) {
                        rootLayerInfoArray.push(layerInfo);
                    } else {
                        layerInfoArray.push(layerInfo);
                    }
                }
            }));
            layerInfoArray = rootLayerInfoArray.concat(layerInfoArray);
            var i = 0;
            var layerInfoArrayLength = layerInfoArray.length;
            var steps = 50;
            setTimeout(lang.hitch(this, function () {
                if (i < layerInfoArrayLength) {
                    var candidateLayerInfoArray = layerInfoArray.slice(i, i + steps);
                    this._foldOrUnfoldLayers(candidateLayerInfoArray, isFold);
                    i = i + steps;
                    setTimeout(lang.hitch(this, arguments.callee), 60); // jshint ignore:line
                } else {
                    this.operationsDropMenuLoading.hide();
                }
            }), 60);
            this.ExpandFolders();
        },
        collapseLayers: function (isFold) {   // method for collapsing layers
            var layerInfoArray = [];
            var rootLayerInfoArray = [];
            this.operationsDropMenuLoading.show();
            this.operLayerInfos.traversal(lang.hitch(this, function (layerInfo) {
                if (!this.isLayerHiddenInWidget(layerInfo)) {
                    if (layerInfo.isRootLayer()) {
                        rootLayerInfoArray.push(layerInfo);
                    } else {
                        layerInfoArray.push(layerInfo);
                    }
                }
            }));
            layerInfoArray = rootLayerInfoArray.concat(layerInfoArray);
            var i = 0;
            var layerInfoArrayLength = layerInfoArray.length;
            var steps = 50;
            setTimeout(lang.hitch(this, function () {
                if (i < layerInfoArrayLength) {
                    var candidateLayerInfoArray = layerInfoArray.slice(i, i + steps);
                    this._foldOrUnfoldLayers(candidateLayerInfoArray, isFold);
                    i = i + steps;
                    setTimeout(lang.hitch(this, arguments.callee), 60); // jshint ignore:line
                } else {
                    this.operationsDropMenuLoading.hide();
                }
            }), 60);
            this.collapseFolders();
            this.eXpanAndCollapseFalg = false;
        },

        //method to replace special characters with asciivalues
        replaceSpecialCharacters: function (text) {
            //var format = /[ ~`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
            var string = "";
            //for (var i = 0; i < text.length; i++) {

            //    if (format.test(text[i])) {
            //        var charcode = text[i].charCodeAt(text[i]);
            //        string += charcode;
            //    }
            //    else {
            //        string += text[i];
            //    }
            //}

            //return string;

            var regex = /^[A-Za-z0-9 ]+$/;

            for (var i = 0; i < text.length; i++) {

                if (!regex.test(text[i])) {
                    var charcode = text[i].charCodeAt(text[i]);
                    string += charcode;
                }
                else {
                    string += text[i];
                }
            }
            return string;

            //var asciivalues = [
            //     { char: "!", value: "32e" },
            //     { char: "#", value: "35a" },
            //     { char: "@", value: "64at" },
            //     { char: "$", value: "36d" },
            //     { char: "%", value: "37p" },
            //     { char: "^", value: "94car" },
            //     { char: "&", value: "38am" },
            //     { char: "*", value: "42ast" },
            //     { char: "(", value: "40lep" },
            //     { char: ")", value: "41rep" },
            //     { char: "_", value: "95und" },
            //     { char: "+", value: "43pl" },
            //     { char: "=", value: "61eq" },
            //     { char: "{", value: "123lb" },
            //     { char: "}", value: "125rb" },
            //     { char: "|", value: "124vb" },
            //     { char: "\\", value: "92bk" },
            //     { char: "[", value: "91lb" },
            //     { char: "]", value: "93lb" },
            //     { char: ":", value: "58co" },
            //     { char: ";", value: "59sc" },
            //     { char: "'", value: "39ap" },
            //     { char: "\"", value: "34qm" },
            //     { char: "<", value: "60lt" },
            //     { char: ">", value: "62gt" },
            //     { char: ",", value: "44co" },
            //     { char: ".", value: "46pe" },
            //     { char: "/", value: "47sl" },
            //     { char: "?", value: "63qm" },
            //     { char: "~", value: "126tid" },
            //     { char: "`", value: "96gr" }

            //];

            //for (var i = 0; i < asciivalues.length; i++) {

            //    text = text.replace(new RegExp(escapeRegExp(asciivalues[i].char), 'g'), asciivalues[i].value);
            //    function escapeRegExp(string) {
            //        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            //    }
            //};
            //return text

        }
    });
});
