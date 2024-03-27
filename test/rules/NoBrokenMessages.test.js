/*
 * NoBrokenMessages.test.js
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

import { Result, SourceFile } from "ilib-lint-common";

import FlowParser from "../../src/parsers/FlowParser.js";
import JSXParser from "../../src/parsers/JSXParser.js";
import TSXParser from "../../src/parsers/TSXParser.js";
import NoBrokenMessages from "../../src/rules/NoBrokenMessages.js";
import { trimIndent } from "../utils.js";

/** @typedef {import("ilib-lint-common").IntermediateRepresentation} IntermediateRepresentation */

describe("No Broken FormattedMessage components rule", () => {
    describe("Flow JSX", () => {
        const getFlowJsxIr = (filePath, content) => {
            const parser = new FlowParser();
            const sourceFile = new SourceFile(filePath, {});
            sourceFile.content = trimIndent(content);
            const [ir] = parser.parse(sourceFile);
            return ir;
        };

        test("Broken FormattedMessage next to each another", () => {
debugger;
            const ir = getFlowJsxIr(
                "x/y.js",
                `
                // @flow
                import * as React from "react";
                import { Button, Link, FormattedCompMessage } from "components";

                export class CustomComponent extends React.Component {
                    render() {
                        return (
                            <>
                                <FormattedMessage
                                    id="unique.you.agree"
                                    defaultMessage="You agree to the "
                                    description="translator's note"
                                />
                                <a href="https://myserver.com/a/b/c.html">
                                <FormattedMessage
                                    id="unique.terms-and-conditions"
                                    defaultMessage="terms and conditions"
                                    description="translator's note"
                                />
                                </a>
                                <FormattedMessage
                                    id="unique.by-using-this"
                                    defaultMessage=" by using this product."
                                    description="translator's note"
                                />
                            </>
                        );
                    }
                }
                `
            );

            const rule = new NoBrokenMessages();

            const result = rule.match({ ir });

            const expected = [
                new Result({
                    severity: "error",
                    description:
                        "Found FormattedMessage components separated by non-breaking components. This indicates a broken string. Use one string with rich-text-formatting instead.",
                    pathName: "x/y.js",
                    rule,
                    highlight:
`<e0><>
                <FormattedMessage id=\"unique.you.agree\" defaultMessage=\"You agree to the \" description=\"translator's note\" />
                <a href=\"https://myserver.com/a/b/c.html\">
                <FormattedMessage id=\"unique.terms-and-conditions\" defaultMessage=\"terms and conditions\" description=\"translator's note\" />
                </a>
                <FormattedMessage id=\"unique.by-using-this\" defaultMessage=\" by using this product.\" description=\"translator's note\" />
            </></e0>`,
                    lineNumber: 10,
                    charNumber: 16,
                    endLineNumber: 14,
                    endCharNumber: 18,
                })
            ];

            expect(Array.isArray(result)).toBeTruthy();
            expect(result.length).toBe(1);
            expect(result).toStrictEqual(expected);
        });

        test("Broken FormattedMessage next to each another", () => {
debugger;
            const ir = getFlowJsxIr(
                "x/y.js",
                `
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Section from 'box-ui-elements/es/components/section';

export const SharedLinksFormRestrictionRadioGroupSection = ({ onChange, value }: Props) => (
    <Section
        description={
            <>
                <FormattedMessage {...messages.sharedLinkRestrictionDescription} />
                &nbsp;
                <a
                    href="https://support.box.com/hc/en-us/articles/36004"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <FormattedMessage {...messages.sharedLinkRestrictionhHelpLink} />
                </a>
            </>
        }
        title={<FormattedMessage {...messages.sharedLinkRestriction} />}
    >
        <SharedLinksFormRestrictionRadioGroup onChange={onChange} value={value} />
    </Section>
);
`
            );

            const rule = new NoBrokenMessages();

            const result = rule.match({ ir });

            const expected = [
                new Result({
                    severity: "error",
                    description:
                        "Found FormattedMessage components separated by non-breaking components. This indicates a broken string. Use one string with rich-text-formatting instead.",
                    pathName: "x/y.js",
                    rule,
                    highlight:
`
            <>
                <FormattedMessage {...messages.sharedLinkRestrictionDescription} />
                &nbsp;
                <a
                    href="https://support.box.com/hc/en-us/articles/36004"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <FormattedMessage {...messages.sharedLinkRestrictionhHelpLink} />
                </a>
            </>
`,
                    lineNumber: 10,
                    charNumber: 16,
                    endLineNumber: 14,
                    endCharNumber: 18,
                })
            ];

            expect(Array.isArray(result)).toBeTruthy();
            expect(result.length).toBe(1);
            expect(result).toStrictEqual(expected);
        });


/*

These are a problem:

                <InlineNotice className="saveFileToDeviceNotice">
                    <FormattedMessage {...messages.restrictNoticeTitle} />
                    <FormattedMessage {...messages.restrictNoticeAndroid} />
                    <FormattedMessage {...messages.restrictNoticeIos} />
                </InlineNotice>


            <span>
                <FormattedMessage {...messages.iWorkSectionDescription} />{' '}
                <Link href={supportURL} rel="noopener" target="_blank">
                    <FormattedMessage {...messages.learnMoreLink} />
                </Link>
            </span>

These should not cause problem:

    const description = (
        <div className="form_tip">
            <p className="legal">
                <FormattedMessage {...messages.description} tagName="p" />
                <FormattedMessage {...messages.tip} tagName="p" />
            </p>
        </div>
    );

            <Field
                component={CheckboxField}
                label={renderLabelWithTooltip(
                    <FormattedMessage {...messages.categoryFeatured} />,
                    <FormattedMessage {...messages.categoryFeaturedTooltip} />,
                )}
                name={CATEGORY_FEATURED_FIELD}
            />


    if (error) {
        return (
            <ErrorMask
                errorHeader={<FormattedMessage {...messages.errorMaskHeader} />}
                errorSubHeader={<FormattedMessage {...messages.errorMaskSubHeader} />}
            />
        );
    }

const successNotificationMessage = <FormattedMessage {...messages.successNotificationMessage} />;
const failureNotificationMessage = <FormattedMessage {...messages.failureNotificationMessage} />;

        const modalTitle =
            type === TYPE_MOVE ? (
                <FormattedMessage {...messages.moveOperationDetails} />
            ) : (
                <FormattedMessage {...messages.copyOperationDetails} />
            );





        test("Broken FormattedMessage inside of another, using ids instead of the string directly in the code", () => {
            const ir = getFlowJsxIr(
                "x/y.js",
                `
                // @flow
                import * as React from "react";
                import { Button, Link, FormattedCompMessage } from "components";
                import messages from './messages.js';

                export class CustomComponent extends React.Component {
                    render() {
                        return (
                            <>
                                <FormattedMessage {...messages.unique_id}
                                    values={{
                                        termsAndConditions:
                                            <a href="terms.html">
                                                <FormattedMessage {...messages.terms.and.conditions} />
                                            </a>
                                    }}
                                />
                            </>
                        );
                    }
                }
                `
            );

            const rule = new NoBrokenMessages();

            const result = rule.match({ ir });

            const expected = [
                new Result({
                    severity: "error",
                    description:
                        "Found a FormattedMessage component inside of another FormattedMessage component. This indicates a broken string.",
                    pathName: "x/y.js",
                    rule,
                    highlight: `<e0><FormattedMessage {...messages.terms.and.conditions} /></e0>`,
                    lineNumber: 15,
                    charNumber: 32,
                    endLineNumber: 15,
                    endCharNumber: 87,
                })
            ];

            expect(result).toStrictEqual(expected);
        });

        test("No broken FormattedMessage inside of another", () => {
            // this is the recommended rich text way of doing it
            const ir = getFlowJsxIr(
                "x/y.js",
                `
                // @flow
                import * as React from "react";
                import { Button, Link, FormattedCompMessage } from "components";

                export class CustomComponent extends React.Component {
                    render() {
                        return (
                            <>
                                <FormattedMessage
                                    id="unique.id"
                                    defaultMessage="You agree to the <a>terms and conditions</a> by using this product."
                                    description="translator's note"
                                    values={{
                                        termsAndConditions: chunks => <a href="terms.html">{...chunks}</a>
                                    }}
                                />
                            </>
                        );
                    }
                }
                `
            );

            const rule = new NoBrokenMessages();

            const result = rule.match({ ir });

            expect(result.length).toEqual(0);
        });

        test("No FormattedMessage at all", () => {
            const ir = getFlowJsxIr(
                "x/y.js",
                `
                // @flow
                import * as React from "react";
                import { Button, Link, FormattedCompMessage } from "components";

                export class CustomComponent extends React.Component {
                    render() {
                        return (
                            <>
                                <span>You agree to the <a href="terms.html">terms and conditions</a> by using this product.</span>
                            </>
                        );
                    }
                }
                `
            );

            const rule = new NoBrokenMessages();

            const result = rule.match({ ir });

            expect(result.length).toEqual(0);
        });

        test("Broken intl.formatMessage inside of a FormattedMessage", () => {
            const ir = getFlowJsxIr(
                "x/y.js",
                `
                // @flow
                import * as React from "react";
                import { Button, Link, FormattedCompMessage } from "components";
                import messages from './messages.js';

                export class CustomComponent extends React.Component {
                    render() {
                        return (
                            <>
                                <FormattedMessage
                                    id="unique.id"
                                    defaultMessage="You agree to the {termsAndConditions} by using this product."
                                    description="translator's note"
                                    values={{
                                        termsAndConditions:
                                            <a href="terms.html">
                                                {intl.formatMessage(messages.unique_id)}
                                            </a>
                                    }}
                                />
                            </>
                        );
                    }
                }
                `
            );

            const rule = new NoBrokenMessages();

            const result = rule.match({ ir });

            const expected = [
                new Result({
                    severity: "error",
                    description:
                        "Found a call to intl.formatMessage() inside of a FormattedMessage component. This indicates a broken string.",
                    pathName: "x/y.js",
                    rule,
                    highlight: `<e0>intl.formatMessage(messages.unique_id)</e0>`,
                    lineNumber: 18,
                    charNumber: 33,
                    endLineNumber: 18,
                    endCharNumber: 71,
                })
            ];

            expect(result).toStrictEqual(expected);
        });

    });

    describe("Typescript JSX", () => {
        const getTsxIr = (filePath, content) => {
            const parser = new TSXParser({filePath});
            const sourceFile = new SourceFile(filePath, {});
            sourceFile.content = trimIndent(content);
            const [ir] = parser.parse(sourceFile);
            return ir;
        };

        test("Broken FormattedMessage inside of another", () => {
            const ir = getTsxIr(
                "x/y.js",
                `
                // @flow
                import * as React from "react";
                import { Button, Link, FormattedCompMessage } from "components";

                export class CustomComponent extends React.Component {
                    render() {
                        return (
                            <>
                                <FormattedMessage
                                    id="unique.id"
                                    defaultMessage="You agree to the {termsAndConditions} by using this product."
                                    description="translator's note"
                                    values={{
                                        termsAndConditions:
                                            <a href="terms.html">
                                                <FormattedMessage
                                                    id="another.id"
                                                    defaultMessage="terms and conditions"
                                                    description="terms and conditions"
                                                />
                                            </a>
                                    }}
                                />
                            </>
                        );
                    }
                }
                `
            );

            const rule = new NoBrokenMessages();

            const result = rule.match({ ir });

            const expected = [
                new Result({
                    severity: "error",
                    description:
                        "Found a FormattedMessage component inside of another FormattedMessage component. This indicates a broken string.",
                    pathName: "x/y.js",
                    rule,
                    highlight: `<e0><FormattedMessage id="another.id" defaultMessage="terms and conditions" description="terms and conditions" /></e0>`,
                    lineNumber: 17,
                    charNumber: 32,
                    endLineNumber: 21,
                    endCharNumber: 34,
                })
            ];

            expect(result).toStrictEqual(expected);
        });

        test("Broken FormattedMessage inside of another, using ids instead of the string directly in the code", () => {
            const ir = getTsxIr(
                "x/y.js",
                `
                // @flow
                import * as React from "react";
                import { Button, Link, FormattedCompMessage } from "components";
                import messages from './messages.js';

                export class CustomComponent extends React.Component {
                    render() {
                        return (
                            <>
                                <FormattedMessage {...messages.unique_id}
                                    values={{
                                        termsAndConditions:
                                            <a href="terms.html">
                                                <FormattedMessage {...messages.terms.and.conditions} />
                                            </a>
                                    }}
                                />
                            </>
                        );
                    }
                }
                `
            );

            const rule = new NoBrokenMessages();

            const result = rule.match({ ir });

            const expected = [
                new Result({
                    severity: "error",
                    description:
                        "Found a FormattedMessage component inside of another FormattedMessage component. This indicates a broken string.",
                    pathName: "x/y.js",
                    rule,
                    highlight: `<e0><FormattedMessage {...messages.terms.and.conditions} /></e0>`,
                    lineNumber: 15,
                    charNumber: 32,
                    endLineNumber: 15,
                    endCharNumber: 87,
                })
            ];

            expect(result).toStrictEqual(expected);
        });

        test("No broken FormattedMessage inside of another", () => {
            // this is the recommended rich text way of doing it
            const ir = getTsxIr(
                "x/y.js",
                `
                // @flow
                import * as React from "react";
                import { Button, Link, FormattedCompMessage } from "components";

                export class CustomComponent extends React.Component {
                    render() {
                        return (
                            <>
                                <FormattedMessage
                                    id="unique.id"
                                    defaultMessage="You agree to the <a>terms and conditions</a> by using this product."
                                    description="translator's note"
                                    values={{
                                        termsAndConditions: chunks => <a href="terms.html">{...chunks}</a>
                                    }}
                                />
                            </>
                        );
                    }
                }
                `
            );

            const rule = new NoBrokenMessages();

            const result = rule.match({ ir });

            expect(result.length).toEqual(0);
        });

        test("No FormattedMessage at all", () => {
            const ir = getTsxIr(
                "x/y.js",
                `
                // @flow
                import * as React from "react";
                import { Button, Link, FormattedCompMessage } from "components";

                export class CustomComponent extends React.Component {
                    render() {
                        return (
                            <>
                                <span>You agree to the <a href="terms.html">terms and conditions</a> by using this product.</span>
                            </>
                        );
                    }
                }
                `
            );

            const rule = new NoBrokenMessages();

            const result = rule.match({ ir });

            expect(result.length).toEqual(0);
        });

        test("Broken intl.formatMessage inside of a FormattedMessage", () => {
            const ir = getTsxIr(
                "x/y.js",
                `
                // @flow
                import * as React from "react";
                import { Button, Link, FormattedCompMessage } from "components";
                import messages from './messages.js';

                export class CustomComponent extends React.Component {
                    render() {
                        return (
                            <>
                                <FormattedMessage
                                    id="unique.id"
                                    defaultMessage="You agree to the {termsAndConditions} by using this product."
                                    description="translator's note"
                                    values={{
                                        termsAndConditions:
                                            <a href="terms.html">
                                                {intl.formatMessage(messages.unique_id)}
                                            </a>
                                    }}
                                />
                            </>
                        );
                    }
                }
                `
            );

            const rule = new NoBrokenMessages();

            const result = rule.match({ ir });

            const expected = [
                new Result({
                    severity: "error",
                    description:
                        "Found a call to intl.formatMessage() inside of a FormattedMessage component. This indicates a broken string.",
                    pathName: "x/y.js",
                    rule,
                    highlight: `<e0>intl.formatMessage(messages.unique_id)</e0>`,
                    lineNumber: 18,
                    charNumber: 33,
                    endLineNumber: 18,
                    endCharNumber: 71,
                })
            ];

            expect(result).toStrictEqual(expected);
        });
    */
    });
});