var Q = require("q");
var sjcl = require('sjcl')
var EventEmitter = require('events').EventEmitter;
var io = require('socket.io-client');
var wsMessages = {
        markets:"/v1/markets",
        depth:"/v1/market/depth",
        currencies:"/v1/currencies",
        balances:"/v1/balances",
        user:"/v1/whoami",
        sessionCreate:"/v1/sessionCreate"
}

function WebSocketClient(options) {
    var _socketio;
    var _ee = new EventEmitter();
    var _options = options || {}
    var _callbacks = {}
    var _currentCallbackId = 0;
    var _url = _options.url || 'https://demo.airbex.net/api';

    this.start = function start() {
        _socketio = io(_url, {multiplex:_options.multiplex || false});
        
        var deferred = Q.defer();
        
        registerMessage(wsMessages.markets, onMarkets.bind(this));
        registerMessage(wsMessages.depth, onDepth.bind(this));
        registerMessage(wsMessages.currencies, onCurrencies.bind(this));
        registerMessage(wsMessages.balances, onBalances.bind(this));
        registerMessage(wsMessages.user, onWhoami.bind(this));
        registerMessage(wsMessages.sessionCreate);
        
        var manager = io.Manager(_url, {});

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
        console.log("getMarkets")
        return this.sendMessage(wsMessages.markets)
    }

    function onMarkets(error, markets){
        _ee.emit(wsMessages.markets, error, markets)
    }

    this.getCurrencies = function(){
        console.log("getCurrencies")
        return this.sendMessage(wsMessages.currencies);
    }

    function onCurrencies(error, currencies){
        _ee.emit(wsMessages.currencies, error, currencies)
    }

    this.getBalances = function(){
        return this.sendMessage(wsMessages.balances);
    }

    function onBalances(error, balances){
        _ee.emit(wsMessages.balances, error, balances);
    }

    this.getUser = function(){
        return this.sendMessage(wsMessages.user);
    }

    function onUser(error, user){
        _ee.emit(wsMessages.user, error, user);
    }
    
    function onWhoami(error, user){
        _ee.emit(wsMessages.user, error, user);
    }
    
    this.getDepth = function(marketId){
        return this.sendMessage(wsMessages.depth, {marketId: marketId});
    }

    function onDepth(error, depth){
        _ee.emit(wsMessages.depth, error, depth);
    }

    this.bootstrap = function(){
        return Q.all([this.getCurrencies(), this.getMarkets()]);
    }
    
    this.loginWithSessionKey = function(sessionKey) {
        //console.log("loginWithSessionKey")
        var deferred = Q.defer();
        this.sessionKey = sessionKey;
        var me = this;
        Q.all([this.getUser(), this.getBalances(), this.getMarkets()])
        .then(function(result){
            deferred.resolve(result);
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
        this.sendMessage(wsMessages.sessionCreate, { email: email })
        .then(function(response){
            var sessionId = response.id;
            sessionKey = keyFromUserKey(sessionId, userKey);
            me.loginWithSessionKey(sessionKey)
            .then(function(result){
                deferred.resolve({
                    sessionKey:sessionKey,
                    user:result[0],
                    balances: result[1],
                    markets:result[2]
                });
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