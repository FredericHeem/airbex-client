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

var DepthController = function(){
    this.view = new DepthView();
    this.model = {}
    
    this.setModel = function (depth){
        this.model = depth;
        this.view.render(depth);
    }
}

module.exports = DepthController;