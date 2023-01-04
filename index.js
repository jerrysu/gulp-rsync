/*jshint strict: false*/

'use strict';

var PluginError = require('plugin-error');
var fancylog = require('fancy-log');
var log = require('./log.js');
var path = require('path');
var rsync = require('./rsync.js');
var through = require('through2');

module.exports = function(options) {
  if (typeof options !== 'object') {
    this.emit(
      'error',
      new PluginError('gulp-rsync', 'options must be an object')
    );
  }

  if (typeof options.destination !== 'string') {
    throw new PluginError(
      'gulp-rsync',
      'destination must be a string to a desired path'
    );
  }

  var sources = [];

  var cwd = options.root ? path.resolve(options.root) : process.cwd();

  return through.obj(function(file, enc, cb) {
    if (file.isStream()) {
      this.emit(
        'error',
        new PluginError('gulp-rsync', 'Streams are not supported!')
      );
    }

    if (path.relative(cwd, file.path).indexOf('..') === 0) {
      this.emit(
        'error',
        new PluginError('gulp-rsync', 'Source contains paths outside of root')
      );
    }

    sources.push(file);
    cb(null, file);
  }, function(cb) {
    sources = sources.filter(function(source) {
      return !source.isNull() ||
        options.emptyDirectories ||
        ( options.recursive
          && ( source.path === cwd
               || source.path.substr(0, cwd.length + 1) === (cwd + path.sep)
             )
        );
    });

    if (sources.length === 0) {
      cb();
      return;
    }

    var shell = options.shell;
    if (options.port) {
      shell = 'ssh -p ' + options.port;
    }

    var destination = options.destination;
    if (options.hostname) {
      destination = options.hostname + ':' + destination;
      if (options.username) {
        destination = options.username + '@' + destination;
      }
    } else {
      destination = path.relative(cwd, path.resolve(process.cwd(), destination));
    }
    
    options.relative = options.relative !== false;

    var config = {
      options: {
        'a': options.archive,
        'c': options.incremental,
        'd': options.emptyDirectories,
        'e': shell,
        'n': options.dryrun,
        'r': options.recursive && !options.archive,
        'R': options.relative,
        't': options.times && !options.archive,
        'u': options.update,
        'v': !options.silent,
        'z': options.compress,
        'omit-dir-times': options.omit_dir_times,
        'no-perms': options.no_perms,
        'chmod': options.chmod,
        'chown': options.chown,
        'exclude': options.exclude,
        'include': options.include,
        'progress': options.progress,
        'links': options.links
      },
      source: sources.map(function(source) {
        var loc = options.relative
          ? (path.relative(cwd, source.path) || '.' )
          : source.path;

        if(process.platform === 'win32') {
          loc = loc.replace(/\\/g, '/');

          if(!options.relative) {
            loc = loc.replace(/^([A-Z]):/,
              function(match, p1, p2){
                return '/cygdrive/' + p1.toLowerCase();
              }
            );
          }
        }

        return loc;
      }),
      destination: destination,
      cwd: cwd
    };

    if (options.options) {
      for (var key in options.options) { config.options[key] = options.options[key]; }
    }

    if (options.clean) {
      if (!options.recursive && !options.archive) {
        this.emit(
          'error',
          new PluginError('gulp-rsync', 'clean requires recursive or archive option')
        );
      }
      config.options['delete'] = true;
    }

    if (!options.silent) {
      var handler = function(data) {
        data.toString().split('\r').forEach(function(chunk) {
          chunk.split('\n').forEach(function(line, j, lines) {
            log('gulp-rsync:', line, (j < lines.length - 1 ? '\n' : ''));
          });
        });
      };
      config.stdoutHandler = handler;
      config.stderrHandler = handler;

      fancylog('gulp-rsync:', 'Starting rsync to ' + destination + '...');
    }

    rsync(config).execute(function(error, command) {
      if (error) {
        this.emit('error', new PluginError('gulp-rsync', error.stack));
      }
      if (options.command) {
        fancylog(command);
      }
      if (!options.silent) {
        fancylog('gulp-rsync:', 'Completed rsync.');
      }
      cb();
    }.bind(this));
  });
};
