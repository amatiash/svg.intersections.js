module.exports = {
    entry: './svg.intersections.js',
    output: {
        path: './dist/',
        filename: 'svg.intersections.js',
        library: 'SVGIntersections'
    },
    externals: {
        "svg.js": "SVG"
    },
    watch: true
};