'use strict';

var Airbex = require('../lib/Airbex.js');

var Markets = require('./markets/markets.js')
var Settings = require('./settings/settings.js')
var Status = require('./status/status.js')
var Balances = require('./balances/balances.js')
var Currencies = require('./currencies/currencies.js')
var Depth = require('./depth/depth.js')
var HomeView = require('./home/home.js');

var Controller = function(){
    
    this.settings = new Settings()
    this.status = new Status()
    this.balances = new Balances()
    this.currencies = new Currencies()
    this.markets = new Markets()
    this.depth = new Depth()
};

var app = {};

app.websocketUrl = "http://localhost:5071";

app.init = function () {
    
    this.controller = new Controller();
    var settings = this.controller.settings.model;
    this.api = new Airbex.WebSocketClient({url:settings.webSocketUrl, apiKey:settings.apiKey});
    
    this.api.addListener('connected', app.onConnected);
    this.api.addListener('connect_error', app.onConnectError);
    this.api.addListener('error', app.onError);
    this.api.start();
    
    this.bom = {};
}

app.onConnectError = function (){
    console.log('connect_error');
    app.controller.status.view.renderError()
}

app.onError = function (error){
    console.log('error ', error.description.message);
    app.controller.status.view.renderError()
}

app.onConnected = function (){
    console.log('socketioClient connect');
    var api = app.api;
    app.controller.status.view.renderConnected()
    
    api.getMarkets()
    .then(function(markets){
        app.bom.markets = markets;
        app.controller.markets.setModel(markets);
        app.getDepths(markets)
    });
    
    api.getCurrencies()
    .then(function(currencies){
        app.controller.currencies.setModel(currencies);
    });
    
    api.getBalances()
    .then(function(balances){
        app.controller.balances.setModel(balances);
    })
    .fail(function(error){
        app.view.balances.render(null, error);
    })
}

app.getDepths = function (markets){
    $.each(markets, function(i, market){
        app.api.getDepth(market.id)
        .done(function(depth){
            app.controller.depth.setModel(depth);
        })
    })
}

app.init();

