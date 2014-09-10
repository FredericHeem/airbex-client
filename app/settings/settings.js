var template = require('./settings.html')

var SettingsView = function(){
    this.$el = $('#settings').html(template())
    this.$form = this.$el.find("#form-settings");
    this.$apiKey = this.$form.find('.form-group.apikey');
    this.$webSocketUrl = this.$form.find('.form-group.webSocketUrl');
    
    this.render = function(model){
        this.$apiKey.find('input').val(model.apiKey);
        this.$webSocketUrl.find('input').val(model.webSocketUrl);
    }
    
    this.getModel = function(){
        var apiKey = this.$apiKey.find('input').val();
        var webSocketUrl = this.$webSocketUrl.find('input').val();
        return {apiKey: apiKey, webSocketUrl: webSocketUrl}
    }
}

var SettingsController = function(eventEmitter){
    var model = {};
    var view = new SettingsView();
    
    this.getModel = function(){
        return model;
    }
    
    this.retrieveSettings = function (){
        var apiKey = localStorage.getItem("apikey");
        
        var webSocketUrl = localStorage.getItem("webSocketUrl");
        if(webSocketUrl === undefined){
            webSocketUrl = app.websocketUrl; 
        }
        return {apiKey: apiKey, webSocketUrl:webSocketUrl}
    }
    
    this.saveSettings = function (model){
        localStorage.setItem("apikey", model.apiKey);
        localStorage.setItem("webSocketUrl", model.webSocketUrl);
    }
    
    model = this.retrieveSettings();
    view.render(model);
    
    view.$form.on('submit', function(e) {
        model = view.getModel();
        this.saveSettings(model);
        
        e.preventDefault()
    })
};

module.exports = SettingsController