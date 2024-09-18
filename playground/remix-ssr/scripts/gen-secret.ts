import crypto from 'node:crypto'

const sessionSecret = crypto.randomBytes(16).toString('hex')

console.log(sessionSecret)
