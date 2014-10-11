/*global describe, it, before, after*/
var assert = require('assert');
var request = require('supertest');
var async = require('async');
var _ = require('underscore');
var config = require('./configTest.js')();
var debug = require('debug')('testRest');
var Airbex = require('../lib/Airbex');

describe('Rest', function () {
    "use strict";
    
    describe('RestKo', function () {
        it('MissingUrlBase', function (done) {
            try {
                var apirestko = new Airbex.RestClient({});
            } catch(e){
                assert(e);
                done();
            }
        });
        it('ApiKeyKo', function (done) {
            var apirestko = new Airbex.RestClient({
                urlBaseRest:config.urlBaseRest,
                apiKey:"1234567890"
            });
            apirestko.getBalances()
            .fail(function(err){
                assert(err)
                assert.equal(err.name, "ApiKeyNotFound");
                done()
            })
            .fail(done)
        });
        it('ApiKeyMissing', function (done) {
            var apirestko = new Airbex.RestClient({
                urlBaseRest:config.urlBaseRest
            });
            apirestko.getBalances()
            .fail(function(err){
                assert(err)
                assert.equal(err.name, "NotAuthenticated");
                done()
            })
            .fail(done)
        });
    });
    
    describe('RestPublic', function () {
        var apirest = new Airbex.RestClient({urlBaseRest:config.urlBaseRest});

        it('RestMarketsPublicOk', function (done) {
            apirest.getMarkets()
            .then(function(markets){
                assert(markets)
                done()
            });
        });
        it('RestCurrenciesPublicOk', function (done) {
            apirest.getCurrencies()
            .then(function(currencies){
                assert(currencies)
                done()
            });
        });
    });
    describe('RestApiKey', function () {
        var apirest = new Airbex.RestClient(config);
        it('RestMarketsAuthOk', function (done) {
            apirest.getMarkets()
            .then(function(markets){
                assert(markets)
                done()
            })
            .fail(done);
        });
        it('RestCurrenciesAuthOk', function (done) {
            apirest.getCurrencies()
            .then(function(currencies){
                assert(currencies)
                done()
            })
            .fail(done);
        });
        it('RestWhoamiAuthOk', function (done) {
            apirest.getWhoami()
            .then(function(user){
                assert(user)
                done()
            })
            .fail(done);
        });
        it('RestBalancesAuthOk', function (done) {
            apirest.getBalances()
            .then(function(balances){
                assert(balances)
                done()
            })
            .fail(done);
        });
        it('RestActivitiesAuthOk', function (done) {
            apirest.getActivities()
            .then(function(activities){
                assert(activities)
                done()
            })
            .fail(done);
        });
        it('RestOrdersAuthOk', function (done) {
            apirest.getOrders()
            .then(function(orders){
                assert(orders)
                done()
            })
            .fail(done);
        });
    });
    
});
