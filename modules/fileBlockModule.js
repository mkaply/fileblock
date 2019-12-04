const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import('resource://gre/modules/Timer.jsm');

let LocalFileBlockPolicy = {
  appDir: null,
  profileDir: null,
  tempDir: null,
  fileExtensionsBlackList: [],
  shouldLoad(contentLocation, loadInfo, mimeTypeGuess) {
    if (!this.appDir) {
      try {
        this.appDir = Services.io.newFileURI(Services.dirsvc.get("CurProcD", Ci.nsIFile)).spec;
      } catch (e) {}
    }
    if (!this.profileDir) {
      try {
        this.profileDir = Services.io.newFileURI(Services.dirsvc.get("ProfD", Ci.nsIFile)).spec;
      } catch (e) {}
    }
    if (!this.tempDir) {
      try {
        this.tempDir = Services.io.newFileURI(Services.dirsvc.get("TmpD", Ci.nsIFile)).spec;
      } catch (e) {}
    }
    if (!this.fileExtensionsBlackList.length) {
      try {
        this.fileExtensionsBlackList = Services.prefs.getCharPref("fileExtensions.blacklist").split(",");
      } catch (e) {}
    }
    // We need to allow access to any files in the profile directory,
    // application directory or the temporary directory. Without these,
    // Firefox won't start
    if (contentLocation.spec.match(this.profileDir) ||
    contentLocation.spec.match(this.appDir) ||
    contentLocation.spec.match(this.tempDir)) {
      return Ci.nsIContentPolicy.ACCEPT;
    }
    if (contentLocation.scheme == "file") {
      let contentType = loadInfo.externalContentPolicyType;
      if (contentType == Ci.nsIContentPolicy.TYPE_DOCUMENT) {
        setTimeout(function() {
          Services.ww.activeWindow.location.href = "about:blank";
        }, 0);
      }
      return Ci.nsIContentPolicy.REJECT_REQUEST;
    }
    try {
      // Might not be an nsIURL
      if (this.fileExtensionsBlackList.includes(contentLocation.QueryInterface(Ci.nsIURL).fileExtension)) {
        return Ci.nsIContentPolicy.REJECT_REQUEST;
      }
    } catch (e) {}
    return Ci.nsIContentPolicy.ACCEPT;
  },
  shouldProcess(contentLocation, loadInfo, mimeTypeGuess) {
    return Ci.nsIContentPolicy.ACCEPT;
  },
  classDescription: "FileBlock Content Service",
  contractID: "@kaply.com/fileblock-content-service;1",
  classID: Components.ID('{d85791cf-3ae5-45e3-bebe-b567df75c7f4}'),
  QueryInterface: ChromeUtils.generateQI([Ci.nsIContentPolicy]),
  createInstance(outer, iid) {
    return this.QueryInterface(iid);
  }
};

let registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
registrar.registerFactory(LocalFileBlockPolicy.classID,
                          LocalFileBlockPolicy.classDescription,
                          LocalFileBlockPolicy.contractID,
                          LocalFileBlockPolicy);

let cm = Cc["@mozilla.org/categorymanager;1"].getService(Ci.nsICategoryManager);
cm.addCategoryEntry("content-policy", LocalFileBlockPolicy.contractID, LocalFileBlockPolicy.contractID, false, true);
