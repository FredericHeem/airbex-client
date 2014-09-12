function WebSocketClient(options) {
    this.io = require('socket.io-client');
    var EventEmitter = require('events').EventEmitter;
    this.ee = new EventEmitter();
    var Q = require("q");
    this.options = options || {}
    this.callbacks = {}
    this.currentCallbackId = 0;
    var url = this.options.url || 'https://demo.airbex.net/api';

    this.start = function start() {
        var me = this
        this.socketio = this.io(url, {multiplex:this.options.multiplex || false});
        
        var deferred = Q.defer();
        
        registerMessage(me, '/v1/markets', this.onMarkets);
        registerMessage(me, '/v1/market/depth', this.onDepth);
        registerMessage(me, '/v1/currencies', this.onCurrencies);
        registerMessage(me, '/v1/balances', this.onBalances);
        
        var manager = this.io.Manager(this.url, {});

        manager.on('connect_error', function() {
            me.ee.emit('connect_error');
            deferred.reject();
        });

        this.socketio.on('connect', function () {
            me.ee.emit('connected');
            deferred.resolve();
        });

        this.socketio.on('error', function (err) {
            console.log('socketioClient error: ', err);
            me.ee.emit('error');
        });

        return deferred.promise;
    }

    this.stop = function stop() {
        if(this.socketio){
            this.socketio.close();
        }
    }
    
    this.addListener = function addListener(message, cb){
        this.ee.addListener(message, cb);
    }

    this.sendMessage = function(request, inputs){
        var deferred = Q.defer();
        var callbackId = getCallbackId(this);
        this.callbacks[callbackId] = {
                time: new Date(),
                deferred:deferred
        };
        var apiKey = undefined;
        if(this.options.apiKey && this.options.apiKey.length > 0){
            apiKey = this.options.apiKey;
        }
        //console.log('sendMessage %s, param: %s, callbackId %s', request, JSON.stringify(inputs), callbackId)
        var header = {callbackId: callbackId, apiKey: apiKey};
        
        this.socketio.emit(request, {header:header, inputs:inputs});
        return deferred.promise;
    }

    this.getMarkets = function getMarkets(){
        return this.sendMessage('/v1/markets')
    }

    this.onMarkets = function onMarkets (me, error, markets){
        //console.log('markets: ' + JSON.stringify(markets));
        me.ee.emit('/v1/markets', error, markets)
    }

    this.getCurrencies = function getCurrencies (){
        return this.sendMessage('/v1/currencies');
    }

    this.onCurrencies = function onCurrencies(me, error, currencies){
        //console.log('currency: ' + JSON.stringify(currencies));
        me.ee.emit('/v1/currencies', error, currencies)
    }

    this.getBalances = function getBalances(){
        return this.sendMessage('/v1/balances');
    }

    this.onBalances = function onBalances(me, error, balances){
        //console.log('onBalances: ' + JSON.stringify(balances));
        me.ee.emit('/v1/balances', error, balances);
    }

    this.getDepth = function getDepth(marketId){
        return this.sendMessage('/v1/market/depth', {marketId: marketId});
    }

    this.onDepth = function onDepth(me, error, depth){
        //console.log('onDepth: ' + JSON.stringify(depth));
        me.ee.emit('/v1/market/depth', error, depth);
    }

    function registerMessage(me, message, cb){
        //console.log('registerMessage %s', message);
        me.socketio.on(message, function(response){
            //console.log('message resp for %s: %s', message, JSON.stringify(response));
            if(cb){
                cb(me, response.error, response.data);
            }
            onMessage(me, response);
        });
    }
    
    function getCallbackId(me) {
        me.currentCallbackId += 1;
        if(me.currentCallbackId > 10000) {
            me.currentCallbackId = 0;
        }
        return me.currentCallbackId;
    }

    function onMessage(me, message) {
        //console.log("onMessage", JSON.stringify(message));
        if(me.callbacks.hasOwnProperty(message.callbackId)) {
            var deferred = me.callbacks[message.callbackId].deferred;
            if(message.error){
                //console.log("onMessage error: %s ", JSON.stringify(message));
                deferred.reject(message.error);
            } else {
                deferred.resolve(message.data);
            }
            delete me.callbacks[message.callbackId];
        } else {
            console.error("onMessage: missing callbackId")
        }
    }
}

module.exports = {
        WebSocketClient: WebSocketClient
};