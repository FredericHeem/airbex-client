var template = require('./balances.html')

var BalancesView = function(){
    var $el = $('#balances').html(template())
    var $alertBalances = $el.find("#alert-balances");
    var $balances_tbody = $el.find(".balances-tbody");
    
    this.render = function (balances, error) {
        $balances_tbody.empty();

        if(balances){
            $alertBalances.hide()
            $.each(balances, function(i, balance) {
                $('<tr>').append(
                        $('<td>').text(balance.currency),
                        $('<td>').text(balance.balance),
                        $('<td>').text(balance.hold),
                        $('<td>').text(balance.available)
                ).appendTo($balances_tbody);
            });
        } else {
            $alertBalances.html("Error: " + error.name)
            $alertBalances.show()
        }
    }
};

var BalancesController = function(){
    this.view = new BalancesView();
    this.model = {}
    
    this.setModel = function (balances){
        this.model = balances;
        this.view.render(balances);
    }
}

module.exports = BalancesController;