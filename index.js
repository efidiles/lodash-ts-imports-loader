const ts = require('typescript');

const LODASH_MODULE_NAME = 'lodash';
const NEW_LINE = '\n';

module.exports = function (source) {
	this.cacheable();
	let output = '';

	const sourceFile = ts.createSourceFile('source.ts', source, ts.ScriptTarget.ES2015, true);

	ts.forEachChild(sourceFile, parseNode);
	return output.trim();

	function parseNode(node, depth) {
		let textToAppend = node.getText() + NEW_LINE;

		if (node.kind === ts.SyntaxKind.ImportDeclaration) {
			const importParts = parseImportNode(node);

			if (isLodashModule(importParts)) {
				let transpiledImportText = transpileToTypescriptSyntax(importParts);
				textToAppend = transpiledImportText;
			}
		}

		appendToOutput(textToAppend);
	}

	function isLodashModule(importParts) {
		const isRootLodashPackagePath = importParts.modulePath === LODASH_MODULE_NAME;
		const hasImportMembers = importParts.importMembers && importParts.importMembers.length > 0;

		return isRootLodashPackagePath && hasImportMembers;
	}

	function transpileToTypescriptSyntax(importParts) {
		const modulePath = importParts.modulePath;

		const transpiledImports = importParts.importMembers.reduce(
			(transpiledText, importMember) => {
				transpiledText += `import ${importMember} = require('${modulePath}/${importMember}');`;
				transpiledText += NEW_LINE;
				return transpiledText;
			}
			, ''
		);

		return transpiledImports;
	}

	function parseImportNode(importNode) {
		const importParts = {};

		ts.forEachChild(importNode, node => {
			if (node.kind === ts.SyntaxKind.ImportClause) {
				importParts.importMembers = getImportMembersFromImportClause(node);
			}

			if (node.kind === ts.SyntaxKind.StringLiteral) {
				importParts.modulePath = getModuleName(node);
			}
		});

		return importParts;
	}

	function getModuleName(node) {
		const nodeText = node.getText();
		const nodeTextWithoutQuotes = nodeText.replace(/'/g, '').replace(/"/g, '');
		return nodeTextWithoutQuotes;
	}

	function getImportMembersFromImportClause(node) {
		const nodeText = node.getText();

		if (!isImportWithMembers(nodeText)) {
			return [];
		}

		const withoutCurlyBrackets = nodeText.replace('{', '').replace('}', '');
		const allMembers = withoutCurlyBrackets.split(',');
		const allTrimmedMembers = allMembers.map(s => s.trim());
		return allTrimmedMembers;
	}

	function isImportWithMembers(clauseText) {
		return clauseText.indexOf('{') === 0;
	}

	function appendToOutput(newText) {
		output += newText;
	}
};
