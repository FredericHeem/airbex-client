function WebSocketClient(options) {
    //var EventEmitter = require('event-emitter');
    this.io = require('socket.io-client');
    var EventEmitter = require('events').EventEmitter;
    this.ee = new EventEmitter();
    this.ee.emit("Caio");
    var Q = require("q");
    options = options || {}
    this.callbacks = {}
    this.currentCallbackId = 0;
    
    
    this.url = options.url;

    this.start = function start() {
        var me = this
        this.socketio = this.io(this.url);
        var manager = this.io.Manager(this.url, {});

        manager.on('connect_error', function() {
            me.ee.emit('connect_error');
        });

        this.socketio.on('connect', function () {
            me.ee.emit('connected');
        });

        this.socketio.on('error', function (err) {
            console.log('socketioClient error: ', err);
            me.ee.emit('error');
        });

        this.registerMessage('markets', this.onMarkets);
        this.registerMessage('/v1/market/depth', this.onDepth);
        this.registerMessage('currencies', this.onCurrencies);
        this.registerMessage('balances', this.onBalances);
    }

    this.addListener = function addListener(message, cb){
        this.ee.addListener(message, cb);
    }

    this.registerMessage = function proto(message, cb){
        console.log('registerMessage %s', message);
        var me = this
        this.socketio.on(message, function(response){
            console.log('message resp for %s: %s', message, JSON.stringify(response));
            cb(me, response.error, response.data);
            onMessage(me, response);
        });
    }

    this.sendMessage = function(request, params){

        console.log('sendMessage %s, param: %s', request, JSON.stringify(params))
        params = params || {};
        var deferred = Q.defer();
        var callbackId = getCallbackId(this);
        this.callbacks[callbackId] = {
                time: new Date(),
                deferred:deferred
        };
        params.callbackId = callbackId;
        this.socketio.emit(request, params);
        return deferred.promise;
    }


    this.getMarkets = function getMarkets(){
        return this.sendMessage('markets', {})
    }

    this.onMarkets = function onMarkets (me, error, markets){
        console.log('markets: ' + JSON.stringify(markets));
        me.ee.emit('markets', error, markets)
    }

    this.getCurrencies = function getCurrencies (){
        return this.sendMessage('currencies');
    }

    this.onCurrencies = function onCurrencies(me, error, currencies){
        console.log('currency: ' + JSON.stringify(currencies));
        me.ee.emit('currencies', error, currencies)
    }

    this.getBalances = function getBalances(){
        return this.sendMessage('balances');
    }

    this.onBalances = function onBalances(me, error, balances){
        console.log('onBalances: ' + JSON.stringify(balances));
        me.ee.emit('balances', error, balances);
    }

    this.getDepth = function getDepth(marketId){
        return this.sendMessage('/v1/market/depth', {marketId: marketId});
    }

    this.onDepth = function onDepth(me, error, depth){
        console.log('onDepth: ' + JSON.stringify(depth));
        me.ee.emit('depth', error, depth);
    }

    function getCallbackId(me) {
        me.currentCallbackId += 1;
        if(me.currentCallbackId > 10000) {
            me.currentCallbackId = 0;
        }
        return me.currentCallbackId;
    }

    function onMessage(me, message) {
        console.log("onMessage", JSON.stringify(message));
        if(me.callbacks.hasOwnProperty(message.callbackId)) {
            me.callbacks[message.callbackId].deferred.resolve(message.data);
            delete me.callbacks[message.callbackId];
        } else {
            console.log("onMessage: missing callbackId")
        }
    }
}

module.exports = {
        WebSocketClient: WebSocketClient
};