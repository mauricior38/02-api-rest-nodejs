'use strict'
const __create = Object.create
const __defProp = Object.defineProperty
const __getOwnPropDesc = Object.getOwnPropertyDescriptor
const __getOwnPropNames = Object.getOwnPropertyNames
const __getProtoOf = Object.getPrototypeOf
const __hasOwnProp = Object.prototype.hasOwnProperty
const __export = (target, all) => {
  for (const name in all)
    __defProp(target, name, { get: all[name], enumerable: true })
}
const __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === 'object') || typeof from === 'function') {
    for (const key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        })
  }
  return to
}
const __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, 'default', { value: mod, enumerable: true })
      : target,
    mod,
  )
)
const __toCommonJS = (mod) =>
  __copyProps(__defProp({}, '__esModule', { value: true }), mod)
const __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    const fulfilled = (value) => {
      try {
        step(generator.next(value))
      } catch (e) {
        reject(e)
      }
    }
    const rejected = (value) => {
      try {
        step(generator.throw(value))
      } catch (e) {
        reject(e)
      }
    }
    var step = (x) =>
      x.done
        ? resolve(x.value)
        : Promise.resolve(x.value).then(fulfilled, rejected)
    step((generator = generator.apply(__this, __arguments)).next())
  })
}

// src/app.ts
const app_exports = {}
__export(app_exports, {
  app: () => app,
})
module.exports = __toCommonJS(app_exports)
const import_fastify = __toESM(require('fastify'))

// src/routes/transactions.ts
const import_zod2 = require('zod')

// src/database.ts
const import_knex = require('knex')

// src/env/index.ts
const import_dotenv = require('dotenv')
const import_zod = require('zod')
if (process.env.NODE_ENV === 'test') {
  ;(0, import_dotenv.config)({ path: '.env.test' })
} else {
  ;(0, import_dotenv.config)()
}
const envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z
    .enum(['development', 'test', 'production'])
    .default('production'),
  DATABASE_URL: import_zod.z.string(),
  PORT: import_zod.z.number().default(3333),
})
const _env = envSchema.safeParse(process.env)
if (_env.success === false) {
  console.error('Invalid enviroment variables', _env.error.format)
  throw new Error('Invalid enviroment variables')
}
const env = _env.data

// src/database.ts
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL env not found')
}
const config2 = {
  client: 'sqlite',
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}
const knex = (0, import_knex.knex)(config2)

// src/routes/transactions.ts
const import_node_crypto = __toESM(require('crypto'))

// src/middlewares/check-session-id-exists.ts
function checkSessionIdExists(request, reply) {
  return __async(this, null, function* () {
    const sessionId = request.cookies.sessionId
    if (!sessionId) {
      return reply.status(401).send({
        error: 'Unauthorizied.',
      })
    }
  })
}

// src/routes/transactions.ts
function transactionsRoutes(app2) {
  return __async(this, null, function* () {
    app2.addHook('preHandler', (request) =>
      __async(this, null, function* () {
        console.log(`[${request.method}] ${request.url}`)
      }),
    )
    app2.get(
      '/',
      {
        preHandler: [checkSessionIdExists],
      },
      (request) =>
        __async(this, null, function* () {
          const { sessionId } = request.cookies
          const transactions = yield knex('transactions')
            .select()
            .where('session_id', sessionId)
            .select()
          return { transactions }
        }),
    )
    app2.get(
      '/:id',
      {
        preHandler: [checkSessionIdExists],
      },
      (request) =>
        __async(this, null, function* () {
          const getTransactionParamsSchema = import_zod2.z.object({
            id: import_zod2.z.string().uuid(),
          })
          const { sessionId } = request.cookies
          const { id } = getTransactionParamsSchema.parse(request.params)
          const transaction = yield knex('transactions')
            .where({
              session_id: sessionId,
              id,
            })
            .first()
          return { transaction }
        }),
    )
    app2.get(
      '/summary',
      {
        preHandler: [checkSessionIdExists],
      },
      (request) =>
        __async(this, null, function* () {
          const { sessionId } = request.cookies
          const summary = yield knex('transactions')
            .where('session_id', sessionId)
            .sum('amount', { as: 'amount' })
            .first()
          return { summary }
        }),
    )
    app2.post('/', (request, reply) =>
      __async(this, null, function* () {
        const creacteTransactionBodySchema = import_zod2.z.object({
          title: import_zod2.z.string(),
          amount: import_zod2.z.number(),
          type: import_zod2.z.enum(['credit', 'debit']),
        })
        const { title, amount, type } = creacteTransactionBodySchema.parse(
          request.body,
        )
        let sessionId = request.cookies.sessionId
        if (!sessionId) {
          sessionId = (0, import_node_crypto.randomUUID)()
          reply.cookie('sessionId', sessionId, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            // 7 days
          })
        }
        yield knex('transactions').insert({
          id: import_node_crypto.default.randomUUID(),
          title,
          amount: type === 'credit' ? amount : amount * -1,
          session_id: sessionId,
        })
        return reply.status(201).send()
      }),
    )
  })
}

// src/app.ts
const import_cookie = __toESM(require('@fastify/cookie'))
var app = (0, import_fastify.default)()
app.register(import_cookie.default)
app.register(transactionsRoutes, {
  prefix: 'transactions',
})
// Annotate the CommonJS export names for ESM import in node:
0 &&
  (module.exports = {
    app,
  })
