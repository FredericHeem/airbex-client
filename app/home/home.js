'use strict';

var HomeView = function(){
    $('body').scrollspy({
        target: '.bs-docs-sidebar',
        offset: 60
    }); 
}

module.exports = HomeView