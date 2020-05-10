var AutoLaunch, isPathAbsolute,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

isPathAbsolute = require('path-is-absolute');

module.exports = AutoLaunch = (function() {

  /* Public */
  function AutoLaunch(arg) {
    var extraArgs, isHidden, mac, name, path, versions;
    name = arg.name, isHidden = arg.isHidden, mac = arg.mac, extraArgs = arg.extraArgs, path = arg.path;
    this.isEnabled = bind(this.isEnabled, this);
    this.disable = bind(this.disable, this);
    this.enable = bind(this.enable, this);
    if (name == null) {
      throw new Error('You must specify a name');
    }
    this.opts = {
      appName: name,
      isHiddenOnLaunch: isHidden != null ? isHidden : false,
      extraArgs: extraArgs != null ? extraArgs : '',
      mac: mac != null ? mac : {}
    };
    versions = typeof process !== "undefined" && process !== null ? process.versions : void 0;
    if (path != null) {
      if (!isPathAbsolute(path)) {
        throw new Error('path must be absolute');
      }
      this.opts.appPath = path;
    } else if ((versions != null) && ((versions.nw != null) || (versions['node-webkit'] != null) || (versions.electron != null))) {
      this.opts.appPath = process.execPath;
    } else {
      throw new Error('You must give a path (this is only auto-detected for NW.js and Electron apps)');
    }
    this.api = null;
    if (/^win/.test(process.platform)) {
      this.api = require('./AutoLaunchWindows');
    } else if (/darwin/.test(process.platform)) {
      this.api = require('./AutoLaunchMac');
    } else if (/linux/.test(process.platform)) {
      this.api = require('./AutoLaunchLinux');
    } else {
      throw new Error('Unsupported platform');
    }
  }

  AutoLaunch.prototype.enable = function() {
    return this.api.enable(this.opts);
  };

  AutoLaunch.prototype.disable = function() {
    return this.api.disable(this.opts.appName, this.opts.mac);
  };

  AutoLaunch.prototype.isEnabled = function() {
    return this.api.isEnabled(this.opts.appName, this.opts.mac);
  };

  return AutoLaunch;

})();
