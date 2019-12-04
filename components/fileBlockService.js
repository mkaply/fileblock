const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

function FileBlock() {}

FileBlock.prototype = {
  observe: function(aSubject, aTopic, aData) {
    switch(aTopic) {
      case "profile-after-change":
        Services.ppmm.loadProcessScript("resource://fileblock/fileBlockModule.js", true);
        Services.obs.addObserver(FileBlock, "profile-before-change", false);  
        Services.obs.addObserver(documentObserver, "browser-window-before-show", false);
        break;
      case "profile-before-change":
        Services.obs.removeObserver(FileBlock, "profile-before-change", false);  
        Services.obs.removeObserver(documentObserver, "browser-window-before-show", false);  
        break;
    }
  },
  classDescription: "FileBlock Service",
  contractID: "@kaply.com/fileblock-service;1",
  classID: Components.ID('{cbea9627-60c0-4718-8545-72a6c3c4b8a3}'),
  QueryInterface: ("generateQI" in XPCOMUtils) ? XPCOMUtils.generateQI([Ci.nsIObserver]) : ChromeUtils.generateQI([Ci.nsIObserver]),
}

var documentObserver = {
  observe: function(aSubject, aTopic, aData) {
    switch(aTopic) {
      case "browser-window-before-show":
        var win = aSubject.QueryInterface(Components.interfaces.nsIDOMWindow);
        let doc = win.document;
        try {
            doc.getElementById("menu_openFile").hidden = true;
        } catch (e) {}
        try {
            doc.getElementById("appMenu-open-file-button").hidden = true;
        } catch (e) {}
        try {
            var keyset = doc.getElementById("openFileKb").removeAttribute("command");
        } catch (e) {}
        try {
            Components.utils.import("resource:///modules/CustomizableUI.jsm");
            CustomizableUI.destroyWidget("open-file-button")
        } catch (e) {}
        break;
    }
  }
}

if (XPCOMUtils.generateNSGetFactory) {
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([FileBlock]);
} else {
  var NSGetModule = XPCOMUtils.generateNSGetModule([FileBlock]);
}
