/* tslint:disable:no-magic-numbers */

import j from './index'

describe('axJson', () => {
    const scheme1 = {
        a: j.string(),
        b: j.number(),
        c: j.boolean(),
        d: j.integer(),
        e: j.dictionary(j.any())(),
        aa: j.array(j.string()),
        ba: j.array(j.number()),
        ca: j.array(j.boolean()),
        da: j.array(j.integer()),
        ea: j.array(j.dictionary(j.any())()),
        n: null,
        o: {x: j.number(), y: j.number()}
    }

    const obj1 = {
        a: 'a',
        b: 1.2,
        c: true,
        d: 10,
        e: {x: 0},
        aa: ['a', 'b', 'c'],
        ba: [12.5, 457, 43534534, 0],
        ca: [true, false, true, false, false],
        da: [0, 1, 10000, -5],
        ea: [{x: 1}],
        n: null,
        o: {x: 1, y: 2}
    }

    test('schema', () => {
        expect(j.schema(scheme1)).toEqual(scheme1)
    })

    test('primitives', () => {
        expect(j.validate(scheme1, obj1)).toEqual(obj1)
    })

    test('type mismatch', () => {
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {a: 123}))).toThrow(j.ValidationError)
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {b: 'hoge'}))).toThrow(j.ValidationError)
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {c: 'hoge'}))).toThrow(j.ValidationError)
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {d: 0.5}))).toThrow(j.ValidationError)
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {e: 123}))).toThrow(j.ValidationError)
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {n: 123}))).toThrow(j.ValidationError)
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {o: 123}))).toThrow(j.ValidationError)
    })

    test('array type mismatch', () => {
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {aa: ['hoge', 456, true]}))).toThrow(j.ValidationError)
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {ba: ['hoge', 456, true]}))).toThrow(j.ValidationError)
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {ca: ['hoge', 456, true]}))).toThrow(j.ValidationError)
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {da: [0, 0.5, 1.2]}))).toThrow(j.ValidationError)
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {ea: [0, 0.5, 1.2]}))).toThrow(j.ValidationError)
    })

    test('undefined check', () => {
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {a: undefined}))).toThrow(j.ValidationError)
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {b: undefined}))).toThrow(j.ValidationError)
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {c: undefined}))).toThrow(j.ValidationError)
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {d: undefined}))).toThrow(j.ValidationError)
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {e: undefined}))).toThrow(j.ValidationError)
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {aa: undefined}))).toThrow(j.ValidationError)
    })

    test('null check', () => {
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {a: null}))).toThrow(j.ValidationError)
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {b: null}))).toThrow(j.ValidationError)
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {c: null}))).toThrow(j.ValidationError)
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {d: null}))).toThrow(j.ValidationError)
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {e: null}))).toThrow(j.ValidationError)
        expect(() => j.validate(scheme1, Object.assign({}, obj1 , {aa: null}))).toThrow(j.ValidationError)
    })

    test('constant', () => {
        const schema = {
            a: 123 as 123,
            b: 'hoge' as 'hoge',
            c: true as true,
            d: false as false
        }

        const value = {
            a: 123,
            b: 'hoge',
            c: true,
            d: false
        }

        expect(j.schema(schema)).toEqual(schema)
        expect(j.validate(schema, value)).toEqual(value)

        expect(() => j.validate(schema, Object.assign({}, value, {a: 456}))).toThrow(j.ValidationError)
        expect(() => j.validate(schema, Object.assign({}, value, {a: 'hoge'}))).toThrow(j.ValidationError)
        expect(() => j.validate(schema, Object.assign({}, value, {b: 'fuga'}))).toThrow(j.ValidationError)
        expect(() => j.validate(schema, Object.assign({}, value, {b: 123}))).toThrow(j.ValidationError)
        expect(() => j.validate(schema, Object.assign({}, value, {c: false}))).toThrow(j.ValidationError)
        expect(() => j.validate(schema, Object.assign({}, value, {c: 'hoge'}))).toThrow(j.ValidationError)
        expect(() => j.validate(schema, Object.assign({}, value, {d: true}))).toThrow(j.ValidationError)
        expect(() => j.validate(schema, Object.assign({}, value, {d: null}))).toThrow(j.ValidationError)
    })

    test('key', () => {
        const schema = {
            a: j.key('hoge', j.string()),
            b: j.key('BB', {
                x: j.key('X', j.number()),
                sameName: j.key('sameName', true as true)
            }),
            c: j.key('CC', j.array({
                x: j.key('xx', j.string()),
                y: j.key('yy', j.integer())
            }))
        }

        expect(j.schema(schema)).toEqual(schema)

        expect(j.validate(schema, {hoge: 'HOGE', BB: {X: 123, sameName: true}, CC: []})).toEqual({a: 'HOGE', b: {x: 123, sameName: true}, c: []})
        expect(j.validate(schema, {hoge: 'HOGE', BB: {X: 123, sameName: true}, CC: [{xx: 'aa', yy: 123}]})).toEqual({a: 'HOGE', b: {x: 123, sameName: true}, c: [{x: 'aa', y: 123}]})
        expect(j.validate(schema, {hoge: 'HOGE', BB: {X: 123, sameName: true}, CC: [{xx: 'aa', yy: 123}, {xx: 'bb', yy: 456}]})).toEqual({a: 'HOGE', b: {x: 123, sameName: true}, c: [{x: 'aa', y: 123}, {x: 'bb', y: 456}]})

        expect(() => j.validate(schema, {hoge: 123, BB: {X: 123, sameName: true}, CC: [{xx: 'aa', yy: 123}]})).toThrow(j.ValidationError)
        expect(() => j.validate(schema, {hoge: 'HOGE', BB: {X: 'hoge', sameName: true}, CC: [{xx: 'aa', yy: 123}]})).toThrow(j.ValidationError)
        expect(() => j.validate(schema, {hoge: 'HOGE', BB: {X: 123, sameName: false}, CC: [{xx: 'aa', yy: 123}]})).toThrow(j.ValidationError)

        expect(() => j.validate(schema, {a: 'HOGE', BB: {X: 123, sameName: true}, CC: [{xx: 'aa', yy: 123}]})).toThrow(j.ValidationError)
        expect(() => j.validate(schema, {hoge: 'HOGE', b: {X: 123, sameName: true}, CC: [{xx: 'aa', yy: 123}]})).toThrow(j.ValidationError)
        expect(() => j.validate(schema, {hoge: 'HOGE', BB: {x: 123, sameName: true}, CC: [{xx: 'aa', yy: 123}]})).toThrow(j.ValidationError)

        expect(() => j.validate(schema, {hoge: 'HOGE', BB: {X: 123, sameName: true}, CC: [{x: 'aa', yy: 123}]})).toThrow(j.ValidationError)
        expect(() => j.validate(schema, {hoge: 'HOGE', BB: {X: 123, sameName: true}, CC: [{xx: 'aa', y: 123}]})).toThrow(j.ValidationError)
        expect(() => j.validate(schema, {hoge: 'HOGE', BB: {X: 123, sameName: true}, c: [{xx: 'aa', yy: 123}]})).toThrow(j.ValidationError)
    })

    test('tuple', () => {
        const schema = {
            a: [j.number(), j.nullable(j.string())]
        }
        expect(j.schema(schema)).toEqual(schema)
        expect(j.validate(schema, {a: [1, 'hoge']})).toEqual({a: [1, 'hoge']})
        expect(j.validate(schema, {a: [2, null]})).toEqual({a: [2, null]})
        expect(() => j.validate(schema, {})).toThrow(j.ValidationError)
        expect(() => j.validate(schema, {a: null})).toThrow(j.ValidationError)
        expect(() => j.validate(schema, {a: []})).toThrow(j.ValidationError)
        expect(() => j.validate(schema, {a: [1, 2]})).toThrow(j.ValidationError)
        expect(() => j.validate(schema, {a: ['hoge', 1]})).toThrow(j.ValidationError)
        expect(() => j.validate(schema, {a: [1, 'hoge', 2]})).toThrow(j.ValidationError)
    })

    describe('string chaining', () => {
        test('nonEmpty', () => {
            const schema = {
                a: j.string.nonEmpty()()
            }
            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {a: 'hoge'})).toEqual({a: 'hoge'})
            expect(() => j.validate(schema, {a: ''})).toThrow(j.ValidationError)
        })
        test('minLength, maxLength', () => {
            const schema = {
                b: j.string.minLength(5).maxLength(10)()
            }
            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {b: '12345'})).toEqual({b: '12345'})
            expect(j.validate(schema, {b: '123456789A'})).toEqual({b: '123456789A'})
            expect(() => j.validate(schema, {b: '1234'})).toThrow(j.ValidationError)
            expect(() => j.validate(schema, {b: '123456789AB'})).toThrow(j.ValidationError)
        })
        test('minLength, maxLength with includeEqual=false', () => {
            const schema = {
                b: j.string.minLength(5, false).maxLength(10, false)()
            }
            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {b: '123456'})).toEqual({b: '123456'})
            expect(j.validate(schema, {b: '123456789'})).toEqual({b: '123456789'})
            expect(() => j.validate(schema, {b: '12345'})).toThrow(j.ValidationError)
            expect(() => j.validate(schema, {b: '123456789A'})).toThrow(j.ValidationError)
        })
        test('test', () => {
            const schema = {
                a: j.string.test(/\.png?$/)()
            }
            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {a: 'hoge.png'})).toEqual({a: 'hoge.png'})
            expect(() => j.validate(schema, {a: 'fuga.gif'})).toThrow(j.ValidationError)
        })
        test('validate', () => {
            const schema = {
                c: j.string.validate(s => s.includes('@'))()
            }
            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {c: 'hoge@fuga'})).toEqual({c: 'hoge@fuga'})
            expect(() => j.validate(schema, {c: 'hoge_fuga'})).toThrow(j.ValidationError)
        })
        test('convert', () => {
            const schema = {
                d: j.string.nonEmpty().convert(s => s.toLocaleLowerCase())
            }
            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {d: 'FuGaHoGE'})).toEqual({d: 'fugahoge'})
            expect(() => j.validate(schema, {d: ''})).toThrow(j.ValidationError)
        })
    })

    describe('number chaining', () => {
        test('integer', () => {
            const schema = {
                a: j.number.integer()()
            }
            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {a: 100})).toEqual({a: 100})
            expect(() => j.validate(schema, {a: 100.1})).toThrow(j.ValidationError)
        })
        test('nonZero', () => {
            const schema = {
                b: j.number.nonZero()()
            }
            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {b: 100})).toEqual({b: 100})
            expect(() => j.validate(schema, {b: 0})).toThrow(j.ValidationError)
        })
        const delta = 0.0000001
        test('minValue, maxValue', () => {
            const schema = {
                c: j.number.minValue(10).maxValue(50)()
            }
            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {c: 10})).toEqual({c: 10})
            expect(j.validate(schema, {c: 50})).toEqual({c: 50})
            expect(() => j.validate(schema, {c: 10 - delta})).toThrow(j.ValidationError)
            expect(() => j.validate(schema, {c: 50 + delta})).toThrow(j.ValidationError)
        })
        test('minValue, maxValue with includeEqual=false', () => {
            const schema = {
                c: j.number.minValue(10, false).maxValue(50, false)()
            }
            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {c: 10 + delta})).toEqual({c: 10 + delta})
            expect(j.validate(schema, {c: 50 - delta})).toEqual({c: 50 - delta})
            expect(() => j.validate(schema, {c: 10})).toThrow(j.ValidationError)
            expect(() => j.validate(schema, {c: 50})).toThrow(j.ValidationError)
        })
        test('validate', () => {
            const schema = {
                d: j.number.integer().validate(v => v % 2 === 0)()
            }
            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {d: 2})).toEqual({d: 2})
            expect(() => j.validate(schema, {d: 3})).toThrow(j.ValidationError)
        })
        test('convert', () => {
            const schema = {
                e: j.number.convert(v => 'number:' + v)
            }
            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {e: 123})).toEqual({e: 'number:123'})
        })
    })

    test('boolean chaining', () => {
        {
            const schema = {
                a: j.boolean.convert(v => v ? 'ON' : 'OFF')
            }
            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {a: true})).toEqual({a: 'ON'})
            expect(j.validate(schema, {a: false})).toEqual({a: 'OFF'})
        }
    })

    test('date', () => {
        const scheme = {
            a: j.date()
        }

        expect(j.schema(scheme)).toEqual(scheme)

        const date = new Date()

        const obj = {
            a: date.toISOString()
        }
        expect(j.validate(scheme, obj)).toEqual({
            a: date
        })

        const obj2 = {
            a: date
        }
        expect(j.validate(scheme, obj2)).toEqual({
            a: date
        })

        expect(() => j.validate(scheme, {a: 'hoge'})).toThrow(j.ValidationError)
    })

    describe('date chaining', () => {
        const minDate = new Date(2001, 1, 23, 12, 34, 56)
        const maxDate = new Date(2020, 5, 6, 1, 23, 45)

        test('minValue, maxValue', () => {
            const schema = {
                a: j.date.minValue(minDate).maxValue(maxDate)()
            }
            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {a: minDate})).toEqual({a: minDate})
            expect(j.validate(schema, {a: minDate.toISOString()})).toEqual({a: minDate})
            expect(j.validate(schema, {a: maxDate})).toEqual({a: maxDate})
            expect(j.validate(schema, {a: maxDate.toISOString()})).toEqual({a: maxDate})

            const overMinDate = new Date(minDate.getTime())
            overMinDate.setSeconds(overMinDate.getSeconds() - 1)
            expect(() => j.validate(schema, {a: overMinDate})).toThrow(j.ValidationError)
            expect(() => j.validate(schema, {a: overMinDate.toISOString()})).toThrow(j.ValidationError)

            const overMaxDate = new Date(maxDate.getTime())
            overMaxDate.setSeconds(overMaxDate.getSeconds() + 1)
            expect(() => j.validate(schema, {a: overMaxDate})).toThrow(j.ValidationError)
            expect(() => j.validate(schema, {a: overMaxDate.toISOString()})).toThrow(j.ValidationError)
        })
        test('minValue, maxValue with includeEqual=false', () => {
            const schema = {
                a: j.date.minValue(minDate, false).maxValue(maxDate, false)()
            }
            expect(j.schema(schema)).toEqual(schema)
            expect(() => j.validate(schema, {a: minDate})).toThrow(j.ValidationError)
            expect(() => j.validate(schema, {a: minDate.toISOString()})).toThrow(j.ValidationError)
            expect(() => j.validate(schema, {a: maxDate})).toThrow(j.ValidationError)
            expect(() => j.validate(schema, {a: maxDate.toISOString()})).toThrow(j.ValidationError)

            const innerMinDate = new Date(minDate.getTime())
            innerMinDate.setSeconds(innerMinDate.getSeconds() + 1)
            expect(j.validate(schema, {a: innerMinDate})).toEqual({a: innerMinDate})
            expect(j.validate(schema, {a: innerMinDate.toISOString()})).toEqual({a: innerMinDate})

            const innerMaxDate = new Date(maxDate.getTime())
            innerMaxDate.setSeconds(innerMaxDate.getSeconds() - 1)
            expect(j.validate(schema, {a: innerMaxDate})).toEqual({a: innerMaxDate})
            expect(j.validate(schema, {a: innerMaxDate.toISOString()})).toEqual({a: innerMaxDate})
        })

        const pastDate = new Date()
        pastDate.setDate(pastDate.getDate() - 1)
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 1)

        test('past', () => {
            const schema = {
                a: j.date.past()()
            }
            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {a: pastDate})).toEqual({a: pastDate})
            expect(j.validate(schema, {a: pastDate.toISOString()})).toEqual({a: pastDate})
            expect(() => j.validate(schema, {a: futureDate})).toThrow(j.ValidationError)
            expect(() => j.validate(schema, {a: futureDate.toISOString()})).toThrow(j.ValidationError)
        })
        test('future', () => {
            const schema = {
                b: j.date.future()()
            }
            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {b: futureDate})).toEqual({b: futureDate})
            expect(j.validate(schema, {b: futureDate.toISOString()})).toEqual({b: futureDate})
            expect(() => j.validate(schema, {b: pastDate})).toThrow(j.ValidationError)
            expect(() => j.validate(schema, {b: pastDate.toISOString()})).toThrow(j.ValidationError)
        })

        test('validate', () => {
            const schema = {
                a: j.date.validate(d => d.getDate() % 2 === 0)()
            }

            expect(j.schema(schema)).toEqual(schema)

            const evenDate = new Date(2018, 10, 10, 1, 23, 45)
            const oddDate = new Date(2018, 10, 11, 1, 23, 45)

            expect(j.validate(schema, {a: evenDate})).toEqual({a: evenDate})
            expect(j.validate(schema, {a: evenDate.toISOString()})).toEqual({a: evenDate})
            expect(() => j.validate(schema, {a: oddDate})).toThrow(j.ValidationError)
            expect(() => j.validate(schema, {a: oddDate.toISOString()})).toThrow(j.ValidationError)
        })

        test('convert', () => {
            const schema = {
                a: j.date.convert(d => `${d.getFullYear()}/${d.getMonth()}`)
            }

            expect(j.schema(schema)).toEqual(schema)

            const date = new Date(2018, 10, 10, 1, 23, 45)

            expect(j.validate(schema, {a: date})).toEqual({a: '2018/10'})
            expect(j.validate(schema, {a: date.toISOString()})).toEqual({a: '2018/10'})
        })
    })

    test('optional', () => {
        const scheme = {
            a: j.optional(j.string()),
            b: j.optional(j.number()),
            c: j.optional(j.boolean()),
            d: j.optional(j.array(j.string()))
        }

        expect(j.schema(scheme)).toEqual(scheme)

        // Can allow undefined members
        expect(j.validate(scheme, {})).toEqual({})
        expect(j.validate(scheme, {a: 'hoge'})).toEqual({a: 'hoge'})
        expect(j.validate(scheme, {b: 123})).toEqual({b: 123})
        expect(j.validate(scheme, {c: true})).toEqual({c: true})
        expect(j.validate(scheme, {d: ['a', 'b']})).toEqual({d: ['a', 'b']})

        // Check type correctly
        expect(() => j.validate(scheme, {a: 123})).toThrow(j.ValidationError)
        expect(() => j.validate(scheme, {b: 'hoge'})).toThrow(j.ValidationError)
        expect(() => j.validate(scheme, {c: 'hoge'})).toThrow(j.ValidationError)
        expect(() => j.validate(scheme, {d: [1, 2, 3]})).toThrow(j.ValidationError)
    })

    test('nullable', () => {
        const scheme = {
            a: j.nullable(j.number()),
            b: j.nullable(j.string()),
            c: j.nullable(j.boolean()),
            d: j.nullable(j.array(j.string()))
        }

        expect(j.schema(scheme)).toEqual(scheme)

        const obj = {
            a: 123,
            b: 'hoge',
            c: true,
            d: ['aaa']
        }

        // Check non null
        expect(j.validate(scheme, obj)).toEqual(obj)

        // Can allow null member
        for (const key of Object.keys(obj)) {
            const o = Object.assign({}, obj, {[key]: null})
            expect(j.validate(scheme, o)).toEqual(o)
        }
    })

    test('nullable unwrap', () => {
        const schema = {
            a: j.nullable.unwrap(() => 'NULL')(j.string()),
            b: j.nullable.unwrap(() => -1)(j.number()),
            c: j.nullable.unwrap(() => ({x: 0, y: 0}))({x: j.number(), y: j.number()})
        }

        expect(j.schema(schema)).toEqual(schema)

        const obj = {
            a: 'hoge',
            b: 123,
            c: {x: 123, y: 456}
        }

        // Check non null
        expect(j.validate(schema, obj)).toEqual(obj)

        // Check unwrap correctly
        expect(j.validate(schema, Object.assign({}, obj, {a: null})))
            .toEqual(Object.assign({}, obj, {a: 'NULL'}))

        expect(j.validate(schema, Object.assign({}, obj, {b: null})))
            .toEqual(Object.assign({}, obj, {b: -1}))

        expect(j.validate(schema, Object.assign({}, obj, {c: null})))
            .toEqual(Object.assign({}, obj, {c: {x: 0, y: 0}}))
    })

    test('optional unwrap', () => {
        const schema = {
            a: j.optional.unwrap(() => 'UNDEFINED')(j.string()),
            b: j.optional.unwrap(() => -1)(j.number()),
            c: j.optional.unwrap(() => ({x: 0, y: 0}))({x: j.number(), y: j.number()})
        }

        expect(j.schema(schema)).toEqual(schema)

        const obj = {
            a: 'hoge',
            b: 123,
            c: {x: 123, y: 456}
        }

        // Check non null
        expect(j.validate(schema, obj)).toEqual(obj)

        // Check unwrap correctly
        expect(j.validate(schema, Object.assign({}, obj, {a: undefined})))
            .toEqual(Object.assign({}, obj, {a: 'UNDEFINED'}))

        expect(j.validate(schema, Object.assign({}, obj, {b: undefined})))
            .toEqual(Object.assign({}, obj, {b: -1}))

        expect(j.validate(schema, Object.assign({}, obj, {c: undefined})))
            .toEqual(Object.assign({}, obj, {c: {x: 0, y: 0}}))
    })

    test('union primitive', () => {
        const scheme = {
            a: j.union(j.number(), j.string())
        }

        expect(j.schema(scheme)).toEqual(scheme)

        expect(j.validate(scheme, {a: 123})).toEqual({a: 123})
        expect(j.validate(scheme, {a: 'hoge'})).toEqual({a: 'hoge'})
        expect(() => j.validate(scheme, {a: true})).toThrow(j.ValidationError)
    })

    test('union object', () => {
        const scheme = j.union({
            a: 'hoge' as const,
            b: 123
        }, {
            a: 'fuga' as const,
            c: true
        })

        expect(j.schema(scheme)).toEqual(scheme)

        expect(j.validate(scheme, {a: 'hoge', b: 123})).toEqual({a: 'hoge', b: 123})
        expect(j.validate(scheme, {a: 'fuga', c: true})).toEqual({a: 'fuga', c: true})
        expect(() => j.validate(scheme, {a: 'ABOA'})).toThrow(j.ValidationError)
        expect(() => j.validate(scheme, {a: 'hoge', b: 100})).toThrow(j.ValidationError)
        expect(() => j.validate(scheme, {a: 'fuga', c: false})).toThrow(j.ValidationError)
    })

    test('intersection', () => {
        const scheme = j.intersection({
            a: j.number()
        }, {
            b: j.string()
        })

        expect(j.schema(scheme)).toEqual(scheme)

        expect(j.validate(scheme, {a: 123, b: 'hoge'})).toEqual({a: 123, b: 'hoge'})

        expect(() => j.validate(scheme, {a: 'hoge', b: 123})).toThrow(j.ValidationError)
        expect(() => j.validate(scheme, {a: 123})).toThrow(j.ValidationError)
        expect(() => j.validate(scheme, {b: 'hoge'})).toThrow(j.ValidationError)
    })

    test('any', () => {
        const schema = {
            a: j.any()
        }

        expect(j.schema(schema)).toEqual(schema)
        expect(j.validate(schema, {a: 123})).toEqual({a: 123})
        expect(j.validate(schema, {a: 'hoge'})).toEqual({a: 'hoge'})
        expect(j.validate(schema, {a: null})).toEqual({a: null})
        expect(j.validate(schema, {a: {x: 0}})).toEqual({a: {x: 0}})
    })

    test('unknown', () => {
        const schema = {
            a: j.unknown()
        }

        expect(j.schema(schema)).toEqual(schema)
        expect(j.validate(schema, {a: 123})).toEqual({a: 123})
        expect(j.validate(schema, {a: 'hoge'})).toEqual({a: 'hoge'})
        expect(j.validate(schema, {a: null})).toEqual({a: null})
        expect(j.validate(schema, {a: {x: 0}})).toEqual({a: {x: 0}})
    })

    test('undefined', () => {
        const schema = {
            a: j.undefined()
        }

        expect(j.schema(schema)).toEqual(schema)
        expect(j.validate(schema, {a: undefined})).toEqual({a: undefined})
        expect(() => j.validate(schema, {a: null})).toThrow(j.ValidationError)
        expect(() => j.validate(schema, {a: 'hoge'})).toThrow(j.ValidationError)
        expect(() => j.validate(schema, {a: {x: 0}})).toThrow(j.ValidationError)
        expect(() => j.validate(schema, {a: 0})).toThrow(j.ValidationError)
    })

    test('null', () => {
        const schema = {
            a: j.null()
        }

        expect(j.schema(schema)).toEqual(schema)
        expect(j.validate(schema, {a: null})).toEqual({a: null})
        expect(() => j.validate(schema, {a: undefined})).toThrow(j.ValidationError)
        expect(() => j.validate(schema, {a: 'hoge'})).toThrow(j.ValidationError)
        expect(() => j.validate(schema, {a: {x: 0}})).toThrow(j.ValidationError)
        expect(() => j.validate(schema, {a: 0})).toThrow(j.ValidationError)
    })

    describe('object', () => {
        test('object schema', () => {
            const schema = j.object({
                a: j.string(),
                b: j.number()
            })()

            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {a: 'hoge', b: 123})).toEqual({a: 'hoge', b: 123})

            expect(() => j.validate(schema, null)).toThrow(j.ValidationError)
            expect(() => j.validate(schema, undefined)).toThrow(j.ValidationError)
            expect(() => j.validate(schema, 123)).toThrow(j.ValidationError)
        })

        test('object convert', () => {
            const schema = j.object({
                a: j.string(),
                b: j.number()
            }).convert(
                v => ({AAA: v.a.toUpperCase(), BBBB: v.b * 10})
            )()

            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {a: 'hoge', b: 123})).toEqual({AAA: 'HOGE', BBBB: 1230})
        })

        test('object validate', () => {
            const schema = j.object({
                a: j.string(),
                b: j.number()
            }).validate(
                v => v.a.startsWith('0x') && (v.b % 2 === 0)
            )()

            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {a: '0xabcd', b: 1234})).toEqual({a: '0xabcd', b: 1234})

            expect(() => j.validate(schema, {a: 'hoge', b: 1234})).toThrow(j.ValidationError)
            expect(() => j.validate(schema, {a: '0xabcd', b: 1233})).toThrow(j.ValidationError)
            expect(() => j.validate(schema, {a: 'hoge', b: 1233})).toThrow(j.ValidationError)
        })

        test('object complex', () => {
            const schema = j.object({
                a: j.string(),
                b: j.number()
            }).validate(
                v => v.a.startsWith('0x') && (v.b % 2 === 0)
            ).convert(
                v => ({x: v.a.toUpperCase(), y: v.b * 0.1})
            )()
            expect(j.validate(schema, {a: '0xabcd', b: 1234})).toEqual({x: '0XABCD', y: 123.4})

            expect(() => j.validate(schema, {a: 'hoge', b: 1234})).toThrow(j.ValidationError)
            expect(() => j.validate(schema, {a: '0xabcd', b: 1233})).toThrow(j.ValidationError)
            expect(() => j.validate(schema, {a: 'hoge', b: 1233})).toThrow(j.ValidationError)
        })
    })

    describe('dictionary', () => {
        test('complex', () => {
            const schema = j.dictionary(
                j.object({
                    x: j.number(),
                    y: j.number()
                })()
            )()

            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {})).toEqual({})
            expect(j.validate(schema, {hoge: {x: 1, y: 2}, fuga: {x: 3, y: 4}})).toEqual({hoge: {x: 1, y: 2}, fuga: {x: 3, y: 4}})

            expect(() => j.validate(schema, {hoge: 'hoge'})).toThrow(j.ValidationError)
            expect(() => j.validate(schema, {hoge: {x: 'a', y: 2}})).toThrow(j.ValidationError)
            expect(() => j.validate(schema, {hoge: {x: 0}})).toThrow(j.ValidationError)
        })

        test('validate', () => {
            const schema = j.dictionary(
                j.object({
                    x: j.number(),
                    y: j.number()
                })()
            ).validate(
                (v, k) => v.x % 2 === 0 && k.startsWith('a')
            )()

            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {})).toEqual({})
            expect(j.validate(schema, {a1: {x: 2, y: 1}, a2: {x: 4, y: 3}})).toEqual({a1: {x: 2, y: 1}, a2: {x: 4, y: 3}})

            expect(() => j.validate(schema, {hoge: {x: 2, y: 1}})).toThrow(j.ValidationError)
            expect(() => j.validate(schema, {a1: {x: 1, y: 1}})).toThrow(j.ValidationError)
        })

        test('validate', () => {
            const schema = j.dictionary(
                j.object({
                    x: j.number(),
                    y: j.number()
                })()
            ).convert(v => ({dict: v}))

            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {})).toEqual({dict: {}})
            expect(j.validate(schema, {a1: {x: 2, y: 1}, a2: {x: 4, y: 3}})).toEqual({dict: {a1: {x: 2, y: 1}, a2: {x: 4, y: 3}}})
        })

        test('map', () => {
            const schema = j.dictionary(
                j.object({
                    x: j.number(),
                    y: j.number()
                })()
            ).map(
                (v, k) => ({a: v.x + v.y, l: k.length})
            )()

            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {})).toEqual({})
            expect(j.validate(schema, {hoge: {x: 1, y: 2}, a: {x: 3, y: 4}})).toEqual({hoge: {a: 3, l: 4}, a: {a: 7, l: 1}})
        })

        test('mapKeys', () => {
            const schema = j.dictionary(
                j.object({
                    x: j.number(),
                    y: j.number()
                })()
            ).mapKeys(
                k => 'HOGE' + k
            )()

            expect(j.schema(schema)).toEqual(schema)
            expect(j.validate(schema, {})).toEqual({})
            expect(j.validate(schema, {aaa: {x: 1, y: 2}, bbb: {x: 3, y: 4}})).toEqual({HOGEaaa: {x: 1, y: 2}, HOGEbbb: {x: 3, y: 4}})
        })
    })

    test('invalid schema', () => {
        const schema = {
            a: () => 0
        }
        expect(() => j.schema(schema)).toThrow(j.InvalidSchemaError)
        expect(() => j.validate(schema, {a: 0})).toThrow(j.ValidationError)
    })

    test('complex object', () => {
        const scheme = {
            a: j.nullable(j.union({
                x: j.string()
            },
            j.date)),
            b: j.optional(j.array(j.nullable(j.union({
                y: j.number(),
                f: j.optional(j.boolean())
            }, {
                z: j.nullable(j.integer()),
                payload: j.dictionary(j.string())()
            }))))
        }

        expect(j.schema(scheme)).toEqual(scheme)

        const obj = {
            a: {x: 'hoge'},
            b: [null, {
                y: 123.456, f: false
            }, {
                z: null,
                payload: {}
            }, {
                y: 100
            }, {
                z: 12,
                payload: {foo: 'bar'}
            }, null]
        }
        expect(j.validate(scheme, obj)).toEqual(obj)
    })

    test('stringify/parse', () => {
        const schema = {
            a: j.string(),
            b: j.number(),
            c: j.nullable(j.number()),
            d: j.date()
        }

        expect(j.schema(schema)).toEqual(schema)

        const date = new Date()

        const value = {
            a: 'hoge',
            b: 123,
            c: null,
            d: date
        }

        const stringifiedValue = JSON.stringify(value)

        expect(j.validateReverse(schema, value)).toEqual(value)
        expect(j.parse(schema, j.stringify(schema, value))).toEqual(value)
        expect(j.parse(schema, stringifiedValue)).toEqual(value)
    })

    test('stringify/parse with key remap', () => {
        const schema = j.object({
            x: j.key('XX', j.number()),
            y: j.key('hoge', j.string()),
            z: j.key('fuga', j.object({
                a: j.key('AA', j.number())
            })())
        }).validate(v => v.x === 100 && v.y === 'HOGE' && v.z.a === 200)()

        const value = {
            XX: 100,
            hoge: 'HOGE',
            fuga: {
                AA: 200
            }
        }

        const parsedValue = {
            x: 100,
            y: 'HOGE',
            z: {a: 200}
        }

        expect(j.validate(schema, value)).toEqual(parsedValue)
        expect(j.validateReverse(schema, parsedValue)).toEqual(value)
        expect(j.parse(schema, j.stringify(schema, parsedValue))).toEqual(parsedValue)
    })
})
