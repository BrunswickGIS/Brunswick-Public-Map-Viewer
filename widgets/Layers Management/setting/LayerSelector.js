
define([
    'dijit/_WidgetBase',
    'dojo/_base/declare',
    'jimu/dijit/Message',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-construct',
    'dojo/on',
    'dojo/query',
    'jimu/dijit/CheckBox',
    'dijit/_TemplatedMixin',
    'dojo/text!./LayerSelector.html',
    'dojo/dom-class',
    'dojo/dom-style',
    "dojo/dom-attr",
], function (_WidgetBase, declare, Message, lang, array, domConstruct, on, query,
    CheckBox, _TemplatedMixin, template,
    domClass, domStyle, domAttr) {

    return declare([_WidgetBase, _TemplatedMixin], {
        templateString: template,
        baseClass: 'layer-selector',
        _currentSelectedLayerRowNode: null,
        _displayStateStorage: null,
        CustLayerInfo: null,

        postMixInProperties: function () {
            this.inherited(arguments);
            this._displayStateStorage = {};
        },

        postCreate: function () {
            array.forEach(this.operLayerInfos.getLayerInfoArrayOfWebmap(), function (layerInfo) {
                this.drawListNode(layerInfo, 0, this.layerListTable, true);
            }, this);

            array.forEach(this.operLayerInfos.getTableInfoArray(), function (layerInfo) {
                this.drawListNode(layerInfo, 0, this.tableListTable, true);

            }, this);

        },

        drawListNode: function (layerInfo, level, toTableNode, isRootLayerORTableNode) {
            var nodeAndSubNode;
            if (layerInfo.newSubLayers.length === 0) {
                //addLayerNode
                nodeAndSubNode = this.addLayerNode(layerInfo, level, toTableNode, isRootLayerORTableNode);

                // don't add legend node, hide show legend image.
                domClass.add(query(".showLegend-div",
                    nodeAndSubNode.currentNode)[0],
                    'hidden');
                return;
            }
            //addLayerNode
            nodeAndSubNode = this.addLayerNode(layerInfo, level, toTableNode, isRootLayerORTableNode);

            array.forEach(layerInfo.newSubLayers, lang.hitch(this, function (level, subLayerInfo) {

                this.drawListNode(subLayerInfo, level + 1, nodeAndSubNode.subNode, false);
            }, level));
        },

        folderToLayerList: function () {  //method for moving single layer to layerlist view(default)
            var layerInfo = this.CustLayerInfo;
            if (layerInfo === null) {
                new Message({
                    message: this.nls.selectLayers
                });
                return;
            }
            if (this.config.layerOptions[layerInfo.id].folder != undefined) {
                if (this.config.layerOptions[layerInfo.id].folder.length === 0) {
                    new Message({
                        message: this.nls.movingnotpossible
                    });
                    return;
                };
            } else if (this.config.layerOptions[layerInfo.id].folder == undefined) {
                new Message({
                    message: this.nls.movingnotpossible
                });
                return;
            }

            if (this.config.layerOptions[layerInfo.id].folder === "WithoutFolder" || this.config.layerOptions[layerInfo.id].folder === "TabWithoutFolder") {// condition for moving layer/table without the folder to layerlist
                this.movelayertoList(layerInfo);
            }
            else {
                this.movetodefault1(layerInfo); // condition for moving layer/table with in the the folder to layerlist
            }
            this.CustLayerInfo = null;
        },
        MoveallNonFolderLayers: function (layerListbody) {   // method for moving layers without folders

            var OprLayer = this.operLayerInfos.getLayerInfoArrayOfWebmap();
            for (var i = 0; i < OprLayer.length; i++) {

                if (this.config.layerOptions[OprLayer[i].id].folder === "WithoutFolder") {
                    this.config.layerOptions[OprLayer[i].id].folder = "";
                    this.config.layerOptions[OprLayer[i].id].displayindex = null;
                    this.config.layerOptions[OprLayer[i].id].visible = true;
                    this.drawListNode(OprLayer[i], 0, this.layerListTable, true);
                }
                dojo.empty(layerListbody);
            }
        },
        MoveallNonFolderTables: function (layerListbody) {    // method for moving tables without folders

            var OprLayer = this.operLayerInfos.getTableInfoArray();
            for (var i = 0; i < OprLayer.length; i++) {

                if (this.config.layerOptions[OprLayer[i].id].folder === "TabWithoutFolder") {
                    this.config.layerOptions[OprLayer[i].id].folder = "";
                    this.config.layerOptions[OprLayer[i].id].displayindex = null;
                    this.config.layerOptions[OprLayer[i].id].visible = true;
                    this.drawListNode(OprLayer[i], 0, this.tableListTable, true);
                }
                dojo.empty(layerListbody);
            }
        },

        movelayertoList: function (layerInfo) { //method for moving layer/table without the folder to  default
            if (layerInfo.isTable) {  // for tables
                var list = document.getElementById("TableWithoutFolder");
                var layer = dojo.query("#TableWithoutFolder")[0].childNodes;
                for (var i = 0; i < layer.length; i++) {

                    if (layer[i].classList != undefined) {
                        if (layer[i].classList.length > 0) {
                            if (layerInfo.id.trim().toUpperCase() == layer[i].id.trim().toUpperCase()) {
                                list.removeChild(list.childNodes[i])
                                list.removeChild(list.childNodes[i])
                                this.config.layerOptions[layerInfo.id].folder = "";
                                this.config.layerOptions[layerInfo.id].visible = true;
                                this.drawListNode(layerInfo, 0, this.tableListTable, true);
                            }
                        }
                    }

                }
            }
            else {  // for layers
                var list = document.getElementById("WithoutFolder");
                var layer = dojo.query("#WithoutFolder")[0].childNodes;// dojo.query("#WithoutFolder > tr");
                for (var i = 0; i < layer.length; i++) {

                    if (layer[i].classList != undefined) {
                        if (layer[i].classList.length > 0 && layer[i].textContent.trim().length > 0) {
                            if (layerInfo.id.trim().toUpperCase() == layer[i].id.trim().toUpperCase()) {
                                list.removeChild(list.childNodes[i])
                                list.removeChild(list.childNodes[i])
                                this.config.layerOptions[layerInfo.id].folder = "";
                                this.config.layerOptions[layerInfo.id].visible = true;
                                this.drawListNode(layerInfo, 0, this.layerListTable, true);
                            }
                        }
                    }

                }

                var tablenode = query("#WithoutFolder");
                var OprLayer = this.operLayerInfos.getLayerInfoArrayOfWebmap();
                var displayIndex = 0;
                for (var l = 0; l < tablenode[0].childNodes.length; l++) {
                    for (var m = 0; m < OprLayer.length; m++) {
                        if (typeof (this.config.layerOptions[OprLayer[m].id]) != "undefined") {
                            if (this.config.layerOptions[OprLayer[m].id].folder === "WithoutFolder") {
                                if (tablenode[0].childNodes[l].classList.length > 0) {
                                    if (OprLayer[m].id.trim().toUpperCase() == tablenode[0].childNodes[l].id.trim().toUpperCase()) {
                                        this.config.layerOptions[OprLayer[m].id].displayindex = displayIndex;
                                        displayIndex++;
                                        //var index = tablenode[0].childNodes[l].rowIndex;
                                        //if (index === 0) {
                                        //    this.config.layerOptions[OprLayer[m].id].displayindex = index;
                                        //}
                                        //else {
                                        //    this.config.layerOptions[OprLayer[m].id].displayindex = index / 2;
                                        //}
                                    }
                                }
                            }
                        }
                    }
                }

            }

        },

        movetodefault1: function (layerInfo) { // method for moving layer/table with in the the folder to layerlist
            var cusrFolder = dojo.query("#customFolderDiv > table > tbody > tr");
            for (var i = 0; i < cusrFolder.length; i++) {
                if (dojo.query("#customFolderDiv > table > tbody > tr")[i].textContent.trim().length > 0) {
                    var foldername = dojo.query("#customFolderDiv > table > tbody > tr")[i].textContent.trim();
                    var folderid = dojo.query("#customFolderDiv > table > tbody > tr")[i].id;
                    if (typeof (this.config.layerOptions[layerInfo.id]) != "undefined") {
                        if (this.config.layerOptions[layerInfo.id].folder === foldername) {
                            this.config.layerOptions[layerInfo.id].folder = "";
                            if (this.config.layerOptions[layerInfo.id].visible != undefined) {
                                this.config.layerOptions[layerInfo.id].visible = true;
                            }
                            this.config.layerOptions[layerInfo.id].displayindex = null;
                            var tablenode = query("#" + folderid + "  + tr > td > table > tbody")
                            for (var k = 0; k < tablenode[0].children.length; k++) {
                                if (tablenode[0].children[k].textContent.trim().length > 0) {
                                    if (layerInfo.id.trim().toUpperCase() == tablenode[0].children[k].id.trim().toUpperCase()) {
                                        tablenode[0].deleteRow(k);
                                        tablenode[0].deleteRow(k);
                                        if (layerInfo.isTable) {
                                            this.drawListNode(layerInfo, 0, this.tableListTable, true);
                                        }
                                        else {
                                            this.drawListNode(layerInfo, 0, this.layerListTable, true);
                                        }
                                        break;
                                    }
                                }
                            }
                            var tablenode = query("#" + folderid + "  + tr > td > table > tbody");
                            var OprLayer = this.operLayerInfos.getLayerInfoArrayOfWebmap();
                            var displayIndex = 0;
                            for (var l = 0; l < tablenode[0].childNodes.length; l++) {
                                for (var m = 0; m < OprLayer.length; m++) {
                                    if (typeof (this.config.layerOptions[OprLayer[m].id]) != "undefined") {
                                        if (this.config.layerOptions[OprLayer[m].id].folder === foldername) {
                                            if (tablenode[0].childNodes[l].classList.length > 0) {
                                                if (OprLayer[m].id.trim().toUpperCase() == tablenode[0].childNodes[l].id.trim().toUpperCase()) {
                                                    this.config.layerOptions[OprLayer[m].id].displayindex = displayIndex;
                                                    displayIndex++;
                                                    //var index = tablenode[0].childNodes[l].rowIndex;
                                                    //if (index === 0) {
                                                    //    this.config.layerOptions[OprLayer[m].id].displayindex = index;
                                                    //}
                                                    //else {
                                                    //    this.config.layerOptions[OprLayer[m].id].displayindex = index / 2;
                                                    //}
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                };
            };
        },
        movetodefault: function (layerInfo) {
            var cusrFolder = dojo.query("#customFolderDiv > table > tbody > tr");

            for (var i = 0; i < cusrFolder.length; i++) {

                if (dojo.query("#customFolderDiv > table > tbody > tr")[i].textContent.trim().length > 0) {

                    var foldername = dojo.query("#customFolderDiv > table > tbody > tr")[i].textContent.trim();
                    var folderid = dojo.query("#customFolderDiv > table > tbody > tr")[i].id;

                    var OprLayer = this.operLayerInfos.getLayerInfoArrayOfWebmap();


                    if (this.config.layerOptions[layerInfo.id].folder === foldername) {
                        this.config.layerOptions[layerInfo.id].folder = "";
                        if (this.config.layerOptions[layerInfo.id].visible != undefined) {
                            this.config.layerOptions[layerInfo.id].visible = true;
                        }
                        this.config.layerOptions[layerInfo.id].displayindex = null;
                        var tablenode = query("#" + folderid + "  + tr > td > table > tbody")
                        for (var k = 0; k < tablenode[0].children.length; k++) {

                            if (tablenode[0].children[k].textContent.trim().length > 0) {
                                if (layerInfo.id.trim().toUpperCase() == tablenode[0].children[k].id.trim().toUpperCase()) {
                                    tablenode[0].deleteRow(k);
                                    tablenode[0].deleteRow(k);
                                    this.drawListNode(layerInfo, 0, this.layerListTable, true);
                                    break;
                                }
                            }
                        }
                    }
                };
            };
        },
        moveTabletodefault: function (layerInfo) {
            var cusrFolder = dojo.query("#customFolderDiv > table > tbody > tr");

            for (var i = 0; i < cusrFolder.length; i++) {

                if (dojo.query("#customFolderDiv > table > tbody > tr")[i].textContent.trim().length > 0) {

                    var foldername = dojo.query("#customFolderDiv > table > tbody > tr")[i].textContent.trim();
                    var folderid = dojo.query("#customFolderDiv > table > tbody > tr")[i].id;

                    var OprLayer = this.operLayerInfos.getTableInfoArray();


                    if (this.config.layerOptions[layerInfo.id].folder === foldername) {
                        this.config.layerOptions[layerInfo.id].folder = "";
                        if (this.config.layerOptions[layerInfo.id].visible != undefined) {
                            this.config.layerOptions[layerInfo.id].visible = true;
                        }
                        this.config.layerOptions[layerInfo.id].displayindex = null;
                        var tablenode = query("#" + folderid + "  + tr > td > table > tbody")
                        for (var k = 0; k < tablenode[0].children.length; k++) {

                            if (tablenode[0].children[k].textContent.trim().length > 0) {
                                if (layerInfo.id.trim().toUpperCase() == tablenode[0].children[k].id.trim().toUpperCase()) {
                                    tablenode[0].deleteRow(k);
                                    tablenode[0].deleteRow(k);
                                    this.drawListNode(layerInfo, 0, this.tableListTable, true);
                                    break;
                                }
                            }
                        }
                    }
                };
            };
        },
        LayerlistToFolder: function (toTableNode) { // method for moving singlr layer to folder
            var layerInfo = this.CustLayerInfo;
            if (layerInfo === null) {
                new Message({
                    message: this.nls.selectLayers
                });
                return;
            }

            var oprLayers = this.operLayerInfos.getLayerInfoArray();

            if (toTableNode.id === "WithoutFolder") {
                if (this.CustLayerInfo.isTable) {
                    this.drawListNode(layerInfo, 0, toTableNode.nextElementSibling, true);
                    if (typeof (this.config.layerOptions[layerInfo.id]) != "undefined")
                        this.config.layerOptions[layerInfo.id].folder = "TabWithoutFolder";
                    else
                        this.config.layerOptions[layerInfo.id] = { "display": this._displayStateStorage[layerInfo.id].displayCK.checked, "folder": "TabWithoutFolder", "displayindex": null, "visible": true };
                    for (var i = 0; i < this.tableListTable.children.length; i++) {
                        if (this.tableListTable.children[i].textContent.trim().length > 0) { // removing table nodes
                            if (layerInfo.id.trim().toUpperCase() == this.tableListTable.children[i].id.trim().toUpperCase()) {
                                document.getElementById("TableListtbody").deleteRow(i);
                                document.getElementById("TableListtbody").deleteRow(i);
                                break;
                            }
                        }
                    }
                    //for (var j = 0; j < dojo.query(toTableNode.nextElementSibling)[0].childNodes.length; j++) {
                    //    if (dojo.query(toTableNode.nextElementSibling)[0].childNodes[j].classList != undefined && dojo.query(toTableNode.nextElementSibling)[0].childNodes[j].classList.length > 0) {
                    //        dojo.addClass(dojo.query(toTableNode.nextElementSibling)[0].childNodes[j].childNodes[2], "displayClass")
                    //    }
                    //}
                }
                else {
                    this.drawListNode(layerInfo, 0, toTableNode, true);
                    if (typeof (this.config.layerOptions[layerInfo.id]) != "undefined") {
                        this.config.layerOptions[layerInfo.id].folder = "WithoutFolder";
                    }
                    for (var i = 0; i < this.layerListTable.children.length; i++) {
                        if (this.layerListTable.children[i].textContent.trim().length > 0) {  // removing layer list nodes
                            if (layerInfo.id.trim().toUpperCase() == this.layerListTable.children[i].id.trim().toUpperCase()) {
                                document.getElementById("LayerlistTbody").deleteRow(i);
                                document.getElementById("LayerlistTbody").deleteRow(i);
                                break;
                            }
                        }
                    }

                }

                if (typeof (this.config.layerOptions[layerInfo.id]) === "undefined" || this.config.layerOptions[layerInfo.id].folder != undefined) {
                    var nodes = dojo.query("#WithoutFolder")[0].childNodes;
                    if (nodes.length > 0) {
                        //for (var i = 0; i < nodes.length; i = i + 2) {
                        //    if (layerInfo.id.trim().toUpperCase() === nodes[i].id.trim().toUpperCase()) {
                        //        if (!layerInfo.isTable) {
                        //            var displayIndex = this.getMaxDisplayIndex(this.config.layerOptions[layerInfo.id].folder, layerInfo);
                        //            if (typeof (this.config.layerOptions[layerInfo.id]) === "undefined") {
                        //                this.config.layerOptions[layerInfo.id] = { "display": this._displayStateStorage[layerInfo.id].displayCK.checked, "folder": toTableNode.textContent, "displayindex": displayIndex, "visible": true };
                        //            }
                        //            else {
                        //                this.config.layerOptions[layerInfo.id].displayindex = displayIndex;
                        //            }
                        //        }
                        //    }
                        //}
                        var displayIndex = 0;
                        for (var i = 0; i < nodes.length; i = i + 2) {
                            if (dojo.hasClass(nodes[i], "csslayer")) {
                                if (typeof (this.config.layerOptions[nodes[i].id]) === "undefined") {
                                    this.config.layerOptions[nodes[i].id] = { "display": this._displayStateStorage[nodes[i].id].displayCK.checked, "folder": "WithoutFolder", "displayindex": displayIndex, "visible": true };

                                    for (var k = 0; k < oprLayers.length; k++) {
                                        if (oprLayers[k].id == nodes[i].id) {

                                            if (oprLayers[k].newSubLayers.length > 0) {

                                                var sublayers = oprLayers[k]._jsapiLayerInfos;

                                                for (var m = 0; m < sublayers.length; m++) {
                                                    this.config.layerOptions[nodes[i].id + "_" + m] = { "display": this._displayStateStorage[nodes[i].id + "_" + m].displayCK.checked };
                                                }
                                            }
                                        }
                                    }

                                }
                                else {
                                    this.config.layerOptions[nodes[i].id].displayindex = displayIndex;
                                }
                                displayIndex++;
                            }
                        }
                    }
                }

                layerInfo = this.CustLayerInfo = null;
                return;
            }
            if (layerInfo.isTable) {
                for (var i = 0; i < this.tableListTable.children.length; i++) {
                    if (this.tableListTable.children[i].textContent.trim().length > 0) {
                        if (layerInfo.id.trim().toUpperCase() == this.tableListTable.children[i].id.trim().toUpperCase()) {
                            if (typeof (this.config.layerOptions[layerInfo.id]) === "undefined") {
                                this.config.layerOptions[layerInfo.id] = { "display": this._displayStateStorage[layerInfo.id].displayCK.checked, "folder": toTableNode.textContent, "displayindex": null, "visible": true };
                            }
                            document.getElementById("TableListtbody").deleteRow(i);
                            document.getElementById("TableListtbody").deleteRow(i);
                            break;
                        }
                    }
                }
            }
            else {
                for (var i = 0; i < this.layerListTable.children.length; i++) {
                    if (this.layerListTable.children[i].textContent.trim().length > 0) {
                        if (layerInfo.id.trim().toUpperCase() == this.layerListTable.children[i].id.trim().toUpperCase()) {

                            document.getElementById("LayerlistTbody").deleteRow(i);
                            document.getElementById("LayerlistTbody").deleteRow(i);
                            break;
                        }
                    }
                }
            }


            var id = toTableNode.id + "id";
            var tbody = '<tbody class="fieldsBody" id="' + id + '"></tbody';
            var tablenode = query("#" + toTableNode.id + "  + tr > td > table")
            tablenode.append(tbody);
            this.drawListNode(layerInfo, 0, id, true);
            if (typeof (this.config.layerOptions[layerInfo.id]) === "undefined" || this.config.layerOptions[layerInfo.id].folder != undefined) {
                var nodes = dojo.query("#" + id)[0].childNodes;
                //var foldervisibility = this.config.customFolder.find(x => x.name === toTableNode.textContent.trim()).visible;
                if (nodes.length > 0) {
                    //for (var i = 0; i < nodes.length; i++) {
                    //    if (nodes[i].classList.length > 0) {
                    //        if (layerInfo.id.trim().toUpperCase() === nodes[i].id.trim().toUpperCase()) {
                    //            if (!layerInfo.isTable) {
                    //                var displayIndex = this.getMaxDisplayIndex(this.config.layerOptions[layerInfo.id].folder, layerInfo);
                    //                if (typeof (this.config.layerOptions[layerInfo.id]) === "undefined") {
                    //                    this.config.layerOptions[layerInfo.id] = { "display": this._displayStateStorage[layerInfo.id].displayCK.checked, "folder": toTableNode.textContent, "displayindex": displayIndex, "visible": true };
                    //                }
                    //                else {
                    //                    this.config.layerOptions[layerInfo.id].displayindex = displayIndex;
                    //                }

                    //            }
                    //        }
                    //    }
                    //}

                    var displayIndex = 0;
                    for (var i = 0; i < nodes.length; i = i + 2) {
                        if (dojo.hasClass(nodes[i], "csslayer")) {
                            if (typeof (this.config.layerOptions[nodes[i].id]) === "undefined") {
                                this.config.layerOptions[nodes[i].id] = { "display": this._displayStateStorage[nodes[i].id].displayCK.checked, "folder": toTableNode.textContent, "displayindex": displayIndex, "visible": true };
                                for (var k = 0; k < oprLayers.length; k++) {
                                    if (oprLayers[k].id == nodes[i].id) {

                                        if (oprLayers[k].newSubLayers.length > 0) {

                                            var sublayers = oprLayers[k]._jsapiLayerInfos;

                                            for (var m = 0; m < sublayers.length; m++) {
                                                this.config.layerOptions[nodes[i].id + "_" + m] = { "display": this._displayStateStorage[nodes[i].id + "_" + m].displayCK.checked };
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                this.config.layerOptions[nodes[i].id].displayindex = displayIndex;
                            }
                            displayIndex++;
                        }
                    }
                }
            }
            this.CustLayerInfo = null;
        },
        getMaxDisplayIndex: function (rootFolder, layerObj) {
            var maxIndexinFolder = 0;
            //var tempconfigarray = [];
            var layerInfosObj = this.operLayerInfos.getLayerInfoArray();
            //var tempArray = [];
            for (var i = 0; i < layerInfosObj.length; i++) {
                var layerInfo = this.config.layerOptions[layerInfosObj[i].id];
                if (typeof (layerInfo) === "undefined")
                    continue;
                var folderName = layerInfo.folder;
                if (folderName == rootFolder) {
                    //if (this.config.layerOptions[layerInfosObj[i].id].displayindex != null) {
                    //    if (this.config.layerOptions[layerInfosObj[i].id].displayindex >= 0) {
                    //        tempArray.push({
                    //            id: layerObj.id,
                    //            display: layerObj.display,
                    //            displayindex: this.config.layerOptions[layerInfosObj[i].id].displayindex,
                    //            folder: layerObj.folder,
                    //            visible: layerObj.visible
                    //        });
                    //    }
                    //}

                    if (parseInt(this.config.layerOptions[layerInfosObj[i].id].displayindex) > maxIndexinFolder)
                        maxIndexinFolder = parseInt(this.config.layerOptions[layerInfosObj[i].id].displayindex);
                }
            }

            //if (tempArray.length > 1) {
            //    tempArray.sort(this.dynamicSort("displayindex"));
            //    maxIndexinFolder = tempArray[tempArray.length - 1].displayindex + 1;
            //}
            //else if (tempArray.length == 1)
            //    maxIndexinFolder = tempArray[0].displayindex + 1;

            return maxIndexinFolder;


        },
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

        MovefolderLayersToLayerList: function (folderNode) {  //method for moving folder level layer's to layerlist view(default)

            var folderId = folderNode.id + "id";
            var foldername = folderNode.textContent.trim();
            var OprLayer = this.operLayerInfos.getLayerInfoArrayOfWebmap();

            if (dojo.query("#" + folderId)[0].childNodes.length === 0) {

                new Message({
                    message: this.nls.emptyfolder
                });
                return;
            }

            if (dojo.query("#" + folderId)[0].childNodes.length > 0) {


                for (var i = 0; i < OprLayer.length; i++) { // moving layer to default

                    if (this.config.layerOptions[OprLayer[i].id].folder != undefined) {
                        if (this.config.layerOptions[OprLayer[i].id].folder === foldername && this.config.layerOptions[OprLayer[i].id].folder.length > 0) {
                            this.config.layerOptions[OprLayer[i].id].folder = "";
                            if (this.config.layerOptions[OprLayer[i].id].visible != undefined) {
                                this.config.layerOptions[OprLayer[i].id].visible = true;
                            }
                            this.config.layerOptions[OprLayer[i].id].displayindex = null;
                            this.drawListNode(OprLayer[i], 0, this.layerListTable, true);
                        }
                    }
                };
                var OprLayer = this.operLayerInfos.getTableInfoArray();
                for (var k = 0; k < OprLayer.length; k++) {

                    if (this.config.layerOptions[OprLayer[k].id].folder != undefined) {  // moving table to default
                        if (this.config.layerOptions[OprLayer[k].id].folder === foldername && this.config.layerOptions[OprLayer[k].id].folder.length > 0) {
                            this.config.layerOptions[OprLayer[k].id].folder = "";
                            this.config.layerOptions[OprLayer[k].id].displayindex = null;
                            if (this.config.layerOptions[OprLayer[k].id].visible != undefined) {
                                this.config.layerOptions[OprLayer[k].id].visible = true;
                            }
                            this.drawListNode(OprLayer[k], 0, this.tableListTable, true);
                        }
                    }
                };

                dojo.query("#" + folderId).empty();
            }

        },



        MoveAllLayersToFolder: function (toTableNode) { // method for moving multiple layers/table into single folder
            var count = 0;
            var loopFlag = false;
            var id = toTableNode.id + "id";
            var tbody = '<tbody class="fieldsBody" id="' + id + '"></tbody';
            var tablenode = query("#" + toTableNode.id + "  + tr > td > table")
            tablenode.append(tbody);
            var oprlayers = this.operLayerInfos.getLayerInfoArrayOfWebmap();
            for (var j = 0; j < oprlayers.length; j++) {   // condition for moving layer into folder
                if (oprlayers[j].parentLayerInfo === null) {
                    if (typeof (this.config.layerOptions[oprlayers[j].id]) === "undefined" || this.config.layerOptions[oprlayers[j].id].folder === undefined
                        || this.config.layerOptions[oprlayers[j].id].folder.length === 0) {
                        count++;
                        for (var i = 0; i < this.layerListTable.children.length; i++) {

                            if (this.layerListTable.children[i].textContent.trim().length > 0) {
                                if (oprlayers[j].id.trim().toUpperCase() == this.layerListTable.children[i].id.trim().toUpperCase()) {
                                    //if layerid is not found in config.
                                    if (typeof (this.config.layerOptions[oprlayers[j].id]) === "undefined") {
                                        document.getElementById("LayerlistTbody").deleteRow(i);
                                        document.getElementById("LayerlistTbody").deleteRow(i);
                                        loopFlag = true;
                                        continue;
                                    }

                                    if (this.config.layerOptions[oprlayers[j].id].folder === undefined) {
                                        this.config.layerOptions[oprlayers[j].id].folder = "";
                                    }
                                    this.config.layerOptions[oprlayers[j].id].folder = toTableNode.textContent.trim()
                                    document.getElementById("LayerlistTbody").deleteRow(i);
                                    document.getElementById("LayerlistTbody").deleteRow(i);
                                    loopFlag = true;
                                    continue;
                                }
                            }
                        };

                        this.drawListNode(oprlayers[j], 0, id, true);
                    }

                }


            }
            var nodes = dojo.query("#" + toTableNode.id + "id")[0].childNodes;
            var displayIndex = 0;
            for (var a = 0; a < nodes.length; a = a + 2) {
                if (nodes[a].textContent.trim().length > 0) {
                    for (var i = 0; i < oprlayers.length; i++) {
                        if (oprlayers[i].id.trim().toUpperCase() === nodes[a].id.trim().toUpperCase()) {
                            if (typeof (this.config.layerOptions[oprlayers[i].id]) === "undefined") {
                                this.config.layerOptions[oprlayers[i].id] = { "display": oprlayers[i]._visible, "folder": toTableNode.textContent, "displayindex": displayIndex, "visible": true };

                                if (oprlayers[i].newSubLayers.length > 0) {

                                    var sublayers = oprlayers[i]._jsapiLayerInfos;

                                    for (var m = 0; m < sublayers.length; m++) {
                                        this.config.layerOptions[oprlayers[i].id + "_" + m] = { "display": this._displayStateStorage[oprlayers[i].id + "_" + m].displayCK.checked };
                                    }
                                }

                            }
                            else {
                                this.config.layerOptions[oprlayers[i].id].displayindex = displayIndex;
                            }
                            displayIndex++;

                            //if (nodes[a].rowIndex === 0) {
                            //    var displayIndex = nodes[a].rowIndex;
                            //    if (typeof (this.config.layerOptions[oprlayers[i].id]) === "undefined") {

                            //        this.config.layerOptions[oprlayers[i].id] = { "display": this._displayStateStorage[oprlayers[i].id].displayCK.checked, "folder": toTableNode.textContent, "displayindex": displayIndex, "visible": true };
                            //    }
                            //    else {
                            //        this.config.layerOptions[oprlayers[i].id].displayindex = displayIndex;
                            //    }
                            //}
                            //else {
                            //    var displayIndex = (nodes[a].rowIndex) / 2;
                            //    if (typeof (this.config.layerOptions[oprlayers[i].id]) === "undefined") {
                            //        this.config.layerOptions[oprlayers[i].id] = { "display": oprlayers[i]._visible, "folder": toTableNode.textContent, "displayindex": displayIndex, "visible": true };
                            //    }
                            //    else {
                            //        this.config.layerOptions[oprlayers[i].id].displayindex = displayIndex;
                            //    }
                            //}
                        }
                    }
                }
            }

            ///get table array info

            var oprlayers = this.operLayerInfos.getTableInfoArray();
            for (var k = 0; k < oprlayers.length; k++) {  // // condition for moving layer into folder
                if (oprlayers[k].parentLayerInfo === null) {
                    if (typeof (this.config.layerOptions[oprlayers[k].id]) === "undefined" || this.config.layerOptions[oprlayers[k].id].folder === undefined
                        || this.config.layerOptions[oprlayers[k].id].folder.length === 0) {
                        for (var i = 0; i < this.tableListTable.children.length; i++) {
                            if (this.tableListTable.children[i].textContent.trim().length > 0) {
                                if (oprlayers[k].id.trim().toUpperCase() == this.tableListTable.children[i].id.trim().toUpperCase()) {
                                    //if the layer is not in config object
                                    if (typeof (this.config.layerOptions[oprlayers[k].id]) === "undefined") {
                                        //update config object with the new layer
                                        this.config.layerOptions[oprlayers[k].id] = { "display": this._displayStateStorage[oprlayers[k].id].displayCK.checked, "folder": toTableNode.textContent, "displayindex": null, "visible": true };
                                        //remove the layer from left side listbox.
                                        document.getElementById("TableListtbody").deleteRow(i);
                                        document.getElementById("TableListtbody").deleteRow(i);
                                        loopFlag = true;
                                        break;
                                    }
                                    if (this.config.layerOptions[oprlayers[k].id].folder === undefined) {
                                        this.config.layerOptions[oprlayers[k].id].folder = "";
                                    }
                                    this.config.layerOptions[oprlayers[k].id].folder = toTableNode.textContent.trim()
                                    document.getElementById("TableListtbody").deleteRow(i);
                                    document.getElementById("TableListtbody").deleteRow(i);
                                    loopFlag = true;
                                    break;
                                }
                            }

                        };

                        this.drawListNode(oprlayers[k], 0, id, true);
                    }

                }
            }
            if (!loopFlag) {
                new Message({
                    message: this.nls.layerNotmoving
                });

            }
        },
        MoveAllLayersBelowFolder: function (layerListbody) { // Method for moving all layers below the folder
            var loopFlag = false;
            var count = 0;
            var oprlayers = this.operLayerInfos.getLayerInfoArrayOfWebmap();
            for (var j = 0; j < oprlayers.length; j++) {
                if (oprlayers[j].parentLayerInfo === null) {
                    if (typeof (this.config.layerOptions[oprlayers[j].id]) === "undefined" || this.config.layerOptions[oprlayers[j].id].folder === undefined
                        || this.config.layerOptions[oprlayers[j].id].folder.length === 0) {
                        count++
                        for (var i = 0; i < this.layerListTable.children.length; i++) {

                            if (this.layerListTable.children[i].textContent.trim().length > 0) {
                                if (oprlayers[j].id.trim().toUpperCase() === this.layerListTable.children[i].id.trim().toUpperCase()) {
                                    if (typeof (this.config.layerOptions[oprlayers[j].id]) != "undefined") {
                                        if (this.config.layerOptions[oprlayers[j].id].folder === undefined) {
                                            this.config.layerOptions[oprlayers[j].id].folder = "";
                                        }
                                        this.config.layerOptions[oprlayers[j].id].folder = "WithoutFolder";
                                    }

                                    document.getElementById("LayerlistTbody").deleteRow(i);
                                    document.getElementById("LayerlistTbody").deleteRow(i);
                                    loopFlag = true;
                                    break;
                                }
                            }
                        };

                        this.drawListNode(oprlayers[j], 0, layerListbody, true);
                    }

                }


            }
            var nodes = dojo.query(layerListbody)[0].childNodes;

            var oprlayers = this.operLayerInfos.getLayerInfoArrayOfWebmap();
            for (var a = 0; a < nodes.length; a = a + 2) {

                if (nodes[a].textContent.trim().length > 0) {
                    for (var i = 0; i < oprlayers.length; i++) {
                        if (oprlayers[i].id.trim().toUpperCase() === nodes[a].id.trim().toUpperCase()) {
                            if (nodes[a].rowIndex === 0) {
                                var displayIndex = nodes[a].rowIndex;
                                if (typeof (this.config.layerOptions[oprlayers[i].id]) === "undefined") {
                                    this.config.layerOptions[oprlayers[i].id] = { "display": this._displayStateStorage[oprlayers[i].id].displayCK.checked, "folder": "WithoutFolder", "displayindex": displayIndex, "visible": true };

                                    if (oprlayers[i].newSubLayers.length > 0) {

                                        var sublayers = oprlayers[i]._jsapiLayerInfos;

                                        for (var m = 0; m < sublayers.length; m++) {
                                            this.config.layerOptions[oprlayers[i].id + "_" + m] = { "display": this._displayStateStorage[oprlayers[i].id + "_" + m].displayCK.checked };
                                        }
                                    }

                                }
                                else {
                                    this.config.layerOptions[oprlayers[i].id].displayindex = displayIndex;
                                }

                            }
                            else {
                                var displayIndex = (nodes[a].rowIndex) / 2;
                                if (typeof (this.config.layerOptions[oprlayers[i].id]) === "undefined") {
                                    this.config.layerOptions[oprlayers[i].id] = { "display": this._displayStateStorage[oprlayers[i].id].displayCK.checked, "folder": "WithoutFolder", "displayindex": displayIndex, "visible": true };
                                    if (oprlayers[i].newSubLayers.length > 0) {

                                        var sublayers = oprlayers[i]._jsapiLayerInfos;

                                        for (var m = 0; m < sublayers.length; m++) {
                                            this.config.layerOptions[oprlayers[i].id + "_" + m] = { "display": this._displayStateStorage[oprlayers[i].id + "_" + m].displayCK.checked };
                                        }
                                    }
                                }
                                else {
                                    this.config.layerOptions[oprlayers[i].id].displayindex = displayIndex;
                                }

                            }
                        }
                    }
                }
            }
            if (!loopFlag) {
                new Message({
                    message: this.nls.layerNotmoving
                });

            }

        },
        MoveAllTablesBelowFolder: function (layerListbody) {// Method for moving all tables below the folder

            var oprlayers = this.operLayerInfos.getTableInfoArray();
            var count = 0;
            for (var j = 0; j < oprlayers.length; j++) {
                if (oprlayers[j].parentLayerInfo === null) {
                    if (typeof (this.config.layerOptions[oprlayers[j].id]) === "undefined" || this.config.layerOptions[oprlayers[j].id].folder === undefined
                        || this.config.layerOptions[oprlayers[j].id].folder.length === 0) {
                        count++
                        for (var i = 0; i < this.tableListTable.children.length; i++) {

                            if (this.tableListTable.children[i].textContent.trim().length > 0) {
                                if (oprlayers[j].id.trim().toUpperCase() === this.tableListTable.children[i].id.trim().toUpperCase()) {
                                    if (typeof (this.config.layerOptions[oprlayers[j].id]) != "undefined") {
                                        if (this.config.layerOptions[oprlayers[j].id].folder === undefined) {
                                            this.config.layerOptions[oprlayers[j].id].folder = "";
                                        }
                                        this.config.layerOptions[oprlayers[j].id].folder = "TabWithoutFolder";
                                        this.config.layerOptions[oprlayers[j].id].displayindex = null;
                                    }
                                    else {
                                        this.config.layerOptions[oprlayers[i].id] = { "display": this._displayStateStorage[oprlayers[i].id].displayCK.checked, "folder": "TabWithoutFolder", "displayindex": null, "visible": true };
                                    }

                                    document.getElementById("TableListtbody").deleteRow(i);
                                    document.getElementById("TableListtbody").deleteRow(i);
                                    loopFlag = true;
                                    // break;
                                }
                            }
                        };

                        this.drawListNode(oprlayers[j], 0, layerListbody, true);
                        // this.config.layerOptions[oprlayers[j].id].displayindex =null;
                        for (var k = 0; k < dojo.query(layerListbody)[0].childNodes.length; k++) {
                            if (dojo.query(layerListbody)[0].childNodes[k].classList != undefined && dojo.query(layerListbody)[0].childNodes[k].classList.length > 0) {
                                dojo.addClass(dojo.query(layerListbody)[0].childNodes[k].childNodes[2], "displayClass")
                            }
                        }

                    }

                }


            }

        },

        foldStructFormation1: function () {  // method for maintaing folder structure  with layers list
            var cusrFolder = dojo.query("#customFolderDiv > table > tbody > tr");
            for (var i = 0; i < cusrFolder.length; i++) {
                if (dojo.query("#customFolderDiv > table > tbody > tr")[i].textContent.trim().length > 0) { // condition for arranging layer/table inside folder

                    var foldername = dojo.query("#customFolderDiv > table > tbody > tr")[i].textContent.trim();
                    var folderid = dojo.query("#customFolderDiv > table > tbody > tr")[i].id;
                    var subnodeid = "#" + folderid + "id";

                    var OprLayer = this.operLayerInfos.getLayerInfoArrayOfWebmap();

                    for (var j = 0; j < OprLayer.length; j++) {  // layer arrangement
                        var layerInfo = this.config.layerOptions[OprLayer[j].id];
                        if (typeof (layerInfo) === "undefined")
                            continue;
                        if (layerInfo.folder != undefined) {

                            if (layerInfo.folder.length > 0) {
                                if (foldername === layerInfo.folder) {

                                    var id = folderid + "id";
                                    var tbody = '<tbody class="fieldsBody" id="' + id + '"></tbody';
                                    var tablenode = query("#" + folderid + "  + tr > td > table")
                                    if (tablenode[0].children.length === 0) {
                                        tablenode.append(tbody);
                                    }
                                    this.drawListNode(OprLayer[j], 0, id, true);

                                }
                                if (foldername === layerInfo.folder) {
                                    if (layerInfo.displayindex != null || layerInfo.displayindex != undefined) {



                                        for (var k = 0; k < dojo.query(subnodeid)[0].childNodes.length; k++) {

                                            if (dojo.query(subnodeid)[0].childNodes[k].classList.length > 0) {

                                                if (OprLayer[j].id.trim().toUpperCase() == dojo.query(subnodeid)[0].childNodes[k].id.trim().toUpperCase()) {

                                                    var node = dojo.query(subnodeid)[0].childNodes[k];
                                                    var subnode = dojo.query(subnodeid)[0].childNodes[k].nextSibling;
                                                    var parent = dojo.query(subnodeid)[0].childNodes[k].parentNode;
                                                    var oldChild = parent.removeChild(node);
                                                    var oldSubChild = parent.removeChild(subnode);
                                                    if (layerInfo.displayindex === 0) {
                                                        parent.insertBefore(oldChild, parent.childNodes[layerInfo.displayindex]);
                                                    }
                                                    else {

                                                    } parent.insertBefore(oldChild, parent.childNodes[2 * (layerInfo.displayindex)]);

                                                    parent.insertBefore(oldSubChild, oldChild.nextSibling);
                                                }
                                            }
                                        }

                                    }
                                }

                            }
                        }
                    }
                    var table = this.operLayerInfos.getTableInfoArray();

                    for (var m = 0; m < table.length; m++) {    // folder arrangement
                        if (typeof (this.config.layerOptions[table[m].id]) === "undefined")
                            continue;

                        if (this.config.layerOptions[table[m].id].folder != undefined && this.config.layerOptions[table[m].id].folder === foldername) {

                            if (this.config.layerOptions[table[m].id].folder.length > 0) {
                                for (var x = 0; x < this.tableListTable.children.length; x++) {

                                    if (this.tableListTable.children[x].textContent.trim().length > 0) {

                                        if (table[m].id.trim().toUpperCase() == this.tableListTable.children[x].id.trim().toUpperCase()) {
                                            document.getElementById("TableListtbody").deleteRow(x);
                                            document.getElementById("TableListtbody").deleteRow(x);
                                            break;
                                        }

                                    }
                                }
                                if (foldername === this.config.layerOptions[table[m].id].folder) {

                                    var id = folderid + "id";
                                    var tbody = '<tbody class="fieldsBody" id="' + id + '"></tbody';
                                    var tablenode = query("#" + folderid + "  + tr > td > table")
                                    if (tablenode[0].children.length === 0) {
                                        tablenode.append(tbody);
                                    }
                                    this.drawListNode(table[m], 0, id, true);


                                }

                            }

                        }

                    }

                }
            }

        },

        foldStructFormation: function (layerListbody) {  // method for maintaing folder structure  with layers list during initial load
            var cusrFolder = dojo.query("#customFolderDiv > table > tbody > tr");
            for (var i = 0; i < cusrFolder.length; i++) {
                if (dojo.query("#customFolderDiv > table > tbody > tr")[i].textContent.trim().length > 0) {
                    var foldername = dojo.query("#customFolderDiv > table > tbody > tr")[i].textContent.trim();
                    var folderid = dojo.query("#customFolderDiv > table > tbody > tr")[i].id;

                    // var OprLayer =  this.config.customFolder.sort(this.dynamicSort("displayindex"));
                    //  var OprLayer = this.operLayerInfos.getLayerInfoArrayOfWebmap();

                    var tempArray = [];
                    var layerInfosObj = this.operLayerInfos.getLayerInfoArrayOfWebmap();
                    for (var a = 0; a < layerInfosObj.length; a++) {
                        var layerInfo = this.config.layerOptions[layerInfosObj[a].id];
                        if (typeof (layerInfo) != "undefined") {
                            if (layerInfo.folder != "WithoutFolder") {
                                this.PushlayertoTemparray(tempArray, layerInfosObj[a].id, layerInfosObj[a], this.config.layerOptions[layerInfosObj[a].id].displayindex, this.config.layerOptions[layerInfosObj[a].id].folder)
                            }
                        }
                    }
                    tempArray.sort(this.dynamicSort("displayindex"));

                    var layer = tempArray

                    for (var j = 0; j < tempArray.length; j++) {
                        if (tempArray[j].foldername == foldername) {

                            for (var k = 0; k < this.layerListTable.children.length; k++) {
                                if (this.layerListTable.children[k].textContent.trim().length > 0) {
                                    if (tempArray[j].id.trim().toUpperCase() == this.layerListTable.children[k].id.trim().toUpperCase()) {
                                        document.getElementById("LayerlistTbody").deleteRow(k);
                                        document.getElementById("LayerlistTbody").deleteRow(k);
                                    }
                                }
                            }

                            var id = folderid + "id";
                            var tbody = '<tbody class="fieldsBody" id="' + id + '"></tbody';
                            var tablenode = query("#" + folderid + "  + tr > td > table")
                            if (tablenode[0].children.length === 0) {
                                tablenode.append(tbody);
                            }
                            this.drawListNode(tempArray[j].layerInfo, 0, id, true);


                        }
                    }

                    //for (var j = 0; j < OprLayer.length; j++) {  // layer arrangement
                    //    var layerInfo = this.config.layerOptions[OprLayer[j].id];
                    //    if (typeof (layerInfo) === "undefined")
                    //        continue;
                    //    if (layerInfo.folder != undefined) {
                    //        if (layerInfo.folder.length > 0) {
                    //            for (var k = 0; k < this.layerListTable.children.length; k++) {
                    //                if (this.layerListTable.children[k].textContent.trim().length > 0) {
                    //                    if (OprLayer[j].id.trim().toUpperCase() == this.layerListTable.children[k].id.trim().toUpperCase()) {
                    //                        document.getElementById("LayerlistTbody").deleteRow(k);
                    //                        document.getElementById("LayerlistTbody").deleteRow(k);
                    //                    }
                    //                }
                    //            }
                    //            if (foldername === layerInfo.folder) {

                    //                var id = folderid + "id";
                    //                var tbody = '<tbody class="fieldsBody" id="' + id + '"></tbody';
                    //                var tablenode = query("#" + folderid + "  + tr > td > table")
                    //                if (tablenode[0].children.length === 0) {
                    //                    tablenode.append(tbody);
                    //                }
                    //                this.drawListNode(OprLayer[j], 0, id, true);
                    //            }
                    //        }
                    //    }
                    //}

                    var table = this.operLayerInfos.getTableInfoArray();

                    for (var m = 0; m < table.length; m++) {  // folder arrangement
                        if (typeof (this.config.layerOptions[table[m].id]) === "undefined")
                            continue;
                        if (this.config.layerOptions[table[m].id].folder != undefined && this.config.layerOptions[table[m].id].folder === foldername) {
                            if (this.config.layerOptions[table[m].id].folder.length > 0) {
                                for (var x = 0; x < this.tableListTable.children.length; x++) {
                                    if (this.tableListTable.children[x].textContent.trim().length > 0) {
                                        if (table[m].id.trim().toUpperCase() == this.tableListTable.children[x].id.trim().toUpperCase()) {
                                            document.getElementById("TableListtbody").deleteRow(x);
                                            document.getElementById("TableListtbody").deleteRow(x);
                                            break;
                                        }
                                    }
                                }
                                if (foldername === this.config.layerOptions[table[m].id].folder) {
                                    var id = folderid + "id";
                                    var tbody = '<tbody class="fieldsBody" id="' + id + '"></tbody';
                                    var tablenode = query("#" + folderid + "  + tr > td > table")
                                    if (tablenode[0].children.length === 0) {
                                        tablenode.append(tbody);
                                    }
                                    this.drawListNode(table[m], 0, id, true);
                                }
                            }
                        }
                    }
                }
            }



        },
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
        PushlayertoTemparray: function (tempArray, layerid, layerInfo, layerDisplayindex, foldername) {
            tempArray.push({
                id: layerid,
                displayindex: layerDisplayindex,
                layerInfo: layerInfo,
                foldername: foldername

            });
        },
        LayersWithNoFolder: function (layerListbody) { // method for creating layer with out folder during initial load
            var tempArray = [];
            var layerInfosObj = this.operLayerInfos.getLayerInfoArrayOfWebmap();
            for (var i = 0; i < layerInfosObj.length; i++) {
                var layerInfo = this.config.layerOptions[layerInfosObj[i].id];
                if (typeof (layerInfo) != "undefined") {
                    if (layerInfo.folder == "WithoutFolder") {
                        this.PushlayertoTemparray(tempArray, layerInfosObj[i].id, layerInfosObj[i], this.config.layerOptions[layerInfosObj[i].id].displayindex, "WithoutFolder")
                    }
                }
            }
            tempArray.sort(this.dynamicSort("displayindex"));
            console.log(tempArray);
            var layers = tempArray;
            if (tempArray.length > 0) {
                for (var j = 0; j < tempArray.length; j++) {
                    this.drawListNode(tempArray[j].layerInfo, 0, layerListbody, true);
                    for (var k = 0; k < this.layerListTable.children.length; k++) {
                        if (this.layerListTable.children[k].textContent.trim().length > 0) {
                            if (tempArray[j].id.trim().toUpperCase() == this.layerListTable.children[k].id.trim().toUpperCase()) {
                                document.getElementById("LayerlistTbody").deleteRow(k);
                                document.getElementById("LayerlistTbody").deleteRow(k);

                            }

                        }
                    }
                }
            }
            //var OprLayer = this.operLayerInfos.getLayerInfoArrayOfWebmap();
            //for (var j = 0; j < OprLayer.length; j++) {
            //    if (typeof (this.config.layerOptions[OprLayer[j].id]) === "undefined")
            //        continue;

            //    if (this.config.layerOptions[OprLayer[j].id].folder === "WithoutFolder") {
            //        this.drawListNode(OprLayer[j], 0, layerListbody, true);
            //        for (var k = 0; k < this.layerListTable.children.length; k++) {
            //            if (this.layerListTable.children[k].textContent.trim().length > 0) {
            //                if (OprLayer[j].id.trim().toUpperCase() == this.layerListTable.children[k].id.trim().toUpperCase()) {
            //                    document.getElementById("LayerlistTbody").deleteRow(k);
            //                    document.getElementById("LayerlistTbody").deleteRow(k);

            //                }


            //            }
            //        }

            //    }
            //}
        },
        TableWithNoFolder: function (layerListbody) {  // method for creating table with out folder during initial load
            var OprLayer = this.operLayerInfos.getTableInfoArray()
            for (var j = 0; j < OprLayer.length; j++) {
                if (typeof (this.config.layerOptions[OprLayer[j].id]) === "undefined")
                    continue;

                if (this.config.layerOptions[OprLayer[j].id].folder === "TabWithoutFolder") {
                    this.drawListNode(OprLayer[j], 0, layerListbody, true);

                    for (var i = 0; i < this.tableListTable.children.length; i++) {

                        if (this.tableListTable.children[i].textContent.trim().length > 0) {

                            if (OprLayer[j].id.trim().toUpperCase() == this.tableListTable.children[i].id.trim().toUpperCase()) {
                                document.getElementById("TableListtbody").deleteRow(i);
                                document.getElementById("TableListtbody").deleteRow(i);
                                break;
                            }

                        }
                    }
                }
            }
            for (var j = 0; j < dojo.query("#TableWithoutFolder")[0].childNodes.length; j++) {
                if (dojo.query("#TableWithoutFolder")[0].childNodes[j].classList != undefined && dojo.query("#TableWithoutFolder")[0].childNodes[j].classList.length > 0) {
                    dojo.addClass(dojo.query("#TableWithoutFolder")[0].childNodes[j].childNodes[2], "displayClass")
                }
            }
        },
        addLayerNode: function (layerInfo, level, toTableNode, isRootObj) {

            var nodetype = "";
            if (isRootObj)
                nodetype = layerInfo.isTable ? " csstable " : " csslayer ";

            var layerTrNode = domConstruct.create('tr', {
                'class': 'jimu-widget-row layer-row ' + nodetype +
                    ( /*visible*/ false ? 'jimu-widget-row-selected' : ''),
                'layerTrNodeId': layerInfo.id,
                'id': layerInfo.id,
                'data-type': (layerInfo.isTable ? "table" : "layer")

            }, toTableNode),
                layerTdNode, ckSelectDiv, ckSelect, imageTableDiv,
                popupMenuNode, i, imageShowLegendDiv, popupMenu, divLabel;


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
                'class': 'showLegend-div jimu-float-leading '
            }, layerTdNode);


            ckSelectDiv = domConstruct.create('div', {
                'class': 'div-select jimu-float-leading'
            }, layerTdNode);
            // if config has not been configured, default value is 'true'.
            // if config has been configured, but new layer of webmap is ont in config file,
            //   default value is 'true'.
            var checkedValue = true;
            if (this.config.layerOptions && this.config.layerOptions[layerInfo.id] !== undefined) {
                checkedValue = this.config.layerOptions[layerInfo.id].display;
            }
            ckSelect = new CheckBox({
                checked: checkedValue,
                'class': "visible-checkbox-" + layerInfo.id
            });
            domConstruct.place(ckSelect.domNode, ckSelectDiv);
            // set tdNode width
            domStyle.set(layerTdNode, 'width', level * 12 + 35 + 'px');

            var layerTitleTdNode = domConstruct.create('td', {
                'class': 'col col2'
            }, layerTrNode);

            imageTableDiv = domConstruct.create('div', {
                'class': 'noLegend-div jimu-float-leading'
            }, layerTitleTdNode/*layerTdNode*/);
            if (layerInfo.isTable) {
                domClass.add(imageTableDiv, 'table');
            }
            if (layerInfo.isTable) {
                domStyle.set(imageTableDiv, 'display', 'block');
            }
            var featureLayerClass = "";
            if (layerInfo.originOperLayer.layerType == "ArcGISFeatureLayer")
                featureLayerClass = "featureLayerClass";
            var layerTitleDivIdClass = 'layer-title-div-' + layerInfo.id;
            var layerTitle = layerInfo.title;
            if (layerTitle.length > 30)
                layerTitle = layerTitle.substr(0, 29) + "...";

            divLabel = domConstruct.create('div', {
                'innerHTML': layerTitle,
                'class': layerTitleDivIdClass + ' div-content jimu-float-leading ' + featureLayerClass,
                'title': layerInfo.title
            }, layerTitleTdNode);
            Arrowup = domConstruct.create('td', {
                'class': 'col col3'
            }, layerTrNode);

            uparrow = domConstruct.create('span', {   // adding uparrow icon to node
                title: 'Move up',
                'class': "row-up-div jimu-icon jimu-icon-up",
                'style': (layerInfo.isTable ? 'visibility: hidden' : '')
            }, Arrowup);

            downarrow = domConstruct.create('span', {  // adding downarrow icon to node 
                title: 'Move down',
                'class': "row-down-div jimu-icon jimu-icon-down",
                'style': (layerInfo.isTable ? 'visibility: hidden' : '')
            }, Arrowup);

            layerDspTogg = domConstruct.create("span", {  // adding eye icon to node 
                "class": "showLayer",
                "title": "visible",
                'style': (layerInfo.isTable ? 'visibility: hidden' : '')
            }, Arrowup);
            //add a tr node to toTableNode.
            var trNode = domConstruct.create('tr', {
                'class': '',
                'layerContentTrNodeId': layerInfo.id
            }, toTableNode);

            var tdNode = domConstruct.create('td', {
                'class': '',
                'colspan': '3'
            }, trNode);

            var tableNode = domConstruct.create('table', {
                'class': 'layer-sub-node'
            }, tdNode);
            dojo.query("#TableListtbody tr  .col3").addClass("displayClass"); // hiding eye icon for tables
            dojo.query("#TableListtbody tr  .col4").addClass("displayClass");
            dojo.query("#TableListtbody tr  .col5").addClass("displayClass")
            this.initDisplayStateStorage(layerInfo, ckSelect, divLabel);

            //bind event

            this.own(on(layerTitleTdNode,
                'click',
                lang.hitch(this,
                    this._onRowTrClick,
                    layerInfo,
                    imageShowLegendDiv,
                    layerTrNode,
                    tableNode)));


            this.own(on(imageShowLegendDiv,
                'click',
                lang.hitch(this,
                    this._onRowNodeClick,
                    layerInfo,
                    imageShowLegendDiv,
                    layerTrNode,
                    tableNode)));

            this.own(on(layerTrNode,
                'mouseover',
                lang.hitch(this, this._onLayerNodeMouseover, layerTrNode, popupMenu)));
            this.own(on(layerTrNode,
                'mouseout',
                lang.hitch(this, this._onLayerNodeMouseout, layerTrNode, popupMenu)));
            this.own(on(ckSelect.domNode, 'click', lang.hitch(this,
                this._onCkSelectNodeClick,
                layerInfo,
                ckSelect)));


            this.own(on(layerDspTogg, 'click', lang.hitch(this,
                this._onVisbleIconClick,
                layerInfo,
                layerDspTogg,
                layerTrNode,
                tableNode)));


            this.own(on(uparrow, 'click', lang.hitch(this,
                this._onupArrowClick,
                layerInfo,
                uparrow,
                layerTrNode,
                tableNode)));

            this.own(on(downarrow, 'click', lang.hitch(this,
                this._ondownArrowClick,
                layerInfo,
                downarrow,
                layerTrNode,
                tableNode)));



            /*
            this.own(on(popupMenuNode, 'click', lang.hitch(this,
              this._onPopupMenuClick,
              layerInfo,
              popupMenu,
              layerTrNode)));
            */
            if (this.config.layerOptions != undefined) {
                if (typeof (this.config.layerOptions[layerInfo.id]) != "undefined") {
                    if (this.config.layerOptions[layerInfo.id].visible != undefined) {

                        if (this.config.layerOptions[layerInfo.id].visible === false) {
                            dojo.addClass(layerTrNode, "disbledClass");
                            dojo.addClass(layerTrNode.childNodes[2].childNodes[2], "hideLayer");
                        }
                    }
                }

            }


            return {
                currentNode: layerTrNode,
                subNode: tableNode
            };
        },


        // return current state:
        //   true:  fold,
        //   false: unfold
        _fold: function (layerInfo, imageShowLegendDiv, subNode) {
            /*jshint unused: false*/
            var state;
            if (domStyle.get(subNode, 'display') === 'none') {
                //unfold
                domStyle.set(subNode, 'display', 'table');
                domClass.add(imageShowLegendDiv, 'unfold');
                state = false; //unfold
            } else {
                //fold
                domStyle.set(subNode, 'display', 'none');
                var src;
                domClass.remove(imageShowLegendDiv, 'unfold');
                state = true; // fold
            }
            return state;
        },

        _onCkSelectNodeClick: function (layerInfo, ckSelect, evt) {

            this.config.layerOptions[layerInfo.id].display = ckSelect.checked;
            layerInfo.traversal(lang.hitch(this, function (subLayerInfo) {
                this._grayedLayerLabel(subLayerInfo);
            }));
            evt.stopPropagation();
        },

        _onLayerNodeMouseover: function (layerTrNode, popupMenu) {
            domClass.add(layerTrNode, "layer-row-mouseover");
            if (popupMenu) {
                //domClass.add(popupMenuNode, "layers-list-popupMenu-div-selected");
                domClass.add(popupMenu.btnNode, "jimu-icon-btn-selected");
            }
        },

        _onLayerNodeMouseout: function (layerTrNode, popupMenu) {
            domClass.remove(layerTrNode, "layer-row-mouseover");
            if (popupMenu) {
                //domClass.remove(popupMenuNode, "layers-list-popupMenu-div-selected");
                domClass.remove(popupMenu.btnNode, "jimu-icon-btn-selected");
            }
        },

        _onRowTrClick: function (layerInfo, imageShowLegendDiv, layerTrNode, subNode) { // method for layer row click              
            if (layerInfo.parentLayerInfo === null) {
                this.CustLayerInfo = layerInfo;
                this._changeSelectedLayerRow(layerTrNode);

                localStorage.setItem("layerTrnode", layerTrNode.textContent.trim());
                localStorage.setItem("layerInfo", layerInfo.id);
            }
        },
        _onRowNodeClick: function (layerInfo, imageShowLegendDiv, layerTrNode, subNode) {   //method for layer node click
            this._fold(layerInfo, imageShowLegendDiv, subNode);
        },
        _ondownArrowClick: function (layerInfo, downarrow, layerTrNode, subNode) {   // mehtod for moving layers down inside the folder               

            if (this.config.layerOptions[layerInfo.id].folder != "WithoutFolder") {
                var node = layerTrNode;
                var parent = node.parentNode;
                if (node.nextSibling.nextSibling === null) {
                    return;
                }
                var prev = node.nextSibling.nextSibling.nextSibling;
                var oldChild = parent.removeChild(node);
                parent.insertBefore(oldChild, prev.nextSibling);
                var childparentNode = subNode.parentNode.parentNode;
                var oldSubChild = parent.removeChild(childparentNode);
                parent.insertBefore(oldSubChild, oldChild.nextSibling);
                var OprLayer = this.operLayerInfos.getLayerInfoArrayOfWebmap();
                var TableData = this.operLayerInfos.getTableInfoArray();
                var displayIndex = 0;
                for (var i = 0; i < dojo.query("#" + parent.id)[0].childNodes.length; i = i + 2) {
                    for (var j = 0; j < OprLayer.length; j++) {

                        if (OprLayer[j].id.trim().toUpperCase() == dojo.query("#" + parent.id)[0].childNodes[i].id.trim().toUpperCase()) {
                            this.config.layerOptions[OprLayer[j].id].displayindex = displayIndex;
                            displayIndex++;
                        }
                    }
                };

            }
            else {
                var node = layerTrNode;
                var parent = node.parentNode;
                if (node.nextSibling === null) {
                    return;
                }
                var prev = node.nextSibling.nextSibling.nextSibling;
                var oldChild = parent.removeChild(node);
                parent.insertBefore(oldChild, prev.nextSibling);
                var childparentNode = subNode.parentNode.parentNode;
                var oldSubChild = parent.removeChild(childparentNode);
                parent.insertBefore(oldSubChild, oldChild.nextSibling);
                var OprLayer = this.operLayerInfos.getLayerInfoArrayOfWebmap();
                var displayIndex = 0;
                for (var i = 0; i < parent.childNodes.length; i = i + 2) {
                    var OprLayer = this.operLayerInfos.getLayerInfoArrayOfWebmap();
                    for (var j = 0; j < OprLayer.length; j++) {
                        if (OprLayer[j].id.trim().toUpperCase() == parent.childNodes[i].id.trim().toUpperCase()) {
                            this.config.layerOptions[OprLayer[j].id].displayindex = displayIndex;
                            displayIndex++;

                        }
                    }

                }
            }

            this.handleUpandDownarrows();
        },
        _onupArrowClick: function (layerInfo, uparrow, layerTrNode, subNode) {   // mehtod for moving layers up inside the folder

            if (this.config.layerOptions[layerInfo.id].folder != "WithoutFolder") {
                var node = layerTrNode;
                var parent = node.parentNode;
                if (node.previousSibling === null) {
                    return;
                }
                var prev = node.previousSibling.previousSibling;
                var oldChild = parent.removeChild(node);
                parent.insertBefore(oldChild, prev);
                var childparentNode = subNode.parentNode.parentNode;
                var oldSubChild = parent.removeChild(childparentNode);
                parent.insertBefore(oldSubChild, oldChild.nextSibling);
                var OprLayer = this.operLayerInfos.getLayerInfoArrayOfWebmap();
                var TableData = this.operLayerInfos.getTableInfoArray();
                var displayIndex = 0;
                for (var i = 0; i < dojo.query("#" + parent.id)[0].childNodes.length; i = i + 2) {
                    for (var j = 0; j < OprLayer.length; j++) {
                        if (OprLayer[j].id.trim().toUpperCase() == dojo.query("#" + parent.id)[0].childNodes[i].id.trim().toUpperCase()) {
                            this.config.layerOptions[OprLayer[j].id].displayindex = displayIndex;
                            displayIndex++;
                        }
                    }
                };
            }
            else {
                var node = layerTrNode;
                var parent = node.parentNode;
                if (node.previousSibling === null) {
                    return;
                }
                var prev = node.previousSibling.previousSibling;
                var oldChild = parent.removeChild(node);
                parent.insertBefore(oldChild, prev);
                var childparentNode = subNode.parentNode.parentNode;
                var oldSubChild = parent.removeChild(childparentNode);
                parent.insertBefore(oldSubChild, oldChild.nextSibling);
                var OprLayer = this.operLayerInfos.getLayerInfoArrayOfWebmap();
                var displayIndex = 0;
                for (var i = 0; i < parent.childNodes.length; i = i + 2) {
                    for (var j = 0; j < OprLayer.length; j++) {
                        if (OprLayer[j].id.trim().toUpperCase() == parent.childNodes[i].id.trim().toUpperCase()) {
                            this.config.layerOptions[OprLayer[j].id].displayindex = displayIndex;
                            displayIndex++;
                        }
                    }
                }
            }
            this.handleUpandDownarrows();

        },
        handleUpandDownarrows: function () {     //method for handling up,down,visble icons


            var rootLayeristDiv = dojo.byId("customFolderDiv");
            var foldernodes = dojo.query(".folder-list-table .folder-list-body .folder-sub-node", rootLayeristDiv);
            foldernodes.forEach(function (node, index, nodelist) {
                var layertrnodes = dojo.query(".csslayer", node);

                for (var i = 0; i < layertrnodes.length; i++) {
                    dojo.query(".jimu-icon-up", layertrnodes[i]).forEach(function (up) {
                        dojo.removeClass(up, "Disabled_state");
                    });
                    dojo.query(".jimu-icon-down", layertrnodes[i]).forEach(function (down) {
                        dojo.removeClass(down, "Disabled_state");
                    });
                }

                if (layertrnodes.length > 0) {
                    {
                        //disable/hide FIRST UP icon
                        var FirstLayerinFolder = layertrnodes[0];
                        var upIcon = dojo.query(".jimu-icon-up", FirstLayerinFolder);
                        dojo.addClass(upIcon[0], "Disabled_state");
                        //disable/hide last down icon
                        var lastLayerinFolder = layertrnodes[layertrnodes.length - 1];
                        var downIcon = dojo.query(".jimu-icon-down", lastLayerinFolder);
                        dojo.addClass(downIcon[0], "Disabled_state");
                    }
                }
            });

            //outside folders
            var withoutFolderNodes = dojo.byId("WithoutFolder");
            var layertrnodes = dojo.query(".csslayer", withoutFolderNodes);

            if (layertrnodes.length > 0) {
                {
                    for (var i = 0; i < layertrnodes.length; i++) {
                        dojo.query(".jimu-icon-up", layertrnodes[i]).forEach(function (node) {
                            dojo.removeClass(node, "Disabled_state");
                        });
                        dojo.query(".jimu-icon-down", layertrnodes[i]).forEach(function (node) {
                            dojo.removeClass(node, "Disabled_state");
                        });
                    }
                    //disable/hide FIRST UP icon
                    var FirstLayerinFolder = layertrnodes[0];
                    var upIcon = dojo.query(".jimu-icon-up", FirstLayerinFolder);
                    dojo.addClass(upIcon[0], "Disabled_state");
                    //disable/hide last down icon
                    var lastLayerinFolder = layertrnodes[layertrnodes.length - 1];
                    var downIcon = dojo.query(".jimu-icon-down", lastLayerinFolder);
                    dojo.addClass(downIcon[0], "Disabled_state");
                }
            }

        },




        _onVisbleIconClick: function (layerInfo, layertoggle, layerTrNode, subNode) {  // method for layer inaccesability

            var loopflag = false;

            for (var i = 0; i < layerTrNode.classList.length; i++) {

                if (layerTrNode.classList[i] === "disbledClass") { // if already disabled
                    dojo.removeClass(layerTrNode, "disbledClass");
                    dojo.removeClass(layerTrNode.childNodes[2].childNodes[2], "hideLayer");
                    if (this.config.layerOptions[layerInfo.id].visible === undefined) {
                        this.config.layerOptions[layerInfo.id].visible = "";
                    }
                    this.config.layerOptions[layerInfo.id].visible = true;
                    loopflag = true;
                    break;
                }
            }
            if (!loopflag) {

                dojo.addClass(layerTrNode, "disbledClass");
                dojo.addClass(layerTrNode.childNodes[2].childNodes[2], "hideLayer");
                if (this.config.layerOptions[layerInfo.id].visible === undefined) {
                    this.config.layerOptions[layerInfo.id].visible = "";
                }
                this.config.layerOptions[layerInfo.id].visible = false;

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
            //   domStyle.set(query("#" + this.domNode.id + "  .layers-list-body .jimu-widget-row-selected"), 'background-color', '#efefef');
            this._currentSelectedLayerRowNode = layerTrNode;
        },

        initDisplayStateStorage: function (layerInfo, displayCK, labelDiv) {
            this._displayStateStorage[layerInfo.id] = {
                displayCK: displayCK,
                labelDiv: labelDiv
            };
            this._grayedLayerLabel(layerInfo);
        },

        _grayedLayerLabel: function (layerInfo) {
            var display = true;
            var currentLayerInfo = layerInfo;
            var labelDiv = this._displayStateStorage[layerInfo.id].labelDiv;
            if (labelDiv) {
                while (currentLayerInfo) {
                    display = display && this._displayStateStorage[currentLayerInfo.id].displayCK.checked;
                    if (!display) {
                        break;
                    }
                    currentLayerInfo = currentLayerInfo.parentLayerInfo;
                }
                if (!display) {
                    domClass.add(labelDiv, 'grayed-title');
                } else {
                    domClass.remove(labelDiv, 'grayed-title');
                }
            }
        },

        getLayerOptions: function () {
            var layerOptions = {};
            for (var child in this._displayStateStorage) {
                if (this._displayStateStorage.hasOwnProperty(child) &&
                    (typeof this._displayStateStorage[child] !== 'function')) {
                    layerOptions[child] = { display: this._displayStateStorage[child].displayCK.checked };
                }
            }
            return layerOptions;
        }

    });
});
