var template = require('./depth.html')
var rowTemplate = require('./row.html')
var DepthView = function(){
    
    var $el = $('#order-book-container-template')
    
    this.render = function (depth) {
        if(depth){
            var marketId = depth.marketId;
            var orderBookSelector = "order-book-container-" + marketId
            var $orderBook = $("#" + orderBookSelector);
            if($orderBook.size() === 0){
                $orderBook = $(template({marketId:marketId}))
                $orderBook.insertBefore($el);
            }

            if(depth.bids){
                $orderBook.find(".bids-tbody").html($.map(depth.bids, function(bid) {
                    return rowTemplate({
                        price: bid[0],
                        volume: bid[1]
                    })
                }))
            }
            if(depth.asks){
                $orderBook.find(".asks-tbody").html($.map(depth.asks, function(ask) {
                    return rowTemplate({
                        price: ask[0],
                        volume: ask[1]
                    })
                }))
            }

            $('body').scrollspy('refresh'); 

        } else {
        }
    };
};

var DepthController = function(app, eventEmitter){
    
    var view = new DepthView();
    var model = {}
    var me = this;
    
    eventEmitter.addListener('markets', onMarkets.bind(this));
    
    function onMarkets(markets){
        console.log("DepthController onMarkets ");
        $.each(markets, function(i, market){
            app.getApi().getDepth(market.id)
            .done(function(depth){
                me.setModel(depth);
            })
        })
    }
    
    this.setModel = function (depth){
        model[depth.id] = depth;
        view.render(depth);
    }
}

module.exports = DepthController;