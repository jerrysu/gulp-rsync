## gulp-rsync

Use the file transferring and syncing capabilities of rsync within your Gulp task.

### Prerequisites

rsync needs to be installed on your machine.

### Installation

```
npm install gulp-rsync --save-dev
```

### Usage

```js
var gulp = require('gulp');
var rsync = require('gulp-rsync');

gulp.task('deploy', function() {
  gulp.src('build/**')
    .pipe(rsync({
      root: 'build',
      hostname: 'example.com',
      destination: '/path/to/site'
    }));
});
```

### API

#### `rsync(options)`

##### `options`

###### `destination`

Type: `string`, **Required**

The destination path. Use `hostname` when using a remote path.

###### `root`

Type: `string`, Default: `process.cwd()`

Specifying a root path changes the path names that are transferred to the
destination. The paths piped into rsync must be within the root path (or the
plugin will yell at you).

```js
gulp.src('build/js/**']).pipe(rsync({destination: '/tmp'});
```

This will create the directory `build` in `/tmp` as well as the directory `js`
in `/tmp/build`.

```js
gulp.src('build/js/**']).pipe(rsync({root: 'build', destination: '/tmp'});
```

This will create the directory `js` in `/tmp`.

###### `hostname`

Type: `string`

The hostname of the destination. rsync will connect to this hostname using SSH
along with configuration in `~/.ssh/config` or SSH keys stored in a keychain.

When this is omitted, rsync will transfer the content to a local path.

###### `username`

Type: `string`

Used to specify a user for the remote host.

###### `shell`

Type: `string`

Typically, rsync is configured to use `ssh` by default, but you may prefer to
use `rsh` on a local network.

###### `port`

Type: `integer`

Used to specify an SSH port for the remote host. Note: This will override the
shell option and force the use of `ssh`.

###### `incremental`

Type: `boolean`, Default: `false`

If set to `true`, rsync will make incremental updates only. rsync will use the
checksum of every file to determine whether a file needs to be updated. This
will add a delay to the transfer, but will minimize the amount of files
transferred each time.

###### `progress`

Type: `boolean`, Default: `false`

If set to `true`, the transfer progress for each file will be displayed in the
console.

This looks like:

```
[20:49:53] gulp-rsync: Starting rsync to example.com:/var/www/example.com/html/...
[20:49:53] gulp-rsync: favicon.ico 
[20:49:53] gulp-rsync:         1150 100%  439.45kB/s    0:00:00 (xfer#1, to-check=12/13) 
[20:49:53] gulp-rsync: index.html 
[20:49:53] gulp-rsync:         2712 100%  101.86kB/s    0:00:00 (xfer#2, to-check=11/13) 
[20:49:53] gulp-rsync: css/style.1afca52f.css 
[20:49:53] gulp-rsync:         1445 100%   54.27kB/s    0:00:00 (xfer#3, to-check=9/13) 
[20:49:53] gulp-rsync: images/photo1.82515393.jpg 
[20:49:53] gulp-rsync:        31878 100%    1.09MB/s    0:00:00 (xfer#7, to-check=3/13) 
[20:49:53] gulp-rsync: images/photo2.2a41e1e3.jpg 
[20:49:53] gulp-rsync:        76988 100%    2.53MB/s    0:00:00 (xfer#9, to-check=1/13) 
[20:49:53] gulp-rsync:  
[20:49:53] gulp-rsync: sent 2401 bytes  received 2820 bytes  10442.00 bytes/sec 
[20:49:53] gulp-rsync: total size is 114173  speedup is 57.01 
[20:49:53] gulp-rsync: Completed rsync.
```

###### `relative`

Type: `boolean`, Default: `true`

By default, gulp-rsync will transfer all paths relative to the `root` specified.
If you want to transfer assets from multiple paths to a single destination, you
can set `relative` to `false`.

```js
gulp.src(['build/js/**/*.js', 'build/css/**/*.css', 'build/images/**'])
  .pipe(rsync({
    hostname: 'example.cdn',
    destination: '/path/to/all/assets',
    relative: false
  });
```

This will transfer all assets (*.js, *.css, and images) into a single directory.

###### `emptyDirectories`

Type: `boolean`, Default: `false`

If set to `true`, rsync will create empty directories.

###### `times`

Type: `boolean`, Default: `false`

Preserves times of the transferred files.

###### `compress`

Type: `boolean`, Default: `false`

Compresses file data during transfer.

###### `recursive`

Type: `boolean`, Default: `false`

If set to `true`, rsync will transfer all files and subdirectories recursively.
This is not necessary when using glob(s) with `gulp.src()`. However, it can be
combined with non-globbed paths to transfer all files:

```
gulp.src(['build/js', 'build/css', 'build/images'])
  .pipe(rsync({
    root: 'build',
    destination: '/tmp',
    recursive: true
  });
```

This is the same as:

```
gulp.src(['build/js/**', 'build/css/**', 'build/images/**'])
  .pipe(rsync({
    root: 'build',
    destination: '/tmp'
  });
```

The difference is that the actual `rsync` command used in the first example is
much shorter.

###### clean

Type: `boolean`, Default: `false`

This must be used with `recursive` set to `true`. If set to `true`, this
instructs rsync to delete all files and directories that are not in the source
paths. **Be careful with this option as it could lead to data loss.**

###### `exclude`

Type: `string|Array<string>`

Enables files or directories matching the pattern(s) provided to be excluded
from the transfer. This is probably most useful when `recursive` is set to
`true` since it is typically better to make these exclusions in `gulp.src()`.

###### `include`

Type: `string|Array<string>`

Used with `exclude`. This adds exceptions for the exclusions.

For example:

```
gulp.src('build')
  .pipe(rsync({
    root: 'build',
    destination: '/tmp',
    recursive: true,
    exclude: ['*.css', '*.js'],
    include: ['*.min.css', '*.min.js']
  });
```

This will transfer only minified CSS and JS files.

###### `update`

Type: `boolean`, Default: `false`

Skip files that are newer on the receiving end.

###### `silent`

Type: `boolean`, Default: `false`

Turns off logging.

#### License

> The MIT License (MIT)
>
> Copyright © 2014 Jerry Su, http://jerrysu.me
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of
> this software and associated documentation files (the “Software”), to deal in
> the Software without restriction, including without limitation the rights to
> use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
> the Software, and to permit persons to whom the Software is furnished to do so,
> subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
> FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
> COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
> IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
> CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
