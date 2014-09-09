'use strict';

var View = function(){
    $('body').scrollspy({
        target: '.bs-docs-sidebar',
        offset: 60
    }); 
}
module.exports = View