'use strict';

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

    if(typeof define === 'function' && define.amd)
        define(['svg.js'], factory);

    else if(typeof module === 'object' && module.exports)
        module.exports = factory(require('svg.js'));

    else
        root.SVGIntersections = factory(root.SVG);

}(this, function(SVG){

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
        // ----------------------------------------------------

        line2StartInLine1 = isPointOnLine(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY);

        if(line2StartInLine1)
            return line2StartInLine1;

        line2EndInLine1 = isPointOnLine(line1StartX, line1StartY, line1EndX, line1EndY, line2EndX, line2EndY);

        if(line2EndInLine1)
            return line2EndInLine1;

        line1StartInLine2 = isPointOnLine(line2StartX, line2StartY, line2EndX, line2EndY, line1StartX, line1StartY);

        if(line1StartInLine2)
            return line1StartInLine2;

        line1EndInLine2 = isPointOnLine(line2StartX, line2StartY, line2EndX, line2EndY, line1EndX, line1EndY);

        if(line1EndInLine2)
            return line1EndInLine2;

        // ----------------------------------------------------

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
     * Get start&end points from a line
     * @function fromLineToLinePos
     *
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

    /**
     * Find length between two points
     * @function lengthBetweenTwoPoints
     *
     * @param   {number} x1 - Start point x
     * @param   {number} y1 - Start point y
     * @param   {number} x2 - End point x
     * @param   {number} y2 - End point y
     * @returns {number}    - Length between start&end position
     */
    function lengthBetweenTwoPoints(x1, y1, x2, y2){
        var a = x1 - x2,
            b = y1 - y2;
        return Math.sqrt(a * a + b * b);
    }

    /**
     * Check if point is on line
     * @function isPointOnLine
     *
     * @param   {number} x1       - Start point x
     * @param   {number} y1       - Start point y
     * @param   {number} x2       - End point x
     * @param   {number} y2       - End point y
     * @param   {number} x        - Check point x
     * @param   {number} y        - Check point y
     * @returns {Point|undefined} - Check point or undefined
     */
    function isPointOnLine(x1, y1, x2, y2, x, y){
        var lineLength     = lengthBetweenTwoPoints(x1, y1, x2, y2),
            segment1Length = lengthBetweenTwoPoints(x1, y1, x, y),
            segment2Length = lengthBetweenTwoPoints(x2, y2, x, y),
            onLine         = lineLength === segment1Length + segment2Length;

        if(onLine)
            return {
                x: x,
                y: y
            }
    }

    return {
        path_linePos          : path_linePos,
        linePos_linePos       : linePos_linePos,
        fromLineToLinePos     : fromLineToLinePos,
        lengthBetweenTwoPoints: lengthBetweenTwoPoints,
        isPointOnLine         : isPointOnLine
    };

}));