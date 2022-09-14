var write = require('./write'),
    geojson = require('./geojson'),
    prj = require('./prj'),
    JSZip = require('jszip');
const { forEach } = require('./util');

module.exports = function(gj, options) {

    var zip = new JSZip(),
        layers;

    // if options.folder is set, zip to a folder with that name
    if (options && options.folder && typeof options.folder === 'string') {
        layers = zip.folder(options.folder);
    } else {
        layers = zip;
    }

    forEach([geojson.point(gj), geojson.line(gj), geojson.polygon(gj)], function(l) {
        if (l.geometries.length && l.geometries[0].length) {
            write(
                // field definitions
                l.properties,
                // geometry type
                l.type,
                // geometries
                l.geometries,
                function(err, files) {
                    var fileName = options && options.types[l.type.toLowerCase()] ? options.types[l.type.toLowerCase()] : l.type;
                    layers.file(fileName + '.shp', files.shp.buffer, { binary: true });
                    layers.file(fileName + '.shx', files.shx.buffer, { binary: true });
                    layers.file(fileName + '.dbf', files.dbf.buffer, { binary: true });
                    layers.file(fileName + '.prj', prj);
                });
        }
    });

    var generateOptions = { compression:'STORE' };

    if (!process.browser) {
      generateOptions.type = 'nodebuffer';
    }

    return zip.generate(generateOptions);
};
