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

var DepthController = function(){
    this.view = new DepthView();
    this.model = {}
    
    this.setModel = function (depth){
        this.model = depth;
        this.view.render(depth);
    }
}

module.exports = DepthController;