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

var CurrenciesController = function(){
    this.view = new CurrenciesView();
    this.model = {}
    
    this.setModel = function (currencies){
        this.model = currencies;
        this.view.render(currencies);
    }
}

module.exports = CurrenciesController;