var template = require('./markets.html')

var MarketsView = function(){
    
    var $el = $('#markets').html(template())
    var $markets_tbody = $el.find(".markets-tbody");
    
    this.render = function (markets) {
        $markets_tbody.empty();
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
                ).appendTo($markets_tbody);
            });
        } else {
        }
    }
};

var MarketsController = function(app, eventEmitter){
    var view = new MarketsView();
    var model = {}
    var me = this;
    eventEmitter.addListener('connected', onConnected.bind(this));
    
    function onConnected(){
        console.log("MarketsController onConnected");
        app.getApi().getMarkets()
        .then(function(markets){
            me.setModel(markets);
            eventEmitter.emit('markets', markets)
        });
    }
    
    this.setModel = function (markets){
        model = markets;
        view.render(markets);
    }
}

module.exports = MarketsController;