var Airbex = (function () {
    'use strict';

    function ApiWebSocket(options) {
        options = options || {}
        this.callbacks = {}
        this.currentCallbackId = 0;
        this.ee = new EventEmitter();
        this.url = options.url;
        
        this.start = function start() {
            var me = this
            this.socketio = io(this.url);
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
            var deferred = $.Deferred();
            var callbackId = getCallbackId(this);
            this.callbacks[callbackId] = {
                    time: new Date(),
                    deferred:deferred
            };
            params.callbackId = callbackId;
            this.socketio.emit(request, params);
            return deferred.promise();
        }


        this.getMarkets = function getMarkets(){
            return this.sendMessage('markets', {})
        }

        this.onMarkets = function onMarkets (me, error, markets){
            console.log('markets: ' + JSON.stringify(markets));
            emitEvent(me, 'markets', [error, markets])
        }

        this.getCurrencies = function getCurrencies (){
            return this.sendMessage('currencies');
        }

        this.onCurrencies = function onCurrencies(me, error, currencies){
            console.log('currency: ' + JSON.stringify(currencies));
            emitEvent(me, 'currencies', [error, currencies])
        }

        this.getBalances = function getBalances(){
            return this.sendMessage('balances');
        }

        this.onBalances = function onBalances(me, error, balances){
            console.log('onBalances: ' + JSON.stringify(balances));
            emitEvent(me, 'balances', [error, balances]);
        }

        this.getDepth = function getDepth(marketId){
            return this.sendMessage('/v1/market/depth', {marketId: marketId});
        }

        this.onDepth = function onDepth(me, error, depth){
            console.log('onDepth: ' + JSON.stringify(depth));
            emitEvent(me, 'depth', [error, depth]);
        }
        
        function getCallbackId(me) {
            me.currentCallbackId += 1;
            if(me.currentCallbackId > 10000) {
                me.currentCallbackId = 0;
            }
            return me.currentCallbackId;
        }

        function emitEvent(me, event, params){
            me.ee.emitEvent(event, params)
        }
        
        function onMessage(me, message) {
            console.log("onMessage", JSON.stringify(message));
            // If an object exists with callback_id in our callbacks object, resolve it
            if(me.callbacks.hasOwnProperty(message.callbackId)) {
                me.callbacks[message.callbackId].deferred.resolve(message.data);
                delete me.callbacks[message.callbackId];
            } else {
                console.log("onMessage: missing callbackId")
            }
        }
    }

    return {
        ApiWebSocket: ApiWebSocket
    }
    //this.ApiWebSocket = ApiWebSocket;
})()