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

var BalancesController = function(){
    this.view = new BalancesView();
    this.model = {}
    
    this.setModel = function (balances){
        this.model = balances;
        this.view.render(balances);
    }
}

module.exports = BalancesController;