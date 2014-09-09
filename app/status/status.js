var StatusView = function(){
    $(".ws-status").hide();
    $(".ws-status-connecting").show();
    
    this.renderConnected = function(){
        $(".ws-status").hide();
        $(".ws-status-connected").show();
    }

    this.renderError = function(){
        $(".ws-status").hide();
        $(".ws-status-error").show();
    }
}

var StatusController = function(){
    this.view = new StatusView();
}

module.exports = StatusController