/**
*	move.js
*	Author: Logan Wilkerson
*
*	A jQuery plugin to move elements with.
*/
var jQuery = jQuery || {};
(function($){
	'use strict';
	var move = {};

	move.dist = function(x1, y1, x2, y2){
		return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
	};

	//grabs an element from the page given 
	move.elementFromPoint = function(x, y){
		return document.elementFromPoint(x - window.pageXOffset, y - window.pageYOffset);
	};

	//z-indexes
	move.background = 8;
	move.midground = 9;
	move.foreground = 10;

	move.monitoringTouchEnd = false;
	move.previousTouchEnd = null;

	/*
	*	Prepares an object to be moved. It supposed a number of options
	*
	*	@param {Object} options
	*	x, y: Move uses top and left to move objects. This means that typically
	*		you'll want to make sure position is set to 'absolute' (default).
	*		This also means that elements will be positioned relative to their first
	*		none static parent.
	*
	*	regX, regY: The point, relative to the top left corner of the element, where the object
	*		is "registered." All move operations take place relative to the registration 
	*		point.
	*
	*	position: The css position to set the object to. 'absolute' by default
	*
	*	rotation: The rotation value in degrees of the object.
	*
	*	minX, minY, maxY, maxY: The max cordinate values of the object. Used to bound the object to
	*		a bounding box.
	*
	*	These options will make up a move elements state which will be stored on the element itself
	*	in the data array as 'data-move'
	*/
	$.fn.move = function(options){
		return this.each(function(){
			var ele = $(this);
			var s = $.extend({
				x: 0,
				y: 0,
				regX: 0,
				regY: 0,
				position: 'absolute', 
				rotation: 0,
				minX: -Infinity, 
				minY: -Infinity, 
				maxX: Infinity, 
				maxY: Infinity,
				defaultZ: move.midground
			}, options);
			ele.css({
				'position': s.position,
				'z-index': s.defaultZ				
			});
			ele.origin(s.regX, s.regY);
			ele.data('move', s);
			ele.rotate(s.rotation);
			ele.x(s.x);
			ele.y(s.y);
			ele.addClass('moveable');
		});
	};

	//sets the current reg values
	$.fn.origin = function(regX, regY){
		var origin = regX + 'px ' + regY + 'px';
		this.css({
			'-webkit-transform-origin': origin,
			'-moz-transform-origin': origin,
			'-ms-transform-origin': origin,
			'transform-origin': origin
		});		
	};

	/**
	*	returns current rotation or sets rotation
	*/
	$.fn.rotate = function(degrees){		
		if(typeof degrees != 'undefined'){
			degrees = degrees % 360;
			var rotateCSS = 'rotate(' + degrees + 'deg)';
			var css = {
				'-webkit-transform': rotateCSS,
				'-moz-transform': rotateCSS,
				'-ms-transform': rotateCSS,
				'transform': rotateCSS
			};
			return this.each(function(){
				$(this).css(css);
				$(this).data('move').rotation = degrees;
			});
		}
		else{
			return this.data('move').rotation;
		}
	};

	//Sets or returns the current x value
	$.fn.x = function(x){
		if(typeof x != 'undefined'){
			var d = this.data('move');
			x = Math.max(x, d.minX);
			x = Math.min(x, d.maxX);
			d.x = x;
			this.css({
				'left': x - this.data('move').regX
			});
			return this;
		}
		else{
			return this.data('move').x;
		}
		
	};

	//Sets or returns the current x value
	$.fn.y = function(y){
		if(typeof y != 'undefined'){
			var d = this.data('move');
			y = Math.max(y, d.minY);
			y = Math.min(y, d.maxY);
			d.y = y;
			this.css({
				'top': y - this.data('move').regY
			});
			return this;
		}
		else{
			return this.data('move').y;
		}
		
	};

	//sets both x and y or returns the values as {x:x(), y:y()}
	$.fn.cords = function(cords){
		if(typeof cords != 'undefined'){
			this.y(cords.y);
			this.x(cords.x);
			return this;
		}
		else{
			return {
				x: this.x(),
				y: this.y()
			};
		}
	};

	//sets or returns regX
	$.fn.regX = function(regX){
		if(typeof regX != 'undefined'){
			this.data('move').regX = regX;
			this.origin(this.data('move').regX, this.data('move').regY);
			return this;
		}
		else{
			return this.data('move').regX;
		}
	};

	//sets or returns regY
	$.fn.regY = function(regY){
		if(typeof regY != 'undefined'){
			this.data('move').regY = regY;
			this.origin(this.data('move').regX, this.data('move').regY);
			return this;
		}
		else{
			return this.data('move').regY;
		}
	};

	$.fn.maxX = function(maxX){
		if(typeof maxX != 'undefined'){
			this.data('move').maxX = maxX;
			this.x(this.x());
			return this;
		}
		else{
			return this.data('move').maxX;
		}
	};

	$.fn.minX = function(minX){
		if(typeof minX != 'undefined'){
			this.data('move').minX = minX;
			this.x(this.x());
			return this;
		}
		else{
			return this.data('move').minX;
		}
	};

	$.fn.maxY = function(maxY){
		if(typeof maxY != 'undefined'){
			this.data('move').maxY = maxY;
			this.y(this.y());
			return this;
		}
		else{
			return this.data('move').maxY;
		}
	};

	$.fn.minY = function(minY){
		if(typeof minY != 'undefined'){
			this.data('move').minY = minY;
			this.y(this.y());
			return this;
		}
		else{
			return this.data('move').minY;
		}
	};


	$.fn.opacity = function(o){
		return this.css({
			opacity: o,
			filter: 'alpha(opacity=' + (o*100).toString() + ')'
		});
	};

	$.fn.background = function(){
		return this.each(function(){
			$(this).css({
				'z-index': move.background
			});
		});
	};

	$.fn.midground = function(){	
		return this.each(function(){
			$(this).css({
				'z-index': move.midground
			});
		});
	};

	$.fn.foreground = function(){
		return this.each(function(){
			$(this).css({
				'z-index': move.foreground
			});
		});
	};


	$.fn.defaultground = function(){
		return this.each(function(){
			$(this).css({
				'z-index': $(this).data('move').defaultZ
			});
		});
	};

	var monitorTouchEnd = function(){	
		if(!move.monitoringTouchEnd){
			$('html').on('touchend', function(evt){
				move.previousTouchEnd = evt;
			});
			move.monitoringTouchEnd = true;
		}
	};

	/*
	* allows the object to be grabbeds
	* dragstart
	* dragstop
	* dragstep
	* currently allows dragging on mobile by default, non-configurable at the moment
	* smoothMouse
	* smoothTouch
	* smoothDistance
	*/
	$.fn.drag = function(options){
		var opt = $.extend({
			dragpick: true,
			smoothDistance: 0,
			smoothMouse: false,
			smoothTouch: false
		}, options);
		monitorTouchEnd();
		return this.each(function(){
			//prevents image ghost while dragging
			$(this).attr('draggable', false); 
			$(this).data('move').drag = true;
			var startDragging = function(evt){
				var ele = $(this);
				var e = $.extend(evt, {type:'dragstart'});
				ele.trigger(e);
				if(!evt.pageX){
					if(!evt.originalEvent.touches[0]){
						return false;
					}
					evt.pageX = evt.originalEvent.touches[0].pageX;
					evt.pageY = evt.originalEvent.touches[0].pageY;
				}
				var dX = ele.x() - evt.pageX;
				var dY = ele.y() - evt.pageY;
				var drag = function(evt){
					if(!evt.pageX){
						evt.pageX = evt.originalEvent.touches[0].pageX;
						evt.pageY = evt.originalEvent.touches[0].pageY;
					}
					evt.preventDefault();
					var skip = false;
					/*
					*	There's a weird glitch where sometimes touchmoves
					*	will be equal to the previous touchend. I skip those.
					*	technically this can skip some valid moves, but I
					*	hope it won't be much of an issue.
					*/
					if(move.previousTouchEnd){
						var endX = move.previousTouchEnd.originalEvent.changedTouches[0].pageX;
						var endY = move.previousTouchEnd.originalEvent.changedTouches[0].pageY;
						if(evt.pageX == endX && evt.pageY == endY){
							skip = true;
						}
					}
					if(!skip){
						var nPos = {x: evt.pageX + dX, y:evt.pageY + dY};
						var dragDis = Math.sqrt(Math.pow(nPos.x - ele.x(), 2) + Math.pow(nPos.y - ele.y(), 2));
						var smooth;
						if(typeof TouchEvent != 'undefined' && (evt.originalEvent instanceof TouchEvent)){
							smooth = opt.smoothTouch;
						}
						else{
							smooth = opt.smoothMouse;
						}
						if(!smooth || dragDis < opt.smoothDistance){
							ele.x(nPos.x);
							ele.y(nPos.y);
						}
						var e = $.extend(evt, {type:'dragstep'});
						ele.trigger(e);
					}
					evt.stopPropagation();		
					return false;
				};
				var dragEnd = function(evt){
					$('html').off('mousemove touchmove', drag);
					$('html').off('mouseup touchend', dragEnd);
					var e = $.extend(evt, {type:'dragstop'});
					ele.trigger(e);

				};
				$('html').on('mousemove touchmove', drag);
				$('html').on('mouseup touchend', dragEnd);
			};
			$(this).on('drag.move', startDragging);
			$(this).on('mousedown touchstart', function(evt){
				evt.preventDefault();
				$('html').trigger(evt);
				var ele = $(this);
				if(opt.dragpick){					
					if(!evt.pageX){
						evt.pageX = evt.originalEvent.touches[0].pageX;
						evt.pageY = evt.originalEvent.touches[0].pageY;
					}
					ele = pointpick(evt.pageX, evt.pageY);
				}
				if(ele){
					startDragging.call(ele, evt);
				}
				return false;
			});
		});
	};

	//picks element whos regX/regY is closest to the given point
	var pointpick = function(x, y){
		var hidden = [];
		var closestEle;
		var minDist = Infinity;
		var ele;
		while((ele = move.elementFromPoint(x, y)) && 
				ele.tagName != 'BODY' && ele.tagName != 'HTML'){
			ele = $(ele);
			if(ele.hasClass('moveable') && ele.data('move').drag){
				var relX = x - ele.parent().offset().left;
				var relY = y - ele.parent().offset().top;
				var dist = move.dist(ele.x(), ele.y(), relX, relY);
				if(dist < minDist){
					closestEle = ele;
					minDist = dist;
				}
			ele.hide();
			hidden.push(ele);
			}
			else{
				break;
			}
		}
		$.each(hidden, function(index, value){
			value.show();
		});
		$('.moveable').defaultground();
		if(closestEle){
			closestEle.foreground();
		}
		return closestEle;
	};
}(jQuery));