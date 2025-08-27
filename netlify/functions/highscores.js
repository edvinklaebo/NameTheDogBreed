let highscores = [];

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify(highscores),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      const { name, score } = JSON.parse(event.body);
      if (!name || typeof score !== 'number') {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid highscore data' }) };
      }
      highscores.push({ name, score });
      highscores.sort((a, b) => b.score - a.score);
      highscores = highscores.slice(0, 10);
      return { statusCode: 201, body: JSON.stringify({ success: true }) };
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};
