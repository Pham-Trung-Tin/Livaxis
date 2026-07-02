const fetch = require('node-fetch');

async function test() {
  console.log('fetching feedbacks...');
  const res = await fetch('http://localhost:5000/api/admin/feedbacks', {
    headers: {
      'Cookie': 'token=xxx' // we might get 401 Unauthorized because we don't have a valid token
    }
  });
  console.log('status:', res.status);
  const data = await res.json();
  console.log('data:', data);
}
test().catch(console.error);
