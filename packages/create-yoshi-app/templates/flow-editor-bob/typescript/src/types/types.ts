import { ComponentDefinition, MemberKind } from '@wix/platform-editor-sdk';

export interface ExtendedComponentDefinition extends ComponentDefinition {
  [additionalField: string]: any;
}

export const MEMBER_KIND = 'member' as MemberKind;
