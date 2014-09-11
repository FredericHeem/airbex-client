var template = require('./settings.html')

var webSocketUrlDefault = "http://localhost:5071";


var SettingsView = function(){
    var $el = $('#settings').html(template())
    var $form = $el.find("#form-settings");
    var $apiKey = $form.find('.form-group.apikey');
    var $webSocketUrl = $form.find('.form-group.webSocketUrl');
    
    this.onSubmit = function(cb){
        $form.on('submit', cb);
    }
    
    this.render = function(model){
        $apiKey.find('input').val(model.apiKey);
        $webSocketUrl.find('input').val(model.webSocketUrl);
    }
    
    this.getModel = function(){
        var apiKey = $apiKey.find('input').val();
        var webSocketUrl = $webSocketUrl.find('input').val();
        return {apiKey: apiKey, webSocketUrl: webSocketUrl}
    }
}

var SettingsController = function(eventEmitter){
    var model = {};
    var view = new SettingsView();
    var me = this;
    
    this.retrieveSettings = function (){
        var apiKey = localStorage.getItem("apikey");
        
        var webSocketUrl = localStorage.getItem("webSocketUrl");
        if(webSocketUrl === undefined || webSocketUrl === '' || webSocketUrl === null){
            webSocketUrl = webSocketUrlDefault; 
        }
        var settings = {apiKey: apiKey, webSocketUrl:webSocketUrl}
        view.render(settings);
        eventEmitter.emit("settings", settings);
    }
    
    this.saveSettings = function (model){
        localStorage.setItem("apikey", model.apiKey);
        if(model.webSocketUrl === ''){
            model.webSocketUrl = webSocketUrlDefault;
        }
        localStorage.setItem("webSocketUrl", model.webSocketUrl);
    }
    
    view.onSubmit(function(e) {
        model = view.getModel();
        me.saveSettings(model);
        eventEmitter.emit("settings", model);
        e.preventDefault()
    })
};

module.exports = SettingsController