define(
  ["dojo/_base/declare",
    "dojo/_base/lang",
    'dojo/_base/html',
    "dojo/on",
    "dijit/_WidgetsInTemplateMixin",
    "jimu/BaseWidgetSetting",
    'jimu/dijit/Message',
    "dojo/text!./EditFolder.html"
  ],
  function (
    declare,
    lang,
    html,
    on,
    _WidgetsInTemplateMixin,
    BaseWidgetSetting, Message,
    template
    ) {
      return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
          baseClass: "CustomLayerlist-Edit-Folder",
          templateString: template,
          editfolder: null,
          loopflag: true,

          postCreate: function () {
              this.inherited(arguments);
              this.own(on(this.name, 'Change', lang.hitch(this, '_onNameChange')));
          },

          setConfig: function (folder) {
              this.loopflag = true;
              this.editfolder = folder;
              if (folder.name) {
                  this.loopflag = false;
                  this.name.set('value', folder.name);

              }
              dojo.query(".input-table .warning").addClass("toogleclass");
              //  this.expandedCbx.setValue(folder.expanded);
          },

          getConfig: function () {
              var folder = {
                  name: this.name.get("value"),
                  items: this.editfolder.items,
                  displayIndex: this.editfolder.displayIndex,
                  status: this.editfolder.status
                  //expanded: this.expandedCbx.getValue(),
                  //useradded: true
              };
              return folder;
          },

          _onNameChange: function (evt) {

              //dojo.query(".input-table .warning").removeClass("toogleclass");
              //  var format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;      

              //var splChars = "*|,\":<>[]{}`\';()@&$#%";
              //for (var i = 0; i < evt.length; i++) {
              //    if (splChars.indexOf(evt.charAt(i)) != -1) {
              //        new Message({
              //            message: this.nls.withoutspecialcharacters
              //        });
              //        this.popup.disableButton(0);
              //        return;
              //    }
              //}


              this._checkRequiredField();
          },

          _checkRequiredField: function () {
              var booleanFlag = false;
              var p = localStorage.getItem("parent");
              var array = JSON.parse(p);
              if (!this.name.get('value')) {
                  if (this.popup) {
                      //new Message({
                      //    message: this.nls.foldernameexists
                      //            });
                      this.popup.disableButton(0);
                      return;
                  }
              }
              if (array != null) {
                  for (var i = 0; i < array.length; i++) {
                      if (array[i].name.toUpperCase() === this.name.get('value').toUpperCase()) {
                          //new Message({
                          //    message: this.nls.foldernameexists
                          //});
                          if (this.loopflag) {
                              dojo.query(".input-table .warning").removeClass("toogleclass");
                          }
                          this.loopflag = true;
                          this.popup.disableButton(0);
                          booleanFlag = true;
                          break;
                      }
                  }
                  if (!booleanFlag) {
                      dojo.query(".input-table .warning").addClass("toogleclass");
                      this.popup.enableButton(0);
                  }
              }
              else {
                  dojo.query(".input-table .warning").addClass("toogleclass");
                  this.popup.enableButton(0);
              }

          }
      });
  });
