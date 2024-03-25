/*
 * NoBrokenMessages.js - check for FormatMessage instances separated from
 * each other by non-breaking components
 *
 * Copyright © 2024 Box, Inc.
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

import { Result, Rule } from "ilib-lint-common";
import { nonBreakingTags } from 'ilib-tools-common';

import _traverse from "@babel/traverse";
const traverse = _traverse.default;
import _generate from "@babel/generator";
const generate = _generate.default;

/**
 * Return true if the current node is a breaking node. To be a non-breaking,
 * a node has to either be a FormattedMessage, a plain text node, or an HTML
 * component. All other types of nodes are breaking nodes. (That is, they
 * break a stream of text that should all be in one node instead of broken
 * apart in multiple nodes.)
 *
 * @private
 * @param {Node} node the node to check
 * @returns {boolean} true if the current node is a breaking node
 */
function isBreakingNode(node) {
    switch (node.type) {
        case 'JSXElement':
            // check for non-breaking HTML element
            if (node.openingElement?.name?.type === "JSXIdentifier") {
                const name = node.openingElement.name.name;
                if (nonBreakingTags[name] || name === "FormattedMessage") {
                    return false;
                }
            }
            break;

        case 'JSXText':
            return false;

        default:
            break;
    }
    return true;
}

/**
 * Count the number of formatted message components and non-breaking tags
 * in a given array of nodes. Recursively descend into all children and
 * calculate the totals.
 *
 * @private
 * @param {Array.<Node>} nodes
 * @returns {{formattedMessage: number, nonBreaking: number}} the counts
 */
function countNodeTypes(nodes) {
    let counts = {
        formattedMessage: 0,
        nonBreaking: 0
    };
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.type === "JSXElement") {
            if (node.openingElement?.name?.name === "FormattedMessage") {
                counts.formattedMessage++;
            } else {
                counts.nonBreaking++;
            }
        }
        if (node.children) {
            const subCounts = countNodeTypes(node.children);
            counts.formattedMessage += subCounts.formattedMessage;
            counts.nonBreaking += subCounts.nonBreaking;
        }
    }
    return counts;
}

/**
 * Return true if the given array of nodes represents a broken string.
 * @private
 * @param {Array.<Node>} nodes
 * @returns {boolean} true if the strings is broken
 */
function isBrokenString(nodes) {
    const counts = countNodeTypes(nodes);
    return counts.formattedMessage > 1 || counts.nonBreaking > 0;
}

// type imports
/** @typedef {import("ilib-lint-common").IntermediateRepresentation} IntermediateRepresentation */
/** @typedef {import("@babel/parser").ParseResult<import("@babel/types").File>} ParseResult */

class NoBrokenMessages extends Rule {
    /** @readonly */
    name = "no-broken-messages";

    /** @readonly */
    description = "Check for FormattedMessage instances separated by non-breaking components";

    /** @readonly */
    link =
        "https://github.com/ilib-js/ilib-lint-react/blob/main/docs/no-broken-messages.md";

    /** @readonly */
    type = "babel-ast";

    /** @override */
    match({ ir }) {
        if (ir.type !== this.type) {
            throw new Error(`Unexpected representation type!`);
        }

        const tree = ir.getRepresentation();
        const results = [];
        const rule = this;

        let index = 0;
        const nodes = [];
        const nodeIndex = {};
        const formattedMessages = [];

        traverse(tree, {
            // find all the interesting nodes and flatten them into an array
            enter(path) {
                const node = path.node;
                if (node.type.startsWith("JSX")) {
                    node.index = index++;
                    nodes.push(node);
                    nodeIndex(String(node.index)) = i;
                    if (node.type === "JSXElement" && node.openingElement?.name?.name === "FormattedMessage") {
                    }
                }
            }
        });

        traverse(tree, {
            enter(path) {
                // check the children of this element if there are any to see if there
                // are sequences of FormattedMessage + non-breaking component + FormattedMessage
                if (path.node?.children?.length > 0) {
                    let brokenElements = [];
                    let children = path.node.children;

                    for (let i = 0; i < children.length; i++) {
                        if (isBreakingNode(children[i])) {
                            if (brokenElements.length > 3 && isBrokenString(brokenElements)) {
                                results.push(new Result({
                                    pathName: ir.sourceFile.getPath(),
                                    severity: "error",
                                    description: `Found FormattedMessage components separated by non-breaking components. This indicates a broken string. Use one string with rich-text-formatting instead.`,
                                    id: undefined,
                                    lineNumber: path.node.loc.start.line,
                                    charNumber: path.node.loc.start.column,
                                    endLineNumber: path.node.loc.end.line,
                                    endCharNumber: path.node.loc.end.column,
                                    // @TODO make a real highlight once IR contains raw content of the linted source file
                                    highlight: `<e0>${generate(path.node).code}</e0>`,
                                    rule,
                                    severity: "error"
                                }));
                            }
                            // breaking component means start afresh
                            brokenElements = [];
                        } else {
                            brokenElements.push(children[i]);
                        }
                    }

                    if (brokenElements.length > 3 && isBrokenString(brokenElements)) {
                        results.push(new Result({
                            pathName: ir.sourceFile.getPath(),
                            severity: "error",
                            description: `Found FormattedMessage components separated by non-breaking components. This indicates a broken string. Use one string with rich-text-formatting instead.`,
                            id: undefined,
                            lineNumber: path.node.loc.start.line,
                            charNumber: path.node.loc.start.column,
                            endLineNumber: path.node.loc.end.line,
                            endCharNumber: path.node.loc.end.column,
                            // @TODO make a real highlight once IR contains raw content of the linted source file
                            highlight: `<e0>${generate(path.node).code}</e0>`,
                            rule,
                            severity: "error"
                        }));
                    }
                }
            }
        });

        return results;
    }
}

export default NoBrokenMessages;
