declare type ValidationContext = {
    path: string;
    keyReverse: boolean;
    keyRemap?: {
        object: any;
        srcKey: string;
        dstKey: string;
    }[];
};
declare class ValidationError extends Error {
    context: ValidationContext;
    type: string;
    description?: string;
    constructor(context: ValidationContext, type: string, description?: string);
}
declare class InvalidSchemaError extends Error {
    path: string;
    constructor(path: string);
}
interface INullableSchemaCreator {
    <T>(schema: T): T | null;
    unwrap: <T>(unwrapper: () => T) => (schema: T) => T;
}
interface IOptionalSchemaCreator {
    <T>(schema: T): T | undefined;
    unwrap: <T>(unwrapper: () => T) => (schema: T) => T;
}
declare type ArrayToUnion<T extends unknown[]> = T extends [infer A, ...infer B] ? A | ArrayToUnion<B> : never;
declare type UnionSchemaCreator = <T extends unknown[]>(...schemas: T) => ArrayToUnion<T>;
declare type ArrayToIntersection<T extends unknown[]> = T extends [infer A, ...infer B] ? (A & ArrayToIntersection<B>) : T extends [infer A] ? A : {};
declare type IntersectionSchemaCreator = <T extends unknown[]>(...schemas: T) => ArrayToIntersection<T>;
interface IStringSchemaCreator {
    (): string;
    nonEmpty: () => IStringSchemaCreator;
    maxLength: (length: number, includeEqual?: boolean) => IStringSchemaCreator;
    minLength: (length: number, includeEqual?: boolean) => IStringSchemaCreator;
    test: (regexp: RegExp) => IStringSchemaCreator;
    validate: (f: (v: string) => boolean) => IStringSchemaCreator;
    convert: <T>(converter: (v: string) => T) => T;
}
interface INumberSchemaCreator {
    (): number;
    nonZero: () => INumberSchemaCreator;
    integer: () => INumberSchemaCreator;
    maxValue: (value: number, includeEqual?: boolean) => INumberSchemaCreator;
    minValue: (value: number, includeEqual?: boolean) => INumberSchemaCreator;
    validate: (f: (v: number) => boolean) => INumberSchemaCreator;
    convert: <T>(converter: (v: number) => T) => T;
}
interface IBooleanSchemaCreator {
    (): boolean;
    convert: <T>(converter: (v: boolean) => T) => T;
}
interface IDateSchemaCreator {
    (): Date;
    convert: <T>(converter: (v: Date) => T) => T;
    maxValue: (value: Date, includeEqual?: boolean) => IDateSchemaCreator;
    minValue: (value: Date, includeEqual?: boolean) => IDateSchemaCreator;
    past: () => IDateSchemaCreator;
    future: () => IDateSchemaCreator;
    validate: (f: (v: Date) => boolean) => IDateSchemaCreator;
}
interface IObjectSchemaCreator<TO> {
    (): TO;
    validate: (f: (v: TO) => boolean) => IObjectSchemaCreator<TO>;
    convert: <T>(converter: (v: TO) => T) => IObjectSchemaCreator<T>;
}
declare type Dictionary<T> = {
    [key: string]: T;
};
interface IDictionarySchemaCreator<T> {
    (): Dictionary<T>;
    validate: (f: (value: T, key: string) => boolean) => IDictionarySchemaCreator<T>;
    convert: <U>(f: (v: Dictionary<T>) => U) => U;
    map: <U>(f: (value: T, key: string) => U) => IDictionarySchemaCreator<U>;
    mapKeys: (f: (key: string) => string) => IDictionarySchemaCreator<T>;
}
declare const axjson: {
    ValidationError: typeof ValidationError;
    InvalidSchemaError: typeof InvalidSchemaError;
    key: <T>(key: string, schema: T) => T;
    nullable: INullableSchemaCreator;
    optional: IOptionalSchemaCreator;
    array: <T_1>(schema: T_1) => T_1[];
    union: UnionSchemaCreator;
    intersection: IntersectionSchemaCreator;
    any: () => any;
    unknown: () => unknown;
    null: () => null;
    undefined: () => undefined;
    object: <T_2>(schema: T_2) => IObjectSchemaCreator<T_2>;
    dictionary: <T_3>(schema: T_3) => IDictionarySchemaCreator<T_3>;
    string: IStringSchemaCreator;
    number: INumberSchemaCreator;
    integer: INumberSchemaCreator;
    boolean: IBooleanSchemaCreator;
    date: IDateSchemaCreator;
    validate: <T_4>(schema: T_4, value: any) => T_4;
    validateReverse: <T_5>(schema: T_5, value: any) => unknown;
    stringify: <T_6>(schema: T_6, value: any) => string;
    parse: <T_7>(schema: T_7, text: string) => T_7;
    schema: <T_8>(schema: T_8) => T_8;
};
export default axjson;
