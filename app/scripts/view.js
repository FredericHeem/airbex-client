'use strict';

$('body').scrollspy({
    target: '#sidebar',
    offset: 40
});

/// Market Summary View
var MarketSummaryView = {};

MarketSummaryView.render = function (markets) {
    $(".markets-tbody").empty();
    if(markets){

        $("#alert-markets").hide()
        $.each(markets, function(i, market) {
            //<li><a href="#secMarket-BTCEUR">BTCEUR</a></li>
            
            $('<li>').append(
                    $('<a>').text(market.id)
                    
            ).appendTo($(".market-submenu"));
            
            $('<tr>').append(
                    $('<td>').text(market.id),
                    $('<td>').text(market.bid || 'N/A'),
                    $('<td>').text(market.ask || 'N/A'),
                    $('<td>').text(market.high || 'N/A'),
                    $('<td>').text(market.low || 'N/A'),
                    $('<td>').text(market.volume || 'N/A'),
                    $('<td>').text(market.last || 'N/A')
            ).appendTo($(".markets-tbody"));
        });
    } else {

    }
}

// Currencies View
var CurrenciesView = {};

CurrenciesView.render = function (currencies) {
    $(".currencies-tbody").empty();
    
    if(currencies){
        $.each(currencies, function(i, currency) {
            var $tr = $('<tr>').append(
                    $('<td>').text(currency.name),
                    $('<td>').text(currency.id),
                    $('<td>').text(currency.fiat),
                    $('<td>').text(currency.scale),
                    $('<td>').text(currency.scale_display),
                    $('<td>').text(currency.withdraw_min),
                    $('<td>').text(currency.withdraw_max),
                    $('<td>').text(currency.withdraw_fee)
            ).appendTo($(".currencies-tbody"));
        });
    } else {
    }
}

// Balances View
var BalancesView = {};
BalancesView.init = function(){
    this.$alertBalances = $("#alert-balances");
}

BalancesView.render = function (balances, error) {
    $(".balances-tbody").empty();
    
    if(balances){
        BalancesView.$alertBalances.hide()
        $.each(balances, function(i, currency) {
            $('<tr>').append(
                    $('<td>').text(currency.name),
                    $('<td>').text(currency.id),
                    $('<td>').text(currency.fiat),
                    $('<td>').text(currency.scale),
                    $('<td>').text(currency.scale_display),
                    $('<td>').text(currency.withdraw_min),
                    $('<td>').text(currency.withdraw_max),
                    $('<td>').text(currency.withdraw_fee)
            ).appendTo($(".balances-tbody"));
        });
    } else {
        BalancesView.$alertBalances.html("Error: " + error.name)
        BalancesView.$alertBalances.show()
    }
}

// Market Depth View
var DepthView = {};

DepthView.init = function(){
    this.$orderBookContainer = $("#order-book-container-template");
}

DepthView.render = function (depth) {
    if(depth){
        var marketId = depth.marketId;
        var orderBookSelector = "order-book-container-" + marketId
        var $orderBook = $("#" + orderBookSelector);
        if($orderBook.size() == 0){
            
            $orderBook = DepthView.$orderBookContainer.clone();
            $orderBook.attr('id', orderBookSelector);
            $orderBook.insertAfter(DepthView.$orderBookContainer);
        }
        $orderBook.find(".market-id").text(marketId);
        
        if(depth.bids){
            $.each(depth.bids, function(i, bid) {
                var $tr = $('<tr>').append(
                        $('<td>').text(bid[0]),
                        $('<td>').text(bid[1]))
                .appendTo($orderBook.find(".bids-tbody"));
            });
        }
        if(depth.asks){
            $.each(depth.asks, function(i, ask) {
                var $tr = $('<tr>').append(
                        $('<td>').text(ask[0]),
                        $('<td>').text(ask[1]))
                .appendTo($orderBook.find(".asks-tbody"));
            });
        }
    } else {
    }
}

// View container
var View = 
{
        marketSummary: MarketSummaryView,
        currencies: CurrenciesView,
        balances: BalancesView,
        depth: DepthView
}

View.init = function(){
    View.balances.init();
    View.depth.init();
}
