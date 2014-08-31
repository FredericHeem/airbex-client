'use strict';

/// Market Summary View
var AirbexApiWs = {};

AirbexApiWs.init = function (url) {
    this.ee = new EventEmitter();
    this.url = url;
}

AirbexApiWs.start = function () {
    var me = this
    this.socketio = io(this.url);
    this.deferredMap = {};
    var manager = io.Manager(this.url, {});
    
    manager.on('connect_error', function() {
        me.ee.emitEvent('connect_error');
    });
    
    this.socketio.on('connect', function () {
        me.ee.emitEvent('connected');
    });

    this.socketio.on('error', function (err) {
        console.log('socketioClient error: ', err);
        me.ee.emitEvent('error');
    });
    
    AirbexApiWs.registerMessage('markets', AirbexApiWs.onMarkets);
    AirbexApiWs.registerMessage('/v1/market/depth', AirbexApiWs.onDepth);
    AirbexApiWs.registerMessage('currencies', AirbexApiWs.onCurrencies);
    AirbexApiWs.registerMessage('balances', AirbexApiWs.onBalances);
    
}

AirbexApiWs.addListener = function (message, cb){
    this.ee.addListener(message, cb);
}
    
AirbexApiWs.registerMessage = function (message, cb){
    console.log('registerMessage %s', message);
    var deferred = $.Deferred();
    this.deferredMap[message] = deferred;
    this.socketio.on(message, function(response){
        console.log('Message resp for %s: %s', message, JSON.stringify(response));
        cb(response.error, response.data);
        if(response.data){
            deferred.resolve();
        } else {
            deferred.reject(response.error);
        }
    });
}

AirbexApiWs.sendMessage = function (message, params){
    console.log('sendMessage %s, param: %s', message, JSON.stringify(params))
    var deferred = this.deferredMap[message]
    this.socketio.emit(message, params);
    return deferred.promise();
}

AirbexApiWs.getMarkets = function (){
    return this.sendMessage('markets', {});
}

AirbexApiWs.onMarkets = function (error, markets){
    console.log('markets: ' + JSON.stringify(markets));
    AirbexApiWs.ee.emitEvent('markets', [error, markets]);
}

AirbexApiWs.getCurrencies = function (){
    return AirbexApiWs.sendMessage('currencies');
}

AirbexApiWs.onCurrencies = function (error, currencies){
    console.log('currency: ' + JSON.stringify(currencies));
    AirbexApiWs.ee.emitEvent('currencies', [error, currencies]);
}

AirbexApiWs.getBalances = function (){
    return AirbexApiWs.sendMessage('balances');
}

AirbexApiWs.onBalances = function (error, balances){
    console.log('onBalances: ' + JSON.stringify(balances));
    AirbexApiWs.ee.emitEvent('balances', [error, balances]);
}

AirbexApiWs.getDepth = function (marketId){
    return AirbexApiWs.sendMessage('/v1/market/depth', {marketId: marketId});
}

AirbexApiWs.onDepth = function (error, depth){
    console.log('onDepth: ' + JSON.stringify(depth));
    AirbexApiWs.ee.emitEvent('depth', [error, depth]);
}

//app.sessionCreate = function (){
////this.socketio.emit("sessionCreate", {email:'aaa'});
//this.socketio.emit("sessionCreate");
//this.socketio.once('sessionCreate', function(session){
//  console.log("session response: ", session);
//  //app.onCurrencies(currencies)
//  
//});
//}