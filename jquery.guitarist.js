(function($){
    var options = {
        includeSelector: 'input,select,textarea,a,[tabindex]',
        excludeSelector: ':not([disabled], [disabled] *)',
        tabAttribute: 'data-guitarist-index'
    };

    //Helper functions
    
    //get the tabbable elements for the given context
    function getElements(context){
        return $(context)
                .find(options.includeSelector)
                .filter(options.excludeSelector);
    }

    //add tab attribute and listener to an element
    function setupElement(index, el, maxIndex){
        $(el)
            .attr(options.tabAttribute, index)
            .on('keydown.guitarist', getTabListener(maxIndex));
    }

    function removeListeners(){
        $(`[${options.tabAttribute}]`).off('keydown.guitarist');
    }

    //set up all of the elements in the context
    function setupElements(context){
        var $elements = getElements(context),
            maxIndex = $elements.length;
        $elements.each(function(index, el){
            setupElement(index, el, maxIndex);
        });
    }

    //close event listener over the max index in the context
    function getTabListener(maxIndex){
        return function(e){
            var tab = e.which === 9,
                increment = 0,
                $target = $(e.target),
                currentIndex = +$target.attr(options.tabAttribute);

            if(tab){
                e.preventDefault();
                increment = e.shiftKey ? -1 : 1;
                getNextElement(currentIndex, increment, maxIndex).focus();
            }
        };
    }

    //get the index of the next element to focus (cyclically)
    function getNextIndex(current, increment, max){
        return (max + current + increment) % max;
    }

    //get the next element to focus
    function getNextElement(current, increment, max){
        var nextIndex = getNextIndex(current, increment, max) 
        var selector = `[${options.tabAttribute}=${nextIndex}]`;
        return $(selector);
    }

    //Public Methods
    var methods = {
        init: function(opts){
            $.extend(options, opts);
            setupElements(this);
        },
        refresh: function(opts){
            $.extend(options, opts);
            removeListeners();
            setupElement(this);
        }
    };

    $.fn.guitarist = function(method){
        var params = Array.prototype.splice.call(arguments, 1);
        if(!method || $.isPlainObject(method)){
            params = method;
            method = 'init';
        }

        try {
            return methods[method].apply(this, params);
        } catch(e) {
            $.error(e);
        }
    };
})(window.jQuery);