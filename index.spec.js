const mockedLoaderObject = {
	cacheable: () => {}
};

const it = require('tape');
const loader = require('./index').bind(mockedLoaderObject);

it('should work without spaces', test => {
	test.plan(1);

	const input = `import {something} from 'lodash'`;
	const expectedOutput = `import something = require('lodash/something');`;

	const result = loader(input);

	test.equal(result, expectedOutput);
});

it('should work with spaces included', test => {
	test.plan(1);

	const input = `import { something } from 'lodash'`;
	const expectedOutput = `import something = require('lodash/something');`;


	const result = loader(input);

	test.equal(result, expectedOutput);
});

it('should work with multiple import members', test => {
	test.plan(1);

	const input = `import {something, something2} from 'lodash'`;
	const expectedOutput = `import something = require('lodash/something');
import something2 = require('lodash/something2');`;

	const result = loader(input);

	test.equal(result, expectedOutput);
});

it('should work with multiple imports', test => {
	test.plan(1);

	const input = `
import {something} from 'lodash';
import {something2, something3} from 'lodash';
`;
	const expectedOutput = `
import something = require('lodash/something');
import something2 = require('lodash/something2');
import something3 = require('lodash/something3');
`;

	const result = loader(input);

	test.equal(result, expectedOutput);
});

it('it should not affect other imports than lodash', test => {
	test.plan(1);

	const input = `
import {something} from 'lodash/something';
import {something2} from 'otherModule';
`;
	const expectedOutput = `
import {something} from 'lodash/something';
import {something2} from 'otherModule';
`;

	const result = loader(input);

	test.equal(result, expectedOutput);
});

it('it should not interfere with other code', test => {
	test.plan(1);

	const input = `
import {something} from 'lodash/something';
import {something2} from 'otherModule';

const test = 'somevalue';
`;
	const expectedOutput = `
import {something} from 'lodash/something';
import {something2} from 'otherModule';

const test = 'somevalue';
`;

	const result = loader(input);

	test.equal(result, expectedOutput);
});

it('should ignore importing all the modules (import *)', test => {
	test.plan(1);

	const input = `import * as _ from 'lodash';`;
	const expectedOutput = `import * as _ from 'lodash';`;

	const result = loader(input);

	test.equal(result, expectedOutput);
});

it("should ignore importing the default module (import _ from 'lodash')", test => {
	test.plan(1);

	const input = `import _ from 'lodash';`;
	const expectedOutput = `import _ from 'lodash';`;

	const result = loader(input);

	test.equal(result, expectedOutput);
});

it("should ignore importing for side-effects (import 'lodash')", test => {
	test.plan(1);

	const input = `import 'lodash';`;
	const expectedOutput = `import 'lodash';`;

	const result = loader(input);

	test.equal(result, expectedOutput);
});

it("should allow renaming imported members", test => {
	test.plan(1);

	const input = `import {something as something2} from 'lodash';`;
	const expectedOutput = `import something2 = require('lodash/something');`;

	const result = loader(input);

	test.equal(result, expectedOutput);
});

it("should allow renaming imported members on multilines", test => {
	test.plan(1);

	const input = `
import {
	something as something2,
	something3 as something4,
} from 'lodash';
`;
	const expectedOutput = `
import something2 = require('lodash/something');
import something4 = require('lodash/something3');
`;

	const result = loader(input);

	test.equal(result, expectedOutput);
});

it("should preserve the newlines at the end of the file", test => {
	test.plan(1);

	const input = `
import {something} from 'lodash';

`;
	const expectedOutput = `
import something = require('lodash/something');

`;

	const result = loader(input);

	test.equal(result, expectedOutput);
});