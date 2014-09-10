var template = require('./sidebar.html')

var SidebarView = function(){
    var $el = $('#sidebar-nav').html(template())
    var $market_submenu = $(".market-submenu");
    this.renderMarket = function (markets) {
        $market_submenu.empty();
        
        $.each(markets, function(i, market) {
            $('<li>').append(
                    $('<a>').text(market.id).attr('href', '#sec-market-' + market.id)
            ).appendTo( $market_submenu );
        });
    }
};

var SidebarController = function(app, eventEmitter){
    var view = new SidebarView();
    
    eventEmitter.addListener('markets', onMarkets.bind(this));
    
    function onMarkets(markets){
        console.log("SidebarController onMarkets");
        view.renderMarket(markets)
    }
}

module.exports = SidebarController;