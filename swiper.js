(function ( window, document, $, undefined ) {
	window.Swiper = function ( containerId, options ) {

		this.$container = $( '#' + containerId );
		this.$wrapper = {};
		this.$slideElements = [];
		this.$currentSlideElement = {};
		this.$prevSlideElement = {};
		this.$nextSlideElement = {};
		this.$pagination = {};
		this.$navButton = {};

		this.slides = [];
		this.currentIndex = 0;
		this.wrapperIndex = 0;
		this.autoPlay = ( options && options.autoPlay ) ? options.autoPlay : false;
		this.autoPlayDuration = 1000;
		this.infinity = ( options && options.infinity ) ? options.infinity : false;

		this.initSwiper( containerId, options );
	};

	var touchStartX = null,
		touchEndX = null;

	var _createSlides = function ( $wrapper, options ) {
		var $slider = $( '<div class="swiper-slider"></div>' ),
			$link = $( '<a href=""></a>'),
			$image = $( '<img src="./resource/images/1.jpg" alt="">' );
		var slideNumber = 0,
			slides = [];

		// slide 생성
		if( options.slides.length === 1 ) {
			$image.css( 'height', options && options.height ? options.height : 'auto' );
			$link.append( $image );
			$slider.append( $link );
			$wrapper.append( $slider );

			return slides.push( $slider );
		} else {
			if( options.slides.length === 2 ) {
				// TBD : 배너 길이가 2개인 경우 예외처리 필요
			}
			for( i = 0; i < 3; i++ ) {
				slideNumber = i === 0 ? options.slides.length -1 : i - 1;
				$slider = $( '<div class="swiper-slider" data-order="' + i + '" data-transform="' + ( ( i - 1 ) * 100 ) + '"></div>' );
				$link = $( '<a href="' + options.slides[slideNumber].link + '"></a>');
				$image = $( '<img src="' + options.slides[slideNumber].image + '" alt="">' );

				$image.css( 'height', options && options.height ? options.height : 'auto' );

				$slider.css( {
					'transform': 'translate3d( ' + ( 100 * ( i -1 ) ) + '%, 0, 0 )',
					'-webkit-transform': 'translate3d( ' + ( 100 * ( i -1 ) ) + '%, 0, 0 )',
					'-ms-transform': 'translate3d( ' + ( 100 * ( i -1 ) ) + '%, 0, 0 )',
					'-o-transform': 'translate3d( ' + ( 100 * ( i -1 ) ) + '%, 0, 0 )'
				});

				$link.append( $image );
				$slider.append( $link );
				$wrapper.append( $slider );

				slides.push( $slider );
			}
			return slides;
		}
	},
	_createPagination = function ( $container, slidesLength ) {
		var $pagination = $( '<div class="swiper-pagination"></div>' ),
			$bullet = $( '<span class="swiper-bullet"></span>' );

		for( i = 0; i < slidesLength; i++ ) {
			$bullet = $( '<span class="swiper-bullet' + ( i === 0 ? ' selected' : '' ) + '"></span>' );
			$pagination.append( $bullet );
		}

		$container.append( $pagination );
		return $pagination;
	},
	_createNavButton = function ( $container, options ) {
		var $navButton = $( '<button type="button" class="prev"></button>' +
							'<button type="button" class="next"></button>');

		$container.append( $navButton );
		return $navButton;
	};

	Swiper.prototype.initSwiper = function ( containerId, options ) {

		var i = 0;
		// options이 없거나 options.slides가 배열이 아니거나, slides에 값이 없는 경우 return
		if( !options || !Array.isArray(options.slides) || options.slides.length === 0 ) {
			return;
		} else {
			this.slides = options.slides;
		}

		// options에 height값이 있는 경우 height값 설정
		options.height = ( options && options.height ) ? options.height : 'auto';

		this.$container = $( '#' + containerId );
		this.$wrapper = $( '<div class="swiper-wrapper" data-transform="0"></div>' );

		this.$container.addClass( 'swiper-container' );
		this.$container.append( this.$wrapper );

		// slide 생성
		this.$slideElements = _createSlides( this.$wrapper, options );
		this.$prevSlideElement = this.$slideElements[ 0 ];
		this.$currentSlideElement = this.$slideElements[ 1 ];
		this.$nextSlideElement = this.$slideElements[ 2 ];

		// pagination 생성
		this.$pagination = _createPagination( this.$container, options.slides.length );

		if( this.slides.length > 1 ) {
			// navButton 생성
			this.$navButton = _createNavButton( this.$container, options );
			this.$navButton.css( { 'top': ( options.height / 2 ) - ( this.$navButton.height() / 2 ) } );
		}
		this.$container.css( 'height', options.height );

		this.setEvent();

		this.setAutoPlay( options.autoPlay );
	};

	Swiper.prototype.setAutoPlay = function ( isAutoPlay ) {
		var that = this;

		if( isAutoPlay ) {
			setInterval( function () {
				that.moveNext();
			}, that.autoPlayDuration );
		}
	};

	Swiper.prototype.setPagination = function () {
		if( this.$pagination.find( '.selected' ).index() !== this.currentIndex ) {
			this.$pagination.find( '.selected' ).removeClass( 'selected' );
			this.$pagination.children().eq( this.currentIndex ).addClass( 'selected' );
		}
	};

	Swiper.prototype.setEvent = function () {
		var that = this;
		that.$container.on( 'click', function ( e ) {
			var $target = $( e.target );

			if ( $target.hasClass( 'swiper-bullet') ) {
				// pagination event fire
				that.moveTo( $target.index() );
			} else if ( $target.hasClass( 'next' ) || $target.hasClass( 'prev' )) {
				// next, prev event fire
				$target.hasClass( 'next' ) ? that.moveNext() : that.movePrev();
			}
		});

		that.$container.on( 'mousedown touchstart', that, that.touchStartHandler);
		that.$container.on( 'mousemove touchmove', that, that.touchMoveHandler);
		that.$container.on( 'mouseup touchend', that, that.touchEndHandler);
	};

	Swiper.prototype.touchStartHandler = function ( e ) {
		e.preventDefault();
		e.stopPropagation();

		var touch = ( e.type === 'mousedown' ) ? e : e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];

		e.data.$container.find( 'a' ).off( 'click' );

		touchStartX = touch.pageX;

		e.data.$wrapper.css( {
			'transition-timing-function': 'initial',
			'transition-duration': '0s'
		});
	},
	Swiper.prototype.touchMoveHandler = function ( e ) {
		e.preventDefault();
		e.stopPropagation();

		var touch = ( e.type === 'mousemove' ) ? e : e.originalEvent.touches[0] || e.originalEvent.changedTouches[0],
			$wrapper = {},
			wrapperMoveX = 0,
			wrapperTransform = 0;

		// swipe 후 touchend event에서 click event 발생 방지
		e.data.$container.find( 'a' ).on( 'click', function ( e ) {
			e.preventDefault();
		});

		if( touchStartX !== null ) {
			if( ( ( !e.data.infinity && e.data.currentIndex === 0 ) && touchStartX - touch.pageX < 0 ) ||
				( ( !e.data.infinity && e.data.currentIndex === e.data.slides.length - 1 ) && touchStartX - touch.pageX > 0 ) ) {
				return;
			} else {
				$wrapper = e.data.$wrapper;
				wrapperTransform = parseInt( $wrapper.attr( 'data-transform' ), 10 );
				wrapperMoveX = ( ( ( touch.pageX - touchStartX ) * 100 / $wrapper.width() ) + wrapperTransform );
				$wrapper.css( {
					'transform': 'translate3d( ' + wrapperMoveX + '%, 0, 0 )',
					'-webkit-transform': 'translate3d( ' + wrapperMoveX + '%, 0, 0 )',
					'-ms-transform': 'translate3d( ' + wrapperMoveX + '%, 0, 0 )',
					'-o-transform': 'translate3d( ' + wrapperMoveX + '%, 0, 0 )'
				});
			}
		}
	},
	Swiper.prototype.touchEndHandler = function ( e ) {
		e.preventDefault();
		e.stopPropagation();

		var touch = ( e.type === 'mouseup' ) ? e : e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];

		touchEndX = e.pageX;
		e.data.$wrapper.css( {
			'transition-timing-function': 'ease-out',
			'transition-duration': '.5s'
		});

		if( touchStartX - touchEndX > 100 ) {
			// swipe right to left
			e.data.moveNext();
		} else if ( touchStartX - touchEndX < -100 ) {
			// swipe left to right
			e.data.movePrev();
		} else {
			e.data.$wrapper.css( {
				'transform': 'translate3d( ' + e.data.$wrapper.attr( 'data-transform' ) + '%, 0, 0 )',
				'-webkit-transform': 'translate3d( ' + e.data.$wrapper.attr( 'data-transform' ) + '%, 0, 0 )',
				'-ms-transform': 'translate3d( ' + e.data.$wrapper.attr( 'data-transform' ) + '%, 0, 0 )',
				'-o-transform': 'translate3d( ' + e.data.$wrapper.attr( 'data-transform' ) + '%, 0, 0 )'
			});
		}
		touchStartX = null;
	};

	Swiper.prototype.moveNext = function () {
		var $tempElement = {},
			moveX = parseInt( this.$prevSlideElement.attr('data-transform'), 10 ) + 300;

		if( this.infinity || this.currentIndex !== this.slides.length - 1 ) {

			this.$prevSlideElement.css( {
				'transform': 'translate3d( ' + moveX + '%, 0, 0 )',
				'-webkit-transform': 'translate3d( ' + moveX + '%, 0, 0 )',
				'-ms-transform': 'translate3d( ' + moveX + '%, 0, 0 )',
				'-o-transform': 'translate3d( ' + moveX + '%, 0, 0 )'
			});
			this.$prevSlideElement.attr( 'data-transform', moveX );

			this.currentIndex = ++this.currentIndex % this.slides.length;
				this.wrapperIndex++;

			$tempElement = this.$prevSlideElement;
			this.$prevSlideElement = this.$currentSlideElement;
			this.$currentSlideElement = this.$nextSlideElement;
			this.$nextSlideElement = $tempElement;
			this.$nextSlideElement.find( 'img' ).attr( 'src', this.slides[ ( this.currentIndex + 1 ) % this.slides.length ].image );
			this.$nextSlideElement.find( 'a' ).attr( 'href', this.slides[ ( this.currentIndex + 1 ) % this.slides.length ].link );

			this.setPagination();

			this.$wrapper.attr( 'data-transform', this.wrapperIndex * -100 );
			this.$wrapper.css( {
				'transform': 'translate3d( ' + ( this.wrapperIndex * -100 ) + '%, 0, 0 )' ,
				'-webkit-transform': 'translate3d( ' + ( this.wrapperIndex * -100 ) + '%, 0, 0 )' ,
				'-ms-transform': 'translate3d( ' + ( this.wrapperIndex * -100 ) + '%, 0, 0 )' ,
				'-o-transform': 'translate3d( ' + ( this.wrapperIndex * -100 ) + '%, 0, 0 )'
			});
		}
	};

	Swiper.prototype.movePrev = function () {
		var $tempElement = {},
			prevIndex = 0,
			moveX = parseInt( this.$nextSlideElement.attr('data-transform'), 10 ) - 300;

		if( this.infinity || this.currentIndex !== 0 ) {
			this.$nextSlideElement.css( {
				'transform': 'translate3d( ' + moveX + '%, 0, 0 )',
				'-webkit-transform': 'translate3d( ' + moveX + '%, 0, 0 )',
				'-ms-transform': 'translate3d( ' + moveX + '%, 0, 0 )',
				'-o-transform': 'translate3d( ' + moveX + '%, 0, 0 )'
			});
			this.$nextSlideElement.attr( 'data-transform', moveX );

			this.currentIndex = ( this.currentIndex - 1 < 0 ) ? --this.currentIndex + this.slides.length : this.currentIndex - 1;
			this.wrapperIndex--;

			$tempElement = this.$nextSlideElement;
			this.$nextSlideElement = this.$currentSlideElement;
			this.$currentSlideElement = this.$prevSlideElement;
			this.$prevSlideElement = $tempElement;

			prevIndex = ( this.currentIndex - 1 < 0 ) ? this.currentIndex - 1 + this.slides.length : this.currentIndex - 1;
			this.$prevSlideElement.find( 'img' ).attr( 'src', this.slides[ prevIndex ].image );
			this.$prevSlideElement.find( 'a' ).attr( 'href', this.slides[ prevIndex ].link );

			this.setPagination();

			this.$wrapper.attr( 'data-transform', this.wrapperIndex * -100 );
			this.$wrapper.css( {
				'transform': 'translate3d( ' + ( this.wrapperIndex * -100 ) + '%, 0, 0 )',
				'-webkit-transform': 'translate3d( ' + ( this.wrapperIndex * -100 ) + '%, 0, 0 )',
				'-ms-transform': 'translate3d( ' + ( this.wrapperIndex * -100 ) + '%, 0, 0 )',
				'-o-transform': 'translate3d( ' + ( this.wrapperIndex * -100 ) + '%, 0, 0 )'
			});
		}
	};

	Swiper.prototype.moveTo = function ( index ) {
		var that = this,
			gap = Math.abs( index - that.currentIndex ),
			duration = ( 500 / gap ),
			direction = index - that.currentIndex < 0 ? 'rl' : 'lr',
			i = 0;

		that.$wrapper.css( {
			'transition-timing-function': 'linear',
			'transition-duration': duration + 'ms'
		});
		for( i = 0; i < gap; i++ ) {
			setTimeout( function () {
				that[ direction === 'lr' ? 'moveNext' : 'movePrev']();
			}, i * duration );
		}

		setTimeout( function () {
			that.$wrapper.css( {
				'transition-timing-function': 'ease',
				'transition-duration': '.5s'
			});
		}, i * duration );
	};

})(window, document, jQuery);