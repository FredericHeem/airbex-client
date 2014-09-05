/*global describe, it, before, after*/
var assert = require('assert');
var request = require('supertest');
var async = require('async');
var config = require('./configTest.js')();
var debug = require('debug')('WebSocket');
var Airbex = require('../lib/Airbex');

describe('WebSocket', function () {
    "use strict";
    
    var apiws = new Airbex.WebSocketClient({url:config.url});

    describe('WebSocketKo', function () {
        it('ConnectKo', function (done) {
            var apiwsKo = new Airbex.WebSocketClient({url:"http://localhost:1234"});
            apiwsKo.start().fail(done);
        });
    });
    
    describe('WebSocketOk', function () {
        before(function(done) {
            debug("before")
            apiws.start().then(done);
        });
        it('MarketsOk', function (done) {
            apiws.getMarkets()
           .done(function(markets){
               assert(markets)
               done()
           });
        });
        it('CurrenciesOk', function (done) {
            apiws.getCurrencies()
           .done(function(currencies){
               assert(currencies)
               done()
           });
        });
        it('BalanceNotAuthenticated', function (done) {
            apiws.getBalances()
           .fail(function(error){
               assert(error)
               assert.equal(error.name, "NotAuthenticated")
               done();
           })
        });
    });
    
   
});
