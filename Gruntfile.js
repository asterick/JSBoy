var fs = require('fs');

module.exports = function(grunt) {
    grunt.initConfig({
        sass: {
            dist: {
                options: {
                    style: 'expanded'
                },
                files: {
                    'web/main.css': ['sass/**/*.scss','!sass/**/_*.scss']
                }
            }
        },
        watch: {
            sass: {
                files: ["sass/**/*"],
                tasks: ["sass"]
            }
        },
        connect: {
            server: {
                options: {
                    port: 9001,
                    base: 'web'
                }
            }
        },
        browserify: {
            dev: {
                files: {
                    'web/main.js': ['src/main.jsx']
                },
                options: {
                    banner: fs.readFileSync('./src/util/polyfills.js', 'utf-8'),
                    transform: [
                        [ "reactify", {"es6": true} ]
                    ],
                    browserifyOptions: { /*debug: true*/ },
                    watch: true
                }
            }
        },
        jshint: {
            options: {
                evil: true
            },
            all: ['Gruntfile.js', 'src/**/*.js']
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask("default", ["browserify", "sass"]);
    grunt.registerTask("dev", ["connect", "default", "watch"]);
};
