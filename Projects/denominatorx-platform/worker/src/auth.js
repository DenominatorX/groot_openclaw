import { hashPassword, verifyPassword, signJWT, verifyJWT } from './crypto.js'

const JWT_TTL = 60 * 60 * 24 * 30 // 30 days in seconds
const TOKEN_BLOCKLIST_TTL = JWT_TTL + 60 // slightly longer than JWT TTL

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function err(message, status = 400) {
  return json({ error: message }, status)
}

function newId() {
  return crypto.randomUUID()
}

async function getBearerToken(request) {
  const auth = request.headers.get('Authorization') || ''
  if (!auth.startsWith('Bearer ')) return null
  return auth.slice(7)
}

export async function handleRegister(request, env) {
  let body
  try { body = await request.json() } catch { return err('invalid JSON') }

  const { email, password } = body || {}
  if (!email || !password) return err('email and password required')
  if (password.length < 8) return err('password must be at least 8 characters')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err('invalid email')

  // Check existing user
  const existing = await env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first()
  if (existing) return err('email already registered', 409)

  const id = newId()
  const hash = await hashPassword(password)
  const now = new Date().toISOString()

  await env.DB.prepare(
    'INSERT INTO users (id, email, password_hash, created_at, subscription_tier) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, email.toLowerCase(), hash, now, 'free').run()

  const token = await signJWT(
    { sub: id, email: email.toLowerCase(), exp: Math.floor(Date.now() / 1000) + JWT_TTL },
    env.JWT_SECRET,
  )

  return json({
    token,
    user: { id, email: email.toLowerCase(), subscription_tier: 'free' },
  }, 201)
}

export async function handleLogin(request, env) {
  let body
  try { body = await request.json() } catch { return err('invalid JSON') }

  const { email, password } = body || {}
  if (!email || !password) return err('email and password required')

  const user = await env.DB.prepare(
    'SELECT id, email, password_hash, subscription_tier FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first()

  if (!user) return err('invalid email or password', 401)

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) return err('invalid email or password', 401)

  const token = await signJWT(
    { sub: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + JWT_TTL },
    env.JWT_SECRET,
  )

  return json({
    token,
    user: { id: user.id, email: user.email, subscription_tier: user.subscription_tier },
  })
}

export async function handleMe(request, env) {
  const token = await getBearerToken(request)
  if (!token) return err('missing token', 401)

  // Check blocklist
  const blocked = await env.SESSIONS.get(`blocklist:${token}`)
  if (blocked) return err('token revoked', 401)

  let payload
  try {
    payload = await verifyJWT(token, env.JWT_SECRET)
  } catch (e) {
    return err(e.message, 401)
  }

  const user = await env.DB.prepare(
    'SELECT id, email, subscription_tier FROM users WHERE id = ?'
  ).bind(payload.sub).first()

  if (!user) return err('user not found', 404)

  return json({ user })
}

export async function handleLogout(request, env) {
  const token = await getBearerToken(request)
  if (!token) return err('missing token', 401)

  // Add to blocklist until expiry
  await env.SESSIONS.put(`blocklist:${token}`, '1', { expirationTtl: TOKEN_BLOCKLIST_TTL })

  return json({ ok: true })
}
