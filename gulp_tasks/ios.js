const { PUBLIC_DESIGN_TOKEN_SOURCE_LIST } = require('./myConstants.js')
const gulp = require('gulp')
const gulpRename = require('gulp-rename')
const del = require('del')
const through2 = require('through2')
const gulpFirst = require('gulp-first')
const styleDictionary = require('style-dictionary')

const swiftEnumFormatter = (type, title, { formatHelpers }) => {
	const { fileHeader } = formatHelpers;

	return function ({dictionary, file}) {
		const indentation = `    `;
		const template = token => `${indentation}/// ${token.value}\n${indentation}${type} static let ${token.name} = ${token.value}`

		return fileHeader({file}) +
			'import UIKit\n\n' +
			type + ' enum ' + title + ' {\n' +
			dictionary.allTokens.map(template).join('\n') +
			'\n}\n';
	};
}

function buildIosDesignTokens(done) {
	const buildPath = '../funnowiOSDSTest/Classes/Foundations/DesignTokens/';
	del.sync([buildPath], {
		force: true,
	});
	const PublicStyleDictionary = styleDictionary.extend({
		source: PUBLIC_DESIGN_TOKEN_SOURCE_LIST,
		platforms: {
			'ios-swift': {
				transforms: [
					'name/cti/camel',
					'color/UIColorSwift',
					'size/swift/remToCGFloat',
				],
				basePxFontSize: 1,
				buildPath,
				files: [
					{
						destination: 'FunnowDesignTokens.swift',
						format: 'swiftEnumFormat',
						className: 'FunnowDesignTokens',
						filter(token) {
							return !token.attributes.isPrivate;
						},
						"options": {
				          "imports": "UIKit",
				          "objectType": "enum",
				          "accessControl": "public"
				        }
					},
				],
			},
		},
	});

	PublicStyleDictionary.registerFormat({
		name: 'swiftEnumFormat',
		formatter: swiftEnumFormatter('public', 'FunnowDesignTokens', PublicStyleDictionary)
	});

	PublicStyleDictionary.buildAllPlatforms();

	done();
}

function exportPdfIcons(done) {
	const buildPath = '../funnowiOSDSTest/Assets/Icons.xcassets';
	del.sync([buildPath], {
		force: true,
	});

	return gulp.src('./icons/*.pdf')
		// 1. create folders for each icon and output pdf file in the corresponding folder
		.pipe(gulpRename(file => ({
			...file,
			dirname: `${ file.basename }.imageset`,
		})))
		.pipe(gulp.dest(buildPath))

		// 2. create Contents.json files for each icon in the corresponding folder
		.pipe(through2.obj((file, _, cb) => {
			file.contents = Buffer.from(JSON.stringify({
				images: [
					{
						filename: file.basename,
						idiom: 'universal'
					},
				],
				info: {
					author: 'xcode',
					version: 1
				},
				properties: {
					'preserves-vector-representation' : true
				}
			}));
			cb(null, file);
		}))
		.pipe(gulpRename(file => ({
			...file,
			basename: 'Contents',
			extname: '.json',
		})))
		.pipe(gulp.dest(buildPath))

		// 3. create Contents.json in /Icons.xcassets
		.pipe(gulpFirst())
		.pipe(through2.obj((file, _, cb) => {
			file.contents = Buffer.from(JSON.stringify({
					info: {
						author: 'xcode',
						version: 1
					}
				}
			));
			cb(null, file);
		}))
		.pipe(gulpRename(file => ({
			...file,
			dirname: './',
			basename: 'Contents',
			extname: '.json',
		})))
		.pipe(gulp.dest(buildPath));		
}

module.exports = {
	exportPdfIcons,
	buildIosDesignTokens
}