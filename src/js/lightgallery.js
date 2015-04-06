;
(function ($, window, document, undefined) {
    'use strict';
    var defaults = {
        mode: 'slide',
        useCSS: true,
        cssEasing: 'ease', //'cubic-bezier(0.25, 0, 0.25, 1)',//
        easing: 'linear', //'for jquery animation',//
        speed: 600,
        height: '100%',
        width: '100%',
        addClass: '',


        closable: true,
        loop: false,
        auto: false,
        pause: 4000,
        escKey: true,
        keyPress: true,
        controls: true,
        slideEndAnimatoin: true,
        hideControlOnEnd: false,

        appendSubHtml: '.lGallerySubHtml', // .lGalleryItem

        preload: 1, //number of preload slides. will exicute only after the current slide is fully loaded. ex:// you clicked on 4th image and if preload = 1 then 3rd slide and 5th slide will be loaded in the background after the 4th slide is fully loaded.. if preload is 2 then 2nd 3rd 5th 6th slides will be preloaded.. ... ...
        showAfterLoad: true,
        selector: '',
        nextHtml: '',
        prevHtml: '',
        index: false, // 0, 1

        lang: {
            allPhotos: 'All photos'
        },
        counter: false,

        exThumbImage: false,
        thumbnail: true,
        showThumbByDefault: false,
        animateThumb: true,
        currentPagerPosition: 'middle',
        thumbWidth: 100,
        thumbMargin: 5,


        mobileSrc: false,
        mobileSrcMaxWidth: 640,
        swipeThreshold: 50,
        enableSwipe: true,
        enableDrag: true,

        vimeoColor: 'CCCCCC',
        videoAutoplay: true,
        videoMaxWidth: '855px',

        dynamic: false,
        dynamicEl: []
    };

    function Plugin(element, options) {

        /* global variables
            * this.el;         // Current plugin element
            * this.$el;        // Current jquery element
            * this.s;          // Plugin settings
            * this.modules;    // lightGallery modules
            * this.isTouch;    // To determine browser supports for touch events;
            * this.lGalleryOn; // false when lightgallery complete first slide;
            
            * this.$items;
            * this.$slide;
            * this.$outer;
        */
        this.el = element;
        this.$el = $(element);
        this.s = $.extend({}, defaults, options);
        this.modules = {};
        this.lGalleryOn = false;

        this.isTouch = ('ontouchstart' in document.documentElement);

        // DIsable hideControlOnEnd if sildeEndAnimation is true
        if (this.s.slideEndAnimatoin && this.s.mode === 'slide') {
            this.s.hideControlOnEnd = false;
        }


        this.$items = (this.s.dynamic) ? this.s.dynamicEl : (this.s.selector !== '') ? $(this.s.selector) : this.$el.children();
        this.$slide = '';
        this.$outer = '';

        this.init();
        return this;
    }

    Plugin.prototype.init = function () {

        var self = this;

        // s.preload should not be more than $item.length
        if (self.s.preload > self.$items.length) {
            self.s.preload = self.$items.length;
        }

        // if dynamic option is enabled execute immediately
        if (self.s.dynamic) {

            self.index = self.s.index || 0;

            // prevent accidental double execution
            if (!$('body').hasClass('lGalleryOn')) {
                setTimeout(function(){
                    self.build(self.index);
                    $('body').addClass('lGalleryOn');
                },200);
            }
        } else {
            self.$items.on('click.lGallery', function (e) {
                e.preventDefault();
                e.stopPropagation();

                self.index = self.s.index || self.$items.index(this);

                // prevent accidental double execution
                if (!$('body').hasClass('lGalleryOn')) {
                    self.build(self.index);
                    $('body').addClass('lGalleryOn');
                }
            });
        }

    };

    Plugin.prototype.build = function (index) {

        var self = this;
        
        this.structure();


        // module constructor 
        $.each($.fn.lightGallery.modules, function (key, value) {
            self.modules[key] = new $.fn.lightGallery.modules[key](self.el);
        });

        
        this.slide(index, false, false);

        if (this.$items.length > 1) {

            this.arrow();

            if (this.s.keyPress) {
                this.keyPress();
            }

            setTimeout(function () {
                self.enableDrag();
                self.enableSwipe();
            }, 50);

        }

        this.closeGallery();



    };

    Plugin.prototype.structure = function () {
        var list = '',
            controls = '',
            i = 0,
            subHtmlCont = '',
            template,
            self = this;

        // Create gallery items
        for (i = 0; i < this.$items.length; i++) {
            list += '<div class="lGalleryItem"></div>';
        }

        // Create controlls
        if (this.s.controls && this.$items.length > 1) {
            controls = '<div class="lGalleryActions">' +
                '<div class="lGalleryPrev">' + this.s.prevHtml + '</div>' +
                '<div class="lGalleryNext">' + this.s.nextHtml + '</div>' +
                '</div>';
        }

        if (this.s.appendSubHtml === '.lGallerySubHtml') {
            subHtmlCont = '<div class="lGallerySubHtml"></div>';
        }

        

        template = '<div class="lGalleryOuter ' + this.s.addClass + '">' +
            '<div class="lGallery" style="width:' + this.s.width + '; height:' + this.s.height + '">' +
            '<div class="lGalleryInner">' + list + '</div>' +
            '<div class="lGalleryToolbar">' +
            '<span class="lGalleryClose"></span>' +
            '</div>' +
            controls +
            subHtmlCont +
            '</div>' +
            '</div>';

        $('body').append(template);
        this.$outer = $('.lGalleryOuter');
        this.$slide = this.$outer.find('.lGalleryItem');

        self.setTop();
        $(window).on('resize.lGallery', function() {
            setTimeout(function(){
                self.setTop();
            },100)
        });

        // add class lGalleryCurrent to remove initial transition
        this.$slide.eq(this.index).addClass('lGalleryCurrent');


        // add Class for css suppport and transition mode
        if (this.doCss()) {
            this.$outer.addClass('lGalleryCSS3');
        } else {
            this.$outer.addClass('lGalleryCSS');
        }

        if (this.s.mode === 'slide') {
            this.$outer.addClass('lGallerySlide');
        } else {
            this.$outer.addClass('lGalleryFade');
        }

        if (this.s.enableDrag && this.$items.length > 1) {
            this.$outer.addClass('lGalleryGrab');
        }

        if (this.s.showAfterLoad) {
            this.$outer.addClass('lGalleryShowAfterLoad');
        }


        if (this.doCss()) {
            var $inner = this.$outer.find('.lGalleryInner');
            $inner.css('transition-timing-function', this.s.cssEasing);
            $inner.css('transition-duration', this.s.speed + 'ms');
        }

    };


    Plugin.prototype.setTop = function() {
        if (this.s.height !== '100%') {
            var wH = $(window).height(),
                top = (wH - parseInt(this.s.height, 10)) / 2,
                $lGallery = this.$outer.find('.lGallery');
            if (wH >= parseInt(this.s.height, 10)) {
                $lGallery.css('top', top + 'px');
            } else {
                $lGallery.css('top', '0px');
            }
        }
    };

    Plugin.prototype.doCss = function () {
        // check for css animation support
        var support = function () {
            var transition = ['transition', 'MozTransition', 'WebkitTransition', 'OTransition', 'msTransition', 'KhtmlTransition'];
            var root = document.documentElement;
            var i = 0;
            for (i = 0; i < transition.length; i++) {
                if (transition[i] in root.style) {
                    return true;
                }
            }
        };
        if (this.s.useCSS && support()) {
            return true;
        }
        return false;
    };

    Plugin.prototype.isVideo = function (src, index) {
        var youtube = src.match(/\/\/(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch\?v=|embed\/)?([a-z0-9self\-]+)/i);
        var vimeo = src.match(/\/\/(?:www\.)?vimeo.com\/([0-9a-z\-self]+)/i);
        var iframe = false;
        if (this.s.dynamic) {
            if (this.s.dynamicEl[index].iframe === 'true') {
                iframe = true;
            }
        } else {
            if (this.$items.eq(index).attr('data-iframe') === 'true') {
                iframe = true;
            }
        }
        if (youtube || vimeo || iframe) {
            return true;
        }
    };

    Plugin.prototype.addHtml = function (index) {
        // add sub-html into the slide
        var subHtml = null;
        if (this.s.dynamic) {
            subHtml = this.s.dynamicEl[index].subHtml;
        } else {
            subHtml = this.$items.eq(index).attr('data-subHtml');
        }
        if (typeof subHtml !== 'undefined' && subHtml !== null) {

            // get first letter of subhtml
            // if first letter starts with . or # get the html form the jQuery object
            var fL = subHtml.substring(0, 1);
            if (fL === '.' || fL === '#') {
                subHtml = $(subHtml).html();
            } else {
                subHtml = subHtml;
            }
        } else {
            subHtml = '';
        }
        if (this.s.appendSubHtml === '.lGallerySubHtml') {
            this.$outer.find(this.s.appendSubHtml).html(subHtml);
        } else {
            this.$slide.eq(index).append(subHtml);
        }
    };

    Plugin.prototype.preload = function (index) {
        var i = 0,
            j = 0;
        for (i = 0; i <= this.s.preload; i++) {
            if (i >= this.$items.length - index) {
                break;
            }
            this.loadContent(index + i, false);
        }
        for (j = 0; j <= this.s.preload; j++) {
            if (index - j < 0) {
                break;
            }
            this.loadContent(index - j, false);
        }
    };

    Plugin.prototype.loadContent = function (index, rec) {


        var src,
            self = this;
        if (self.s.dynamic) {
            src = self.s.dynamicEl[index].src;
        } else {
            src = self.$items.eq(index).attr('data-src');
        }


        if (typeof src !== 'undefined' && src !== '') {
            if (!self.isVideo(src, index)) {

                if (!self.$slide.eq(index).hasClass('lGalleryLoaded')) {
                    self.$slide.eq(index).prepend('<img class="lGalleryObject" src="' + src + '" />');
                    if (this.s.appendSubHtml !== '.lGallerySubHtml') {
                        self.addHtml(index);
                    }
                    self.$slide.eq(index).addClass('lGalleryLoaded');
                }

                self.$slide.eq(index).find('.lGalleryObject').on('load error', function () {
                    self.$slide.eq(index).addClass('lGalleryComplete');
                });

                if (rec === true) {
                    if (!self.$slide.eq(index).hasClass('lGalleryComplete')) {
                        self.$slide.eq(index).find('.lGalleryObject').on('load error', function () {
                            self.preload(index);
                        });
                    } else {
                        self.preload(index);
                    }
                }

            }
        }
    };


    /***

        ** Slide() gets call on start
        ** ** Set lGallery.on true once slide() function gets called.
        ** Call loadContent() on slide() function inside setTimeout
        ** ** On first slide we do not want any animation like slide of fade
        ** ** So on first slide( if lGallery.on if false that is first slide) loadContent() should start loading immediately
        ** ** Else loadContent() should wait for the transition to complete.
        ** ** So set timeout s.speed + 50 
    <=> ** loadContent() will load slide content in to the particular slide
        ** ** It has recursion (rec) parameter. if rec === true loadContent() will call preload() function.
        ** ** preload will execute only when the previous slide is fully loaded (images iframe)
        ** ** avoid simultaneous image load
    <=> ** Preload() will check for s.preload value and call loadContent() again accoring to preload value
        ** loadContent()  <====> Preload()


    */
    Plugin.prototype.slide = function (index, fromTouch, fromThumb) {
        var self = this,
            length = this.$slide.length,
            time = self.lGalleryOn ? this.s.speed : 0,
            next = false,
            prev = false,
            prevIndex = this.$outer.find('.lGalleryCurrent').index();

        this.$el.trigger('onBeforeSlide.lGallery');

        // Add title if this.s.appendSubHtml === lGallerySubHtml
        if (this.s.appendSubHtml === '.lGallerySubHtml') {
            // wait for slide animation to complete 
            setTimeout(function () {
                self.addHtml(index);
            }, time);
        }

        this.arrowDisable(index);

        if (!fromTouch) {
            // remove all transitions
            self.$outer.addClass('lGalleryNoTrans');
            this.$slide.removeClass('lGalleryPrevSlide lGalleryNextSlide');

            if (index < prevIndex) {
                prev = true;
                if ((index === 0) && (prevIndex === length -1) && !fromThumb) {
                    prev = false;
                    next = true;
                }
            }else if (index > prevIndex) {
                next = true;
                if ((index === length -1) && (prevIndex === 0) && !fromThumb) {
                    prev = true;
                    next = false;
                }
            };

            if (prev) {
                //prevslide
                this.$slide.eq(index).addClass('lGalleryPrevSlide');
                this.$slide.eq(prevIndex).addClass('lGalleryNextSlide');
            }else if (next) {
                // next slide
                this.$slide.eq(index).addClass('lGalleryNextSlide');
                this.$slide.eq(prevIndex).addClass('lGalleryPrevSlide');
            };

           // give 50 ms for browser to add/remove class
            setTimeout(function(){
                self.$slide.eq(prevIndex).removeClass('lGalleryCurrent');
                self.$slide.eq(index).addClass('lGalleryCurrent');

                // reset all transitions
                self.$outer.removeClass('lGalleryNoTrans');
            },50);
        }else{

            var touchPrev = index - 1,
                touchNext = index + 1;

            if ((index === 0) && (prevIndex === length -1)) {
                // next slide
                touchNext = 0;
                touchPrev = length -1;    
            }else if ((index === length -1) && (prevIndex === 0)) {
                // prev slide
                touchNext = 0;
                touchPrev = length -1;     
            };

            this.$slide.removeClass('lGalleryPrevSlide lGalleryCurrent lGalleryNextSlide');
            self.$slide.eq(touchPrev).addClass('lGalleryPrevSlide');
            self.$slide.eq(touchNext).addClass('lGalleryNextSlide');
            self.$slide.eq(index).addClass('lGalleryCurrent');
        }



        if (self.lGalleryOn) {
            setTimeout(function () {
                self.loadContent(index, true);
            }, this.s.speed + 50);
            if (!self.doCss()) {
                self.$slide.fadeOut(self.s.speed);
                self.$slide.eq(index).fadeIn(self.s.speed);
            };
        } else {
            self.loadContent(index, true);
            if (!self.doCss()) {
                self.$slide.fadeOut(50);
                self.$slide.eq(index).fadeIn(50);
            }
        }
        self.lGalleryOn = true;




    };

    Plugin.prototype.goToNextSlide = function (fromTouch) {
        var self = this;
        if ((self.index + 1) < self.$slide.length) {
            self.index++;
            self.slide(self.index, fromTouch, false);
        } else {
            if (self.s.loop) {
                self.index = 0;
                self.slide(self.index, fromTouch, false);
            } else if (self.s.slideEndAnimatoin && self.s.mode === 'slide') {
                self.$outer.addClass('lGalleryRightEnd');
                setTimeout(function () {
                    self.$outer.removeClass('lGalleryRightEnd');
                }, 400);
            }
        }
    };

    Plugin.prototype.goToPrevSlide = function (fromTouch) {
        var self = this;
        if (self.index > 0) {
            self.index--;
            self.slide(self.index, fromTouch, false);
        } else {
            if (self.s.loop) {
                self.index = self.$items.length - 1;
                self.slide(self.index, fromTouch, false);
            } else if (self.s.slideEndAnimatoin && self.s.mode === 'slide') {
                self.$outer.addClass('lGalleryLeftEnd');
                setTimeout(function () {
                    self.$outer.removeClass('lGalleryLeftEnd');
                }, 400);
            }
        }
    };


    Plugin.prototype.keyPress = function () {
        var self = this;
        $(window).on('keyup.lGallery', function (e) {
            if (self.$items.length > 1) {
                if (e.keyCode === 37) {
                    e.preventDefault();
                    self.goToPrevSlide();
                }
                if (e.keyCode === 39) {
                    e.preventDefault();
                    self.goToNextSlide();
                }
            }
        });
        $(window).on('keydown.lGallery', function (e) {
            if (self.s.escKey === true && e.keyCode === 27) {
                e.preventDefault();
                self.destroy();
            }
        });
    };

    Plugin.prototype.arrow = function () {
        var self = this;
        this.$outer.find('.lGalleryPrev').on('click.lGallery', function () {
            self.goToPrevSlide();
        });
        this.$outer.find('.lGalleryNext').on('click.lGallery', function () {
            self.goToNextSlide();
        });
    };

    Plugin.prototype.arrowDisable = function (index) {

        // Disable arrows if s.hideControlOnEnd is true
        if (!this.s.loop && this.s.hideControlOnEnd) {
            if ((index + 1) < this.$slide.length) {
                this.$outer.find('.lGalleryNext').removeAttr('disabled').removeClass('disabled');
            } else {
                this.$outer.find('.lGalleryNext').attr('disabled', 'disabled').addClass('disabled');
            }
            if (index > 0) {
                this.$outer.find('.lGalleryPrev').removeAttr('disabled').removeClass('disabled');
            } else {
                this.$outer.find('.lGalleryPrev').attr('disabled', 'disabled').addClass('disabled');
            }
        }
    };

    Plugin.prototype.setTranslate = function ($el, value) {
        // jQuery supports Automatic CSS prefixing since jQuery 1.8.0
        // For jQuery bellow 1.8.0 users added -webkit-transform
        $el.css({
            'transform': 'translate3d(' + (value) + 'px, 0px, 0px)',
            '-webkit-transform': 'translate3d(' + (value) + 'px, 0px, 0px)'
        });
    };

    Plugin.prototype.touchMove = function (startCoords, endCoords) {

        var distance = endCoords - startCoords;

        // reset opacity and transition duration
        this.$outer.addClass('lGalleryDragging');

        // move current slide
        this.setTranslate(this.$slide.eq(this.index), distance);

        // move next and prev slide with current slide
        this.setTranslate($('.lGalleryPrevSlide'), -this.$slide.eq(this.index).width() + distance);
        this.setTranslate($('.lGalleryNextSlide'), this.$slide.eq(this.index).width() + distance);
    };

    Plugin.prototype.touchEnd = function (distance) {
        var self = this;

        // keep slide animation for any mode while dragg/swipe
        if (self.s.mode !== 'slide') {
            self.$outer.addClass('lGallerySlide');
        };


        this.$slide.not('.lGalleryCurrent, .lGalleryPrevSlide, .lGalleryNextSlide').css('opacity', '0');
        // set transition duration 
        setTimeout(function () {
            self.$outer.removeClass('lGalleryDragging');

            if ((distance < 0) && (Math.abs(distance) > self.s.swipeThreshold)) {
                self.goToNextSlide(true);
            } else if ((distance > 0) && (Math.abs(distance) > self.s.swipeThreshold)) {
                self.goToPrevSlide(true);
            }
            self.$slide.removeAttr('style');
        });

        // remove slide class once drag/swipe is completed if mode is not slide
        setTimeout(function(){
            if (!self.$outer.hasClass('lGalleryDragging') && self.s.mode !== 'slide') {
                self.$outer.removeClass('lGallerySlide');
            };
        },self.s.speed + 100);

    };

    Plugin.prototype.enableSwipe = function () {
        var self = this,
            startCoords = 0,
            endCoords = 0;

        self.$slide.on('touchstart.lGallery', function (e) {
            e.preventDefault();
            self.manageSwipeClass();
            startCoords = e.originalEvent.targetTouches[0].pageX;
        });

        self.$slide.on('touchmove.lGallery', function (e) {
            e.preventDefault();
            endCoords = e.originalEvent.targetTouches[0].pageX;
            self.touchMove(startCoords, endCoords);
        });

        self.$slide.on('touchend.lGallery', function () {
            self.touchEnd(endCoords - startCoords);
        });

    };

    Plugin.prototype.enableDrag = function () {
        var self = this,
            startCoords = 0,
            endCoords = 0,
            isDraging = false,
            isMoved = false;
        if (self.s.enableDrag && !self.isTouch && self.doCss()) {
            self.$slide.on('mousedown.lGallery', function (e) {
                // execute only on .lGalleryObject
                if ($(e.target).hasClass('lGalleryObject')) {
                    e.preventDefault();
                    self.manageSwipeClass();
                    startCoords = e.pageX;
                    isDraging = true;

                    // ** Fix for webkit cursor issue https://code.google.com/p/chromium/issues/detail?id=26723
                    self.$outer.scrollLeft += 1;
                    self.$outer.scrollLeft -= 1;
                    // *

                    self.$outer.removeClass('lGalleryGrab').addClass('lGalleryGrabbing');
                }
            });

            $(window).on('mousemove.lGallery', function (e) {
                if (isDraging) {
                    isMoved = true;
                    endCoords = e.pageX;
                    self.touchMove(startCoords, endCoords);
                }
            });

            $(window).on('mouseup.lGallery', function () {
                if (isMoved) {
                    isMoved = false;
                    self.touchEnd(endCoords - startCoords);
                }

                // Prevent execution on click
                if (isDraging) {
                    isDraging = false;
                    self.$outer.removeClass('lGalleryGrabbing').addClass('lGalleryGrab');
                }
            });

        }
    };
    Plugin.prototype.manageSwipeClass = function (){
        var touchNext = this.index + 1,
            touchPrev = this.index - 1,
            length = this.$slide.length;
        if (this.s.loop) {
            if (this.index === 0) {
                touchPrev = length - 1;    
            }else if (this.index === length - 1) {
                touchNext = 0;    
            };
        };
        this.$slide.removeClass('lGalleryNextSlide lGalleryPrevSlide');
        if (touchPrev > -1) {
            this.$slide.eq(touchPrev).addClass('lGalleryPrevSlide');
        };
        this.$slide.eq(touchNext).addClass('lGalleryNextSlide');
    };



    Plugin.prototype.closeGallery = function () {

        var self = this,
            mousedown = false;
        this.$outer.find('.lGalleryClose').on('click.lGallery', function () {
            self.destroy();
        });


        if (self.s.closable) {

            // If you drag the slide and release outside gallery gets close on chrome
            // for preventing this check mousedown and mouseup happened on .lGalleryItem or lGalleryOuter
            self.$outer.on('mousedown.lGallery', function (e) {

                if ($(e.target).is('.lGalleryOuter') || $(e.target).is('.lGalleryItem ')) {
                    mousedown = true;
                } else {
                    mousedown = false;
                }

            });

            self.$outer.on('mouseup.lGallery', function (e) {

                if ($(e.target).is('.lGalleryOuter') || $(e.target).is('.lGalleryItem ') && mousedown) {
                    if (!self.$outer.hasClass('lGalleryDragging')) {
                        self.destroy();
                    };
                }

            });

        }

    };

    Plugin.prototype.destroy = function (d) {

        var self = this;

        // if d is false or undefined destroy will only close the gallery 
        // plugins instance remains with the element

        // if d is true destroy will completely remove the plugin

        if (typeof d === 'undefined') {
            d = false;
        }
        if (d === true) {
            this.$items.off('click.lGallery');
        }

        // Distroy all lightGallery modules
        $.each($.fn.lightGallery.modules, function (key, value) {
            self.modules[key].destroy();
        });


        this.lGalleryOn = false;
        $(window).off('keyup.lGallery keydown.lGallery mousemove.lGallery mouseup.lGallery resize.lGallery');
        $('body').removeClass('lGalleryOn');

        this.$outer.remove();
    };



    $.fn.lightGallery = function (options) {
        return this.each(function () {
            if (!$.data(this, 'lightGallery')) {
                $.data(this, 'lightGallery', new Plugin(this, options));
            }
        });
    };
    $.fn.lightGallery.modules = {};

})(jQuery, window, document);