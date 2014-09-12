function WebSocketClient(options) {
    var _io = require('socket.io-client');
    var _socketio;
    var EventEmitter = require('events').EventEmitter;
    var _ee = new EventEmitter();
    var Q = require("q");
    var sjcl = require('sjcl')
    var _options = options || {}
    var _callbacks = {}
    var _currentCallbackId = 0;
    var _url = _options.url || 'https://demo.airbex.net/api';

    this.start = function start() {
        _socketio = _io(_url, {multiplex:_options.multiplex || false});
        
        var deferred = Q.defer();
        
        registerMessage('/v1/markets', onMarkets.bind(this));
        registerMessage('/v1/market/depth', onDepth.bind(this));
        registerMessage('/v1/currencies', onCurrencies.bind(this));
        registerMessage('/v1/balances', onBalances.bind(this));
        registerMessage('/v1/whoami', onWhoami.bind(this));
        registerMessage('/v1/sessionCreate');
        
        var manager = _io.Manager(_url, {});

        manager.on('connect_error', function() {
            _ee.emit('connect_error');
            deferred.reject();
        }.bind(this));

        _socketio.on('connect', function () {
            _ee.emit('connected');
            deferred.resolve();
        }.bind(this));

        _socketio.on('error', function (err) {
            console.log('socketioClient error: ', err);
            _ee.emit('error');
        }.bind(this));

        return deferred.promise;
    }

    this.stop = function stop() {
        if(_socketio){
            _socketio.close();
        }
    }
    
    this.addListener = function addListener(message, cb){
        _ee.addListener(message, cb);
    }

    this.sendMessage = function(request, inputs){
        var deferred = Q.defer();
        var callbackId = getCallbackId(this);
        _callbacks[callbackId] = {
                time: new Date(),
                deferred:deferred
        };
        var apiKey = undefined;
        if(options.apiKey && options.apiKey.length > 0){
            apiKey = options.apiKey;
        }
        //console.log('sendMessage %s, param: %s, callbackId %s', request, JSON.stringify(inputs), callbackId)
        var header = {callbackId: callbackId, apiKey: apiKey, sessionKey: this.sessionKey};
        
        _socketio.emit(request, {header:header, inputs:inputs});
        return deferred.promise;
    }

    this.getMarkets = function(){
        return this.sendMessage('/v1/markets')
    }

    function onMarkets(error, markets){
        _ee.emit('/v1/markets', error, markets)
    }

    this.getCurrencies = function(){
        return this.sendMessage('/v1/currencies');
    }

    function onCurrencies(error, currencies){
        _ee.emit('/v1/currencies', error, currencies)
    }

    this.getBalances = function(){
        return this.sendMessage('/v1/balances');
    }

    function onBalances(error, balances){
        _ee.emit('/v1/balances', error, balances);
    }

    function onWhoami(error, user){
        _ee.emit('/v1/whoami', error, user);
    }
    
    this.getDepth = function(marketId){
        return this.sendMessage('/v1/market/depth', {marketId: marketId});
    }

    function onDepth(error, depth){
        _ee.emit('/v1/market/depth', error, depth);
    }

    this.loginWithKey = function(sessionKey) {
        //console.log("loginWithKey")
        var deferred = Q.defer();
        this.sessionKey = sessionKey;
        var me = this;
        this.sendMessage('/v1/whoami')
        .then(function(user){
            console.log("loginWithKey user ", user);
            deferred.resolve(user);
        })
        .fail(function(error){
            me.sessionKey = undefined;
            deferred.reject(error);
        })
        return deferred.promise;
    }
    
    this.loginWithUserKey = function(email, userKey) {
        var deferred = Q.defer();
        var sessionKey;
        var me = this;
        this.sendMessage('/v1/sessionCreate', { email: email })
        .then(function(response){
            var sessionId = response.id;
            sessionKey = keyFromUserKey (sessionId, userKey);
            me.loginWithKey(sessionKey)
            .then(function(user){
                deferred.resolve(user);
            })
            .fail(function(error){
                deferred.reject(error);
            })
        })
        .fail(function(error){
            deferred.reject(error);
        })
        return deferred.promise;
    }
    
    this.login = function(email, password) {
        return this.loginWithUserKey(email, getUserKey(email, password))
    }
    
    function registerMessage(message, cb){
        _socketio.on(message, function(response){
            //console.log('message resp for %s: %s', message, JSON.stringify(response));
            if(cb){
                cb(response.error, response.data);
            }
            onMessage(response);
        });
    }
    
    function getCallbackId(me) {
        _currentCallbackId += 1;
        if(_currentCallbackId > 10000) {
            _currentCallbackId = 0;
        }
        return _currentCallbackId;
    }

    function onMessage(message) {
        //console.log("onMessage", JSON.stringify(message));
        if(_callbacks.hasOwnProperty(message.callbackId)) {
            var deferred = _callbacks[message.callbackId].deferred;
            if(message.error){
                //console.log("onMessage error: %s ", JSON.stringify(message));
                deferred.reject(message.error);
            } else {
                deferred.resolve(message.data);
            }
            delete _callbacks[message.callbackId];
        } else {
            console.error("onMessage: missing callbackId")
        }
    }
    
    function sha256(s) {
        var bits = sjcl.hash.sha256.hash(s)
        return sjcl.codec.hex.fromBits(bits)
    }

    function getUserKey(email, password) {
        return sha256(email.toLowerCase() + password)
    }

    function keyFromCredentials(sessionId, email, password) {
        var userKey = getUserKey(email, password)
        return keyFromUserKey(sessionId, userKey)
    }

    function keyFromUserKey(sessionId, userKey) {
        var skey = sha256(sessionId + userKey)
        return skey
    }
    
}

module.exports = {
        WebSocketClient: WebSocketClient
};