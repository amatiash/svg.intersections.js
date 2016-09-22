var SVGIntersections =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

	/**
	 * @module SVGIntersections
	 */

	/**
	 * @typedef {Object} Position
	 *
	 * @property {number} x1 - Start point x
	 * @property {number} y1 - Start point y
	 * @property {number} x2 - End point x
	 * @property {number} y2 - End point y
	 */

	/**
	 * @typedef {Object} Point
	 *
	 * @property {number} x
	 * @property {number} y
	 */

	(function(root, factory){

	    if(true)
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1), __webpack_require__(2)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

	    else if(typeof module === 'object' && module.exports)
	        module.exports = factory(require('svg.js'), require('distance-to-line-segment'));

	}(this, function(SVG, distanceToLineSegment){

	    var defaults = {
	        segmentLength: 10
	    };

	    SVG.extend(SVG.Path, {

	        /**
	         * SVG.Path -> SVG.Line intersections
	         * @ignore
	         * @param {Object} line - SVG.Line element
	         * @param {Number} [segmentLength=10]
	         * @returns {Array.<Point>}
	         */
	        intersectsLine: function(line, segmentLength){
	            return path_linePos(this, fromLineToLinePos(line), segmentLength);
	        },

	        /**
	         * SVG.Path -> SVG.Path intersections
	         * @ignore
	         * @param   {Object} path - SVG.Path element
	         * @param   {Number} [segmentLength=10]
	         * @returns {Array.<Point>}
	         */
	        intersectsPath: function(path, segmentLength){

	            segmentLength = segmentLength || defaults.segmentLength;

	            var pathLength       = this.length(),
	                numberOfSegments = Math.round(pathLength / segmentLength),
	                stepLength       = pathLength / numberOfSegments,
	                allPositions     = [];

	            for(var i = 0; i < numberOfSegments; i++){

	                var segmentStart   = this.pointAt(i * stepLength),
	                    segmentEnd     = this.pointAt((i + 1) * stepLength),
	                    lineSegmentPos = {
	                        x1: segmentStart.x,
	                        y1: segmentStart.y,
	                        x2: segmentEnd.x,
	                        y2: segmentEnd.y
	                    },
	                    positions      = path_linePos(path, lineSegmentPos, segmentLength);

	                if(positions.length){
	                    positions.forEach(function(el){

	                        var lastEl;

	                        // If at least one position pushed -> compare positions.
	                        //
	                        // This check is due to possible position dublicate.
	                        // This happens when end point of the segment intersects with the line,
	                        // so the next segment start point will also intersects with this line
	                        if(allPositions.length >= 1){
	                            lastEl = allPositions[allPositions.length - 1];

	                            // Return is the same
	                            if(lastEl.x === el.x && lastEl.y === el.y)
	                                return;
	                        }

	                        allPositions.push(el);
	                    });

	                }
	            }

	            return allPositions;
	        }
	    });

	    SVG.extend(SVG.Line, {

	        /**
	         * SVG.Line -> SVG.Line intersection
	         * @ignore
	         * @param   {Object} line - SVG.Line element
	         * @returns {Point|undefined}
	         */
	        intersectsLine: function(line){
	            return linePos_linePos(fromLineToLinePos(this), fromLineToLinePos(line));
	        },

	        /**
	         * SVG.Line -> SVG.Path intersections
	         * @ignore
	         * @param   {Object} path - SVG.Path element
	         * @param   {Number} [segmentLength=10]
	         * @returns {Array.<Point>}
	         */
	        intersectsPath: function(path, segmentLength){
	            return path_linePos(path, fromLineToLinePos(this), segmentLength);
	        }
	    });

	    /**
	     * Get intersection points for a path element and a line position.
	     * Devides a path into line segments and finds line-to-line intersection.
	     *
	     * @function path_linePos
	     *
	     * @param   {Object}   pathEl             - SVG.Path element
	     * @param   {Position} linePos            - Line start&end position
	     * @param   {Number}   [segmentLength=10] - Path segment length. Used for accuracy
	     *
	     * @returns {Array.<Point>}               - Array of intersection points
	     */
	    function path_linePos(pathEl, linePos, segmentLength){

	        segmentLength = segmentLength || defaults.segmentLength;

	        var pathLength       = pathEl.length(),
	            numberOfSegments = Math.round(pathLength / segmentLength),
	            stepLength       = pathLength / numberOfSegments,
	            positions        = [];

	        for(var i = 0; i < numberOfSegments; i++){

	            var segmentStart   = pathEl.pointAt(i * stepLength),
	                segmentEnd     = pathEl.pointAt((i + 1) * stepLength),
	                lineSegmentPos = {
	                    x1: segmentStart.x,
	                    y1: segmentStart.y,
	                    x2: segmentEnd.x,
	                    y2: segmentEnd.y
	                },
	                position       = linePos_linePos(lineSegmentPos, linePos);

	            // Push is intersects
	            position && positions.push(position);

	        }

	        return positions;
	    }

	    /**
	     * Get intersection point for 2 lines depending on their start&end position points.
	     * {@link http://jsfiddle.net/justin_c_rounds/Gd2S2/|Original function}
	     *
	     * @function linePos_linePos
	     *
	     * @param    {Position} line1Pos - First line start&end position
	     * @param    {Position} line2Pos - Second line start&end position
	     *
	     * @returns  {Point|undefined}   - Intersection point or undefined
	     */
	    function linePos_linePos(line1Pos, line2Pos){

	        var line1StartX = line1Pos.x1,
	            line1StartY = line1Pos.y1,
	            line1EndX   = line1Pos.x2,
	            line1EndY   = line1Pos.y2,

	            line2StartX = line2Pos.x1,
	            line2StartY = line2Pos.y1,
	            line2EndX   = line2Pos.x2,
	            line2EndY   = line2Pos.y2,

	            a,
	            b,
	            onLine1,
	            onLine2,
	            numerator1,
	            numerator2,
	            denominator,
	            line2EndInLine1,
	            line1EndInLine2,
	            line2StartInLine1,
	            line1StartInLine2;

	        denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));

	        // Return if lines are parallel
	        if(denominator == 0)
	            return;

	        // Check if any of start/end points are at another line

	        line1StartInLine2 = distanceToLineSegment(line2StartX, line2StartY, line2EndX, line2EndY, line1StartX, line1StartY);
	        line1EndInLine2   = distanceToLineSegment(line2StartX, line2StartY, line2EndX, line2EndY, line1EndX, line1EndY);
	        line2StartInLine1 = distanceToLineSegment(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY);
	        line2EndInLine1   = distanceToLineSegment(line1StartX, line1StartY, line1EndX, line1EndY, line2EndX, line2EndY);

	        if(line1StartInLine2 === 0)
	            return {
	                x: line1StartX,
	                y: line1StartY
	            };

	        if(line1EndInLine2 === 0)
	            return {
	                x: line1EndX,
	                y: line1EndY
	            };

	        if(line2StartInLine1 === 0)
	            return {
	                x: line2StartX,
	                y: line2StartY
	            };

	        if(line2EndInLine1 === 0)
	            return {
	                x: line2EndX,
	                y: line2EndY
	            };

	        a          = line1StartY - line2StartY;
	        b          = line1StartX - line2StartX;
	        numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
	        numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
	        a          = numerator1 / denominator;
	        b          = numerator2 / denominator;

	        // If line1 is a segment and line2 is infinite, they intersect if:
	        if(a > 0 && a < 1)
	            onLine1 = true;

	        // If line2 is a segment and line1 is infinite, they intersect if:
	        if(b > 0 && b < 1)
	            onLine2 = true;

	        // If line1 and line2 are segments, they intersect if both of the above are true
	        if(onLine1 && onLine2){

	            return {
	                x: line1StartX + (a * (line1EndX - line1StartX)),
	                y: line1StartY + (a * (line1EndY - line1StartY))

	                /*// It is worth noting that this should be the same as:
	                 x: line2StartX + (b * (line2EndX - line2StartX)),
	                 y: line2StartX + (b * (line2EndY - line2StartY))*/
	            };
	        }
	    }

	    /**
	     * Get Start&end points from a line
	     * @param   {Object} line                  - SVG.Line element
	     * @returns {{x1: *, y1: *, x2: *, y2: *}} - Start&end points
	     */
	    function fromLineToLinePos(line){
	        var array = line.array();
	        return {
	            x1: array.value[0][0],
	            y1: array.value[0][1],
	            x2: array.value[1][0],
	            y2: array.value[1][1]
	        }
	    }

	    return {
	        path_linePos   : path_linePos,
	        linePos_linePos: linePos_linePos,
	        fromLineToLinePos: fromLineToLinePos
	    };

	}));

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = SVG;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * @module distance-to-line-segment 
	 */


	/**
	* Calculate the square of the distance between a finite line segment and a point. This 
	* version takes somewhat less convenient parameters than distanceToLineSegment.squared,
	* but is more efficient if you are calling it multiple times for the same line segment,
	* since you pass in some easily pre-calculated values for the segment.
	* @alias module:distance-to-line-segment.squaredWithPrecalc
	* @param {number} lx1 - x-coordinate of line segment's first point
	* @param {number} ly1 - y-coordinate of line segment's first point
	* @param {number} ldx - x-coordinate of the line segment's second point minus lx1
	* @param {number} ldy - y-coordinate of the line segment's second point minus ly1
	* @param {number} lineLengthSquared - must be ldx\*ldx + ldy\*ldy. Remember, this precalculation
	*    is for efficiency when calling this multiple times for the same line segment.
	* @param {number} px - x coordinate of point
	* @param {number} py - y coordinate of point
	*/

	function distanceSquaredToLineSegment2(lx1, ly1, ldx, ldy, lineLengthSquared, px, py) {
	   var t; // t===0 at line pt 1 and t ===1 at line pt 2
	   if (!lineLengthSquared) {
	      // 0-length line segment. Any t will return same result
	      t = 0;
	   }
	   else {
	      t = ((px - lx1) * ldx + (py - ly1) * ldy) / lineLengthSquared;

	      if (t < 0)
	         t = 0;
	      else if (t > 1)
	         t = 1;
	   }
	   
	   var lx = lx1 + t * ldx,
	       ly = ly1 + t * ldy,
	       dx = px - lx,
	       dy = py - ly;
	   return dx*dx + dy*dy;   
	}

	/**
	* Calculate the square of the distance between a finite line segment and a point. 
	* @alias module:distance-to-line-segment.squared
	* @param {number} lx1 - x-coordinate of line segment's first point
	* @param {number} ly1 - y-coordinate of line segment's first point
	* @param {number} lx2 - x-coordinate of the line segment's second point
	* @param {number} ly2 - y-coordinate of the line segment's second point
	* @param {number} px - x coordinate of point
	* @param {number} py - y coordinate of point
	*/

	function distanceSquaredToLineSegment(lx1, ly1, lx2, ly2, px, py) {
	   var ldx = lx2 - lx1,
	       ldy = ly2 - ly1,
	       lineLengthSquared = ldx*ldx + ldy*ldy;
	   return distanceSquaredToLineSegment2(lx1, ly1, ldx, ldy, lineLengthSquared, px, py);
	}

	/**
	* Calculate the distance between a finite line segment and a point. Using distanceToLineSegment.squared can often be more efficient.
	* @alias module:distance-to-line-segment
	* @param {number} lx1 - x-coordinate of line segment's first point
	* @param {number} ly1 - y-coordinate of line segment's first point
	* @param {number} lx2 - x-coordinate of the line segment's second point
	* @param {number} ly2 - y-coordinate of the line segment's second point
	* @param {number} px - x coordinate of point
	* @param {number} py - y coordinate of point
	*/

	function distanceToLineSegment(lx1, ly1, lx2, ly2, px, py)
	{
	   return Math.sqrt(distanceSquaredToLineSegment(lx1, ly1, lx2, ly2, px, py));
	}


	distanceToLineSegment.squared = distanceSquaredToLineSegment;
	distanceToLineSegment.squaredWithPrecalc = distanceSquaredToLineSegment2;
	module.exports = distanceToLineSegment;


/***/ }
/******/ ]);