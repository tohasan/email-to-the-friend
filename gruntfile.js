
module.exports = function (grunt) {
    var targetDir = 'target';
    var tmpDir = targetDir + '/.tmp';
    var pageTmpDir = tmpDir + '/emails';
    var pageTmp = pageTmpDir + '/index.html';
    var pageTarget = targetDir + '/index.html';

    // Measures the time each task takes
    require('time-grunt')(grunt);

    // Tasks
    grunt.initConfig({
        less: {
            generated: {
                options: {
                    plugins: [
                        new (require('less-plugin-autoprefix'))({   // https://github.com/less/less-plugin-autoprefix
                            browsers: ["last 2 versions", "> 1%"]   // ie >= 8; https://github.com/ai/browserslist
                        }),
                        new (require('less-plugin-clean-css'))({ // pass cleanCssOptions as parameter: https://github.com/jakubpawlowicz/clean-css
                            advanced: false,            // set to false to disable advanced optimizations - selector & property merging, reduction, etc.
                            aggressiveMerging: false,   // set to false to disable aggressive merging of properties.
                            keepBreaks: false,          // whether to keep line breaks (default is false)
                            mediaMerging: false,        // whether to merge @media blocks (default is true)
                            shorthandCompacting: false, // set to false to skip shorthand compacting (default is true unless sourceMap is set when it's false)
                            roundingPrecision: 0,       // rounding precision; defaults to 2; -1 disables rounding
                            restructuring: false        // set to false to disable restructuring in advanced optimizations
                        })
                    ]
                }
            }
        },
        uglify: {
            generated: {
                options: {
                    sourceMap: false,
                    sourceMapIncludeSources: false
                }
            }
        },
        concat: {
            generated: {}
        },
        copy: {
            target: {
                files: [{
                    src: pageTmp,
                    dest: pageTarget
                }]
            }
        },
        useminPrepare: {
            src: pageTmp,
            options: {
                dest: pageTmpDir,
                root: 'emails',
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
            options: {
                blockReplacements: {
                    less: function (block) {
                        return '<link rel="stylesheet" href="' + block.dest + '">';
                    }
                }
            },
            index: pageTmp
        },
        clean: {
            target: targetDir
        },
        inlinecss: {
            options: {
                xmlMode: true,
                applyWidthAttributes: true,
                applyHeightAttributes: true,
                applyAttributesTableElements: true,
                preserveImportant: true,
                preserveMediaQueries: false,
                insertPreservedExtraCss: false,
                webResources: {
                    scripts: false,
                    images: false
                }
            },
            files: pageTmp
        }
    });

    // Load grunt plugins installed using npm install
    grunt.loadNpmTasks('grunt-contrib-clean');      // https://github.com/gruntjs/grunt-contrib-clean
    grunt.loadNpmTasks('grunt-contrib-concat');     // https://github.com/gruntjs/grunt-contrib-concat
    grunt.loadNpmTasks('grunt-contrib-copy');       // https://github.com/gruntjs/grunt-contrib-copy
    grunt.loadNpmTasks('grunt-contrib-less');       // https://github.com/gruntjs/grunt-contrib-less
    grunt.loadNpmTasks('grunt-contrib-uglify');     // https://github.com/gruntjs/grunt-contrib-uglify
    grunt.loadNpmTasks('grunt-text-replace');       // https://github.com/yoniholmes/grunt-text-replace
    grunt.loadNpmTasks('grunt-usemin');             // https://github.com/yeoman/grunt-usemin
    grunt.loadNpmTasks('grunt-inline-css');         // https://github.com/jgallen23/grunt-inline-css

    grunt.registerTask('templates:build', [
        'clean:target',
        'useminPrepare:index'
    ]);
};