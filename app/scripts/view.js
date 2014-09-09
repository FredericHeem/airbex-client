'use strict';

$('body').scrollspy({
    target: '.bs-docs-sidebar',
    offset: 60
});

var StatusView = function(){
    $(".ws-status").hide();
    $(".ws-status-connecting").show();
    
    this.renderConnected = function(){
        $(".ws-status").hide();
        $(".ws-status-connected").show();
    }

    this.renderError = function(){
        $(".ws-status").hide();
        $(".ws-status-error").show();
    }
}

var SettingsView = function(){
    
    this.$form = $("#settings");
    this.$apiKey = this.$form.find('.form-group.apikey');
    this.$webSocketUrl = this.$form.find('.form-group.webSocketUrl');
    
    this.render = function(model){
        this.$apiKey.find('input').val(model.apiKey);
        this.$webSocketUrl.find('input').val(model.webSocketUrl);
    }
    
    this.getModel = function(){
        var apiKey = this.$apiKey.find('input').val();
        var webSocketUrl = this.$webSocketUrl.find('input').val();
        return {apiKey: apiKey, webSocketUrl: webSocketUrl}
    }
}

/// Market Summary View
var MarketSummaryView = function(){
    this.render = function (markets) {
        $(".markets-tbody").empty();
        if(markets){

            $("#alert-markets").hide()
            $.each(markets, function(i, market) {

                $('<li>').append(
                        $('<a>').text(market.id).attr('href', '#sec-market-' + market.id)

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
};



//Currencies View
var CurrenciesView = function(){
    this.render = function (currencies) {
        $(".currencies-tbody").empty();

        if(currencies){
            $.each(currencies, function(i, currency) {
                $('<tr>').append(
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
};

//Balances View
var BalancesView = function(){
    this.$alertBalances = $("#alert-balances");
    
    this.render = function (balances, error) {
        $(".balances-tbody").empty();

        if(balances){
            this.$alertBalances.hide()
            $.each(balances, function(i, balance) {
                $('<tr>').append(
                        $('<td>').text(balance.currency),
                        $('<td>').text(balance.balance),
                        $('<td>').text(balance.hold),
                        $('<td>').text(balance.available)
                ).appendTo($(".balances-tbody"));
            });
        } else {
            this.$alertBalances.html("Error: " + error.name)
            this.$alertBalances.show()
        }
    }
};



//Market Depth View
var DepthView = function(){
    this.$orderBookContainer = $("#order-book-container-template");
    
    this.render = function (depth) {
        if(depth){
            var marketId = depth.marketId;
            var orderBookSelector = "order-book-container-" + marketId
            var $orderBook = $("#" + orderBookSelector);
            if($orderBook.size() === 0){

                $orderBook = this.$orderBookContainer.clone();
                $orderBook.attr('id', orderBookSelector);
                $orderBook.insertBefore(this.$orderBookContainer);
            }
            $orderBook.find(".market-id").text(marketId).parent().parent().attr('id', 'sec-market-' + marketId);

            if(depth.bids){
                $.each(depth.bids, function(i, bid) {
                    $('<tr>').append(
                            $('<td>').text(bid[0]),
                            $('<td>').text(bid[1]))
                            .appendTo($orderBook.find(".bids-tbody"));
                });
            }
            if(depth.asks){
                $.each(depth.asks, function(i, ask) {
                    $('<tr>').append(
                            $('<td>').text(ask[0]),
                            $('<td>').text(ask[1]))
                            .appendTo($orderBook.find(".asks-tbody"));
                });
            }

            $('body').scrollspy('refresh'); 

        } else {
        }
    };
};

//View container
var View = 
{
        settings: new SettingsView(),
        status: new StatusView(),
        marketSummary: new MarketSummaryView(),
        currencies: new CurrenciesView(),
        balances: new BalancesView(),
        depth: new DepthView()
};

