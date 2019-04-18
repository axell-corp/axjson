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
interface IUnionSchemaCreator {
    <T>(schema: T): T;
    <T1, T2>(schema1: T1, schema2: T2): T1 | T2;
    <T1, T2, T3>(schema1: T1, schema2: T2, schema3: T3): T1 | T2 | T3;
    <T1, T2, T3, T4>(schema1: T1, schema2: T2, schema3: T3, schema4: T4): T1 | T2 | T3 | T4;
}
interface IIntersectionSchemaCreator {
    <T>(schema: T): T;
    <T1, T2>(schema1: T1, schema2: T2): T1 & T2;
    <T1, T2, T3>(schema1: T1, schema2: T2, schema3: T3): T1 & T2 & T3;
    <T1, T2, T3, T4>(schema1: T1, schema2: T2, schema3: T3, schema4: T4): T1 & T2 & T3 & T4;
}
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
declare const _default: {
    ValidationError: typeof ValidationError;
    InvalidSchemaError: typeof InvalidSchemaError;
    key: <T>(key: string, schema: T) => T;
    nullable: INullableSchemaCreator;
    optional: IOptionalSchemaCreator;
    array: <T>(schema: T) => T[];
    union: IUnionSchemaCreator;
    intersection: IIntersectionSchemaCreator;
    any: () => any;
    object: <T>(schema: T) => IObjectSchemaCreator<T>;
    dictionary: <T>(schema: T) => IDictionarySchemaCreator<T>;
    string: IStringSchemaCreator;
    number: INumberSchemaCreator;
    integer: INumberSchemaCreator;
    boolean: IBooleanSchemaCreator;
    date: IDateSchemaCreator;
    validate: <T>(schema: T, value: any) => T;
    validateReverse: <T>(schema: T, value: any) => {};
    stringify: <T>(schema: T, value: any) => string;
    parse: <T>(schema: T, text: string) => T;
    schema: <T>(schema: T) => T;
};
export default _default;