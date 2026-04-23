

async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/admin/orders/2/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: 'done' })
    });
    const data = await res.json();
    console.log("Status update response:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
