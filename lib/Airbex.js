"use strict";
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
        sessionCreate:"/v1/sessionCreate",
        activity:"activity"
}

function WebSocketClient(options) {
    var _socketio;
    var _ee = new EventEmitter();
    var _options = options || {}
    var _callbacks = {}
    var _currentCallbackId = 0;
    var _url = _options.url || 'https://demo.airbex.net/';
    var _sessionKey;
    
    this.getIo = function(){
        return _socketio;
    }
    
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
            console.error('socketioClient error: ', err);
            try {
                _ee.emit('error', err);
            } catch(e){
                console.error('no error hanlder: ', e);
            }
            deferred.reject(err);
        }.bind(this));

        return deferred.promise;
    }

    this.stop = function stop() {
        if(_socketio){
            _socketio.close();
        }
    }
    
    this.on = function(message, cb){
        _ee.on(message, cb);
    }

    this.sendMessage = function(request, inputs){
        var deferred = Q.defer();
        var callbackId = getCallbackId();
        _callbacks[callbackId] = {
                time: new Date(),
                deferred:deferred
        };
        var apiKey;
        if(options.apiKey && options.apiKey.length > 0){
            apiKey = options.apiKey;
        }
        
        var header = {callbackId: callbackId, apiKey: apiKey, sessionKey: _sessionKey};
        //console.log('sendMessage %s, param: %s, header %s', request, JSON.stringify(inputs), JSON.stringify(header))
        _socketio.emit(request, {header:header, inputs:inputs});
        return deferred.promise;
    }

    this.getMarkets = function(){
        return this.sendMessage(wsMessages.markets)
    }

    function onMarkets(error, markets){
        _ee.emit(wsMessages.markets, error, markets)
    }

    this.getCurrencies = function(){
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
    
    function onWhoami(error, user){
        _ee.emit(wsMessages.user, error, user);
    }
    
    this.getDepth = function(marketId){
        return this.sendMessage(wsMessages.depth, {marketId: marketId});
    }

    function onDepth(error, depth){
        _ee.emit(wsMessages.depth, error, depth);
    }

    this.sessionCreate = function(email){
        _sessionKey = undefined;
        return this.sendMessage(wsMessages.sessionCreate, { email: email });
    }
    
    this.bootstrap = function(){
        var deferred = Q.defer();
        Q.all([this.getCurrencies(), this.getMarkets()])
        .spread(function (currencies, markets) {
            deferred.resolve({
                currencies:currencies,
                markets:markets
            });
        });
        return deferred.promise;
    }
    
    this.getSessionKey = function(){
        return _sessionKey;
    }
    
    this.loginWithSessionKey = function(sessionKey) {
        //console.log("loginWithSessionKey: ", sessionKey)
        var deferred = Q.defer();
        _sessionKey = sessionKey;
        var me = this;
        this.getUser()
        .then(function(user){
            //console.log("loginWithSessionKey: user");
            Q.all([me.getBalances(), me.getMarkets()])
            .spread(function (balances, markets) {
                //console.log("loginWithSessionKey: balances and marktes");
                deferred.resolve({
                    sessionKey:sessionKey,
                    user:user,
                    balances: balances,
                    markets:markets
                });
            })
        })
        .fail(function(error){
            if(error.name !== "OtpRequired"){
                me._sessionKey = undefined;
            }
            
            deferred.reject(error);
        })
        return deferred.promise;
    }
    
    this.loginWithUserKey = function(email, userKey) {
        var deferred = Q.defer();
        var me = this;
        this.sessionCreate(email)
        .then(function(response){
            var sessionId = response.id;
            var sessionKey = keyFromUserKey(sessionId, userKey);
            me.loginWithSessionKey(sessionKey)
            .then(function(result){
                deferred.resolve(result);
            }).fail(function(error){
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
    
    function getCallbackId() {
        _currentCallbackId += 1;
        if(_currentCallbackId > 10000) {
            _currentCallbackId = 0;
        }
        return _currentCallbackId;
    }

    function onMessage(message) {
        //console.log("onMessage", JSON.stringify(message));
        if(message.error){
            try {
                _ee.emit('error', message.error);
            } catch(e){
                //console.error("error event not handled for message ", message)
            }
        }
        
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