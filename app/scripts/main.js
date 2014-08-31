'use strict';

var app = {};

app.websocketUrl = "http://localhost:5071";

app.init = function () {
    this.bom = {};
    this.$wsStatus = $(".ws-status");
    this.$wsStatus.text("Idle");
    this.$alertBalances = $("#alert-balances");
    this.$orderBookContainer = $("#order-book-container");
    this.deferredMap = {};
    
}

app.initWebSoket = function () {
    this.socketio = io(this.websocketUrl);
    
    var manager = io.Manager(this.websocketUrl, {});
    
    manager.on('connect_error', function() {
        app.onError();
    });
    
    this.socketio.on('connect', function () {
        app.onConnected();
        
    });

    this.socketio.on('error', function (err) {
        console.log('socketioClient error: ', err);
        app.onError(err);
    });
    
    app.registerMessage('markets', app.onMarkets);
    app.registerMessage('/v1/market/depth', app.onDepth);
    app.registerMessage('currencies', app.onCurrencies);
    
}

app.onError = function (error){
    console.log('connect_error ', error.description.message);
    app.$wsStatus.text('Error');
}

app.onConnected = function (){
    console.log('socketioClient connect');
    app.$wsStatus.text("Connected");
    app.getMarkets()
    .done(app.getDepths);
    //app.getCurrencies();
    //app.getBalances();
    //app.getDepth("BTCUSD");
    //app.sessionCreate();
}

app.registerMessage = function (message, cb){
    console.log('registerMessage %s', message);
    var deferred = $.Deferred();
    this.deferredMap[message] = deferred;
    this.socketio.on(message, function(response){
        console.log('getMessage resp for %s: %s', message, JSON.stringify(response));
        if(response.data){
            cb(null, response);
            deferred.resolve();
        } else {
            deferred.reject(response.error);
        }
    });
}

app.getMessage = function (message, params, cbData){
    console.log('getMessage %s, param: %s', message, JSON.stringify(params))
    var deferred = $.Deferred();
    this.socketio.emit(message, params);
    this.socketio.once(message, function(response){
        console.log('getMessage resp for %s: %s', message, JSON.stringify(response));
        if(response.data){
            cbData(response);
            deferred.resolve();
        } else {
            deferred.reject(response.error);
        }
    });

    return deferred.promise();
}

app.sendMessage = function (message, params){
    console.log('sendMessage %s, param: %s', message, JSON.stringify(params))
    var deferred = this.deferredMap[message]
    this.socketio.emit(message, params);
    return deferred.promise();
}

app.getMarkets = function (){
    return app.sendMessage('markets', {});
}

app.onMarkets = function (err, markets){
    console.log('markets: ' + JSON.stringify(markets));
    $(".markets-tbody").empty();
    if(markets.data){
        app.bom.markets = markets.data;
        $("#alert-markets").hide()
        $.each(markets.data, function(i, market) {
            var $tr = $('<tr>').append(
                    $('<td>').text(market.id),
                    $('<td>').text(market.bid || 'N/A'),
                    $('<td>').text(market.ask || 'N/A'),
                    $('<td>').text(market.high || 'N/A'),
                    $('<td>').text(market.low || 'N/A'),
                    $('<td>').text(market.volume || 'N/A'),
                    $('<td>').text(market.last || 'N/A')
            ).appendTo($(".markets-tbody"));
        });
    } else {

    }
}



app.getCurrencies = function (){
    return app.getMessage('currencies', {}, app.onCurrencies);
}

app.onCurrencies = function (currencies){
    console.log('currency: ' + JSON.stringify(currencies));
    $(".currencies-tbody").empty();
    
    if(currencies.data){
        $.each(currencies.data, function(i, currency) {
            var $tr = $('<tr>').append(
                    $('<td>').text(currency.name),
                    $('<td>').text(currency.id),
                    $('<td>').text(currency.fiat),
                    $('<td>').text(currency.scale),
                    $('<td>').text(currency.scale_display),
                    $('<td>').text(currency.withdraw_min),
                    $('<td>').text(currency.withdraw_max),
                    $('<td>').text(currency.withdraw_fee)
            ).appendTo($(".currencies-tbody"));
        });
    } else {
    }
}

app.getBalances = function (){
    return app.getMessage('balances', {}, app.onBalances);
}

app.onBalances = function (balances){
    console.log('onBalances: ' + JSON.stringify(balances));
    $(".balances-tbody").empty();
    
    if(balances.data){
        this.$alertBalances.hide()
        $.each(balances.data, function(i, currency) {
            var $tr = $('<tr>').append(
                    $('<td>').text(currency.name),
                    $('<td>').text(currency.id),
                    $('<td>').text(currency.fiat),
                    $('<td>').text(currency.scale),
                    $('<td>').text(currency.scale_display),
                    $('<td>').text(currency.withdraw_min),
                    $('<td>').text(currency.withdraw_max),
                    $('<td>').text(currency.withdraw_fee)
            ).appendTo($(".balances-tbody"));
        });
    } else {
        this.$alertBalances.html("Error: " + balances.error.name)
        this.$alertBalances.show()
    }
}

app.getDepths = function (){
    if(!app.bom.markets){
        return;
    }
    
    $.each(app.bom.markets, function(i, market){
        app.getDepth(market.id)
    })
}

app.getDepth = function (marketId){
    return app.sendMessage('/v1/market/depth', {marketId: marketId});
}

app.onDepth = function (error, depth){
    console.log('onDepth: ' + JSON.stringify(depth));
    //$(".currencies-tbody").empty();
    
    if(depth.data){
        var marketId = depth.data.marketId;
        
        //app.$orderBookContainer
    } else {
    }
}

app.sessionCreate = function (){
    //this.socketio.emit("sessionCreate", {email:'aaa'});
    this.socketio.emit("sessionCreate");
    this.socketio.once('sessionCreate', function(session){
        console.log("session response: ", session);
        //app.onCurrencies(currencies)
        
    });
}

app.init();
app.initWebSoket();


