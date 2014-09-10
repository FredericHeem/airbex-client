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

var App = function(){
    this.controller = new Controller();
    
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
        console.log('socketioClient connect');
        var api = this.api;
        this.controller.status.setModel({state:"connected"});
        var me = this;
        api.getMarkets()
        .then(function(markets){
            me.controller.markets.setModel(markets);
            getDepths(me, markets)
        });
        
        api.getCurrencies()
        .then(function(currencies){
            me.controller.currencies.setModel(currencies);
        });
        
        api.getBalances()
        .then(function(balances){
            me.controller.balances.setModel(balances);
        })
        .fail(function(error){
            me.view.balances.render(null, error);
        })
    }

    function getDepths(me, markets){
        $.each(markets, function(i, market){
            me.api.getDepth(market.id)
            .done(function(depth){
                me.controller.depth.setModel(depth);
            })
        })
    }
};

var app = new App();
app.webSocketStart();

