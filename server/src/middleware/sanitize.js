export function sanitizeInput(value) {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim()
}

export function sanitizeObject(obj, allowedKeys) {
  if (!obj || typeof obj !== 'object') return {}

  const sanitized = {}
  for (const key of allowedKeys) {
    if (obj[key] !== undefined) {
      const value = obj[key]
      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput(value)
      } else if (Array.isArray(value)) {
        sanitized[key] = value
          .filter((item) => typeof item === 'string')
          .map((item) => sanitizeInput(item))
          .filter(Boolean)
      } else {
        sanitized[key] = value
      }
    }
  }
  return sanitized
}

export function sanitizationMiddleware(req, _res, next) {
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeInput(req.query[key])
      }
    }
  }

  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key])
      }
    }
  }

  next()
}

export function validateContentType(req, res, next) {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.headers['content-type'] || ''
    if (!contentType.includes('application/json')) {
      return res.status(415).json({
        error: 'Content-Type must be application/json',
      })
    }
  }
  next()
}
