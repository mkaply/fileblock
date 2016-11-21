var gPathWhitelist = [];
var gExtensionWhitelist = [];

var gHideAddon = false;

const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

function FileBlock() {}

FileBlock.prototype = {
  appDir: null,
  profileDir: null,
  tempDir: null,
  shouldLoad: function(aContentType, aContentLocation, aRequestOrigin, aContext, aMimeTypeGuess, aExtra) {
    if (!this.appDir) {
      this.appDir = Services.io.newFileURI(Services.dirsvc.get("CurProcD", Ci.nsIFile)).spec;
      this.profileDir = Services.io.newFileURI(Services.dirsvc.get("ProfD", Ci.nsIFile)).spec;
      this.tempDir = Services.io.newFileURI(Services.dirsvc.get("TmpD", Ci.nsIFile)).spec;
      var userDir = Services.dirsvc.get("Home", Ci.nsIFile);
      for (var i=0; i < gPathWhitelist.length; i++) {
        gPathWhitelist[i] = gPathWhitelist[i].replace("~", userDir.path);
      }
    }
    // We need to allow access to any files in the profile directory,
    // application directory or the temporary directory. Without these,
    // Firefox won't start
    if (aContentLocation.spec.match(this.profileDir) ||
        aContentLocation.spec.match(this.appDir) ||
        aContentLocation.spec.match(this.tempDir)) {
      return Ci.nsIContentPolicy.ACCEPT;
    }
    // Deny all files except those on the whitelists
    if (aContentLocation.scheme == "file") {
      var file = aContentLocation.QueryInterface(Components.interfaces.nsIFileURL).file;
      for (var i=0; i< gPathWhitelist.length; i++) {
        if (file.path.toLowerCase().indexOf(gPathWhitelist[i].toLowerCase()) == 0) {
          return Ci.nsIContentPolicy.ACCEPT;
        }
      }
      for (var i=0; i< gExtensionWhitelist.length; i++) {
        var filename = file.leafName.toLowerCase();
        var extension = "." + gExtensionWhitelist[i].toLowerCase();
        if (filename.indexOf(extension, filename.length - extension.length) !== -1) {
          return Ci.nsIContentPolicy.ACCEPT;
        }
      }
      return Ci.nsIContentPolicy.REJECT_REQUEST;
    }
    // Allow everything else
    return Ci.nsIContentPolicy.ACCEPT;
  },
  shouldProcess: function(aContentType, aContentLocation, aRequestOrigin, aContext, aMimeTypeGuess, aExtra) {
    return Ci.nsIContentPolicy.ACCEPT;
  },
  observe: function(aSubject, aTopic, aData) {
    switch(aTopic) {
      case "profile-after-change":
        Services.obs.addObserver(documentObserver, "chrome-document-global-created", false);  
        Services.obs.addObserver(FileBlock, "profile-before-change", false);  
        break;
      case "profile-before-change":
        Services.obs.removeObserver(FileBlock, "profile-before-change", false);  
        Services.obs.removeObserver(documentObserver, "chrome-document-global-created", false);  
        break;
    }
  },
  classDescription: "FileBlock Service",
  contractID: "@kaply.com/fileblock-service;1",
  classID: Components.ID('{cbea9627-60c0-4718-8545-72a6c3c4b8a3}'),
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIContentPolicy, Ci.nsIObserver])
}

var documentObserver = {
  observe: function(aSubject, aTopic, aData) {
    switch(aTopic) {
      case "chrome-document-global-created":
        if (!(aSubject instanceof Ci.nsIDOMWindow)) {
          return;
        }
        var win = aSubject.QueryInterface(Components.interfaces.nsIDOMWindow);
        win.addEventListener("load", function(event) {
          win.removeEventListener("load", arguments.callee, false);
          var doc = event.target;
          var url = doc.location.href.split("?")[0].split("#")[0];
          switch (url) {
            case "chrome://browser/content/browser.xul":
              try {
                doc.getElementById("menu_openFile").hidden = true;
              } catch (e) {}
              try {
                doc.getElementById("appmenu_openFile").hidden = true;
              } catch (e) {}
              try {
                var keyset = doc.getElementById("openFileKb").removeAttribute("command");
              } catch (e) {}
              try {
                Components.utils.import("resource:///modules/CustomizableUI.jsm");
                CustomizableUI.destroyWidget("open-file-button")
              } catch (e) {}
              break;
            case "chrome://mozapps/content/extensions/extensions.xul":
            case "about:addons":
              if (!gHideAddon) {
                return;
              }
              try {
                doc.querySelector("richlistitem[value='fileblock@kaply.com']").hidden = true;
              } catch (e) {}
              win.addEventListener("ViewChanged", function() {
                try {
                  doc.querySelector("richlistitem[value='fileblock@kaply.com']").hidden = true;
                } catch (e) {}
              } , false)
          }
        }, false);
    }
  }
}

if (XPCOMUtils.generateNSGetFactory) {
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([FileBlock]);
} else {
  var NSGetModule = XPCOMUtils.generateNSGetModule([FileBlock]);
}
