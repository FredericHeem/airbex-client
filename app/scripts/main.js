'use strict';

var app = {};

app.websocketUrl = "http://localhost:5071";

app.init = function () {
    this.api = new Airbex.WebSocketClient({url:app.websocketUrl});
    
    this.api.addListener('connected', app.onConnected);
    this.api.addListener('connect_error', app.onConnectError);
    this.api.addListener('error', app.onError);
    this.api.start();
    
    this.view = View;
    this.view.init();
    this.bom = {};
    this.view.status.renderConnecting()
}

app.onConnectError = function (){
    console.log('connect_error ');
    app.view.status.renderError()
}

app.onError = function (error){
    console.log('error ', error.description.message);
    app.view.status.renderError()
}

app.onConnected = function (){
    console.log('socketioClient connect');
    var api = app.api;
    app.view.status.renderConnected()
    
    api.getMarkets()
    .then(function(markets){
        app.bom.markets = markets;
        app.view.marketSummary.render(markets);
        app.getDepths(markets)
    });
    
    api.getCurrencies()
    .then(function(currencies){
        app.view.currencies.render(currencies);
    });
    
    api.getBalances()
    .then(function(balances){
        app.view.balances.render(balances);
    })
    .fail(function(error){
        app.view.balances.render(null, error);
    })
}

app.getDepths = function (markets){
    $.each(markets, function(i, market){
        app.api.getDepth(market.id)
        .done(function(depth){
            app.view.depth.render(depth);
        })
    })
}

app.init();


