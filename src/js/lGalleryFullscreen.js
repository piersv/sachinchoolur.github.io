;
(function ($, window, document, undefined) {
 
    var defaults = {
        fullScreen: true
    };
 
    var Fullscreen =  function(element) {
    
        // get lightGallery core plugin data 
        this.core = $(element).data('lightGallery');

        this.$el = $(element);

        // extend module defalut settings with lightGallery core settings 
        this.core.s = $.extend({}, defaults, this.core.s);

        this.init();

        return this;
    }
 
    Fullscreen.prototype.init = function () {
        var fullScreen = '';
        if (this.core.s.fullScreen) {
            // check for fullscreen browser support 
            if (!document.fullscreenEnabled && !document.webkitFullscreenEnabled &&
                !document.mozFullScreenEnabled && !document.msFullscreenEnabled) {
                return;
            }else{
                fullScreen = '<span class="lGalleryFullScreen"></span>';
                this.core.$outer.find('.lGalleryToolbar').prepend(fullScreen);
                this.fullScreen();
            }
        }
    };

    Fullscreen.prototype.reuestFullscreen = function () {
        var el = document.documentElement;
        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if (el.msRequestFullscreen) {
            el.msRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        }
    };

    Fullscreen.prototype.exitFullscreen = function () {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    };

    // https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Using_full_screen_mode
    Fullscreen.prototype.fullScreen = function () {
        var self = this;

        $(document).on('fullscreenchange.lGallery webkitfullscreenchange.lGallery mozfullscreenchange.lGallery MSFullscreenChange.lGallery', function () {
            self.core.$outer.toggleClass('lGalleryFullScreenOn');
        });

        this.core.$outer.find('.lGalleryFullScreen').on('click.lGallery', function () {
            if (!document.fullscreenElement && 
                !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                self.reuestFullscreen();
            } else {
                self.exitFullscreen();
            }
        });

    };

    Fullscreen.prototype.destroy = function(){

        // exit from fullscreen if activated
        this.exitFullscreen();

        $(document).off('fullscreenchange.lGallery webkitfullscreenchange.lGallery mozfullscreenchange.lGallery MSFullscreenChange.lGallery');
    }


    $.fn.lightGallery.modules.fullscreen = Fullscreen;
    
 
})(jQuery, window, document);