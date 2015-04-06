;
(function ($, window, document, undefined) {

    var defaults = {
        thumbnail: true
    };

    var Thumbnail = function (element) {

        // get lightGallery core plugin data 
        this.core = $(element).data('lightGallery');

        this.$el = $(element);

        // extend module default settings with lightGallery core settings 
        this.core.s = $.extend({}, defaults, this.core.s);

        this.init();

        return this;
    };

    Thumbnail.prototype.init = function () {
        if (this.core.s.thumbnail && this.core.$items.length > 1) {
            this.build();
        }
    };

    Thumbnail.prototype.build = function () {
        var self = this,
            thumbList = '',
            thumbImg,
            $thumb,
            html = '<div class="lGalleryThumbOuter">' +
            '<div class="lGalleryThumb">' +
            '</div>' +
            '<div class="lGalleryThumbActions">' +
            '<div class="lGalleryThumbPrev"></div>' +
            '<div class="lGalleryThumbNext"></div>' +
            '</div>' +
            '</div>';

        self.core.$outer.addClass('hasThumbnail');

        self.core.$outer.find('.lGallery').append(html);

        if (self.core.s.animateThumb) {
            var width = (self.core.$items.length * (self.core.s.thumbWidth + self.core.s.thumbMargin));
            self.core.$outer.find('.lGalleryThumb').css({
                'width': width + 'px',
                'position': 'relative'
            });
        }


        if (self.core.s.dynamic) {
            for (var i = 0; i < self.core.s.dynamicEl.length; i++) {
                thumbImg = self.core.s.dynamicEl[i].thumb;
                thumbList += '<div class="lGalleryThumbItem" style="width:' + self.core.s.thumbWidth + 'px; margin-right: ' + self.core.s.thumbMargin + 'px"><img src="' + thumbImg + '" /></div>';
            }
        } else {
            self.core.$items.each(function () {
                if (!self.core.s.exThumbImage) {
                    thumbImg = $(this).find('img').attr('src');
                } else {
                    thumbImg = $(this).attr(self.core.s.exThumbImage);
                }
                thumbList += '<div class="lGalleryThumbItem" style="width:' + self.core.s.thumbWidth + 'px; margin-right: ' + self.core.s.thumbMargin + 'px"><img src="' + thumbImg + '" /></div>';
            });
        }
        self.core.$outer.find('.lGalleryThumb').html(thumbList);

        $thumb = self.core.$outer.find('.lGalleryThumbItem');

    
        // manage active class for thumbnail
        $thumb.eq(self.core.index).addClass('active');
        self.core.$el.on('onBeforeSlide.lGallery',function(){
            $thumb.removeClass('active');
            $thumb.eq(self.core.index).addClass('active');
        })

        $thumb.bind('click touchend', function () {
            self.core.index = $(this).index();
            $thumb.removeClass('active');
            $(this).addClass('active');
            self.core.slide(self.core.index, false, true);
        });


        self.core.$el.on('onBeforeSlide.lGallery',function(){
            self.animateThumb(self.core.index);
        });

        $(window).on('resize.lGalleryThumb', function() {
            setTimeout(function() {
                self.animateThumb(self.core.index);
            }, 200);
        });


    };

    Thumbnail.prototype.animateThumb = function(index) {
        var $thumb = this.core.$outer.find('.lGalleryThumb');
        if (this.core.s.animateThumb) {
            var thumbOuterWidth = this.core.$outer.find('.lGalleryThumbOuter').width(),
                position,
                left,
                width;
            switch (this.core.s.currentPagerPosition) {
                case 'left':
                    position = 0;
                    break;
                case 'middle':
                    position = (thumbOuterWidth / 2) - (this.core.s.thumbWidth / 2);
                    break;
                case 'right':
                    position = thumbOuterWidth - this.core.s.thumbWidth;
            }
            left = ((this.core.s.thumbWidth + this.core.s.thumbMargin) * index - 1) - position;
            width = (this.core.$items.length * (this.core.s.thumbWidth + this.core.s.thumbMargin));
            if (left > (width - thumbOuterWidth)) {
                left = width - thumbOuterWidth;
            }
            if (left < 0) {
                left = 0;
            }


            if (this.core.lGalleryOn) {
                if (!$thumb.hasClass('on')) {
                    $thumb.addClass('on');
                    this.core.$outer.find('.lGalleryThumb').css('transition-duration', this.core.s.speed + 'ms');    
                };
                if (!this.core.doCss()) {
                    $thumb.animate({
                        left: -left + 'px'
                    }, this.core.s.speed);
                }
            }else{
                if (!this.core.doCss()) {
                    $thumb.css('left', -left + 'px');
                }
            }
            $thumb.css('transform', 'translate3d(-' + left + 'px, 0px, 0px)');

        }
    };

    Thumbnail.prototype.destroy = function () {
        $(window).off('resize.lGalleryThumb');
        this.core.$outer.find('.lGalleryThumbOuter').remove();
        this.core.$outer.removeClass('hasThumbnail');
    };


    $.fn.lightGallery.modules.Thumbnail = Thumbnail;


})(jQuery, window, document);