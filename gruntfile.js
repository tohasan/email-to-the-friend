
module.exports = function (grunt) { // NOSONAR
    var path = require('path');

    var targetDir = 'target';
    var pageDir = 'emails';
    var tmpDir = targetDir + '/.tmp';
    var pageTmpDir = tmpDir + '/emails';
    var pageTmpPath = pageTmpDir
        + '/8march-1.html';
        // + '/index.html';
    var pageTargetPath = targetDir
        + '/8march-1.html';
        // + '/index.html';

    // Helper
    var helper = {
        createConfig: function (context, block) {
            var cfg = { files: [] };
            var outfile = path.join(context.outDir, block.dest);
            var filesDef = {};

            filesDef.dest = outfile;
            filesDef.src = [];

            context.inFiles.forEach(function (inFile) {
                filesDef.src.push(path.join(context.inDir, inFile));
            });

            cfg.files.push(filesDef);

            context.outFiles = [block.dest];
            return cfg;
        }
    };

    // Measures the time each task takes
    require('time-grunt')(grunt);

    // Tasks
    grunt.initConfig({
        less: {
            generated: {}
        },
        concat: {
            generated: {}
        },
        copy: {
            tmp: {
                files: [{
                    expand: true,
                    cwd: pageDir,
                    src: '*.html',
                    dest: pageTmpDir
                }]
            }
        },
        useminPrepare: {
            index: pageTmpPath,
            options: {
                dest: pageTmpDir,
                root: pageDir,
                staging: tmpDir,
                flow: {
                    steps: {
                        css: ['concat'],
                        less: [{
                            name: 'less',
                            'createConfig': function (context, block) {
                                return helper.createConfig(context, block);
                            }
                        }]
                    },
                    post: {}
                }
            }
        },
        usemin: {
            index: pageTmpPath,
            options: {
                blockReplacements: {
                    less: function (block) {
                        return '<link rel="stylesheet" href="' + block.dest + '">';
                    }
                }
            }
        },
        clean: {
            target: targetDir
        },
        inlinecss: {
            options: {
                xmlMode: false,
                applyWidthAttributes: true,
                applyHeightAttributes: true,
                applyAttributesTableElements: true,
                preserveImportant: true,
                preserveMediaQueries: true,
                preserveFontFaces: true,
                insertPreservedExtraCss: false,
                webResources: {
                    images: false
                }
            },
            index: {
                src: pageTmpPath,
                dest: pageTargetPath
            }
        },
        postcss: {
            options: {
                processors: [
                    // https://github.com/postcss/autoprefixer
                    require('autoprefixer')({
                        // ie >= 8; https://github.com/ai/browserslist
                        browsers: ["last 2 versions", "> 1%"]
                    }),
                    // http://cssnano.co
                    require('cssnano')({
                        // Disable unsafe optimizations
                        reduceIdents: false,
                        zindex: false,
                        mergeIdents: false,
                        discardUnused: false
                    })
                ]
            },
            index: {
                src: pageTmpDir + '/css/master.css',
                dest: pageTmpDir + '/css/master.css'
            }
        }
    });

    // Load grunt plugins installed using npm install
    grunt.loadNpmTasks('grunt-contrib-clean');      // https://github.com/gruntjs/grunt-contrib-clean
    grunt.loadNpmTasks('grunt-contrib-concat');     // https://github.com/gruntjs/grunt-contrib-concat
    grunt.loadNpmTasks('grunt-contrib-copy');       // https://github.com/gruntjs/grunt-contrib-copy
    grunt.loadNpmTasks('grunt-contrib-less');       // https://github.com/gruntjs/grunt-contrib-less
    grunt.loadNpmTasks('grunt-inline-css');         // https://github.com/jgallen23/grunt-inline-css
    grunt.loadNpmTasks('grunt-postcss');            // https://github.com/nDmitry/grunt-postcss
    grunt.loadNpmTasks('grunt-usemin');             // https://github.com/yeoman/grunt-usemin

    grunt.registerTask('emails:build', [
        'clean:target',
        'copy:tmp',
        'useminPrepare:index',
        'less:generated',
        'concat:generated',
        'usemin:index',
        'postcss:index',
        'inlinecss:index'
    ]);
};