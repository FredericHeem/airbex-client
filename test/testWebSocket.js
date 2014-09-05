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
    
    describe('WebSocketOk', function () {
        before(function(done) {
            debug("before")
            apiws.start();
            done();
        });
        it('MarketsOk', function (done) {
            apiws.getMarkets()
           .done(function(markets){
               assert(markets)
               done()
           });
        });
    });
    
   
});
