var StatusView = function(){
    $(".ws-status").hide();
    $(".ws-status-connecting").show();

    this.render = function(model){
        var state = model.state;
        if(state === 'connected'){
            renderConnected();
        } else {
            renderError();
        }
    }
    
    function renderConnected(){
        $(".ws-status").hide();
        $(".ws-status-connected").show();
    }

    function renderError(){
        $(".ws-status").hide();
        $(".ws-status-error").show();
    }
}

var StatusController = function(eventEmitter){
    this.view = new StatusView();
    this.model = {};
    
    eventEmitter.addListener('connected', onConnected.bind(this));
    
    function onConnected(){
        this.setModel({state:"connected"});
    }
    
    this.setModel = function(model){
        this.model = model;
        this.view.render(model);
    }
}

module.exports = StatusController