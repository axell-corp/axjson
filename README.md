# AxJson

AxJson is type-safe json validator for TypeScript.

# Concepts


```typescript
type User = {
    id: number; // positive integer only
    name: string; // no empty
    tags: string | string[];
    created: Date | null;
};

const user = await fetch('SOME_API_URL');
// user is 'any', not type safe.
// user.created is 'string', so you must convert it to Date manually.
```

If you want to make a Json object type-safe, you must write validation code like below for each schema.

```typescript
if (typeof user.id !== 'number' || user.id <= 0) {
    throw new Error('Invalid user.id');
}
if (typeof user.name !== 'string' || user.name === '') {
    throw new Error('Invalid user.name');
}
if (Array.isArray(user.tags)) {
    for (const tag of user.tags) {
        if (typeof tag !== 'string') {
            throw new Error('Invalid user.tags')
        }
    }
} else if (typeof user.tags !== string) {
    throw new Error('Invalid user.tags');
}
if (user.created !== null) {
    const timestamp = Date.parse(user.created);
    if (Number.isNaN(timestamp)) {
        throw new Error('Invalid user.created');
    }
    user.created = new Date(timestamp);
}
```

With AxJson, you just define a Json schema. It's done.

```typescript
import axJson from 'axJson';

const UserSchema = {
    id: axJson.number.integer().minValue(0)(),
    name: axJson.string.noEmpty()(),
    tags: axJson.union(
        axJson.string(),
        axJson.array(axJson.string())
    ),
    created: axJson.nullable(axJson.date())
};

type User = typeof UserSchema;
// type User = {
//     id: number;
//     name: string;
//     tags: string | string[];
//     created: Date | null;
// };

// Type-safe with runtime validation
const user = axJson.validate(
    UserSchema, await fetch('SOME_API_URL'));

```

# Defining schema

## Object

```typescript
const schema = {
    a: axJson.string(),
    b: axJson.number()
};
```

```typescript
type Schema = {
    a: string;
    b: number;
};
```

## Tuple and array

```typescript
const schema = {
    arrayMember: axJson.array(axJson.number()),
    tupleMember: [axJson.number(), axJson.number()]
}
```

```typescript
type Schema = {
    arrayMember: number[];
    tupleMember: [number, number];
};
```

## Constants

Use `as` operator to define constants.

```typescript
const schema = {
    a: true as true,
    b: 'foo' as 'foo',
    c: 123 as 123,
    d: axJson.union('A' as 'A', 'B' as 'B')
};
```

```typescript
type Schema = {
    a: true;
    b: 'foo';
    c: 123;
    d: 'A' | 'B';
};
```

## Null

Use `nullable` to make schema nullable.
Also you can use `null` directly to just define `null`.

```typescript
const schema = {
    a: axJson.nullable(axJson.number()),
    b: null
};
```

```typescript
type Schema = {
    a: number | null;
    b: null;
};
```


## Compositing schemas

Schemas can be used in another schema.

```typescript
const schema1 = {
    a: axJson.string(),
    b: axJson.number()
};

const schema2 = {
    x: schema1
}
```


# Reference

## `validate`

This method validates `value` is `T`, then returns validated and converted value or raises error.

```typescript
validate: <T>(schema: T, value: any) => T
```

## `nullable`

This method creates the nullable type schema from the exist schema.

```typescript
nullable: <T>(schema: T) => T | null
```

## `optional`

This method creates the optional type schema from the exist schema.

```typescript
optional: <T>(schema: T) => T | undefined
```

## `array`

This method creates the array type schema.

```typescript
array: <T>(schema: T) => T[]
```

## `union`

This method creates the union type schema.

```typescript
union: <T1, T2>(schema1: T1, schema2: T2) => T1 | T2
union: <T1, T2, T3>(schema1: T1, schema2: T2, schema3: T3) => T1 | T2 | T3
union: <T1, T2, T3, T4>(schema1: T1, schema2: T2, schema3: T3, schema4: T4) => T1 | T2 | T3 | T4
```

## `intersection`

This method creates the intersection type schema.

```typescript
intersection: <T1, T2>(schema1: T1, schema2: T2) => T1 & T2
intersection: <T1, T2, T3>(schema1: T1, schema2: T2, schema3: T3) => T1 & T2 & T3
intersection: <T1, T2, T3, T4>(schema1: T1, schema2: T2, schema3: T3, schema4: T4) => T1 & T2 & T3 & T4
```

## `object`

This method creates the `object` type schema.
Unlike defining object schema, this method will not validate any members.

```typescript
object: () => object
```

## `any`

This method creates the `any` type schema.
Schemas created by this method will not be validate anything.

```typescript
any: () => any
```

## `string`

This method creates the `string` type schema.

```typescript
axJson.string: () => string
```

Also `axJson.string` has some utility methods can be chained like below.
```typescript
string.nonEmpty().maxLength(10)()
```

### `nonEmpty`
This method validates the string is non-empty.

```typescript
nonEmpty: () => StringChain
```

### `maxLength`
This method validates the string length is smaller than the specified max-length.

```typescript
maxLength: (length: number) => StringChain
```

### `minLength`
This method validates the string length is greater than the specified min-length.

```typescript
minLength: (length: number) => StringChain
```

### `test`
This method validates the string matches the specified regex pattern.

```typescript
test: (pattern: string) => StringChain
```

### `validate`
This method validates the specified `validator` method returns true.

```typescript
validate: (validator: (v: string) => boolean) => StringChain
```

### `convert`
This method converts the string value to string or another type by the specified `converter`.

```typescript
convert: <T>(converter: (v: string) => T) => T
```

Put this method terminal of the method-chain because `convert` returns converted type and that can not be chained any more.

```typescript
string.nonEmpty().maxLength(10).convert(v => v.toLowerCase())
```

## `number`

This method creates the `number` type schema.

```typescript
axJson.number: () => number
```

Also `axJson.number` has some utility methods can be chained like below.
```typescript
axJson.number.nonZero().maxValue(100)()
```

### `nonZero`

This method validates the value is non-zero.

```typescript
nonZero: () => NumberChain
```

### `integer`

This method validates the value is an integer number.

```typescript
integer: () => NumberChain
```

### `maxValue`

This method validates the value is smaller than the specified value.

```typescript
maxValue: (value: number) => NumberChain
```

### `minValue`

This method validates the value is greater than the specified value.

```typescript
minValue: (value: number) => NumberChain
```

### `validate`

This method validates the specified `validator` method returns true.

```typescript
validate: (validator: (v: number) => boolean) => NumberChain
```

### `convert`

This method converts the number value to number or another type by the specified `converter`.

```typescript
convert: <T>(converter: (v: number) => T) => T
```

Put this method terminal of the method-chain because `convert` returns converted type and that cannot be chained any more.

```typescript
axJson.number.nonZero().maxValue(100).convert(v => v * 2)
```

## `integer`

`integer` is the alias for `number.integer()`.

## `date`


