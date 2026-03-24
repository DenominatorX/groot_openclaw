import { handleRegister, handleLogin, handleMe, handleLogout } from './auth.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function withCors(response) {
  const res = new Response(response.body, response)
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v))
  return res
}

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    const url = new URL(request.url)
    const path = url.pathname

    try {
      let response

      if (path === '/api/auth/register' && request.method === 'POST') {
        response = await handleRegister(request, env)
      } else if (path === '/api/auth/login' && request.method === 'POST') {
        response = await handleLogin(request, env)
      } else if (path === '/api/auth/me' && request.method === 'GET') {
        response = await handleMe(request, env)
      } else if (path === '/api/auth/logout' && request.method === 'POST') {
        response = await handleLogout(request, env)
      } else if (path === '/api/health') {
        response = new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json' },
        })
      } else {
        response = new Response(JSON.stringify({ error: 'not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      return withCors(response)
    } catch (e) {
      return withCors(new Response(
        JSON.stringify({ error: 'internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      ))
    }
  },
}
