/*global describe, it, before, after*/
var assert = require('assert');
var request = require('supertest');
var async = require('async');
var _ = require('underscore');
var config = require('./configTest.js')();
var debug = require('debug')('WebSocket');
var Airbex = require('../lib/Airbex');


describe('WebSocket', function () {
    "use strict";

    describe('WebSocketKo', function () {
        it('ConnectKo', function (done) {
            var apiwsKo = new Airbex.WebSocketClient({url:"http://localhost:1234"});
            apiwsKo.start().fail(done);
        });
    });
    
    describe('WebSocketPublic', function () {
        var apiws = new Airbex.WebSocketClient({url:config.url});
        before(function(done) {
            apiws.start().done(done);
        });
        after(function(done) {
            apiws.stop();
            done();
        });
        it('MarketsPublicOk', function (done) {
            apiws.getMarkets()
            .done(function(markets){
                assert(markets)
                done()
            });
        });
        it('DepthPublicOk', function (done) {
            apiws.getMarkets()
           .done(function(markets){
               _.each(markets, function(market, index){
                   apiws.getDepth(market.id).done(function(){
                       if((index + 1) == markets.length){
                           done()
                       }
                   })
               })
           });
        });
        it('CurrenciesPublicOk', function (done) {
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
    describe('WebSocketAuthenticated', function () {
        var apiws = new Airbex.WebSocketClient({
            url:config.url,
            apiKey:config.apiKey
        });
        before(function(done) {
            this.timeout(30e3);
            apiws.start()
            .fail(function(){
                assert(false);
            })
            .done(function(){
                done();
            })
        });
        it('MarketsAuthenticatedOk', function (done) {
            apiws.getMarkets()
           .done(function(markets){
               assert(markets)
               done()
           });
        });
        it('CurrenciesAuthenticatedOk', function (done) {
            apiws.getCurrencies()
           .done(function(currencies){
               assert(currencies)
               done()
           });
        });
        it('BalanceAuthenticatedOk', function (done) {
            apiws.getBalances()
           .done(function(balances){
               assert(balances)
               done();
           })
        });
    });
});
