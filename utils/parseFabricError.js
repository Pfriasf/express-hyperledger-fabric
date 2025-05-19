const { v4: uuidv4 } = require('uuid');

exports.parseFabricError = (error) => {
    const traceId = uuidv4();
    const timestamp = new Date().toISOString();
  
    if (!error?.responses || !Array.isArray(error.responses)) {
      return {
        code: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Unexpected error',
        status: 500,
        details: [{ issue: error?.message || 'Unexpected error' }],
        timestamp,
        traceId,
      };
    }
  
    const details = error.responses.map((res) => {
      const peer = res.peer || 'unknown-peer';
      const message = res.response?.message || 'No message available';
      const status = res.response?.status || 500;
  
      return {
        field: peer,
        issue: message.replace(/^❌ Error:\s*/, '').trim(),
        status,
      };
    });
  
    return {
      code: 'FABRIC_TRANSACTION_ERROR',
      message: 'One or more peers rejected the transaction.',
      status: 400,
      details,
      timestamp,
      traceId,
    };
}

  