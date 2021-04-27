
define([
    'dojo/_base/declare',
    'jimu/BaseWidgetSetting',
    'jimu/LayerInfos/LayerInfos',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/_base/html',
    "dojo/on",
    './LayerSelector',
    'jimu/dijit/Message',
    'jimu/dijit/Popup',
    'dojo/keys',
    'dojo/_base/lang', 'dojo/_base/array',
    './FolderListView',
    "./EditFolder",
    'dojo/dom-construct',
    "dojo/dom", "dojo/query", 'dojo/dom-style',
    "dojo/dom-attr",
    'dijit/form/CheckBox',
    'jimu/dijit/CheckBox'
],
    function (
        declare,
        BaseWidgetSetting,
        LayerInfos, _WidgetsInTemplateMixin, html, on, LayerSelector,
        Message, Popup, keys, lang, array, FolderListView, EditFolder, domConstruct, dom, query, domStyle,domAttr

    ) {
        return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {

            baseClass: 'jimu-widget-layerList-setting',
            popup: null,
            popup2: null,
            FolderListView: null,
            getSelectedNode: null,
            operationallayers: null,
            folders: null,
            folderObj: null,
            startup: function () {
                this.inherited(arguments);
                this.setConfig(this.config);
                this.createLayerSelector();

            },
            postCreate: function () {
                this.inherited(arguments);
                if (this.config.customFolder === undefined || this.config.customFolder === null) {
                    this.config.customFolder = [];
                }
                this.folders = this.config.customFolder;                
                this.folderListview();
            },
            createLayerSelector: function () {
                this.operationallayers = LayerInfos.getInstanceSync();
                var layerInfosObj = LayerInfos.getInstanceSync();
                this.layerSelector = new LayerSelector({
                    operLayerInfos: layerInfosObj,
                    config: this.config,
                    nls: this.nls
                }).placeAt(this.layerSelectorDiv);

                if (this.config.layerOptions === undefined) {
                    this.config.layerOptions = this.layerSelector.getLayerOptions();
                }
                this.layerSelector.foldStructFormation();
                this.layerSelector.LayersWithNoFolder(this.layerListbody);
                this.layerSelector.TableWithNoFolder(this.tableListbody);
             //   this.layersrowArrangment();
            //    this.layerarrangementWithoutfolder();
                dojo.query(".layer-list-table .layers-list-body > tr >  .col3").addClass("displayClass")
                dojo.query(".layer-list-table .layers-list-body .layer-sub-node > tr > .col3").addClass("displayClass")
                dojo.query(" #WithoutFolder .layer-sub-node > tr > .col3").addClass("displayClass");
                this.handlingIcons();
               this.handleUpandDownarrows();
                this.handlefolderOrder();
                this.handlefolderArrows();
            },

            handlefolderOrder: function () { // arranging folder order

                if (typeof (this.config.customFolder) != "undefined" && this.config.customFolder.length > 0) {

                    var foldernodes = dojo.query(".folder-list-body")[1].childNodes;

                    var configfolder = this.config.customFolder;
                    for (var i = 0; i < configfolder.length; i++) {

                        for (var j = 0; j < foldernodes.length; j = j + 2) {
                            if (configfolder[i].name == foldernodes[j].textContent) {

                                //  if (configfolder[i].displayIndex != null) {


                                var node = foldernodes[j];
                                var nextsibling = foldernodes[j].nextSibling;
                                var parent = foldernodes[j].parentNode;
                                var oldChild = parent.removeChild(node);
                                var oldSubChild = parent.removeChild(nextsibling);
                                if (configfolder[i].displayIndex === 0) {
                                    parent.insertBefore(oldChild, parent.childNodes[configfolder[i].displayIndex]);
                                }
                                else {
                                    parent.insertBefore(oldChild, parent.childNodes[2 * (configfolder[i].displayIndex)]);
                                }
                                parent.insertBefore(oldSubChild, oldChild.nextSibling);
                            }
                            //}
                        }

                    }



                }


                // this.handlefolderarrow(parent);

            },


            // method for handling folder move up & move down arrows
            handlefolderArrows: function (parent) {

                var rootLayeristDiv = dojo.byId("customFolderDiv");
                var foldernodes = dojo.query(".folder-list-table .folder-list-body", rootLayeristDiv);
                foldernodes.forEach(function (node, index, nodelist) {
                    var layertrnodes = dojo.query(".folder-row", node);

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
            },


            handlingIcons: function () {   //handling icons
                dojo.query(".folder-list-table .folder-list-body .folder-sub-node .fieldsBody .layer-sub-node .col3").addClass("displayClass");
                dojo.query(".cust-list-table .layer-sub-node .col3").addClass("displayClass");
            },

            layerarrangementWithoutfolder: function () {   // method for layer arrangement with out folder

                var OprLayer = this.operationallayers.getLayerInfoArrayOfWebmap();
                for (var j = 0; j < OprLayer.length; j++) {
                    if (typeof (this.config.layerOptions[OprLayer[j].id]) === "undefined")
                        continue;
                    if (this.config.layerOptions[OprLayer[j].id].folder === "WithoutFolder") {
                        var Layerwithoutfolder = dojo.query("#WithoutFolder")[0].childNodes;
                        if (this.config.layerOptions[OprLayer[j].id].displayindex != null || typeof( this.config.layerOptions[OprLayer[j].id].displayindex) != 'undefined') {
                            for (var m = 0; m < Layerwithoutfolder.length; m=m+2) {
                                //if (Layerwithoutfolder[m].classList != undefined && Layerwithoutfolder[m].classList.length > 0) {
                                if (OprLayer[j].id.trim().toUpperCase()==Layerwithoutfolder[m].id.trim().toUpperCase()) {
                                        var node = Layerwithoutfolder[m];
                                        var subnode = Layerwithoutfolder[m].nextSibling;
                                        if (subnode === null || subnode === undefined) {
                                            return
                                        }
                                        var parent = Layerwithoutfolder[m].parentNode;
                                        var oldChild = parent.removeChild(node);
                                        var oldSubChild = parent.removeChild(subnode);
                                        if (this.config.layerOptions[OprLayer[j].id].displayindex === 0) {
                                            parent.insertBefore(oldChild, parent.childNodes[this.config.layerOptions[OprLayer[j].id].displayindex]);
                                        }
                                        else {
                                            parent.insertBefore(oldChild, parent.childNodes[2 * (this.config.layerOptions[OprLayer[j].id].displayindex)]);
                                        }
                                        parent.insertBefore(oldSubChild, oldChild.nextSibling);
                                    }
                                //}
                            }
                        }
                    }

                }
            },

            layersrowArrangment: function () {   // Method for arranging layer's inside folder
                var cusrFolder = dojo.query("#customFolderDiv > table > tbody > tr");
                if (cusrFolder.length > 0) {
                    for (var i = 0; i < cusrFolder.length; i++) {
                        if (dojo.query("#customFolderDiv > table > tbody > tr")[i].textContent.trim().length > 0) {
                            var foldername = dojo.query("#customFolderDiv > table > tbody > tr")[i].textContent.trim();
                            var folderid = dojo.query("#customFolderDiv > table > tbody > tr")[i].id + "id";
                            var OprLayer = this.operationallayers.getLayerInfoArrayOfWebmap();
                            for (var j = 0; j < OprLayer.length; j++) {
                                if (typeof (this.config.layerOptions[OprLayer[j].id]) === "undefined")
                                    continue;
                                if (this.config.layerOptions[OprLayer[j].id].folder === foldername) {
                                    if (this.config.layerOptions[OprLayer[j].id].displayindex != null || this.config.layerOptions[OprLayer[j].id].displayindex != undefined) {
                                        for (var k = 0; k < dojo.query("#" + folderid)[0].childNodes.length; k++) {
                                            if (dojo.query("#" + folderid)[0].childNodes[k].textContent.length > 0) {
                                                // if ((OprLayer[j].id.toUpperCase().indexOf(dojo.query("#" + folderid)[0].childNodes[k].textContent.toUpperCase()) || OprLayer[j].title.toUpperCase().indexOf(dojo.query("#" + folderid)[0].childNodes[k].textContent.toUpperCase())) > -1) {
                                                if (OprLayer[j].id.trim().toUpperCase() === dojo.query("#" + folderid)[0].childNodes[k].id.trim().toUpperCase()) {
                                                    if (dojo.query("#" + folderid)[0].childNodes[k].classList != undefined && dojo.query("#" + folderid)[0].childNodes[k].classList.length > 1) {
                                                        var node = dojo.query("#" + folderid)[0].childNodes[k];
                                                        var subnode = dojo.query("#" + folderid)[0].childNodes[k].nextSibling;
                                                        var parent = dojo.query("#" + folderid)[0].childNodes[k].parentNode;
                                                        var oldChild = parent.removeChild(node);
                                                        var oldSubChild = parent.removeChild(subnode);

                                                        if (this.config.layerOptions[OprLayer[j].id].displayindex === 0) {
                                                            parent.insertBefore(oldChild, parent.childNodes[this.config.layerOptions[OprLayer[j].id].displayindex]);
                                                        }
                                                        else {
                                                            parent.insertBefore(oldChild, parent.childNodes[2 * (this.config.layerOptions[OprLayer[j].id].displayindex)]);
                                                        }
                                                        parent.insertBefore(oldSubChild, oldChild.nextSibling);
                                                    }
                                                }
                                            }
                                        }
                                    }

                                }                              
                            }

                            var TableInfo = this.operationallayers.getTableInfoArray();
                            for (var m = 0; m < TableInfo.length; m++) {
                                if (typeof (this.config.layerOptions[TableInfo[m].id]) === "undefined")
                                    continue;
                                if (this.config.layerOptions[TableInfo[m].id].folder === foldername) {

                                    if (this.config.layerOptions[TableInfo[m].id].displayindex != null || this.config.layerOptions[TableInfo[m].id].displayindex != undefined) {

                                        for (var k = 0; k < dojo.query("#" + folderid)[0].childNodes.length; k++) {

                                            if (dojo.query("#" + folderid)[0].childNodes[k].textContent.length > 0) {

                                                if ((TableInfo[m].id.toUpperCase()==dojo.query("#" + folderid)[0].childNodes[k].id.toUpperCase())) {
                                                    var node = dojo.query("#" + folderid)[0].childNodes[k];
                                                    var subnode = dojo.query("#" + folderid)[0].childNodes[k].nextSibling;
                                                    var parent = dojo.query("#" + folderid)[0].childNodes[k].parentNode;
                                                    var oldChild = parent.removeChild(node);
                                                    var oldSubChild = parent.removeChild(subnode);

                                                    if (this.config.layerOptions[TableInfo[m].id].displayindex === 0) {

                                                        parent.insertBefore(oldChild, parent.childNodes[this.config.layerOptions[TableInfo[m].id].displayindex]);
                                                    }
                                                    else {
                                                        parent.insertBefore(oldChild, parent.childNodes[2 * (this.config.layerOptions[TableInfo[m].id].displayindex)]);
                                                    }
                                                    parent.insertBefore(oldSubChild, oldChild.nextSibling);
                                                }
                                            }
                                        }
                                    }

                                }

                            }
                        }
                    }
                }
            },
            handleUpandDownarrows: function (isrelationtable) {     //method for handling up,down,visble icons                
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
                            dojo.addClass(downIcon[0],"Disabled_state");                                                                                   
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

            _onFolderListViewRowClick: function (folderTrNode, folder, deleteImg, loadingImg, parent) {   //method for folder row click

                var node = folderTrNode;
                var hasclass = false;
                var classList = query("#" + node.id)[0].classList;
                for (var i = 0; i < classList.length; i++) {

                    if (classList[i] == "jimu-widget-row-selected") {
                        domStyle.set(query("#" + node.id)[0], 'background-color', 'white');
                        dojo.removeClass(query("#" + node.id)[0], "jimu-widget-row-selected");
                        this.getSelectedNode = null;
                        hasclass = true;

                    }

                }
                if (!hasclass) {

                    domStyle.set(query("#" + node.id)[0], 'background-color', '#c2eff7');
                    dojo.addClass(query("#" + node.id)[0], "jimu-widget-row-selected")
                    this.getSelectedNode = folderTrNode;

                }


                var folderRows = query(".folder-row");
                for (var i = 0; i < folderRows.length; i++) {
                    if (folderRows[i].id != node.id) {
                        domStyle.set(folderRows[i], 'background-color', 'white');
                        dojo.removeClass(query("#" + folderRows[i].id)[0], "jimu-widget-row-selected");
                        // this.getSelectedNode = null;
                    }

                }


            },
            _onFolderListViewClick: function (folderTrNode, folder, deleteImg, loadingImg, parent) {   //method for folder node click
                if (dojo.hasClass(dojo.query("#" + folderTrNode.id + "  .col1 .div-icon")[0], "CloseIcon1")) {                    
                    //  query("#" + folderTrNode.id + " .col1  .CloseIcon > img").removeClass("displayClass")
                    dojo.query("#" + folderTrNode.id + " .col1 .div-icon")[0].src = this.folderUrl + "/images/folderopen.png";
                    query("#" + folderTrNode.id + " .col1 .div-icon").removeClass("CloseIcon1");
                }
                else {
                    dojo.query("#" + folderTrNode.id + " .col1 .div-icon")[0].src = this.folderUrl + "images/folderclose.png";
                    //query("#" + folderTrNode.id + " .col1 .div-icon .folder-open").addClass("displayClass")
                    query("#" + folderTrNode.id + " .col1 .div-icon").addClass("CloseIcon1");
                    // query("#" + folderTrNode.id + " .col1  .CloseIcon > img").addClass("displayClass")
                }
            },

            setConfig: function (config) {
                // compitible with old verion, undefined means 'show title'
                var titleValue = config.showTitle === false ? false : true;
                this.showTitle.setValue(titleValue);
                this.showBasemap.setValue(config.showBasemap);
                this.showLegend.setValue(config.showLegend);
                this.expandAllLayersByDefault.setValue(config.expandAllLayersByDefault);
                if (config.contextMenu) {
                    this.zoomto.setValue(config.contextMenu.ZoomTo);
                    this.transparency.setValue(config.contextMenu.Transparency);
                    this.controlPopup.setValue(config.contextMenu.EnableOrDisablePopup);
                    this.moveupDown.setValue(config.contextMenu.MoveupOrMovedown);
                    this.table.setValue(config.contextMenu.OpenAttributeTable);
                    this.url.setValue(config.contextMenu.DescriptionOrShowItemDetailsOrDownload);
                    this.showVisibilityRange.setValue(config.contextMenu.SetVisibilityRange);
                }

            },

            folderListview: function () {    //method for folder creation & handling
                this.FolderListView = new FolderListView({
                    myfolderarray: this.config.customFolder,
                    operLayers: LayerInfos.getInstanceSync(),
                    CustomLayerlistWidget: this,
                    config: this.config,
                    map: this.map,
                    nls: this.nls
                }).placeAt(this.folderListbody);
                this.own(this.FolderListView.on(
                    'onRowClick',
                    lang.hitch(this, this._onFolderListViewRowClick)));

                this.own(this.FolderListView.on(
                    'onDivclick',
                    lang.hitch(this, this._onFolderListViewClick)));


                this.own(this.FolderListView.on(
                    'onRowDeleteClick',
                    lang.hitch(this, this._onDeleteBtnClicked)));
                this.own(this.FolderListView.on(
                    'onRowEditClick',
                    lang.hitch(this, this._onEditBtnClicked)));
            },
            _createFolder: function (fObject) {   // method for updating new folder

                domConstruct.empty(this.folderListbody);
                if (fObject != undefined) {
                    this.config.customFolder.push(fObject);
                }
                this.folderListview();
                return this.config;


            },

            _onDeleteBtnClicked: function (folder, folderTrNode, parent) {    //method for  deleting folder
                this.folderObj = folder;
                this.popup = new Popup({
                    titleLabel: this.nls.deleteLabel,
                    autoHeight: true,
                    content: this.nls.deleteContent,
                    container: 'main-page',
                    width: 400,
                    buttons: [{
                        label: this.nls.ok,
                        key: keys.ENTER,
                        onClick: lang.hitch(this, '_onfolderDeletePopupOk')
                    }, {
                        label: this.nls.cancel,
                        key: keys.ESCAPE,
                        onClose: lang.hitch(this, '_onFolderDeleteCancel')
                    }],
                })

            },
            _onfolderDeletePopupOk: function () {    // method for confirming to delete the folder
                this.popup.close();
                this.getSelectedNode = null;
                var folder = this.folderObj
                array.some(this.config.customFolder, function (b, i) {
                    if (b.name === folder.name) {
                        this.config.customFolder.splice(i, 1);
                        return true;
                    }
                }, this);

                localStorage.setItem("parent", JSON.stringify(this.config.customFolder)) // stores the folder array in local storage
                var OprLayer = this.operationallayers.getLayerInfoArrayOfWebmap();
                for (var i = 0; i < OprLayer.length; i++) {
                    if (typeof (this.config.layerOptions[OprLayer[i].id]) != "undefined") { 
                        if (this.config.layerOptions[OprLayer[i].id].folder != undefined && this.config.layerOptions[OprLayer[i].id].folder.length > 0) {
                            if (this.config.layerOptions[OprLayer[i].id].folder === folder.name) {
                                var layerinfo = OprLayer[i];
                                this.layerSelector.movetodefault(layerinfo)

                            }
                        }
                    }
                };
                var OprLayer = this.operationallayers.getTableInfoArray();
                for (var i = 0; i < OprLayer.length; i++) {
                    if (typeof (this.config.layerOptions[OprLayer[i].id]) != "undefined") { 
                    if (this.config.layerOptions[OprLayer[i].id].folder != undefined && this.config.layerOptions[OprLayer[i].id].folder.length > 0) {
                        if (this.config.layerOptions[OprLayer[i].id].folder === folder.name) {
                            var layerinfo = OprLayer[i];
                            this.layerSelector.moveTabletodefault(layerinfo)
                        }
                        }
                    }
                };

                this._arrangefoldersonDelete(folder);
                //  domConstruct.empty(this.folderListbody);
                //  this.folderListview();
                //  this.layerSelector.foldStructFormation1();
                this.handlingIcons();
                this.handleUpandDownarrows();
                dojo.query(".layer-list-table .layers-list-body > tr >  .col3").addClass("displayClass");
                dojo.query(".layer-list-table .layers-list-body .layer-sub-node > tr > .col3").addClass("displayClass");
                this.handlefolderOrder();
                this.handlefolderArrows();

            },

            _arrangefoldersonDelete: function (folder) {  // removing folder node & updating index values;

                var displayIndex = 0;

                var nodeList = dojo.query(".folder-list-body")[1].childNodes;

                for (var i = 0; i < nodeList.length; i = i + 2) {

                    if (nodeList[i].textContent.trim() == folder.name) {
                        dojo.query(".folder-list-body")[1].deleteRow(i);
                        dojo.query(".folder-list-body")[1].deleteRow(i);

                        break;
                    }
                }


                var folderarray = this.config.customFolder;

                for (var i = 0; i < nodeList.length; i = i + 2) {
                    var foldername = nodeList[i].textContent;
                    for (var j = 0; j < folderarray.length; j++) {
                        if (foldername == folderarray[j].name) {

                            folderarray[j].displayIndex = displayIndex;
                            displayIndex++;
                        }
                    }

                }
            },

            _onFolderDeleteCancel: function () {  // method for canceling  delete  folder
                this.popup.close();
            },


            _onBtnAddFolderClicked: function () {  // method for Adding a new  folder
                this.popupState2 = "ADD";
                localStorage.setItem("parent", JSON.stringify(this.config.customFolder))   // storing folder array in local storage
                // assigning displayindex values for folder

                if (typeof (this.config.customFolder) != "undefined" && this.config.customFolder.length > 0) {

                    var index = this.config.customFolder.length;
                }
                if (typeof (this.config.customFolder) != "undefined" && this.config.customFolder.length == 0) {

                    var index = 0;
                }
                this._openEditFolder(this.nls.addFolder, {
                    name: '',
                    displayIndex: index,
                    items: [],
                    status: true

                });
            },
            _onEditBtnClicked: function (folder, folderTrNode, parent) {   // method for folder name update/edit
                this.currentfolder = folder;
                this.currentfolderParent = parent;
                this._onEditFolderClick(folder, parent);
            },

            _onEditFolderClick: function (folder, parent) {
                this.popupState2 = "EDIT";
                localStorage.setItem("parent", JSON.stringify(parent))
                this._openEditFolder(this.nls.editFolder, folder, parent);
            },

            _openEditFolder: function (name, folder) {
                this.editFolder = new EditFolder({
                    nls: this.nls,
                    folderUrl: this.folderUrl,

                });
                this.editFolder.setConfig(folder || {});

                this.popup2 = new Popup({
                    titleLabel: name,
                    autoHeight: true,
                    content: this.editFolder,
                    container: 'main-page',
                    width: 440,
                    buttons: [
                        {
                            label: this.nls.ok,
                            key: keys.ENTER,
                            disable: true,
                            onClick: lang.hitch(this, '_onEditFolderOk')
                        }, {
                            label: this.nls.cancel,
                            key: keys.ESCAPE
                        }
                    ],
                    onClose: lang.hitch(this, '_onEditFolderClose')
                });
                html.addClass(this.popup2.domNode, 'widget-setting-popup');
                this.editFolder.startup();
                dojo.query(".input-table .warning").addClass("toogleclass");
            },
            _onEditFolderOk: function () {

                var folder = this.editFolder.getConfig();
                folder.name = folder.name.replace(/^\s+|\s+$/gm, '');
                this.popup2.close();
                var editResult = null;
                if (!folder.name) {
                    new Message({
                        message: this.nls.warning
                    });
                    return;
                }
                var bmArray = [];
                if (this.popupState2 === "ADD") {
                    if (!this.currentfolder) {
                        bmArray = this.folders;
                    }
                    useradded = true;
                    this.folderNameExists = false;
                    array.some(this.config.customFolder, lang.hitch(this, function (b, index) {
                        this._searchFolderForExistingName(b, index, folder.name);
                    }));
                    if (this.folderNameExists === false) {
                        this.getSelectedNode = null;
                        this.config.customFolder.push(folder);
                        this._createFolder();
                        editResult = true;
                        this.layerSelector.foldStructFormation1();
                        this.handlingIcons();
                        this.handleUpandDownarrows();
                        this.handlefolderOrder();
                        this.handlefolderArrows()
                        localStorage.setItem("parent", JSON.stringify(this.config.customFolder))
                    }
                    if (editResult) {
                        // this.popup2.close();
                        this.popupState2 = "";
                        editResult = false;
                    } else {
                        new Message({
                            message: this.nls.errorNameExist
                        });
                    }
                } else if (this.popupState2 === "EDIT") {
                    bmArray = this.currentfolderParent;
                    this.folderNameExists = false;
                    array.some(bmArray, function (b, i) {
                        // jshint unused:false
                        if (b.name === this.currentfolder.name) {
                            bmArray.splice(i, 1, folder);
                            return true;
                        }
                    }, this);

                    this.config.customFolder = bmArray;
                    localStorage.setItem("parent", JSON.stringify(bmArray))
                    var cusrFolder = dojo.query("#customFolderDiv > table > tbody > tr");

                    for (var i = 0; i < cusrFolder.length; i++) {

                        if (dojo.query("#customFolderDiv > table > tbody > tr")[i].textContent.trim().length > 0) {
                            if (this.currentfolder.name === dojo.query("#customFolderDiv > table > tbody > tr")[i].textContent.trim()) {
                                dojo.query("#customFolderDiv > table > tbody > tr")[i].childNodes[1].childNodes[0].textContent = folder.name;
                                break;
                            }
                        }
                    };
                    var OprLayer = this.operationallayers.getLayerInfoArrayOfWebmap();
                    for (var i = 0; i < OprLayer.length; i++) {
                        if (this.config.layerOptions[OprLayer[i].id].folder != undefined) {
                            if (this.config.layerOptions[OprLayer[i].id].folder.length > 0) {
                                if (this.config.layerOptions[OprLayer[i].id].folder === this.currentfolder.name) {
                                    this.config.layerOptions[OprLayer[i].id].folder = folder.name;
                                }
                            }
                        }
                    };
                    var TableInfo = this.operationallayers.getTableInfoArray();
                    for (var i = 0; i < TableInfo.length; i++) {
                        if (this.config.layerOptions[TableInfo[i].id].folder != undefined) {
                            if (this.config.layerOptions[TableInfo[i].id].folder.length > 0) {
                                if (this.config.layerOptions[TableInfo[i].id].folder === this.currentfolder.name) {
                                    this.config.layerOptions[TableInfo[i].id].folder = folder.name;
                                }
                            }
                        }
                    };

                    this.getSelectedNode = null
                    this._createFolder();
                   this.layerSelector.foldStructFormation1();
                    this.handlingIcons();
                   this.handleUpandDownarrows();
                    this.handlefolderOrder();
                    this.handlefolderArrows();
                    this.popupState2 = "";
                }


            },

            _onEditFolderClose: function () {
                this.editFolder = null;
                this.popup2 = null;
            },


            _MoveMultipleToFolder: function () {   // method for moving multiple layers into single folder
                if (this.getSelectedNode === null || this.getSelectedNode === undefined) {
                    this.layerSelector.MoveAllLayersBelowFolder(this.layerListbody);
                    this.layerSelector.MoveAllTablesBelowFolder(this.tableListbody);                    
                    dojo.query(" #WithoutFolder .layer-sub-node > tr > .col3").addClass("displayClass");                    
                }
                else {
                    this.layerSelector.MoveAllLayersToFolder(this.getSelectedNode);
                }

                this.handlingIcons();
                this.handleUpandDownarrows();
            },

            MoveToFolders: function () {  // method for moving single layer to folder
                var isrelationtable;
                var layerinfoObj = layerId= localStorage.getItem("layerInfo");
                if (layerinfoObj === "null") {
                    new Message({
                        message: this.nls.selectLayers
                    });
                    return;
                }
                if (typeof (this.config.layerOptions[layerinfoObj]) != "undefined") {
                    var folderName = this.config.layerOptions[layerinfoObj].folder;
                    if (folderName != "" && typeof (folderName) != "undefined") {
                        new Message({
                            message: this.nls.selectLayers
                        });
                        return;
                    }
                }

                if (this.getSelectedNode === null || this.getSelectedNode === undefined) { //if no folder selected moving layer/table under the folder                   
                    this.layerSelector.LayerlistToFolder(this.layerListbody);
                   this.handleUpandDownarrows();
                    this.handlingIcons();
                    localStorage.setItem("layerInfo", null)
                    return;
                }

                //if layerinfo is not found in config
                if (typeof (this.config.layerOptions[layerId]) != "undefined") {

                    if (this.config.layerOptions[layerId].folder === undefined || this.config.layerOptions[layerId].folder === null) {

                        this.config.layerOptions[layerId].folder = {};
                        this.config.layerOptions[layerId].folder = this.getSelectedNode.textContent.trim();
                    }
                    else {
                        this.config.layerOptions[layerId].folder = this.getSelectedNode.textContent.trim();
                    }
                }
                this.layerSelector.LayerlistToFolder(this.getSelectedNode);
                this.config = this.config;
               this.handleUpandDownarrows(isrelationtable);
                this.handlingIcons();
                localStorage.setItem("layerInfo", null);
                return this.config;
               
                //var layertrNode = localStorage.getItem("layerTrnode");
              
                //if (layertrNode != null) {

                //    //this.handlingIcons();
                //    for (var i = 0; i < this.operationallayers._layerInfos.length; i++) {
                //        var id = this.operationallayers._layerInfos[i].id;
                //        var title = this.operationallayers._layerInfos[i].title;
                //        isrelationtable = null;
                //        if ((id.indexOf(layertrNode) > -1) || (title.indexOf(layertrNode) > -1)) {
                //            var layerId = this.operationallayers._layerInfos[i].id;
                //            break;
                //        }
                //    }
                //    if (layerId === undefined) {
                //        for (var i = 0; i < this.operationallayers._tableInfos.length; i++) {
                //            var id = this.operationallayers._tableInfos[i].id;
                //            var title = this.operationallayers._tableInfos[i].title;
                //            isrelationtable = title;
                //            if ((id.indexOf(layertrNode) > -1) || (title.indexOf(layertrNode) > -1)) {
                //                var layerId = this.operationallayers._tableInfos[i].id;
                //                break;
                //            }                           
                //        }
                //    }                  
                  
                //}
            },
            MoveToLayerList: function () {  //method for moving single layer to layerlist view(default)
                this.layerSelector.folderToLayerList();
                dojo.query(".layer-list-table .layers-list-body > tr >  .col3").addClass("displayClass");
                dojo.query(".layer-list-table .layers-list-body .layer-sub-node > tr > .col3").addClass("displayClass");
               this.handleUpandDownarrows();
                localStorage.setItem("layerInfo", null);
            },

            MoveFolderlevellayersToLayerList: function () { //method for moving folder level layer's to layerlist view(default)
                if (this.getSelectedNode === null || this.getSelectedNode === undefined) {//if no folder selected moving layer/table to default
                    this.layerSelector.MoveallNonFolderLayers(this.layerListbody)
                    this.layerSelector.MoveallNonFolderTables(this.tableListbody)                  
                }
                else {
                    this.layerSelector.MovefolderLayersToLayerList(this.getSelectedNode);
                }

                dojo.query(".layer-list-table .layers-list-body > tr >  .col3").addClass("displayClass");
                dojo.query(".layer-list-table .layers-list-body .layer-sub-node > tr > .col3").addClass("displayClass");

            },

            _searchFolderForExistingName: function (folder, index, name) {   // method for finding duplicates in folder names
                if (folder.name.toUpperCase() === name.toUpperCase()) {
                    this.folderNameExists = true;
                    return true;
                }
            },
            getConfig: function () { // method for saving configuration changes to layerlist config
                if (dojo.query(".layer-list-table #LayerlistTbody ")[0].childNodes.length > 0
                    || dojo.query(".layer-list-table #TableListtbody ")[0].childNodes.length > 0) {  // condition for moving all layer/table to within/under the folder before saving
                    new Message({
                        message: this.nls.MoveAllcontentToright
                    });
                    return false;
                }
                this.config.showTitle = this.showTitle.getValue();
                this.config.showBasemap = this.showBasemap.getValue();
                this.config.showLegend = this.showLegend.getValue();
                this.config.expandAllLayersByDefault = this.expandAllLayersByDefault.getValue();
                if (!this.config.contextMenu) {
                    this.config.contextMenu = {};
                }
                this.config.contextMenu.ZoomTo = this.zoomto.getValue();
                this.config.contextMenu.Transparency = this.transparency.getValue();
                this.config.contextMenu.EnableOrDisablePopup = this.controlPopup.getValue();
                this.config.contextMenu.MoveupOrMovedown = this.moveupDown.getValue();
                this.config.contextMenu.OpenAttributeTable = this.table.getValue();
                this.config.contextMenu.DescriptionOrShowItemDetailsOrDownload = this.url.getValue();
				this.config.contextMenu.SetVisibilityRange = this.showVisibilityRange.getValue();				
				
                if (this.config.layerOptions === undefined) { // method for pushing layeroptions,during initial stage of widget
                    this.config.layerOptions = this.layerSelector.getLayerOptions();
                }
                return this.config;
            }
        });
    });
