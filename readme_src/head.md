# svg.intersections.js
Intersections plugin for [svg.js](https://github.com/wout/svg.js)

Finds intersections of paths and lines.

[Demo](https://amatiash.github.io/svg.intersections.js/demo.html).

## Installation

`npm i -S svg.intersections.js`

For non- AMD or CommonJS adds a global `SVGIntersections`.

## Usage

```javascript
var draw = SVG('drawing').size(400, 400),
    line  = draw.line(19, 127, 252, 386).stroke('blueviolet'),
    path  = draw.path('M140 45 L 12 250').stroke('darkorange'),
    intersectionPoints;
```
Then

```javascript
intersectionPoints = path.intersectsLine(line);
```
Or

```javascript
intersectionPoints = line.intersectsPath(path);
```

Result

```javascript
[ 
    {
        x: 62.453914292554465,
        y: 175.3028489346421
    }
]
```

When checking with a path, first it splits it into line segments and checks a line-line intersection.

`segmentLength` specifies the length of a segment.

Longer segment -> faster and less accurate

**Be carefull** checking intersections of two paths (especially long), with a hight accuracy - it can be really slow.

### Avaliable methods

#### SVG.Path

`.intersectsLine(line [, segmentLength])`

`.intersectsPath(path [, segmentLength])`

#### SVG.Line

`.intersectsLine(line)`

`.intersectsPath(path [, segmentLength])`

## API