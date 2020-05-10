isPathAbsolute = require 'path-is-absolute'

# Public: The main auto-launch class
module.exports = class AutoLaunch

    ### Public ###

    # options - {Object}
    #   :isHidden - (Optional) {Boolean}
    #   :mac - (Optional) {Object}
    #       :useLaunchAgent - (Optional) {Boolean}. If `true`, use filed-based Launch Agent. Otherwise use AppleScript
    #           to add Login Item
    #   :name - {String}
    #   :path - (Optional) {String}
    #   :extraArgs - (Optional) {String}
    constructor: ({name, isHidden, mac, extraArgs, path}) ->
        throw new Error 'You must specify a name' unless name?

        @opts =
            appName: name
            isHiddenOnLaunch: if isHidden? then isHidden else false
            extraArgs: if extraArgs? then extraArgs else ''
            mac: mac ? {}

        versions = process?.versions
        if path?
            # Verify that the path is absolute
            throw new Error 'path must be absolute' unless isPathAbsolute path
            @opts.appPath = path

        else if versions? and (versions.nw? or versions['node-webkit']? or versions.electron?)
            @opts.appPath = process.execPath

        else
            throw new Error 'You must give a path (this is only auto-detected for NW.js and Electron apps)'

        @api = null
        if /^win/.test process.platform
            @api = require './AutoLaunchWindows'
        else if /darwin/.test process.platform
            @api = require './AutoLaunchMac'
        else if /linux/.test process.platform
            @api = require './AutoLaunchLinux'
        else
            throw new Error 'Unsupported platform'


    enable: => @api.enable @opts


    disable: => @api.disable @opts.appName, @opts.mac


    # Returns a Promise which resolves to a {Boolean}
    isEnabled: => @api.isEnabled @opts.appName, @opts.mac
