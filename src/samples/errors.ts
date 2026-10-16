/** Error envelopes copied from the OpenAPI `components.responses` examples. */
export const errors = {
  unauthenticated: {
    error: { code: 'unauthenticated', message: 'A valid bearer token is required.', status: 401 },
  },
  paidPlanRequired: {
    error: {
      code: 'paid_plan_required',
      message: 'Please choose a paid plan to continue.',
      status: 403,
      plans_url: 'https://app.searcherries.com/plans',
    },
  },
  insufficientScope: {
    error: {
      code: 'insufficient_scope',
      message: 'The token cannot read the API.',
      status: 403,
      required_scopes: ['api:read', 'mcp:use'],
    },
  },
  notFound: {
    error: { code: 'not_found', message: 'Project not found.', status: 404 },
  },
  validationFailed: {
    error: {
      code: 'validation_failed',
      message: 'The request parameters are invalid.',
      status: 422,
      errors: { period: ['The selected period is invalid.'] },
    },
  },
  rateLimited: {
    error: {
      code: 'rate_limited',
      message: 'Too many requests. Retry after the number of seconds in retry_after.',
      status: 429,
      retry_after: 42,
    },
  },
  serverError: {
    error: { code: 'server_error', message: 'Something failed on the Searcherries side.', status: 500 },
  },
};
