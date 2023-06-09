/*
 * testJSParser.js - test the React JS parser
 *
 * Copyright © 2023 Box, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ResourceString } from 'ilib-tools-common';

import JSParser from '../src/parsers/JSParser.js';

import { Result, IntermediateRepresentation } from 'i18nlint-common';

export const testJSParser = {
    testJSParserConstructorEmpty: function(test) {
        test.expect(1);

        const parser = new JSParser();
        test.ok(parser);

        test.done();
    },

    testJSParserConstructorPath: function(test) {
        test.expect(1);

        const parser = new JSParser({
            filePath: "./test/testfiles/test.js"
        });
        test.ok(parser);

        test.done();
    },

    testJSParserGetDescription: function(test) {
        test.expect(2);

        const parser = new JSParser();
        test.ok(parser);

        test.equal(parser.getDescription(), "A parser for JS files.");

        test.done();
    },

    testJSParserGetName: function(test) {
        test.expect(2);

        const parser = new JSParser();
        test.ok(parser);

        test.equal(parser.getName(), "js");

        test.done();
    },

    testJSParserGetExtensions: function(test) {
        test.expect(2);

        const parser = new JSParser();
        test.ok(parser);

        test.deepEqual(parser.getExtensions(), [ "js" ]);

        test.done();
    },

    testJSParserSimple: function(test) {
        test.expect(3);

        const parser = new JSParser();
        test.ok(parser);

        const actual = parser.parseString("import foo from '../src/index.js';", "x/y");
        test.ok(actual);

        const expected = new IntermediateRepresentation({
            "type": "ast-jstree",
            "ir": {
                "type": 'Program',
                "start": 0,
                "end": 34,
                "loc": {
                    "start": { "line": 1, "column": 0 },
                    "end": { "line": 1, "column": 34 }
                },
                "body": [
                    {
                        "type": 'ImportDeclaration',
                        "start": 0,
                        "end": 34,
                        "loc": {
                            "start": { "line": 1, "column": 0 },
                            "end": { "line": 1, "column": 34 }
                        },
                        "specifiers": [
                            {
                                "type": 'ImportDefaultSpecifier',
                                "start": 7,
                                "end": 10,
                                "loc": {
                                    "start": { "line": 1, "column": 7 },
                                    "end": { "line": 1, "column": 10 }
                                },
                                "local": {
                                    "type": 'Identifier',
                                    "start": 7,
                                    "end": 10,
                                    "loc": {
                                        "start": { "line": 1, "column": 7 },
                                        "end": { "line": 1, "column": 10 }
                                    },
                                    "name": 'foo'
                                }
                            }
                        ],
                        "source": {
                            "type": 'Literal',
                            "start": 16,
                            "end": 33,
                            "loc": {
                                "start": { "line": 1, "column": 16 },
                                "end": { "line": 1, "column": 33 }
                            },
                            "value": '../src/index.js',
                            "raw": "'../src/index.js'"
                        }
                    }
                ],
                "sourceType": 'module'
            },
            filePath: "x/y"
        });
        test.deepEqual(actual, expected);

        test.done();
    },

    testJSParserMoreComplex: function(test) {
        test.expect(3);

        const parser = new JSParser();
        test.ok(parser);

        const actual = parser.parseString(
            `// comment
            import foo from '../src/index.js';

            const str = "String";
            `, "x/y");
        test.ok(actual);

        const expected = new IntermediateRepresentation({
            "type": "ast-jstree",
            "ir": {
                "type": "Program",
                "start": 0,
                "end": 105,
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 0
                    },
                    "end": {
                        "line": 5,
                        "column": 12
                    }
                },
                "body": [
                    {
                        "type": "ImportDeclaration",
                        "start": 23,
                        "end": 57,
                        "loc": {
                            "start": {
                                "line": 2,
                                "column": 12
                            },
                            "end": {
                                "line": 2,
                                "column": 46
                            }
                        },
                        "specifiers": [
                            {
                                "type": "ImportDefaultSpecifier",
                                "start": 30,
                                "end": 33,
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 19
                                    },
                                    "end": {
                                        "line": 2,
                                        "column": 22
                                    }
                                },
                                "local": {
                                    "type": "Identifier",
                                    "start": 30,
                                    "end": 33,
                                    "loc": {
                                        "start": {
                                            "line": 2,
                                            "column": 19
                                        },
                                        "end": {
                                            "line": 2,
                                            "column": 22
                                        }
                                    },
                                    "name": "foo"
                                }
                            }
                        ],
                        "source": {
                            "type": "Literal",
                            "start": 39,
                            "end": 56,
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 28
                                },
                                "end": {
                                    "line": 2,
                                    "column": 45
                                }
                            },
                            "value": "../src/index.js",
                            "raw": "'../src/index.js'"
                        }
                    },
                    {
                        "type": "VariableDeclaration",
                        "start": 71,
                        "end": 92,
                        "loc": {
                            "start": {
                                "line": 4,
                                "column": 12
                            },
                            "end": {
                                "line": 4,
                                "column": 33
                            }
                        },
                        "declarations": [
                            {
                                "type": "VariableDeclarator",
                                "start": 77,
                                "end": 91,
                                "loc": {
                                    "start": {
                                        "line": 4,
                                        "column": 18
                                    },
                                    "end": {
                                        "line": 4,
                                        "column": 32
                                    }
                                },
                                "id": {
                                    "type": "Identifier",
                                    "start": 77,
                                    "end": 80,
                                    "loc": {
                                        "start": {
                                            "line": 4,
                                            "column": 18
                                        },
                                        "end": {
                                            "line": 4,
                                            "column": 21
                                        }
                                    },
                                    "name": "str"
                                },
                                "init": {
                                    "type": "Literal",
                                    "start": 83,
                                    "end": 91,
                                    "loc": {
                                        "start": {
                                            "line": 4,
                                            "column": 24
                                        },
                                        "end": {
                                            "line": 4,
                                            "column": 32
                                        }
                                    },
                                    "value": "String",
                                    "raw": "\"String\""
                                }
                            }
                        ],
                        "kind": "const"
                    }
                ],
                "sourceType": "module"
            },
            "filePath": "x/y"
        });
        test.deepEqual(actual, expected);

        test.done();
    },
};

