'use strict';

var app = {};

app.websocketUrl = "http://localhost:5071";

app.init = function () {
    this.api = AirbexApiWs;
    this.api.init(app.websocketUrl);
    
    this.api.addListener('connected', app.onConnected);
    this.api.addListener('markets', app.onMarkets);
    this.api.addListener('currencies', app.onCurrencies);
    this.api.addListener('balances', app.onBalances);
    this.api.addListener('depth', app.onDepth);
    this.api.start();
    
    this.view = View;
    this.view.init();
    this.bom = {};
    this.$wsStatus = $(".ws-status");
    this.$wsStatus.text("Idle");
}

app.onMarkets = function (error, markets){
    console.log('markets: ' + JSON.stringify(markets));
    app.bom.markets = markets;
    app.view.marketSummary.render(error, markets);
}

app.onCurrencies = function (error, currencies){
    console.log('currency: ' + JSON.stringify(currencies));
    app.view.currencies.render(error, currencies);
}

app.onBalances = function (error, balances){
    console.log('onBalances: ' + JSON.stringify(balances));
    app.view.balances.render(error, balances);
}

app.onDepth = function (error, depth){
    console.log('onDepth: ' + JSON.stringify(depth));
    //$(".currencies-tbody").empty();
    app.view.depth.render(error, depth);
}

app.onError = function (error){
    console.log('connect_error ', error.description.message);
    app.$wsStatus.text('Error');
}


app.onConnected = function (){
    console.log('socketioClient connect');
    var api = app.api;
    app.$wsStatus.text("Connected");
    api.getMarkets()
    .done(app.getDepths);
    api.getCurrencies();
    api.getBalances();
}

app.getDepths = function (){
    if(!app.bom.markets){
        return;
    }
    
    $.each(app.bom.markets, function(i, market){
        app.api.getDepth(market.id)
    })
}


app.init();


