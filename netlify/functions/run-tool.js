const handler = require('../../backend/api/run-tool');

exports.handler = async function netlifyHandler(event, context) {
  const input = {
    httpMethod: event.httpMethod || 'POST',
    headers: event.headers || {},
    body: event.body || '{}'
  };

  const response = await handler(input);

  return {
    statusCode: response.statusCode || 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: response.body || JSON.stringify({ error: 'No response body.' })
  };
};
