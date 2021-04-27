
define([
  'dijit/_WidgetBase',
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/html',
  'dojo/dom-construct',
  'dojo/on',
  'dojo/query',
  'jimu/dijit/CheckBox',
  'dijit/_TemplatedMixin',
  'dojo/text!./FolderListView.html',
  'dojo/dom-attr',
  'dojo/dom-class',
  'dojo/dom-style',
  'esri/geometry/Extent',
  'dojo/Evented'
], function (_WidgetBase, declare, lang, array, html, domConstruct, on, query,
  CheckBox, _TemplatedMixin, template,
  domAttr, domClass, domStyle, Extent, Evented) {

    return declare([_WidgetBase, _TemplatedMixin, Evented], {
        templateString: template,
        _currentSelectedFolderRowNode: null,
        _currentIndex: 1,
        nls: null,
        openArray: null,

        postMixInProperties: function () {
            this.inherited(arguments);
        },

        postCreate: function () {
            array.forEach(this.myfolderarray, function (folder) {
                this.drawListNode(folder, 0, this.foldersListTable, this.myfolderarray);
            }, this);
        },

        drawListNode: function (folder, level, toTableNode, parent) {
            var nodeAndSubNode;
            nodeAndSubNode = this.addfolderNode(folder, level, toTableNode, parent);

        },

        addfolderNode: function (folder, level, toTableNode, parent) {
            var folderTrNode = domConstruct.create('tr', {
                'id': 'folder_' + this._currentIndex,
                'class': 'jimu-widget-row folder-row ' +
                          ( /*visible*/ false ? 'jimu-widget-row-selected' : '')
            }, toTableNode), folderTdNode, iconDiv, iconNode, imageExpandNode, i, expandImageDiv, divLabel, folderActionsDiv,
                loadingImg, deleteImg, editImg, thumbImg;

            domAttr.set(folderTrNode, 'level', level);
            domAttr.set(folderTrNode, 'name', folder.name);

            folderTdNode = domConstruct.create('td', {
                'class': 'col col1'
            }, folderTrNode);

            for (i = 0; i < level; i++) {
                domConstruct.create('div', {
                    'class': 'begin-blank-div jimu-float-leading',
                    'innerHTML': ''
                }, folderTdNode);
            }

            if (folder.items) {
                expandImageDiv = domConstruct.create('div', {
                    'class': 'expand-div jimu-float-leading'
                }, folderTdNode);
                var expandImageSrc;

                expandImageSrc = this.CustomLayerlistWidget.folderUrl + 'images/v.png';


                imageExpandNode = domConstruct.create('img', {
                    'class': 'expand-image',
                    'src': expandImageSrc,
                    'alt': 'l'
                }, expandImageDiv);

                var imageName;

                imageName = 'images/folderopen.png';


                iconNode = domConstruct.create('img', {
                    'class': 'div-icon jimu-float-trailing folder-open',
                    'src': this.CustomLayerlistWidget.folderUrl + imageName,
                    'alt': 'l'
                }, expandImageDiv);

            }

            /* iconDiv = domConstruct.create('div', {
              'class': 'div-icon jimu-float-trailing'
            }, folderTdNode);
      
            var imageName;
            
                  imageName = 'images/folderopen.png';
           
      
            iconNode = domConstruct.create('img', {
              'src': this.CustomLayerlistWidget.folderUrl + imageName,
              'alt': 'l'
            }, iconDiv);
      
            domConstruct.place(iconNode, iconDiv); */

            // set tdNode width
            domStyle.set(folderTdNode, 'width', level * 12 + 35 + 'px');

            var FolderTitleTdNode = domConstruct.create('td', {
                'class': 'col col2'
            }, folderTrNode);
            var folderName = folder.name;
            //if (folderName.length > 30)
            //    folderName = folderName.substr(0,29)+"...";


            divLabel = domConstruct.create('div', {
                'innerHTML': folderName,
                'class': 'div-content jimu-float-leading',
                'style': 'line-height:1.2',
                'title': folder.name
            }, FolderTitleTdNode);

            this._currentIndex++;

            folderTdNode = domConstruct.create('td', {
                'class': 'col col3'
            }, folderTrNode);

            var tablenode = domConstruct.create('table', {
                'class': 'operations'
            }, folderTdNode);

            var tr1 = domConstruct.create('tr', {
                'class': ''
            }, tablenode);


            var td1 = domConstruct.create('td', {
                'class': 'operation-switch'
            }, tr1);

            folderActionsDiv = domConstruct.create("div", {
                "class": "actions-div"
            }, td1);
            //var td2 = domConstruct.create('td', {
            //    'class': ''
            //}, tr1);
            // toggle button node creation
            tooglebtn = domConstruct.create("label", {
                "class": "switch"
            }, folderActionsDiv);

            toggleinput = domConstruct.create("input", {
                checked: folder.status,
                "type": "checkbox",
                "id": folder.name,
                "class": "toggleBtn"
            }, tooglebtn);

            toggleslide = domConstruct.create("div", {
                "class": "slider round",
            }, tooglebtn);

            //onlabel = domConstruct.create("span", {
            //    "class": "on",
            //    "innerHTML":"ON"
            //}, toggleslide);

            //Offlabel = domConstruct.create("span", {
            //    "class": "off",
            //    "innerHTML": "OFF"
            //}, toggleslide);
            ///




            //if (!folder.items) {
            //  loadingImg = domConstruct.create("img", {
            //    "class": "folder-loading-img",
            //    "src": this.CustomLayerlistWidget.folderUrl + 'images/loading.gif',
            //    "height": 24,
            //    "width": 24
            //  }, folderActionsDiv);
            //  domStyle.set(loadingImg, 'display', 'none');
            //}

            editImg = domConstruct.create("img", {
                "class": "folder-edit-img",
                "src": this.CustomLayerlistWidget.folderUrl + 'images/edit_default.png',
                "title": this.nls.labelEdit
            }, folderActionsDiv);


            deleteImg = domConstruct.create("img", {
                "class": "folder-delete-img",
                "src": this.CustomLayerlistWidget.folderUrl + 'images/i_remove_info.png',
                "title": this.nls.labelDelete
            }, folderActionsDiv);

            //visibleImg = domConstruct.create("img", {
            //    "class": "folder-visible-img",
            //    "src": this.CustomLayerlistWidget.folderUrl + 'images/showLayers.png',
            //    "title": "visible"
            //}, folderActionsDiv);
            Uparrow = domConstruct.create("span", {    // adding uparrrow icon
                "class": "folder-uparrow-img row-up-div jimu-icon jimu-icon-up",
                "title": "Moveup"
            }, folderActionsDiv);

            Downarrow = domConstruct.create("span", {   // adding downarrow icon
                "class": "folder-downarrow-img row-down-div jimu-icon jimu-icon-down",
                "title": "Movedown"
            }, folderActionsDiv);





            var tableNode = null;
            if (folder.items) {
                //add a tr node to toTableNode.
                var trNode = domConstruct.create('tr', {
                    'class': ''
                }, toTableNode);

                var tdNode = domConstruct.create('td', {
                    'class': '',
                    'colspan': '3'
                }, trNode);

                tableNode = domConstruct.create('table', {
                    'class': 'folder-sub-node',
                    'cellpadding': '5',
                    'cellspacing': '0'

                }, tdNode);

                //if (folder.expanded) {
                //    domStyle.set(tableNode, 'display', 'table');
                //}
            };

            if (this.config.customFolder != undefined) {
                for (var j = 0; j < this.config.customFolder.length; j++) {

                    if (this.config.customFolder[j].visible === false) {
                        if (this.config.customFolder[j].name === folderTdNode.parentNode.textContent) {


                            dojo.addClass(folderTdNode.parentNode, "disbledClass");
                            dojo.addClass(folderTdNode.childNodes[1].childNodes[2], "hideLayer");

                        }
                    }

                }
            }
            //bind event
            this.own(on(FolderTitleTdNode,
                        'click',
                      lang.hitch(this,
                                 this._onRowTrClick,
                                 folder,
                                 imageExpandNode,
                                 folderTrNode,
                                 loadingImg,
                                 deleteImg,
                                 tableNode,
                                 parent)));

            if (deleteImg) {
                this.own(on(deleteImg,
                            'click',
                          lang.hitch(this,
                                     this._onRowDeleteClick,
                                     folder,
                                     folderTrNode,
                                     parent)));
            }

            if (thumbImg) {
                this.own(on(thumbImg,
                            'click',
                          lang.hitch(this,
                                     this._onRowThumbClick,
                                     folder,
                                     folderTrNode,
                                     parent)));
            }

            if (editImg) {
                this.own(on(editImg,
                            'click',
                          lang.hitch(this,
                                     this._onRowEditClick,
                                     folder,
                                     folderTrNode,
                                     parent)));
            }

            if (expandImageDiv) {
                this.own(on(expandImageDiv,
                            'click',
                          lang.hitch(this,
                                     this._onRowExpandClick,
                                     folder,
                                     imageExpandNode,
                                     folderTrNode,
                                     loadingImg,
                                     deleteImg,
                                     tableNode,
                                     parent)));
            }
            //this.own(on(visibleImg,
            //           'click',
            //         lang.hitch(this,
            //                    this._onVisibleIconClick,
            //                    folder,
            //                    folderTrNode,
            //                    parent)));
            this.own(on(Downarrow,
                      'click',
                    lang.hitch(this,
                               this._ondownarrowClick,
                               folder,
                               folderTrNode,
                               parent)));
            this.own(on(Uparrow,
                       'click',
                     lang.hitch(this,
                                this._onuparrowClick,
                                folder,
                                folderTrNode,
                                parent)));

            this.own(on(tooglebtn,
                 'change',
                     lang.hitch(this,
                                this.sliderchange,
                                folder,
                                folderTrNode,
                                parent)));


            this.own(on(folderTrNode,
                      'mouseover',
                      lang.hitch(this, this._onLayerNodeMouseover, folderTrNode)));
            this.own(on(folderTrNode,
                      'mouseout',
                      lang.hitch(this, this._onLayerNodeMouseout, folderTrNode)));

            return { currentNode: folderTrNode, subNode: tableNode };
        },

        //clearSelected: function() {
        //  if(this._currentSelectedFolderRowNode){
        //    domClass.remove(this._currentSelectedFolderRowNode, 'jimu-widget-row-selected');
        //  }
        //},

        // return current state:
        //   true:  fold,
        //   false: unfold
        _fold: function (folder, imageExpandNode, subNode) {
            /*jshint unused: false*/
            /* global isRTL*/
            var state;
            if (domStyle.get(subNode, 'display') === 'none') {
                //unfold
                domStyle.set(subNode, 'display', 'table');
                domAttr.set(imageExpandNode, 'src', this.CustomLayerlistWidget.folderUrl + 'images/v.png');
                state = false;//unfold
            } else {
                //fold
                domStyle.set(subNode, 'display', 'none');
                var src;
                if (isRTL) {
                    src = this.CustomLayerlistWidget.folderUrl + 'images/v_left.png';
                } else {
                    src = this.CustomLayerlistWidget.folderUrl + 'images/v_right.png';
                }
                domAttr.set(imageExpandNode, 'src', src);
                state = true;// fold
            }
            return state;
        },

        _onRowThumbClick: function (folder, folderTrNode, parent) {
            this.emit('onThumbClick', folderTrNode, folder);
        },

        _onLayerNodeMouseover: function (folderTrNode) {
            domClass.add(folderTrNode, "folder-row-mouseover");
        },

        _onLayerNodeMouseout: function (folderTrNode) {
            domClass.remove(folderTrNode, "folder-row-mouseover");
        },

        _onRowTrClick: function (folder, imageShowLegendNode, folderTrNode, loadingImg, deleteImg, subNode, parent) {
            if (loadingImg) {
                domStyle.set(loadingImg, 'display', 'none');
                if (deleteImg) {
                    domStyle.set(deleteImg, 'display', '');
                }
            }
            this._changeSelectedFolderRow(folderTrNode, loadingImg, deleteImg, folder, parent);
        },

        _onRowExpandClick: function (folder, imageShowLegendNode, folderTrNode, loadingImg, deleteImg, subNode, parent) {
            if (loadingImg) {
                domStyle.set(loadingImg, 'display', 'none');
                if (deleteImg) {
                    domStyle.set(deleteImg, 'display', '');
                }
            }

            this._fold(folder, imageShowLegendNode, subNode);

            this._changeSelectedFolderRow1(folderTrNode, loadingImg, deleteImg, folder, parent);



        },

        _onRowDeleteClick: function (folder, folderTrNode, parent) {
            if (this._currentSelectedFolderRowNode) {
                domClass.remove(this._currentSelectedFolderRowNode, 'jimu-widget-row-selected');
            }
            this.emit('onRowDeleteClick', folder, folderTrNode, parent);
        },

        _onRowEditClick: function (folder, folderTrNode, parent) {
            if (this._currentSelectedFolderRowNode) {
                domClass.remove(this._currentSelectedFolderRowNode, 'jimu-widget-row-selected');
            }
            domClass.add(folderTrNode, 'jimu-widget-row-selected');
            this._currentSelectedFolderRowNode = folderTrNode;
            this.emit('onRowEditClick', folder, folderTrNode, parent);
        },

        _changeSelectedFolderRow: function (folderTrNode, loadingImg, deleteImg, folder, parent) {
            if (this._currentSelectedFolderRowNode) {
                //  domClass.remove(this._currentSelectedFolderRowNode, 'jimu-widget-row-selected');
            }
            // domClass.add(folderTrNode, 'jimu-widget-row-selected');
            this._currentSelectedFolderRowNode = folderTrNode;
            this.emit('onRowClick', folderTrNode, folder, deleteImg, loadingImg, parent);
        },
        _changeSelectedFolderRow1: function (folderTrNode, loadingImg, deleteImg, folder, parent) {
            //if (this._currentSelectedFolderRowNode) {
            //    domClass.remove(this._currentSelectedFolderRowNode, 'jimu-widget-row-selected');
            //}
            //domClass.add(folderTrNode, 'jimu-widget-row-selected');
            this._currentSelectedFolderRowNode = folderTrNode;
            this.emit('onDivclick', folderTrNode, folder, deleteImg, loadingImg, parent);
        },
        _onVisibleIconClick: function (folder, folderTrNode, parent) {

            var loopflag = false;
            var oprlayers = this.operLayers.getLayerInfoArrayOfWebmap();
            for (var i = 0; i < folderTrNode.classList.length; i++) {

                if (folderTrNode.classList[i] === "disbledClass") {
                    dojo.removeClass(folderTrNode, "disbledClass");
                    dojo.removeClass(folderTrNode.childNodes[2].childNodes[1].childNodes[2], "hideLayer");

                    for (var j = 0; j < this.config.customFolder.length; j++) {

                        if (this.config.customFolder[j].name === folder.name) {

                            this.config.customFolder[j].visible = true;

                        }


                    }

                    loopflag = true;

                }
            }
            if (!loopflag) {

                dojo.addClass(folderTrNode, "disbledClass");
                dojo.addClass(folderTrNode.childNodes[2].childNodes[1].childNodes[2], "hideLayer");

                for (var j = 0; j < this.config.customFolder.length; j++) {

                    if (this.config.customFolder[j].name === folder.name) {

                        this.config.customFolder[j].visible = false;

                    }


                }

                //for (var j = 0; j < oprlayers.length; j++) {
                //    if (this.config.layerOptions[oprlayers[j].id].folder != undefined && this.config.layerOptions[oprlayers[j].id].folder.length > 0) {
                //        if (this.config.layerOptions[oprlayers[j].id].folder === bookmark.name) {
                //            if (this.config.layerOptions[oprlayers[j].id].visible === undefined) {
                //                this.config.layerOptions[oprlayers[j].id].visible = "";
                //            }
                //            this.config.layerOptions[oprlayers[j].id].visible = false;
                //            break;
                //        }
                //    }

                //}

            }
        },
        _ondownarrowClick: function (folder, folderTrNode, parent) { // method for moving folder down      
            var node = folderTrNode;
            var nextsibiling = folderTrNode.nextSibling;
            var parent = folderTrNode.parentNode;
            if (folderTrNode.nextSibling.nextSibling == null) {
                return;
            }
            var nextnode = folderTrNode.nextSibling.nextSibling.nextSibling;
            var oldChild = parent.removeChild(node);
            parent.insertBefore(oldChild, nextnode.nextSibling);
            var oldSubChild = parent.removeChild(nextsibiling);
            parent.insertBefore(oldSubChild, oldChild.nextSibling);
            this.arrangefolderIndex(parent);
            this.handlefolderArrows();
        },
        _onuparrowClick: function (folder, folderTrNode, parent) {  // method for moving folder up      
            var node = folderTrNode;
            var nextsibling = folderTrNode.nextSibling;
            var parent = folderTrNode.parentNode;
            if (node.previousSibling == null) {
                return;
            }
            var previousNode = node.previousSibling.previousSibling;
            var oldChild = parent.removeChild(node);
            parent.insertBefore(oldChild, previousNode);
            var oldSubChild = parent.removeChild(nextsibling);
            parent.insertBefore(oldSubChild, oldChild.nextSibling);
            this.arrangefolderIndex(parent);
            this.handlefolderArrows();
        },
        arrangefolderIndex: function (parent) {  // assigning displayindex values to folder after moving up/down
            var displayIndex = 0;
            var nodeList = dojo.query(parent)[0].childNodes;
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

        sliderchange: function (folder, folderTrNode, parent) {   // method for toggle button on/off

            var foldername = folder.name;
            var id = folderTrNode.id;
            var checked = dojo.query("#" + id + " .col3 .toggleBtn")[0].checked;

            var folderarray = this.config.customFolder;

            for (var i = 0; i < folderarray.length; i++) {

                if (folderarray[i].name == foldername) {

                    folderarray[i].status = checked;
                }

            }

        },
        handlefolderArrows: function (parent) {  // method handling folder up & down arrows

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
    });
});
