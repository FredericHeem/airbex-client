var template = require('./currencies.html')

var CurrenciesView = function(){
    var $el = $('#currencies').html(template())
    var $currencies_tbody = $el.find(".currencies-tbody");
    
    this.render = function (currencies) {
        $currencies_tbody.empty();

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
                ).appendTo($currencies_tbody);
            });
        } else {
        }
    }
};

var CurrenciesController = function(app, eventEmitter){
    this.view = new CurrenciesView();
    this.model = {}
    var me = this;
    eventEmitter.addListener('connected', onConnected.bind(this));
    
    function onConnected(){
        console.log("CurrenciesController onConnected");
        app.getApi().getCurrencies()
        .then(function(currencies){
            me.setModel(currencies);
        });
    }
    
    this.setModel = function (currencies){
        this.model = currencies;
        this.view.render(currencies);
    }
}

module.exports = CurrenciesController;