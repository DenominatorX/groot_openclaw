// PBKDF2-based password hashing using Web Crypto API (available in Cloudflare Workers)

const ITERATIONS = 100_000
const HASH_ALGO = 'SHA-256'
const KEY_LENGTH = 32 // bytes

export async function hashPassword(password) {
  const enc = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: HASH_ALGO },
    keyMaterial,
    KEY_LENGTH * 8,
  )
  const hash = new Uint8Array(bits)
  const saltHex = bufToHex(salt)
  const hashHex = bufToHex(hash)
  return `pbkdf2:${ITERATIONS}:${saltHex}:${hashHex}`
}

export async function verifyPassword(password, stored) {
  const [, iters, saltHex, hashHex] = stored.split(':')
  const enc = new TextEncoder()
  const salt = hexToBuf(saltHex)
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: parseInt(iters, 10), hash: HASH_ALGO },
    keyMaterial,
    KEY_LENGTH * 8,
  )
  const hash = bufToHex(new Uint8Array(bits))
  return hash === hashHex
}

// JWT (HS256) using Web Crypto HMAC

function base64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return Uint8Array.from(atob(str), c => c.charCodeAt(0))
}

export async function signJWT(payload, secret) {
  const enc = new TextEncoder()
  const header = base64url(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))
  const body = base64url(enc.encode(JSON.stringify(payload)))
  const sigInput = `${header}.${body}`

  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(sigInput))
  return `${sigInput}.${base64url(sig)}`
}

export async function verifyJWT(token, secret) {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('invalid token')
  const [header, body, sig] = parts
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  )
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    base64urlDecode(sig),
    enc.encode(`${header}.${body}`),
  )
  if (!valid) throw new Error('invalid signature')
  const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(body)))
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('token expired')
  }
  return payload
}

// Helpers
function bufToHex(buf) {
  return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('')
}

function hexToBuf(hex) {
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return arr
}
