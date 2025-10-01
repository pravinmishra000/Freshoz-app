async function sendPrompt(prompt: string) {
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
  
      const data = await res.json();
      return data.output;
    } catch (err) {
      console.error(err);
      return "Kuch gadbad ho gayi, fir se koshish karein.";
    }
  }
  