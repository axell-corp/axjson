"use strict";
/* tslint:disable:no-magic-numbers */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
describe('axJson', () => {
    const scheme1 = {
        a: index_1.default.string(),
        b: index_1.default.number(),
        c: index_1.default.boolean(),
        d: index_1.default.integer(),
        e: index_1.default.dictionary(index_1.default.any())(),
        aa: index_1.default.array(index_1.default.string()),
        ba: index_1.default.array(index_1.default.number()),
        ca: index_1.default.array(index_1.default.boolean()),
        da: index_1.default.array(index_1.default.integer()),
        ea: index_1.default.array(index_1.default.dictionary(index_1.default.any())()),
        n: null,
        o: { x: index_1.default.number(), y: index_1.default.number() }
    };
    const obj1 = {
        a: 'a',
        b: 1.2,
        c: true,
        d: 10,
        e: { x: 0 },
        aa: ['a', 'b', 'c'],
        ba: [12.5, 457, 43534534, 0],
        ca: [true, false, true, false, false],
        da: [0, 1, 10000, -5],
        ea: [{ x: 1 }],
        n: null,
        o: { x: 1, y: 2 }
    };
    test('schema', () => {
        expect(index_1.default.schema(scheme1)).toEqual(scheme1);
    });
    test('primitives', () => {
        expect(index_1.default.validate(scheme1, obj1)).toEqual(obj1);
    });
    test('type mismatch', () => {
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { a: 123 }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { b: 'hoge' }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { c: 'hoge' }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { d: 0.5 }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { e: 123 }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { n: 123 }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { o: 123 }))).toThrow(index_1.default.ValidationError);
    });
    test('array type mismatch', () => {
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { aa: ['hoge', 456, true] }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { ba: ['hoge', 456, true] }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { ca: ['hoge', 456, true] }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { da: [0, 0.5, 1.2] }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { ea: [0, 0.5, 1.2] }))).toThrow(index_1.default.ValidationError);
    });
    test('undefined check', () => {
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { a: undefined }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { b: undefined }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { c: undefined }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { d: undefined }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { e: undefined }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { aa: undefined }))).toThrow(index_1.default.ValidationError);
    });
    test('null check', () => {
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { a: null }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { b: null }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { c: null }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { d: null }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { e: null }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme1, Object.assign({}, obj1, { aa: null }))).toThrow(index_1.default.ValidationError);
    });
    test('constant', () => {
        const schema = {
            a: 123,
            b: 'hoge',
            c: true,
            d: false
        };
        const value = {
            a: 123,
            b: 'hoge',
            c: true,
            d: false
        };
        expect(index_1.default.schema(schema)).toEqual(schema);
        expect(index_1.default.validate(schema, value)).toEqual(value);
        expect(() => index_1.default.validate(schema, Object.assign({}, value, { a: 456 }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(schema, Object.assign({}, value, { a: 'hoge' }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(schema, Object.assign({}, value, { b: 'fuga' }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(schema, Object.assign({}, value, { b: 123 }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(schema, Object.assign({}, value, { c: false }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(schema, Object.assign({}, value, { c: 'hoge' }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(schema, Object.assign({}, value, { d: true }))).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(schema, Object.assign({}, value, { d: null }))).toThrow(index_1.default.ValidationError);
    });
    test('key', () => {
        const schema = {
            a: index_1.default.key('hoge', index_1.default.string()),
            b: index_1.default.key('BB', {
                x: index_1.default.key('X', index_1.default.number()),
                sameName: index_1.default.key('sameName', true)
            }),
            c: index_1.default.key('CC', index_1.default.array({
                x: index_1.default.key('xx', index_1.default.string()),
                y: index_1.default.key('yy', index_1.default.integer())
            }))
        };
        expect(index_1.default.schema(schema)).toEqual(schema);
        expect(index_1.default.validate(schema, { hoge: 'HOGE', BB: { X: 123, sameName: true }, CC: [] })).toEqual({ a: 'HOGE', b: { x: 123, sameName: true }, c: [] });
        expect(index_1.default.validate(schema, { hoge: 'HOGE', BB: { X: 123, sameName: true }, CC: [{ xx: 'aa', yy: 123 }] })).toEqual({ a: 'HOGE', b: { x: 123, sameName: true }, c: [{ x: 'aa', y: 123 }] });
        expect(index_1.default.validate(schema, { hoge: 'HOGE', BB: { X: 123, sameName: true }, CC: [{ xx: 'aa', yy: 123 }, { xx: 'bb', yy: 456 }] })).toEqual({ a: 'HOGE', b: { x: 123, sameName: true }, c: [{ x: 'aa', y: 123 }, { x: 'bb', y: 456 }] });
        expect(() => index_1.default.validate(schema, { hoge: 123, BB: { X: 123, sameName: true }, CC: [{ xx: 'aa', yy: 123 }] })).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(schema, { hoge: 'HOGE', BB: { X: 'hoge', sameName: true }, CC: [{ xx: 'aa', yy: 123 }] })).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(schema, { hoge: 'HOGE', BB: { X: 123, sameName: false }, CC: [{ xx: 'aa', yy: 123 }] })).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(schema, { a: 'HOGE', BB: { X: 123, sameName: true }, CC: [{ xx: 'aa', yy: 123 }] })).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(schema, { hoge: 'HOGE', b: { X: 123, sameName: true }, CC: [{ xx: 'aa', yy: 123 }] })).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(schema, { hoge: 'HOGE', BB: { x: 123, sameName: true }, CC: [{ xx: 'aa', yy: 123 }] })).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(schema, { hoge: 'HOGE', BB: { X: 123, sameName: true }, CC: [{ x: 'aa', yy: 123 }] })).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(schema, { hoge: 'HOGE', BB: { X: 123, sameName: true }, CC: [{ xx: 'aa', y: 123 }] })).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(schema, { hoge: 'HOGE', BB: { X: 123, sameName: true }, c: [{ xx: 'aa', yy: 123 }] })).toThrow(index_1.default.ValidationError);
    });
    test('tuple', () => {
        const schema = {
            a: [index_1.default.number(), index_1.default.nullable(index_1.default.string())]
        };
        expect(index_1.default.schema(schema)).toEqual(schema);
        expect(index_1.default.validate(schema, { a: [1, 'hoge'] })).toEqual({ a: [1, 'hoge'] });
        expect(index_1.default.validate(schema, { a: [2, null] })).toEqual({ a: [2, null] });
        expect(() => index_1.default.validate(schema, {})).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(schema, { a: null })).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(schema, { a: [] })).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(schema, { a: [1, 2] })).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(schema, { a: ['hoge', 1] })).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(schema, { a: [1, 'hoge', 2] })).toThrow(index_1.default.ValidationError);
    });
    describe('string chaining', () => {
        test('nonEmpty', () => {
            const schema = {
                a: index_1.default.string.nonEmpty()()
            };
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, { a: 'hoge' })).toEqual({ a: 'hoge' });
            expect(() => index_1.default.validate(schema, { a: '' })).toThrow(index_1.default.ValidationError);
        });
        test('minLength, maxLength', () => {
            const schema = {
                b: index_1.default.string.minLength(5).maxLength(10)()
            };
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, { b: '12345' })).toEqual({ b: '12345' });
            expect(index_1.default.validate(schema, { b: '123456789A' })).toEqual({ b: '123456789A' });
            expect(() => index_1.default.validate(schema, { b: '1234' })).toThrow(index_1.default.ValidationError);
            expect(() => index_1.default.validate(schema, { b: '123456789AB' })).toThrow(index_1.default.ValidationError);
        });
        test('minLength, maxLength with includeEqual=false', () => {
            const schema = {
                b: index_1.default.string.minLength(5, false).maxLength(10, false)()
            };
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, { b: '123456' })).toEqual({ b: '123456' });
            expect(index_1.default.validate(schema, { b: '123456789' })).toEqual({ b: '123456789' });
            expect(() => index_1.default.validate(schema, { b: '12345' })).toThrow(index_1.default.ValidationError);
            expect(() => index_1.default.validate(schema, { b: '123456789A' })).toThrow(index_1.default.ValidationError);
        });
        test('test', () => {
            const schema = {
                a: index_1.default.string.test(/\.png?$/)()
            };
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, { a: 'hoge.png' })).toEqual({ a: 'hoge.png' });
            expect(() => index_1.default.validate(schema, { a: 'fuga.gif' })).toThrow(index_1.default.ValidationError);
        });
        test('validate', () => {
            const schema = {
                c: index_1.default.string.validate(s => s.includes('@'))()
            };
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, { c: 'hoge@fuga' })).toEqual({ c: 'hoge@fuga' });
            expect(() => index_1.default.validate(schema, { c: 'hoge_fuga' })).toThrow(index_1.default.ValidationError);
        });
        test('convert', () => {
            const schema = {
                d: index_1.default.string.nonEmpty().convert(s => s.toLocaleLowerCase())
            };
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, { d: 'FuGaHoGE' })).toEqual({ d: 'fugahoge' });
            expect(() => index_1.default.validate(schema, { d: '' })).toThrow(index_1.default.ValidationError);
        });
    });
    describe('number chaining', () => {
        test('integer', () => {
            const schema = {
                a: index_1.default.number.integer()()
            };
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, { a: 100 })).toEqual({ a: 100 });
            expect(() => index_1.default.validate(schema, { a: 100.1 })).toThrow(index_1.default.ValidationError);
        });
        test('nonZero', () => {
            const schema = {
                b: index_1.default.number.nonZero()()
            };
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, { b: 100 })).toEqual({ b: 100 });
            expect(() => index_1.default.validate(schema, { b: 0 })).toThrow(index_1.default.ValidationError);
        });
        const delta = 0.0000001;
        test('minValue, maxValue', () => {
            const schema = {
                c: index_1.default.number.minValue(10).maxValue(50)()
            };
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, { c: 10 })).toEqual({ c: 10 });
            expect(index_1.default.validate(schema, { c: 50 })).toEqual({ c: 50 });
            expect(() => index_1.default.validate(schema, { c: 10 - delta })).toThrow(index_1.default.ValidationError);
            expect(() => index_1.default.validate(schema, { c: 50 + delta })).toThrow(index_1.default.ValidationError);
        });
        test('minValue, maxValue with includeEqual=false', () => {
            const schema = {
                c: index_1.default.number.minValue(10, false).maxValue(50, false)()
            };
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, { c: 10 + delta })).toEqual({ c: 10 + delta });
            expect(index_1.default.validate(schema, { c: 50 - delta })).toEqual({ c: 50 - delta });
            expect(() => index_1.default.validate(schema, { c: 10 })).toThrow(index_1.default.ValidationError);
            expect(() => index_1.default.validate(schema, { c: 50 })).toThrow(index_1.default.ValidationError);
        });
        test('validate', () => {
            const schema = {
                d: index_1.default.number.integer().validate(v => v % 2 === 0)()
            };
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, { d: 2 })).toEqual({ d: 2 });
            expect(() => index_1.default.validate(schema, { d: 3 })).toThrow(index_1.default.ValidationError);
        });
        test('convert', () => {
            const schema = {
                e: index_1.default.number.convert(v => 'number:' + v)
            };
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, { e: 123 })).toEqual({ e: 'number:123' });
        });
    });
    test('boolean chaining', () => {
        {
            const schema = {
                a: index_1.default.boolean.convert(v => v ? 'ON' : 'OFF')
            };
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, { a: true })).toEqual({ a: 'ON' });
            expect(index_1.default.validate(schema, { a: false })).toEqual({ a: 'OFF' });
        }
    });
    test('date', () => {
        const scheme = {
            a: index_1.default.date()
        };
        expect(index_1.default.schema(scheme)).toEqual(scheme);
        const date = new Date();
        const obj = {
            a: date.toISOString()
        };
        expect(index_1.default.validate(scheme, obj)).toEqual({
            a: date
        });
        const obj2 = {
            a: date
        };
        expect(index_1.default.validate(scheme, obj2)).toEqual({
            a: date
        });
        expect(() => index_1.default.validate(scheme, { a: 'hoge' })).toThrow(index_1.default.ValidationError);
    });
    describe('date chaining', () => {
        const minDate = new Date(2001, 1, 23, 12, 34, 56);
        const maxDate = new Date(2020, 5, 6, 1, 23, 45);
        test('minValue, maxValue', () => {
            const schema = {
                a: index_1.default.date.minValue(minDate).maxValue(maxDate)()
            };
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, { a: minDate })).toEqual({ a: minDate });
            expect(index_1.default.validate(schema, { a: minDate.toISOString() })).toEqual({ a: minDate });
            expect(index_1.default.validate(schema, { a: maxDate })).toEqual({ a: maxDate });
            expect(index_1.default.validate(schema, { a: maxDate.toISOString() })).toEqual({ a: maxDate });
            const overMinDate = new Date(minDate.getTime());
            overMinDate.setSeconds(overMinDate.getSeconds() - 1);
            expect(() => index_1.default.validate(schema, { a: overMinDate })).toThrow(index_1.default.ValidationError);
            expect(() => index_1.default.validate(schema, { a: overMinDate.toISOString() })).toThrow(index_1.default.ValidationError);
            const overMaxDate = new Date(maxDate.getTime());
            overMaxDate.setSeconds(overMaxDate.getSeconds() + 1);
            expect(() => index_1.default.validate(schema, { a: overMaxDate })).toThrow(index_1.default.ValidationError);
            expect(() => index_1.default.validate(schema, { a: overMaxDate.toISOString() })).toThrow(index_1.default.ValidationError);
        });
        test('minValue, maxValue with includeEqual=false', () => {
            const schema = {
                a: index_1.default.date.minValue(minDate, false).maxValue(maxDate, false)()
            };
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(() => index_1.default.validate(schema, { a: minDate })).toThrow(index_1.default.ValidationError);
            expect(() => index_1.default.validate(schema, { a: minDate.toISOString() })).toThrow(index_1.default.ValidationError);
            expect(() => index_1.default.validate(schema, { a: maxDate })).toThrow(index_1.default.ValidationError);
            expect(() => index_1.default.validate(schema, { a: maxDate.toISOString() })).toThrow(index_1.default.ValidationError);
            const innerMinDate = new Date(minDate.getTime());
            innerMinDate.setSeconds(innerMinDate.getSeconds() + 1);
            expect(index_1.default.validate(schema, { a: innerMinDate })).toEqual({ a: innerMinDate });
            expect(index_1.default.validate(schema, { a: innerMinDate.toISOString() })).toEqual({ a: innerMinDate });
            const innerMaxDate = new Date(maxDate.getTime());
            innerMaxDate.setSeconds(innerMaxDate.getSeconds() - 1);
            expect(index_1.default.validate(schema, { a: innerMaxDate })).toEqual({ a: innerMaxDate });
            expect(index_1.default.validate(schema, { a: innerMaxDate.toISOString() })).toEqual({ a: innerMaxDate });
        });
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        test('past', () => {
            const schema = {
                a: index_1.default.date.past()()
            };
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, { a: pastDate })).toEqual({ a: pastDate });
            expect(index_1.default.validate(schema, { a: pastDate.toISOString() })).toEqual({ a: pastDate });
            expect(() => index_1.default.validate(schema, { a: futureDate })).toThrow(index_1.default.ValidationError);
            expect(() => index_1.default.validate(schema, { a: futureDate.toISOString() })).toThrow(index_1.default.ValidationError);
        });
        test('future', () => {
            const schema = {
                b: index_1.default.date.future()()
            };
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, { b: futureDate })).toEqual({ b: futureDate });
            expect(index_1.default.validate(schema, { b: futureDate.toISOString() })).toEqual({ b: futureDate });
            expect(() => index_1.default.validate(schema, { b: pastDate })).toThrow(index_1.default.ValidationError);
            expect(() => index_1.default.validate(schema, { b: pastDate.toISOString() })).toThrow(index_1.default.ValidationError);
        });
        test('validate', () => {
            const schema = {
                a: index_1.default.date.validate(d => d.getDate() % 2 === 0)()
            };
            expect(index_1.default.schema(schema)).toEqual(schema);
            const evenDate = new Date(2018, 10, 10, 1, 23, 45);
            const oddDate = new Date(2018, 10, 11, 1, 23, 45);
            expect(index_1.default.validate(schema, { a: evenDate })).toEqual({ a: evenDate });
            expect(index_1.default.validate(schema, { a: evenDate.toISOString() })).toEqual({ a: evenDate });
            expect(() => index_1.default.validate(schema, { a: oddDate })).toThrow(index_1.default.ValidationError);
            expect(() => index_1.default.validate(schema, { a: oddDate.toISOString() })).toThrow(index_1.default.ValidationError);
        });
        test('convert', () => {
            const schema = {
                a: index_1.default.date.convert(d => `${d.getFullYear()}/${d.getMonth()}`)
            };
            expect(index_1.default.schema(schema)).toEqual(schema);
            const date = new Date(2018, 10, 10, 1, 23, 45);
            expect(index_1.default.validate(schema, { a: date })).toEqual({ a: '2018/10' });
            expect(index_1.default.validate(schema, { a: date.toISOString() })).toEqual({ a: '2018/10' });
        });
    });
    test('optional', () => {
        const scheme = {
            a: index_1.default.optional(index_1.default.string()),
            b: index_1.default.optional(index_1.default.number()),
            c: index_1.default.optional(index_1.default.boolean()),
            d: index_1.default.optional(index_1.default.array(index_1.default.string()))
        };
        expect(index_1.default.schema(scheme)).toEqual(scheme);
        // Can allow undefined members
        expect(index_1.default.validate(scheme, {})).toEqual({});
        expect(index_1.default.validate(scheme, { a: 'hoge' })).toEqual({ a: 'hoge' });
        expect(index_1.default.validate(scheme, { b: 123 })).toEqual({ b: 123 });
        expect(index_1.default.validate(scheme, { c: true })).toEqual({ c: true });
        expect(index_1.default.validate(scheme, { d: ['a', 'b'] })).toEqual({ d: ['a', 'b'] });
        // Check type correctly
        expect(() => index_1.default.validate(scheme, { a: 123 })).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme, { b: 'hoge' })).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme, { c: 'hoge' })).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme, { d: [1, 2, 3] })).toThrow(index_1.default.ValidationError);
    });
    test('nullable', () => {
        const scheme = {
            a: index_1.default.nullable(index_1.default.number()),
            b: index_1.default.nullable(index_1.default.string()),
            c: index_1.default.nullable(index_1.default.boolean()),
            d: index_1.default.nullable(index_1.default.array(index_1.default.string()))
        };
        expect(index_1.default.schema(scheme)).toEqual(scheme);
        const obj = {
            a: 123,
            b: 'hoge',
            c: true,
            d: ['aaa']
        };
        // Check non null
        expect(index_1.default.validate(scheme, obj)).toEqual(obj);
        // Can allow null member
        for (const key of Object.keys(obj)) {
            const o = Object.assign({}, obj, { [key]: null });
            expect(index_1.default.validate(scheme, o)).toEqual(o);
        }
    });
    test('nullable unwrap', () => {
        const schema = {
            a: index_1.default.nullable.unwrap(() => 'NULL')(index_1.default.string()),
            b: index_1.default.nullable.unwrap(() => -1)(index_1.default.number()),
            c: index_1.default.nullable.unwrap(() => ({ x: 0, y: 0 }))({ x: index_1.default.number(), y: index_1.default.number() })
        };
        expect(index_1.default.schema(schema)).toEqual(schema);
        const obj = {
            a: 'hoge',
            b: 123,
            c: { x: 123, y: 456 }
        };
        // Check non null
        expect(index_1.default.validate(schema, obj)).toEqual(obj);
        // Check unwrap correctly
        expect(index_1.default.validate(schema, Object.assign({}, obj, { a: null })))
            .toEqual(Object.assign({}, obj, { a: 'NULL' }));
        expect(index_1.default.validate(schema, Object.assign({}, obj, { b: null })))
            .toEqual(Object.assign({}, obj, { b: -1 }));
        expect(index_1.default.validate(schema, Object.assign({}, obj, { c: null })))
            .toEqual(Object.assign({}, obj, { c: { x: 0, y: 0 } }));
    });
    test('optional unwrap', () => {
        const schema = {
            a: index_1.default.optional.unwrap(() => 'UNDEFINED')(index_1.default.string()),
            b: index_1.default.optional.unwrap(() => -1)(index_1.default.number()),
            c: index_1.default.optional.unwrap(() => ({ x: 0, y: 0 }))({ x: index_1.default.number(), y: index_1.default.number() })
        };
        expect(index_1.default.schema(schema)).toEqual(schema);
        const obj = {
            a: 'hoge',
            b: 123,
            c: { x: 123, y: 456 }
        };
        // Check non null
        expect(index_1.default.validate(schema, obj)).toEqual(obj);
        // Check unwrap correctly
        expect(index_1.default.validate(schema, Object.assign({}, obj, { a: undefined })))
            .toEqual(Object.assign({}, obj, { a: 'UNDEFINED' }));
        expect(index_1.default.validate(schema, Object.assign({}, obj, { b: undefined })))
            .toEqual(Object.assign({}, obj, { b: -1 }));
        expect(index_1.default.validate(schema, Object.assign({}, obj, { c: undefined })))
            .toEqual(Object.assign({}, obj, { c: { x: 0, y: 0 } }));
    });
    test('union primitive', () => {
        const scheme = {
            a: index_1.default.union(index_1.default.number(), index_1.default.string())
        };
        expect(index_1.default.schema(scheme)).toEqual(scheme);
        expect(index_1.default.validate(scheme, { a: 123 })).toEqual({ a: 123 });
        expect(index_1.default.validate(scheme, { a: 'hoge' })).toEqual({ a: 'hoge' });
        expect(() => index_1.default.validate(scheme, { a: true })).toThrow(index_1.default.ValidationError);
    });
    test('union object', () => {
        const scheme = index_1.default.union({
            a: 'hoge',
            b: 123
        }, {
            a: 'fuga',
            c: true
        });
        expect(index_1.default.schema(scheme)).toEqual(scheme);
        expect(index_1.default.validate(scheme, { a: 'hoge', b: 123 })).toEqual({ a: 'hoge', b: 123 });
        expect(index_1.default.validate(scheme, { a: 'fuga', c: true })).toEqual({ a: 'fuga', c: true });
        expect(() => index_1.default.validate(scheme, { a: 'ABOA' })).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme, { a: 'hoge', b: 100 })).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme, { a: 'fuga', c: false })).toThrow(index_1.default.ValidationError);
    });
    test('intersection', () => {
        const scheme = index_1.default.intersection({
            a: index_1.default.number()
        }, {
            b: index_1.default.string()
        });
        expect(index_1.default.schema(scheme)).toEqual(scheme);
        expect(index_1.default.validate(scheme, { a: 123, b: 'hoge' })).toEqual({ a: 123, b: 'hoge' });
        expect(() => index_1.default.validate(scheme, { a: 'hoge', b: 123 })).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme, { a: 123 })).toThrow(index_1.default.ValidationError);
        expect(() => index_1.default.validate(scheme, { b: 'hoge' })).toThrow(index_1.default.ValidationError);
    });
    test('any', () => {
        const schema = {
            a: index_1.default.any()
        };
        expect(index_1.default.schema(schema)).toEqual(schema);
        expect(index_1.default.validate(schema, { a: 123 })).toEqual({ a: 123 });
        expect(index_1.default.validate(schema, { a: 'hoge' })).toEqual({ a: 'hoge' });
        expect(index_1.default.validate(schema, { a: null })).toEqual({ a: null });
        expect(index_1.default.validate(schema, { a: { x: 0 } })).toEqual({ a: { x: 0 } });
    });
    describe('object', () => {
        test('object schema', () => {
            const schema = index_1.default.object({
                a: index_1.default.string(),
                b: index_1.default.number()
            })();
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, { a: 'hoge', b: 123 })).toEqual({ a: 'hoge', b: 123 });
            expect(() => index_1.default.validate(schema, null)).toThrow(index_1.default.ValidationError);
            expect(() => index_1.default.validate(schema, undefined)).toThrow(index_1.default.ValidationError);
            expect(() => index_1.default.validate(schema, 123)).toThrow(index_1.default.ValidationError);
        });
        test('object convert', () => {
            const schema = index_1.default.object({
                a: index_1.default.string(),
                b: index_1.default.number()
            }).convert(v => ({ AAA: v.a.toUpperCase(), BBBB: v.b * 10 }))();
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, { a: 'hoge', b: 123 })).toEqual({ AAA: 'HOGE', BBBB: 1230 });
        });
        test('object validate', () => {
            const schema = index_1.default.object({
                a: index_1.default.string(),
                b: index_1.default.number()
            }).validate(v => v.a.startsWith('0x') && (v.b % 2 === 0))();
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, { a: '0xabcd', b: 1234 })).toEqual({ a: '0xabcd', b: 1234 });
            expect(() => index_1.default.validate(schema, { a: 'hoge', b: 1234 })).toThrow(index_1.default.ValidationError);
            expect(() => index_1.default.validate(schema, { a: '0xabcd', b: 1233 })).toThrow(index_1.default.ValidationError);
            expect(() => index_1.default.validate(schema, { a: 'hoge', b: 1233 })).toThrow(index_1.default.ValidationError);
        });
        test('object complex', () => {
            const schema = index_1.default.object({
                a: index_1.default.string(),
                b: index_1.default.number()
            }).validate(v => v.a.startsWith('0x') && (v.b % 2 === 0)).convert(v => ({ x: v.a.toUpperCase(), y: v.b * 0.1 }))();
            expect(index_1.default.validate(schema, { a: '0xabcd', b: 1234 })).toEqual({ x: '0XABCD', y: 123.4 });
            expect(() => index_1.default.validate(schema, { a: 'hoge', b: 1234 })).toThrow(index_1.default.ValidationError);
            expect(() => index_1.default.validate(schema, { a: '0xabcd', b: 1233 })).toThrow(index_1.default.ValidationError);
            expect(() => index_1.default.validate(schema, { a: 'hoge', b: 1233 })).toThrow(index_1.default.ValidationError);
        });
    });
    describe('dictionary', () => {
        test('complex', () => {
            const schema = index_1.default.dictionary(index_1.default.object({
                x: index_1.default.number(),
                y: index_1.default.number()
            })())();
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, {})).toEqual({});
            expect(index_1.default.validate(schema, { hoge: { x: 1, y: 2 }, fuga: { x: 3, y: 4 } })).toEqual({ hoge: { x: 1, y: 2 }, fuga: { x: 3, y: 4 } });
            expect(() => index_1.default.validate(schema, { hoge: 'hoge' })).toThrow(index_1.default.ValidationError);
            expect(() => index_1.default.validate(schema, { hoge: { x: 'a', y: 2 } })).toThrow(index_1.default.ValidationError);
            expect(() => index_1.default.validate(schema, { hoge: { x: 0 } })).toThrow(index_1.default.ValidationError);
        });
        test('validate', () => {
            const schema = index_1.default.dictionary(index_1.default.object({
                x: index_1.default.number(),
                y: index_1.default.number()
            })()).validate((v, k) => v.x % 2 === 0 && k.startsWith('a'))();
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, {})).toEqual({});
            expect(index_1.default.validate(schema, { a1: { x: 2, y: 1 }, a2: { x: 4, y: 3 } })).toEqual({ a1: { x: 2, y: 1 }, a2: { x: 4, y: 3 } });
            expect(() => index_1.default.validate(schema, { hoge: { x: 2, y: 1 } })).toThrow(index_1.default.ValidationError);
            expect(() => index_1.default.validate(schema, { a1: { x: 1, y: 1 } })).toThrow(index_1.default.ValidationError);
        });
        test('validate', () => {
            const schema = index_1.default.dictionary(index_1.default.object({
                x: index_1.default.number(),
                y: index_1.default.number()
            })()).convert(v => ({ dict: v }));
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, {})).toEqual({ dict: {} });
            expect(index_1.default.validate(schema, { a1: { x: 2, y: 1 }, a2: { x: 4, y: 3 } })).toEqual({ dict: { a1: { x: 2, y: 1 }, a2: { x: 4, y: 3 } } });
        });
        test('map', () => {
            const schema = index_1.default.dictionary(index_1.default.object({
                x: index_1.default.number(),
                y: index_1.default.number()
            })()).map((v, k) => ({ a: v.x + v.y, l: k.length }))();
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, {})).toEqual({});
            expect(index_1.default.validate(schema, { hoge: { x: 1, y: 2 }, a: { x: 3, y: 4 } })).toEqual({ hoge: { a: 3, l: 4 }, a: { a: 7, l: 1 } });
        });
        test('mapKeys', () => {
            const schema = index_1.default.dictionary(index_1.default.object({
                x: index_1.default.number(),
                y: index_1.default.number()
            })()).mapKeys(k => 'HOGE' + k)();
            expect(index_1.default.schema(schema)).toEqual(schema);
            expect(index_1.default.validate(schema, {})).toEqual({});
            expect(index_1.default.validate(schema, { aaa: { x: 1, y: 2 }, bbb: { x: 3, y: 4 } })).toEqual({ HOGEaaa: { x: 1, y: 2 }, HOGEbbb: { x: 3, y: 4 } });
        });
    });
    test('invalid schema', () => {
        const schema = {
            a: () => 0
        };
        expect(() => index_1.default.schema(schema)).toThrow(index_1.default.InvalidSchemaError);
        expect(() => index_1.default.validate(schema, { a: 0 })).toThrow(index_1.default.ValidationError);
    });
    test('complex object', () => {
        const scheme = {
            a: index_1.default.nullable(index_1.default.union({
                x: index_1.default.string()
            }, index_1.default.date)),
            b: index_1.default.optional(index_1.default.array(index_1.default.nullable(index_1.default.union({
                y: index_1.default.number(),
                f: index_1.default.optional(index_1.default.boolean())
            }, {
                z: index_1.default.nullable(index_1.default.integer()),
                payload: index_1.default.dictionary(index_1.default.string())()
            }))))
        };
        expect(index_1.default.schema(scheme)).toEqual(scheme);
        const obj = {
            a: { x: 'hoge' },
            b: [null, {
                    y: 123.456, f: false
                }, {
                    z: null,
                    payload: {}
                }, {
                    y: 100
                }, {
                    z: 12,
                    payload: { foo: 'bar' }
                }, null]
        };
        expect(index_1.default.validate(scheme, obj)).toEqual(obj);
    });
    test('stringify/parse', () => {
        const schema = {
            a: index_1.default.string(),
            b: index_1.default.number(),
            c: index_1.default.nullable(index_1.default.number()),
            d: index_1.default.date()
        };
        expect(index_1.default.schema(schema)).toEqual(schema);
        const date = new Date();
        const value = {
            a: 'hoge',
            b: 123,
            c: null,
            d: date
        };
        const stringifiedValue = JSON.stringify(value);
        expect(index_1.default.validateReverse(schema, value)).toEqual(value);
        expect(index_1.default.parse(schema, index_1.default.stringify(schema, value))).toEqual(value);
        expect(index_1.default.parse(schema, stringifiedValue)).toEqual(value);
    });
    test('stringify/parse with key remap', () => {
        const schema = index_1.default.object({
            x: index_1.default.key('XX', index_1.default.number()),
            y: index_1.default.key('hoge', index_1.default.string()),
            z: index_1.default.key('fuga', index_1.default.object({
                a: index_1.default.key('AA', index_1.default.number())
            })())
        }).validate(v => v.x === 100 && v.y === 'HOGE' && v.z.a === 200)();
        const value = {
            XX: 100,
            hoge: 'HOGE',
            fuga: {
                AA: 200
            }
        };
        const parsedValue = {
            x: 100,
            y: 'HOGE',
            z: { a: 200 }
        };
        expect(index_1.default.validate(schema, value)).toEqual(parsedValue);
        expect(index_1.default.validateReverse(schema, parsedValue)).toEqual(value);
        expect(index_1.default.parse(schema, index_1.default.stringify(schema, parsedValue))).toEqual(parsedValue);
    });
});
//# sourceMappingURL=index.test.js.map