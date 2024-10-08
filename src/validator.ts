/**
 * This is not an automatically generated file.
 */
import type {
    $errorRule,
    $errorsRule,
    $skipRule,
    AbolishInlineValidator,
    AbolishRule
} from "./types";

export declare module AvailableValidators {
    export interface Options {
        $name: string;
        $error: $errorRule;
        $errors: $errorsRule;
        $inline: AbolishInlineValidator;
        $skip: $skipRule;

        default: any;
        required: boolean;
        typeof: string | string[] | false;
        type: string | string[] | false;
        exact: string | boolean | number;
        min: number;
        max: number;
        minLength: number;
        maxLength: number;
        size: number | number[];
        object: Record<string, AbolishRule> | AbolishCompiledObject;
        objectAsync: Record<string, AbolishRule> | AbolishCompiledObject;
    }
}

/**
 * AV - Abolish Validators
 * alias for AvailableValidators.Options
 */
export type AV = Partial<AvailableValidators.Options>;

/**
 * Import all additional validators
 */
import "../validators/validators";
import { AbolishCompiledObject } from "./Compiler";
