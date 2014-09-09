var SettingsView = function(){
    
    this.$form = $("#settings");
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

var SettingsController = function(){
    console.log("SettingsController");
    this.view = new SettingsView();
    this.model = {}
    
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
    
    this.model = this.retrieveSettings();
    this.view.render(this.model);
    
    this.view.$form.on('submit', function(e) {
        var model = this.view.getModel();
        this.saveSettings(model);
        
        e.preventDefault()
    })
};

module.exports = SettingsController