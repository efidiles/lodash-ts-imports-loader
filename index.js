const ts = require('typescript');

const LODASH_MODULE_NAME = 'lodash';
const NEW_LINE = '\n';
const RENAMED_MEMBER_SEPARATOR = ' as ';

module.exports = function (source) {
	let output = source;

	this.cacheable();

	const sourceFile = ts.createSourceFile('source.ts', source, ts.ScriptTarget.ES2015, true);

	ts.forEachChild(sourceFile, parseNode);

	return output;

	function parseNode(node, depth) {
		if (node.kind === ts.SyntaxKind.ImportDeclaration) {
			const importText = node.getText();
			const importParts = parseImportNode(node);

			if (isLodashModule(importParts)) {
				let transpiledImportText = transpileToTypescriptSyntax(importParts);

				replaceInOutput(importText, transpiledImportText);
			}
		}
	}

	function isLodashModule(importParts) {
		const isRootLodashPackagePath = importParts.modulePath === LODASH_MODULE_NAME;
		const hasImportMembers = importParts.importMembers && importParts.importMembers.length > 0;

		return isRootLodashPackagePath && hasImportMembers;
	}

	function transpileToTypescriptSyntax(importParts) {
		const modulePath = importParts.modulePath;

		const transpiledImports = importParts.importMembers.reduce(
			(transpiledText, importMember, memberIndex) => {
				let transpiledImport = '';

				if (isRenamedMemberObject(importMember)) {
					const memberName = importMember.memberName;
					const newName = importMember.memberNewName;

					transpiledImport += `import ${newName} = require('${modulePath}/${memberName}');`;
				} else {
					transpiledImport += `import ${importMember} = require('${modulePath}/${importMember}');`;
				}

				if (memberIndex > 0) {
					transpiledImport = prependNewLine(transpiledImport);
				}

				return transpiledText + transpiledImport;
			}
			, ''
		);

		return transpiledImports;
	}

	function prependNewLine(transpiledImport) {
		return NEW_LINE + transpiledImport;
	}

	function isRenamedMemberObject(importMember) {
		return !!importMember.memberName;
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
		const allRawMembers = withoutCurlyBrackets.split(',');

		const allParsedMembers = allRawMembers
			.filter(clearEmptyValues)
			.map(rawMemberText => {
			const trimmedRawMemberText = rawMemberText.trim();

			if (isRenamedMember(rawMemberText)) {
				return getRenamedMemberParts(rawMemberText)
			}

			return rawMemberText.trim();
		});

		return allParsedMembers;

		function clearEmptyValues(rawMemberText) {
			return !!rawMemberText.trim().length;
		}
	}

	function isRenamedMember(memberText) {
		return memberText.indexOf(RENAMED_MEMBER_SEPARATOR) !== -1;
	}

	function getRenamedMemberParts(rawMemberText) {
		const memberParts = rawMemberText.trim().split(RENAMED_MEMBER_SEPARATOR);

		return {
			memberName: memberParts[0].trim(),
			memberNewName: memberParts[1].trim()
		};
	}

	function isImportWithMembers(clauseText) {
		return clauseText.indexOf('{') === 0;
	}

	function replaceInOutput(toReplace, replacement) {
		output = output.replace(toReplace, replacement);
	}
};
