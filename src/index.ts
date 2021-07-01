/*
 * AxJson
 * AXELL Json Validator Library
 *
 * Copyright(C) 2018-2019 AXELL CORPORATION
 */


//
// Types
//
type ValidationContext = {
    path: string,
    keyReverse: boolean
    keyRemap?: {object: any, srcKey: string, dstKey: string}[]
}

interface ValidatorFunc<TO, TS = any> {
    (v: TS, ctx: ValidationContext): TO
}

interface Validatable<TO, TS = any> {
    validate: ValidatorFunc<TO, TS>
    key?: string
}


//
// Internal utilities
//
function isValidatable(v: any): v is Validatable<any> {
    return typeof v.validate === 'function'
}

function makeValidatable<TO, TS = any>(func: ValidatorFunc<TO, TS>, key?: string): Validatable<TO, TS> {
    return ({validate: func, key})
}

const getValidatableKey = (v: any) =>
    v !== null && typeof v === 'object' && typeof v.key === 'string' ? v.key as string : null

const camouflage = <TO, TS = any>(func: ValidatorFunc<TO, TS>, key?: string) =>
    makeValidatable(func, key) as any as TO

const compositeValidatorFunc = <TS, T, TO>(f1: ValidatorFunc<T, TS>, f2: ValidatorFunc<TO, T>) =>
    (v: TS, ctx: ValidationContext) => f2(f1(v, ctx), ctx)


//
// Error
//
class ValidationError extends Error {
    context: ValidationContext
    type: string
    description?: string

    constructor(context: ValidationContext, type: string, description?: string) {
        super(`${context.path} [${type}]: ${description}`)
        this.context = context
        this.type = type
        this.description = description
    }
}

class InvalidSchemaError extends Error {
    path: string

    constructor(path: string) {
        super(`${path} is not valid schema.`)
        this.path = path
    }
}


//
// Value validator
//
const validateValue = <T>(schema: any, value: any, ctx: ValidationContext) => {
    // Null
    if (schema === null) {
        if (value === null) {
            return null as any as T
        }
        else {
            throw new ValidationError(ctx, 'null', 'The value is not null.')
        }
    }

    // Validator
    if (isValidatable(schema)) {
        return schema.validate(value, ctx) as T
    }

    // Tuple
    if (Array.isArray(schema)) {
        if (!Array.isArray(value)) {
            throw new ValidationError(ctx, 'tuple', 'The value is not a tuple.')
        }
        if (schema.length !== value.length) {
            throw new ValidationError(ctx, 'tuple', 'Tuple size mismatched.')
        }

        const length = schema.length
        const ret: any[] = []

        for (let i = 0; i < length; i++) {
            ret.push(validateValue(schema[i], value[i], {...ctx, path: `${ctx.path}[${i}]`}))
        }
        return ret as any as T
    }

    // Dictionary
    if (typeof schema === 'object') {
        if (typeof value !== 'object') {
            throw new ValidationError(ctx, 'dictionary', 'The value is not an object.')
        }

        const schemaKeys = Object.keys(schema)
        const ret: any = {}

        for (const key of schemaKeys) {
            const validatableKey = getValidatableKey(schema[key])

            if (ctx.keyReverse) {
                if (validatableKey && key !== validatableKey) {
                    if (!ctx.keyRemap) {
                        ctx.keyRemap = []
                    }
                    ctx.keyRemap.push({object: ret, srcKey: key, dstKey: validatableKey})
                }
                ret[key] = validateValue(schema[key], value[key], {...ctx, path: `${ctx.path}.${key}`})
            }
            else {
                ret[key] = validateValue(schema[key], value[validatableKey || key], {...ctx, path: `${ctx.path}.${key}`})
            }
        }
        return ret as T
    }

    // Constant
    if (typeof schema === 'string' || typeof schema === 'number' || typeof schema === 'boolean') {
        if (schema === value) {
            return value as T
        }
        else {
            throw new ValidationError(ctx, 'constant', 'The constant value mismatched')
        }
    }

    throw new ValidationError(ctx, 'unknown', 'Invalid schema')
}


//
// Schema validator
//
const validateSchema = <T>(schema: T, path: string) => {
    // Null
    if (schema === null) {
        return schema
    }

    // Validator
    if (isValidatable(schema)) {
        return schema
    }

    // Tuple
    if (Array.isArray(schema)) {
        const length = schema.length
        for (let i = 0; i < length; i++) {
            validateSchema(schema[i], `${path}[${i}]`)
        }
        return schema
    }

    // Dictionary
    if (typeof schema === 'object') {
        const schemaKeys = Object.keys(schema)

        for (const key of schemaKeys) {
            validateSchema((schema as any)[key], `${path}.${key}`)
        }
        return schema
    }

    // Constant
    if (typeof schema === 'string' || typeof schema === 'number' || typeof schema === 'boolean') {
        return schema
    }

    throw new InvalidSchemaError(path)
}


//
// Key name schema
//
const createKeySchema = <T>(key: string, schema: T) =>
    camouflage<T>(
        (v, ctx) => validateValue<T>(schema, v, ctx),
        key
    )


//
// Nullable schema
//
const createNullableSchema = <T>(schema: T) =>
    camouflage<T | null>(
        (v, ctx) => v === null ? null : validateValue<T>(schema, v, ctx)
    )

const createNullableUnwrapSchema = <T>(unwrapper: () => T) => (schema: T) =>
    camouflage<T>(
        (v, ctx) => v === null ? unwrapper() : validateValue<T>(schema, v, ctx)
    )

interface INullableSchemaCreator {
    <T>(schema: T): T | null
    unwrap: <T>(unwrapper: () => T) => (schema: T) => T
}

const nullableSchemaCreator: INullableSchemaCreator = Object.assign(
    createNullableSchema,
    {
        unwrap: createNullableUnwrapSchema
    }
)


//
// Optional schema
//
const createOptionalSchema = <T>(schema: T) =>
    camouflage<T | undefined>(
        (v, ctx) => v === undefined ? undefined : validateValue<T>(schema, v, ctx)
    )

const createOptionalUnwrapSchema = <T>(unwrapper: () => T) => (schema: T) =>
    camouflage<T>(
        (v, ctx) => v === undefined ? unwrapper() : validateValue<T>(schema, v, ctx)
    )

interface IOptionalSchemaCreator {
    <T>(schema: T): T | undefined
    unwrap: <T>(unwrapper: () => T) => (schema: T) => T
}

const optionalSchemaCreator: IOptionalSchemaCreator = Object.assign(
    createOptionalSchema,
    {
        unwrap: createOptionalUnwrapSchema
    }
)


//
// Array schema
//
const createArraySchema = <T>(schema: T) =>
    camouflage<T[]>(
        (v, ctx) => {
            if (!Array.isArray(v)) {
                throw new ValidationError(ctx, 'array', 'The value is not an array.')
            }

            const ret: T[] = []
            for (let i = 0; i < v.length; i++) {
                ret.push(validateValue<T>(schema, v[i], {...ctx, path: `${ctx.path}[${i}]`}))
            }
            return ret
        }
    )


//
// Union schema
//
type ArrayToUnion<T extends unknown[]> = T extends readonly [infer A, ...infer B] ? A | ArrayToUnion<B> : T extends (infer A)[] ? A : never
type UnionSchemaCreator = <T extends unknown[]>(...schemas: T) => ArrayToUnion<T>

const createUnionSchema: UnionSchemaCreator = (...schemas) =>
    camouflage<any>(
        (v, ctx) => {
            for (const schema of schemas) {
                try {
                    return validateValue<any>(schema, v, ctx)
                }
                catch (err) {
                    //
                }
            }
            throw new ValidationError(ctx, 'union', 'The value is none of types.')
        }
    )


//
// Intersection schema
//
type ArrayToIntersection<T extends unknown[]> = T extends [infer A, ...infer B] ? (A & ArrayToIntersection<B>) : T extends [infer A] ? A : {}

type IntersectionSchemaCreator = <T extends unknown[]>(...schemas: T) => ArrayToIntersection<T>

const createIntersectionSchema: IntersectionSchemaCreator = (...schemas) =>
    camouflage<any>(
        (v, ctx) => {
            const ret = {}
            for (const schema of schemas) {
                try {
                    Object.assign(ret, validateValue<any>(schema, v, ctx))
                }
                catch (err) {
                    throw new ValidationError(ctx, 'intersection', 'The value is not one of types. (' + err + ')')
                }
            }
            return ret
        }
    )


//
// Any schema
//
const createAnySchema = () =>
    camouflage<any>((v, _) => v)


//
// Unknown schema
//
const createUnknownSchema = () =>
    camouflage<unknown>((v, _) => v)


//
// Undefined schema
//
const createUndefinedSchema = () => (
    camouflage<undefined>((v, ctx) => {
        if (v === undefined) {
            return v
        }
        console.error(v)
        throw new ValidationError(ctx, 'undefined', 'The value is not undefined.')
    })
)


//
// Null schema
//
const createNullSchema = () => (
    camouflage<null>((v, ctx) => {
        if (v === null) {
            return v
        }
        console.error(v)
        throw new ValidationError(ctx, 'null', 'The value is not null.')
    })
)


//
// String schema
//
interface IStringSchemaCreator {
    (): string
    nonEmpty: () => IStringSchemaCreator
    maxLength: (length: number, includeEqual?: boolean) => IStringSchemaCreator
    minLength: (length: number, includeEqual?: boolean) => IStringSchemaCreator
    test: (regexp: RegExp) => IStringSchemaCreator
    validate: (f: (v: string) => boolean) => IStringSchemaCreator
    convert: <T>(converter: (v: string) => T) => T
}

class StringSchemaChain {
    private func: ValidatorFunc<string>

    constructor(func: ValidatorFunc<string>) {
        this.func = func
    }

    toCreator: (() => IStringSchemaCreator) = () =>
        Object.assign(() => camouflage(this.func), this)

    static initial = new StringSchemaChain((v, ctx) => {
        if (typeof v === 'string') {
            return v
        }
        throw new ValidationError(ctx, 'string', 'The value is not a string.')
    }).toCreator()

    private composite = (next: ValidatorFunc<string, string>) =>
        new StringSchemaChain(compositeValidatorFunc(this.func, next)).toCreator()

    nonEmpty = () =>
        this.composite(
            (v, ctx) => {
                if (v === '') {
                    throw new ValidationError(ctx, 'string.nonEmpty', 'The value is an empty string.')
                }
                return v
            }
        )

    maxLength = (length: number, includeEqual = true) =>
        this.composite(
            (v, ctx) => {
                if (includeEqual ? v.length <= length : v.length < length) {
                    return v
                }
                throw new ValidationError(ctx, 'string.maxLength', 'Length of the value is larger than max-length.')
            }
        )

    minLength = (length: number, includeEqual = true) =>
        this.composite(
            (v, ctx) => {
                if (includeEqual ? v.length >= length : v.length > length) {
                    return v
                }
                throw new ValidationError(ctx, 'string.minLength', 'Length of the value is smaller than min-length.')
            }
        )

    test = (regexp: RegExp) => {
        return this.composite(
            (v, ctx) => {
                if (!regexp.test(v)) {
                    throw new ValidationError(ctx, 'string.text', 'The value did not match the pattern.')
                }
                return v
            }
        )
    }

    validate = (f: (v: string) => boolean) =>
        this.composite(
            (v, ctx) => {
                if (!(f(v))) {
                    throw new ValidationError(ctx, 'string.validate', 'Validation failed.')
                }
                return v
            }
        )

    convert = <T>(converter: (v: string) => T) =>
        camouflage<T, string>((v, ctx) => converter(this.func(v, ctx)))
}


//
// Number schema
//
interface INumberSchemaCreator {
    (): number
    nonZero: () => INumberSchemaCreator
    integer: () => INumberSchemaCreator
    maxValue: (value: number, includeEqual?: boolean) => INumberSchemaCreator
    minValue: (value: number, includeEqual?: boolean) => INumberSchemaCreator
    validate: (f: (v: number) => boolean) => INumberSchemaCreator
    convert: <T>(converter: (v: number) => T) => T
}

class NumberSchemaChain {
    private func: ValidatorFunc<number>

    constructor(func: ValidatorFunc<number>) {
        this.func = func
    }

    toCreator: (() => INumberSchemaCreator) = () =>
        Object.assign(() => camouflage(this.func), this)

    static initial = new NumberSchemaChain((v, ctx) => {
        if (typeof v === 'number') {
            return v
        }
        throw new ValidationError(ctx, 'number', 'The value is not a number.')
    }).toCreator()

    private composite = (next: ValidatorFunc<number, number>) =>
        new NumberSchemaChain(compositeValidatorFunc(this.func, next)).toCreator()

    nonZero = () =>
        this.composite(
            (v, ctx) => {
                if (v === 0) {
                    throw new ValidationError(ctx, 'number.nonZero', 'The value is zero.')
                }
                return v
            }
        )

    integer = () =>
        this.composite(
            (v, ctx) => {
                if (!Number.isInteger(v)) {
                    throw new ValidationError(ctx, 'number.integer', 'The value is not an integer.')
                }
                return v
            }
        )

    maxValue = (value: number, includeEqual = true) =>
        this.composite(
            (v, ctx) => {
                if (includeEqual ? v <= value : v < value) {
                    return v
                }
                throw new ValidationError(ctx, 'number.maxValue', 'The value is larger than max-value.')
            }
        )

    minValue = (value: number, includeEqual = true) =>
        this.composite(
            (v, ctx) => {
                if (includeEqual ? v >= value : v > value) {
                    return v
                }
                throw new ValidationError(ctx, 'number.minValue', 'The value is smaller than min-value.')
            }
        )

    validate = (f: (v: number) => boolean) =>
        this.composite(
            (v, ctx) => {
                if (!(f(v))) {
                    throw new ValidationError(ctx, 'number.validate', 'Validation failed.')
                }
                return v
            }
        )

    convert = <T>(converter: (v: number) => T) =>
        camouflage<T, number>((v, ctx) => converter(this.func(v, ctx)))
}


//
// Boolean schema
//
interface IBooleanSchemaCreator {
    (): boolean
    convert: <T>(converter: (v: boolean) => T) => T
}

class BooleanSchemaChain {
    private func: ValidatorFunc<boolean>

    constructor(func: ValidatorFunc<boolean>) {
        this.func = func
    }

    toCreator: (() => IBooleanSchemaCreator) = () =>
        Object.assign(() => camouflage(this.func), this)

    static initial = new BooleanSchemaChain((v, ctx) => {
        if (typeof v === 'boolean') {
            return v
        }
        throw new ValidationError(ctx, 'boolean', 'The value is not a boolean.')
    }).toCreator()

    convert = <T>(converter: (v: boolean) => T) =>
        camouflage<T, boolean>((v, ctx) => converter(this.func(v, ctx)))
}


//
// Date
//
interface IDateSchemaCreator {
    (): Date
    convert: <T>(converter: (v: Date) => T) => T
    maxValue: (value: Date, includeEqual?: boolean) => IDateSchemaCreator
    minValue: (value: Date, includeEqual?: boolean) => IDateSchemaCreator
    past: () => IDateSchemaCreator
    future: () => IDateSchemaCreator
    validate: (f: (v: Date) => boolean) => IDateSchemaCreator
}

class DateSchemaChain {
    private func: ValidatorFunc<Date>

    constructor(func: ValidatorFunc<Date>) {
        this.func = func
    }

    toCreator: (() => IDateSchemaCreator) = () =>
        Object.assign(() => camouflage(this.func), this)

    static initial = new DateSchemaChain((v, ctx) => {
        if (v instanceof Date) {
            return v
        }
        const timestamp = Date.parse(v)
        if (Number.isNaN(timestamp)) {
            throw new ValidationError(ctx, 'Date', 'The value is not a Date.')
        }
        return new Date(timestamp)
    }).toCreator()

    private composite = (next: ValidatorFunc<Date, Date>) =>
        new DateSchemaChain(compositeValidatorFunc(this.func, next)).toCreator()

    convert = <T>(converter: (v: Date) => T) =>
        camouflage<T, Date>((v, ctx) => converter(this.func(v, ctx)))

    maxValue = (value: Date, includeEqual = true) =>
        this.composite((v, ctx) => {
            if (includeEqual ? value.getTime() >= v.getTime() : value.getTime() > v.getTime()) {
                return v
            }
            throw new ValidationError(ctx, 'Date', 'The value is larger than max-value.')
        })

    minValue = (value: Date, includeEqual = true) =>
        this.composite((v, ctx) => {
            if (includeEqual ? value.getTime() <= v.getTime() : value.getTime() < v.getTime()) {
                return v
            }
            throw new ValidationError(ctx, 'Date', 'The value is smaller than min-value.')
        })

    past = () =>
        this.composite((v, ctx) => {
            if (Date.now() < v.getTime()) {
                throw new ValidationError(ctx, 'Date', 'The value is future.')
            }
            return v
        })

    future = () =>
        this.composite((v, ctx) => {
            if (Date.now() > v.getTime()) {
                throw new ValidationError(ctx, 'Date', 'The value is past.')
            }
            return v
        })

    validate = (f: (v: Date) => boolean) =>
        this.composite(
            (v, ctx) => {
                if (!(f(v))) {
                    throw new ValidationError(ctx, 'Date.validate', 'Validation failed.')
                }
                return v
            }
        )
}



//
// Object
//
interface IObjectSchemaCreator<TO> {
    (): TO
    validate: (f: (v: TO) => boolean) => IObjectSchemaCreator<TO>
    convert: <T>(converter: (v: TO) => T) => IObjectSchemaCreator<T>
}

class ObjectSchemaChain<TO extends {}> {
    private func: ValidatorFunc<TO>

    constructor(func: ValidatorFunc<TO>) {
        this.func = func
    }

    static initial = <T>(schema: T) =>
        new ObjectSchemaChain<T>((v, ctx) => {
            if (v === null || v === undefined) {
                throw new ValidationError(ctx, 'Object', 'The value is null or undefined.')
            }
            if (typeof v === 'object') {
                return validateValue(schema, v, ctx)
            }
            throw new ValidationError(ctx, 'Object', 'The value is not an object.')
        }).toCreator()

    toCreator: (() => IObjectSchemaCreator<TO>) = () =>
        Object.assign(() => camouflage(this.func), this)

    private composite = (next: ValidatorFunc<TO, TO>) =>
        new ObjectSchemaChain<TO>(compositeValidatorFunc(this.func, next)).toCreator()

    validate = (f: (v: TO) => boolean) =>
        this.composite(
            (v, ctx) => {
                if (!f(v)) {
                    throw new ValidationError(ctx, 'Object.validate', 'Validation failed.')
                }
                return v
            }
        )

    convert = <T>(f: (v: TO) => T) =>
        new ObjectSchemaChain<T>((v, ctx) => f(this.func(v, ctx))).toCreator()
}



//
// Dictionary
//
type Dictionary<T> = {[key: string]: T}

interface IDictionarySchemaCreator<T> {
    (): Dictionary<T>
    validate: (f: (value: T, key: string) => boolean) => IDictionarySchemaCreator<T>
    convert: <U>(f: (v: Dictionary<T>) => U) => U
    map: <U>(f: (value: T, key: string) => U) => IDictionarySchemaCreator<U>
    mapKeys: (f: (key: string) => string) => IDictionarySchemaCreator<T>
}

class DictionarySchemaChain<T> {
    private func: ValidatorFunc<Dictionary<T>>

    constructor(func: ValidatorFunc<Dictionary<T>>) {
        this.func = func
    }

    static initial = <T>(schema: T) =>
        new DictionarySchemaChain<T>((v, ctx) => {
            if (v === null || v === undefined) {
                throw new ValidationError(ctx, 'Dictionary', 'The value is null or undefined.')
            }
            if (typeof v !== 'object') {
                throw new ValidationError(ctx, 'Dictionary', 'The value is not an object.')
            }
            return Object.keys(v).reduce<any>(
                (obj, key) => {
                    obj[key] = validateValue(schema, v[key], {...ctx, path: `${ctx.path}.${key}`})
                    return obj
                }, {})
        })
        .toCreator()

    toCreator: (() => IDictionarySchemaCreator<T>) = () =>
        Object.assign(() => camouflage(this.func), this)

    private composite = (next: ValidatorFunc<Dictionary<T>, Dictionary<T>>) =>
        new DictionarySchemaChain<T>(compositeValidatorFunc(this.func, next)).toCreator()

    validate = (f: (value: T, key: string) => boolean) =>
        this.composite(
            (v, ctx) => {
                Object.keys(v).forEach(key => {
                    if (!f(v[key], key)) {
                        throw new ValidationError(ctx, 'Dictionary.validate', 'Validation failed.')
                    }
                })
                return v
            }
        )

    convert = <U>(f: (v: Dictionary<T>) => U) =>
        camouflage<U, Dictionary<T>>((v, ctx) => f(this.func(v, ctx)))

    map = <U>(f: (value: T, key: string) => U) =>
        new DictionarySchemaChain<U>((v, ctx) =>
            Object.keys(v).reduce<any>(
                (obj, key) => {obj[key] = f(v[key], key); return obj},
                {})
        )
        .toCreator()

    mapKeys = (f: (key: string) => string) =>
        this.composite(
            (v, ctx) =>
                Object.keys(v).reduce<any>(
                    (obj, key) => {obj[f(key)] = v[key]; return obj},
                    {})
        )
}


//
// Export functions
//
const exportFunctions = () => {
    const validate = <T>(schema: T, value: any) =>
        validateValue<T>(schema, value, {path: '', keyReverse: false})
    
    const validateReverse = <T>(schema: T, value: any) => {
        const context: ValidationContext = {path: '', keyReverse: true}
        const validatedValue = validateValue(schema, value, context)
        if (context.keyRemap) {
            for (const remap of context.keyRemap) {
                remap.object[remap.dstKey] = remap.object[remap.srcKey]
                delete remap.object[remap.srcKey]
            }
        }
        return validatedValue
    }
    
    const stringify = <T>(schema: T, value: any) =>
        JSON.stringify(validateReverse(schema, value))
    
    const parse = <T>(schema: T, text: string) =>
        validate(schema, JSON.parse(text))
    
    const schema = <T>(schema: T) =>
        validateSchema(schema, '')
    
    return {
        validate,
        validateReverse,
        stringify,
        parse,
        schema
    }
}

//
// Module export
//
const axjson = {
    ...exportFunctions(),
    ValidationError,
    InvalidSchemaError,
    key: createKeySchema,
    nullable: nullableSchemaCreator,
    optional: optionalSchemaCreator,
    array: createArraySchema,
    union: createUnionSchema,
    intersection: createIntersectionSchema,
    any: createAnySchema,
    unknown: createUnknownSchema,
    null: createNullSchema,
    undefined: createUndefinedSchema,
    object: ObjectSchemaChain.initial,
    dictionary: DictionarySchemaChain.initial,
    string: StringSchemaChain.initial,
    number: NumberSchemaChain.initial,
    integer: NumberSchemaChain.initial.integer(),
    boolean: BooleanSchemaChain.initial,
    date: DateSchemaChain.initial,
}

export default axjson
