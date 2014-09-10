'use strict';

var Airbex = require('../lib/Airbex.js');

var Markets = require('./markets/markets.js')
var Settings = require('./settings/settings.js')
var Status = require('./status/status.js')
var Balances = require('./balances/balances.js')
var Currencies = require('./currencies/currencies.js')
var Depth = require('./depth/depth.js')
var HomeView = require('./home/home.js');

var Controller = function(app, eventEmitter){
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
    
    this.controller = new Controller(this, eventEmitter);
    
    this.getApi = function(){
        return this.api;
    }
    
    this.webSocketStart = function () {
        var settings = this.controller.settings.model;
        this.api = new Airbex.WebSocketClient({url:settings.webSocketUrl, apiKey:settings.apiKey});
        
        this.api.addListener('connected', onConnected.bind(this));
        this.api.addListener('connect_error', onConnectError.bind(this));
        this.api.addListener('error', onError.bind(this));
        this.api.start();
    }
    
    function onConnectError(){
        console.log('connect_error');
        this.controller.status.view.renderError()
        this.controller.status.setModel({state:"error"});
    }

    function onError(error){
        console.log('error ', error.description.message);
        this.controller.status.setModel({state:"error"});
    }

    function onConnected(){
        console.log('App onConnected');
        eventEmitter.emit('connected');
    }
};

var app = new App();
app.webSocketStart();

