'use strict';

var Airbex = require('../lib/Airbex.js');

var SideBar = require('./sidebar/sidebar.js')
var Markets = require('./markets/markets.js')
var Settings = require('./settings/settings.js')
var Status = require('./status/status.js')
var Balances = require('./balances/balances.js')
var Currencies = require('./currencies/currencies.js')
var Depth = require('./depth/depth.js')
var HomeView = require('./home/home.js');

var Controller = function(app, eventEmitter){
    this.sidebar = new SideBar(app, eventEmitter)
    this.settings = new Settings(eventEmitter)
    this.status = new Status(eventEmitter)
    this.balances = new Balances(app, eventEmitter)
    this.currencies = new Currencies(app, eventEmitter)
    this.markets = new Markets(app, eventEmitter)
    this.depth = new Depth(app, eventEmitter)
};

var App = function(){
    var EventEmitter = require('events').EventEmitter;
    var eventEmitter = new EventEmitter();
    
    eventEmitter.addListener('settings', onSettings.bind(this));
    
    var controller = new Controller(this, eventEmitter);
    
    this.getApi = function(){
        return this.api;
    }
    
    this.start = function(){
        controller.settings.retrieveSettings();
    }
    
    function webSocketStart(me, settings) {
        me.api = new Airbex.WebSocketClient({url:settings.webSocketUrl, apiKey:settings.apiKey});
        me.api.addListener('connected', onConnected.bind(me));
        me.api.addListener('connect_error', onConnectError.bind(me));
        me.api.addListener('error', onError.bind(me));
        me.api.start();
    }
    
    function onSettings(settings){
        console.log('onSettings');
        webSocketStart(this, settings);
    }
    
    function onConnectError(){
        console.log('connect_error');
        controller.status.setModel({state:"error"});
    }

    function onError(error){
        console.log('error ', error.description.message);
        controller.status.setModel({state:"error"});
    }

    function onConnected(){
        console.log('App onConnected');
        eventEmitter.emit('connected');
    }
};

var app = new App();
app.start();

