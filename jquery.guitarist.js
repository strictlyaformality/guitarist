(function($){
    var options = {
        includeSelector: 'input,select,textarea,a,[tabindex]',
        excludeSelector: '[disabled], [disabled] *',
        nestedFilter: '',
        entryIndex: 0,
        lockContainer: true,
        tabAttribute: 'data-guitarist-index',
        containerAttribute: 'data-guitarist-container'
    };

    //Helper functions
    
    //get the tabbable elements for the given context
    function getElements(context){
        return $(context)
                .find(options.includeSelector)
                .not(options.excludeSelector)
                .not(getNestedContextFilter(context, options.includeSelector));
    }

    //get a filter for nested contexts
    function getNestedContextFilter(context, selector){
        var filter = `${options.nestedFilter} ${selector}`;
        return $(context).find(filter);
    }

    //get containers that define context
    function getContainers(){
        return $(`[${options.containerAttribute}]`);
    }

    //add tab attribute and listener to an element
    function setupElement(index, el, maxIndex, maxContainerIndex, context){
        $(el)
            .attr(options.tabAttribute, index)
            .on('keydown.guitarist', function(e){
                getTabHandler(maxIndex, context)(e);
                getContainerNavHandler(maxContainerIndex)(e);
                contextLockHandler(e);
            });
    }

    //remove the listener from the tabbable elements
    function removeListeners(context){
        $(context).find(`[${options.tabAttribute}]`).off('keydown.guitarist');
    }

    //set up all of the elements in the context
    function setupElements(context, maxContainerIndex){
        var $elements = getElements(context),
            maxIndex = $elements.length;
        $elements.each(function(index, el){
            setupElement(index, el, maxIndex, maxContainerIndex, context);
        });
    }

    //get the index of the next element to focus (cyclically)
    function getNextIndex(current, increment, max){
        return (max + current + increment) % max;
    }

    //get the next item (by index)
    function getNext(current, increment, max, context, attr){
        var nextIndex = getNextIndex(current, increment, max), 
            selector = `[${attr}=${nextIndex}]`;
        return $(context).find(selector);
    }

    //get the next element to focus
    function getNextElement(current, increment, max, context){
        var attr = options.tabAttribute, 
            filter = getNestedContextFilter(context, `[${attr}]`)
        return getNext(current, increment, max, context, attr)
                .not(filter);
    }

    //get the next container to enter
    function getNextContainer(current, increment, max){
        return getNext(current, increment, max, document, options.containerAttribute);
    }

    //set focus to the entry element
    function setInitialFocus(context){
        var selector = `[${options.tabAttribute}=${options.entryIndex}]`;
        $(context)
            .find(selector)
            .not(getNestedContextFilter(context, selector))
            .focus();
    }

    //set up the container
    function setupContainer(context){
        var selector = `[${options.containerAttribute}]`;
        $(context).attr(options.containerAttribute, getContainers().length);
    }

    //Event Handlers
    
    //close event handler over the max index in the context
    function getTabHandler(maxIndex, context){
        return function(e){
            var tab = e.which === 9,
                increment = 0,
                $target = $(e.target),
                currentIndex = +$target.attr(options.tabAttribute);

            if(tab && options.lockContainer){
                e.preventDefault();
                increment = e.shiftKey ? -1 : 1;
                getNextElement(currentIndex, increment, maxIndex, context).focus();
            }
        };
    }

    //close event handler over the max index for containers
    function getContainerNavHandler(maxIndex){
        var map = {
            39: 1, //right
            37: -1 //left
        };
        return function(e){
            var increment = map[e.which],
                attr = options.containerAttribute,
                $target = $(e.target),
                $container = $target.parents(`[${attr}]`).first(),
                currentIndex = +$container.attr(attr);

            if(increment && e.ctrlKey){
                var next = getNextContainer(currentIndex, increment, maxIndex);
                setInitialFocus(next);
            }            
        };
    }

    //event listener for (un)locking the context to the container 
    function contextLockHandler(e){
        var map = {
            38: false, //up
            40: true  //down
        },
        toggle = map[e.which];

        if (toggle !== undefined) {
            options.lockContainer = toggle;
        }
    }
    

    //Public Methods
    var methods = {
        //initialize the guitarist
        init: function(opts){
            var maxContainerIndex = this.length;
            this.each(function(index, el){
                $.extend(options, opts);
                setupContainer(el);
                setupElements(el, maxContainerIndex);
            });
        },
        //refresh the guitarist (with delicious cocktails pls)
        refresh: function(){
            this.each(function(index, el){
                removeListeners();
                $(el).guitarist();
            });
        }
    };

    $.fn.guitarist = function(method){
        var params = Array.prototype.splice.call(arguments, 1);
        if(!method || $.isPlainObject(method)){
            params = [method];
            method = 'init';
        }

        try {
            return methods[method].apply(this, params);
        } catch(e) {
            $.error(e);
        }
    };
})(window.jQuery);