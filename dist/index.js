"use strict";
/*
 * AxJson
 * AXELL Json Validator Library
 *
 * Copyright(C) 2018-2019 AXELL CORPORATION
 */
Object.defineProperty(exports, "__esModule", { value: true });
//
// Internal utilities
//
function isValidatable(v) {
    return typeof v.validate === 'function';
}
function makeValidatable(func, key) {
    return ({ validate: func, key });
}
const getValidatableKey = (v) => v !== null && typeof v === 'object' && typeof v.key === 'string' ? v.key : null;
const camouflage = (func, key) => makeValidatable(func, key);
const compositeValidatorFunc = (f1, f2) => (v, ctx) => f2(f1(v, ctx), ctx);
//
// Error
//
class ValidationError extends Error {
    constructor(context, type, description) {
        super(`${context.path} [${type}]: ${description}`);
        this.context = context;
        this.type = type;
        this.description = description;
    }
}
class InvalidSchemaError extends Error {
    constructor(path) {
        super(`${path} is not valid schema.`);
        this.path = path;
    }
}
//
// Value validator
//
const validateValue = (schema, value, ctx) => {
    // Null
    if (schema === null) {
        if (value === null) {
            return null;
        }
        else {
            throw new ValidationError(ctx, 'null', 'The value is not null.');
        }
    }
    // Validator
    if (isValidatable(schema)) {
        return schema.validate(value, ctx);
    }
    // Tuple
    if (Array.isArray(schema)) {
        if (!Array.isArray(value)) {
            throw new ValidationError(ctx, 'tuple', 'The value is not a tuple.');
        }
        if (schema.length !== value.length) {
            throw new ValidationError(ctx, 'tuple', 'Tuple size mismatched.');
        }
        const length = schema.length;
        const ret = [];
        for (let i = 0; i < length; i++) {
            ret.push(validateValue(schema[i], value[i], Object.assign(Object.assign({}, ctx), { path: `${ctx.path}[${i}]` })));
        }
        return ret;
    }
    // Dictionary
    if (typeof schema === 'object') {
        if (typeof value !== 'object') {
            throw new ValidationError(ctx, 'dictionary', 'The value is not an object.');
        }
        const schemaKeys = Object.keys(schema);
        const ret = {};
        for (const key of schemaKeys) {
            const validatableKey = getValidatableKey(schema[key]);
            if (ctx.keyReverse) {
                if (validatableKey && key !== validatableKey) {
                    if (!ctx.keyRemap) {
                        ctx.keyRemap = [];
                    }
                    ctx.keyRemap.push({ object: ret, srcKey: key, dstKey: validatableKey });
                }
                ret[key] = validateValue(schema[key], value[key], Object.assign(Object.assign({}, ctx), { path: `${ctx.path}.${key}` }));
            }
            else {
                ret[key] = validateValue(schema[key], value[validatableKey || key], Object.assign(Object.assign({}, ctx), { path: `${ctx.path}.${key}` }));
            }
        }
        return ret;
    }
    // Constant
    if (typeof schema === 'string' || typeof schema === 'number' || typeof schema === 'boolean') {
        if (schema === value) {
            return value;
        }
        else {
            throw new ValidationError(ctx, 'constant', 'The constant value mismatched');
        }
    }
    throw new ValidationError(ctx, 'unknown', 'Invalid schema');
};
//
// Schema validator
//
const validateSchema = (schema, path) => {
    // Null
    if (schema === null) {
        return schema;
    }
    // Validator
    if (isValidatable(schema)) {
        return schema;
    }
    // Tuple
    if (Array.isArray(schema)) {
        const length = schema.length;
        for (let i = 0; i < length; i++) {
            validateSchema(schema[i], `${path}[${i}]`);
        }
        return schema;
    }
    // Dictionary
    if (typeof schema === 'object') {
        const schemaKeys = Object.keys(schema);
        for (const key of schemaKeys) {
            validateSchema(schema[key], `${path}.${key}`);
        }
        return schema;
    }
    // Constant
    if (typeof schema === 'string' || typeof schema === 'number' || typeof schema === 'boolean') {
        return schema;
    }
    throw new InvalidSchemaError(path);
};
//
// Key name schema
//
const createKeySchema = (key, schema) => camouflage((v, ctx) => validateValue(schema, v, ctx), key);
//
// Nullable schema
//
const createNullableSchema = (schema) => camouflage((v, ctx) => v === null ? null : validateValue(schema, v, ctx));
const createNullableUnwrapSchema = (unwrapper) => (schema) => camouflage((v, ctx) => v === null ? unwrapper() : validateValue(schema, v, ctx));
const nullableSchemaCreator = Object.assign(createNullableSchema, {
    unwrap: createNullableUnwrapSchema
});
//
// Optional schema
//
const createOptionalSchema = (schema) => camouflage((v, ctx) => v === undefined ? undefined : validateValue(schema, v, ctx));
const createOptionalUnwrapSchema = (unwrapper) => (schema) => camouflage((v, ctx) => v === undefined ? unwrapper() : validateValue(schema, v, ctx));
const optionalSchemaCreator = Object.assign(createOptionalSchema, {
    unwrap: createOptionalUnwrapSchema
});
//
// Array schema
//
const createArraySchema = (schema) => camouflage((v, ctx) => {
    if (!Array.isArray(v)) {
        throw new ValidationError(ctx, 'array', 'The value is not an array.');
    }
    const ret = [];
    for (let i = 0; i < v.length; i++) {
        ret.push(validateValue(schema, v[i], Object.assign(Object.assign({}, ctx), { path: `${ctx.path}[${i}]` })));
    }
    return ret;
});
const createUnionSchema = (...schemas) => camouflage((v, ctx) => {
    for (const schema of schemas) {
        try {
            return validateValue(schema, v, ctx);
        }
        catch (err) {
            //
        }
    }
    throw new ValidationError(ctx, 'union', 'The value is none of types.');
});
const createIntersectionSchema = (...schemas) => camouflage((v, ctx) => {
    const ret = {};
    for (const schema of schemas) {
        try {
            Object.assign(ret, validateValue(schema, v, ctx));
        }
        catch (err) {
            throw new ValidationError(ctx, 'intersection', 'The value is not one of types. (' + err + ')');
        }
    }
    return ret;
});
//
// Any schema
//
const createAnySchema = () => camouflage((v, _) => v);
//
// Unknown schema
//
const createUnknownSchema = () => camouflage((v, _) => v);
//
// Undefined schema
//
const createUndefinedSchema = () => (camouflage((v, ctx) => {
    if (v === undefined) {
        return v;
    }
    console.error(v);
    throw new ValidationError(ctx, 'undefined', 'The value is not undefined.');
}));
//
// Null schema
//
const createNullSchema = () => (camouflage((v, ctx) => {
    if (v === null) {
        return v;
    }
    console.error(v);
    throw new ValidationError(ctx, 'null', 'The value is not null.');
}));
class StringSchemaChain {
    constructor(func) {
        this.toCreator = () => Object.assign(() => camouflage(this.func), this);
        this.composite = (next) => new StringSchemaChain(compositeValidatorFunc(this.func, next)).toCreator();
        this.nonEmpty = () => this.composite((v, ctx) => {
            if (v === '') {
                throw new ValidationError(ctx, 'string.nonEmpty', 'The value is an empty string.');
            }
            return v;
        });
        this.maxLength = (length, includeEqual = true) => this.composite((v, ctx) => {
            if (includeEqual ? v.length <= length : v.length < length) {
                return v;
            }
            throw new ValidationError(ctx, 'string.maxLength', 'Length of the value is larger than max-length.');
        });
        this.minLength = (length, includeEqual = true) => this.composite((v, ctx) => {
            if (includeEqual ? v.length >= length : v.length > length) {
                return v;
            }
            throw new ValidationError(ctx, 'string.minLength', 'Length of the value is smaller than min-length.');
        });
        this.test = (regexp) => {
            return this.composite((v, ctx) => {
                if (!regexp.test(v)) {
                    throw new ValidationError(ctx, 'string.text', 'The value did not match the pattern.');
                }
                return v;
            });
        };
        this.validate = (f) => this.composite((v, ctx) => {
            if (!(f(v))) {
                throw new ValidationError(ctx, 'string.validate', 'Validation failed.');
            }
            return v;
        });
        this.convert = (converter) => camouflage((v, ctx) => converter(this.func(v, ctx)));
        this.func = func;
    }
}
StringSchemaChain.initial = new StringSchemaChain((v, ctx) => {
    if (typeof v === 'string') {
        return v;
    }
    throw new ValidationError(ctx, 'string', 'The value is not a string.');
}).toCreator();
class NumberSchemaChain {
    constructor(func) {
        this.toCreator = () => Object.assign(() => camouflage(this.func), this);
        this.composite = (next) => new NumberSchemaChain(compositeValidatorFunc(this.func, next)).toCreator();
        this.nonZero = () => this.composite((v, ctx) => {
            if (v === 0) {
                throw new ValidationError(ctx, 'number.nonZero', 'The value is zero.');
            }
            return v;
        });
        this.integer = () => this.composite((v, ctx) => {
            if (!Number.isInteger(v)) {
                throw new ValidationError(ctx, 'number.integer', 'The value is not an integer.');
            }
            return v;
        });
        this.maxValue = (value, includeEqual = true) => this.composite((v, ctx) => {
            if (includeEqual ? v <= value : v < value) {
                return v;
            }
            throw new ValidationError(ctx, 'number.maxValue', 'The value is larger than max-value.');
        });
        this.minValue = (value, includeEqual = true) => this.composite((v, ctx) => {
            if (includeEqual ? v >= value : v > value) {
                return v;
            }
            throw new ValidationError(ctx, 'number.minValue', 'The value is smaller than min-value.');
        });
        this.validate = (f) => this.composite((v, ctx) => {
            if (!(f(v))) {
                throw new ValidationError(ctx, 'number.validate', 'Validation failed.');
            }
            return v;
        });
        this.convert = (converter) => camouflage((v, ctx) => converter(this.func(v, ctx)));
        this.func = func;
    }
}
NumberSchemaChain.initial = new NumberSchemaChain((v, ctx) => {
    if (typeof v === 'number') {
        return v;
    }
    throw new ValidationError(ctx, 'number', 'The value is not a number.');
}).toCreator();
class BooleanSchemaChain {
    constructor(func) {
        this.toCreator = () => Object.assign(() => camouflage(this.func), this);
        this.convert = (converter) => camouflage((v, ctx) => converter(this.func(v, ctx)));
        this.func = func;
    }
}
BooleanSchemaChain.initial = new BooleanSchemaChain((v, ctx) => {
    if (typeof v === 'boolean') {
        return v;
    }
    throw new ValidationError(ctx, 'boolean', 'The value is not a boolean.');
}).toCreator();
class DateSchemaChain {
    constructor(func) {
        this.toCreator = () => Object.assign(() => camouflage(this.func), this);
        this.composite = (next) => new DateSchemaChain(compositeValidatorFunc(this.func, next)).toCreator();
        this.convert = (converter) => camouflage((v, ctx) => converter(this.func(v, ctx)));
        this.maxValue = (value, includeEqual = true) => this.composite((v, ctx) => {
            if (includeEqual ? value.getTime() >= v.getTime() : value.getTime() > v.getTime()) {
                return v;
            }
            throw new ValidationError(ctx, 'Date', 'The value is larger than max-value.');
        });
        this.minValue = (value, includeEqual = true) => this.composite((v, ctx) => {
            if (includeEqual ? value.getTime() <= v.getTime() : value.getTime() < v.getTime()) {
                return v;
            }
            throw new ValidationError(ctx, 'Date', 'The value is smaller than min-value.');
        });
        this.past = () => this.composite((v, ctx) => {
            if (Date.now() < v.getTime()) {
                throw new ValidationError(ctx, 'Date', 'The value is future.');
            }
            return v;
        });
        this.future = () => this.composite((v, ctx) => {
            if (Date.now() > v.getTime()) {
                throw new ValidationError(ctx, 'Date', 'The value is past.');
            }
            return v;
        });
        this.validate = (f) => this.composite((v, ctx) => {
            if (!(f(v))) {
                throw new ValidationError(ctx, 'Date.validate', 'Validation failed.');
            }
            return v;
        });
        this.func = func;
    }
}
DateSchemaChain.initial = new DateSchemaChain((v, ctx) => {
    if (v instanceof Date) {
        return v;
    }
    const timestamp = Date.parse(v);
    if (Number.isNaN(timestamp)) {
        throw new ValidationError(ctx, 'Date', 'The value is not a Date.');
    }
    return new Date(timestamp);
}).toCreator();
class ObjectSchemaChain {
    constructor(func) {
        this.toCreator = () => Object.assign(() => camouflage(this.func), this);
        this.composite = (next) => new ObjectSchemaChain(compositeValidatorFunc(this.func, next)).toCreator();
        this.validate = (f) => this.composite((v, ctx) => {
            if (!f(v)) {
                throw new ValidationError(ctx, 'Object.validate', 'Validation failed.');
            }
            return v;
        });
        this.convert = (f) => new ObjectSchemaChain((v, ctx) => f(this.func(v, ctx))).toCreator();
        this.func = func;
    }
}
ObjectSchemaChain.initial = (schema) => new ObjectSchemaChain((v, ctx) => {
    if (v === null || v === undefined) {
        throw new ValidationError(ctx, 'Object', 'The value is null or undefined.');
    }
    if (typeof v === 'object') {
        return validateValue(schema, v, ctx);
    }
    throw new ValidationError(ctx, 'Object', 'The value is not an object.');
}).toCreator();
class DictionarySchemaChain {
    constructor(func) {
        this.toCreator = () => Object.assign(() => camouflage(this.func), this);
        this.composite = (next) => new DictionarySchemaChain(compositeValidatorFunc(this.func, next)).toCreator();
        this.validate = (f) => this.composite((v, ctx) => {
            Object.keys(v).forEach(key => {
                if (!f(v[key], key)) {
                    throw new ValidationError(ctx, 'Dictionary.validate', 'Validation failed.');
                }
            });
            return v;
        });
        this.convert = (f) => camouflage((v, ctx) => f(this.func(v, ctx)));
        this.map = (f) => new DictionarySchemaChain((v, ctx) => Object.keys(v).reduce((obj, key) => { obj[key] = f(v[key], key); return obj; }, {}))
            .toCreator();
        this.mapKeys = (f) => this.composite((v, ctx) => Object.keys(v).reduce((obj, key) => { obj[f(key)] = v[key]; return obj; }, {}));
        this.func = func;
    }
}
DictionarySchemaChain.initial = (schema) => new DictionarySchemaChain((v, ctx) => {
    if (v === null || v === undefined) {
        throw new ValidationError(ctx, 'Dictionary', 'The value is null or undefined.');
    }
    if (typeof v !== 'object') {
        throw new ValidationError(ctx, 'Dictionary', 'The value is not an object.');
    }
    return Object.keys(v).reduce((obj, key) => {
        obj[key] = validateValue(schema, v[key], Object.assign(Object.assign({}, ctx), { path: `${ctx.path}.${key}` }));
        return obj;
    }, {});
})
    .toCreator();
//
// Export functions
//
const exportFunctions = () => {
    const validate = (schema, value) => validateValue(schema, value, { path: '', keyReverse: false });
    const validateReverse = (schema, value) => {
        const context = { path: '', keyReverse: true };
        const validatedValue = validateValue(schema, value, context);
        if (context.keyRemap) {
            for (const remap of context.keyRemap) {
                remap.object[remap.dstKey] = remap.object[remap.srcKey];
                delete remap.object[remap.srcKey];
            }
        }
        return validatedValue;
    };
    const stringify = (schema, value) => JSON.stringify(validateReverse(schema, value));
    const parse = (schema, text) => validate(schema, JSON.parse(text));
    const schema = (schema) => validateSchema(schema, '');
    return {
        validate,
        validateReverse,
        stringify,
        parse,
        schema
    };
};
//
// Module export
//
const axjson = Object.assign(Object.assign({}, exportFunctions()), { ValidationError,
    InvalidSchemaError, key: createKeySchema, nullable: nullableSchemaCreator, optional: optionalSchemaCreator, array: createArraySchema, union: createUnionSchema, intersection: createIntersectionSchema, any: createAnySchema, unknown: createUnknownSchema, null: createNullSchema, undefined: createUndefinedSchema, object: ObjectSchemaChain.initial, dictionary: DictionarySchemaChain.initial, string: StringSchemaChain.initial, number: NumberSchemaChain.initial, integer: NumberSchemaChain.initial.integer(), boolean: BooleanSchemaChain.initial, date: DateSchemaChain.initial });
exports.default = axjson;
