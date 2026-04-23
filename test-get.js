

async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/admin/orders');
    const data = await res.json();
    if (data.success) {
      const order = data.data.find(o => o.id === 2);
      console.log("Order 2 status:", order?.status, "rawState:", order?.rawState);
    } else {
      console.error("API error:", data.error);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
