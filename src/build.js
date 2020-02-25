require('@babel/register')({
  presets: ['@babel/preset-react'],
  only: [/components/]
});

const path = require('path');
const glob = require('glob');
const { readFile, writeFile } = require('fs').promises;
const fsc = require('fs-extra');
const matter = require('gray-matter');
const requireDir = require('require-dir');
const chalk = require('chalk');
const MDX = require('@mdx-js/runtime');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const pkg = require('../package.json');

const log = (...args) => console.log(chalk.green(`[${pkg.name}]:`, ...args));

log.error = (...args) => console.log(chalk.red(`[error]:`, ...args));

const cwd = process.cwd();

const components = requireDir(path.resolve(cwd, 'src/components'));

const getFilename = fpath => path.basename(fpath, path.extname(fpath));

console.log(components);

const filepath = path.resolve(cwd, 'src/emails/**/*.{mdx,md}');

log('Reading files in', filepath);

glob(filepath, async function(err, files) {
  if (err) {
    return log.error(err);
  }

  files.forEach(async file => {
    const text = await readFile(file, 'utf8');

    const fm = matter(text);

    console.log(files, fm);

    try {
      const result = renderToStaticMarkup(
        React.createElement(
          MDX,
          {
            components
          },
          fm.content
        )
      );

      const filename = getFilename(file);

      log('writing file', filename);

      await writeFile(path.resolve(cwd, 'dist', filename + '.html'));

      log('done');
    } catch (err) {
      log.error(err);
    }
  });
});
