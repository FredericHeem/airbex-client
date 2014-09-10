var template = require('./balances.html')

var BalancesView = function(){
    var $el = $('#balances').html(template())
    var $alertBalances = $el.find("#alert-balances");
    var $balances_tbody = $el.find(".balances-tbody");
    
    this.renderError = function(error){
        $balances_tbody.empty();
        $alertBalances.html("Error: " + error.message)
        $alertBalances.show()
    }
    this.render = function (balances) {
        $balances_tbody.empty();
        $alertBalances.hide()
        $.each(balances, function(i, balance) {
            $('<tr>').append(
                    $('<td>').text(balance.currency),
                    $('<td>').text(balance.balance),
                    $('<td>').text(balance.hold),
                    $('<td>').text(balance.available)
            ).appendTo($balances_tbody);
        });
    }
};

var BalancesController = function(app, eventEmitter){
    var view = new BalancesView();
    var model = {}
    var me = this;
    eventEmitter.addListener('connected', onConnected.bind(this));
    
    function onConnected(){
        console.log("BalancesController onConnected");
        app.getApi().getBalances()
        .then(function(balances){
            me.setModel(balances);
        })
        .fail(function(error){
            view.renderError(error);
        })
    }
    
    this.setModel = function (balances){
        model = balances;
        view.render(balances);
    }
}

module.exports = BalancesController;