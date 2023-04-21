const gulp = require('gulp');
const { buildIosDesignTokens, exportPdfIcons } = require('./gulp_tasks/ios.js')

// iOS
const buildIos = gulp.series(
	buildIosDesignTokens,
	exportPdfIcons,
);

module.exports = {
	buildIos
}