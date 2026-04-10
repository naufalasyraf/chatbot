const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

let conversation = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // ✅ tampilkan user dulu
  appendMessage('user', "👑 " + userMessage);
  input.value = '';

  conversation.push({ role: "user", text: userMessage });

  const loadingMsg = appendMessage('bot', '💭 Bentar ya sayang, lagi mikir buat jawab kamu...');

  try {
    const res = await fetchWithRetry('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation })
    });

    const data = await res.json();

    loadingMsg.remove();

    // ❗ 1. cek success dulu (PALING PENTING)
    if (!data.success) {
      appendMessage(
        'bot',
        data.message || 'Ih aku lagi ngambek 😤💔 coba lagi ya'
      );
      return;
    }

    // ❗ 2. cek result
    if (!data.result || data.result.trim() === '') {
      appendMessage('bot', 'Ih kamu sih... aku lagi ngambek 😤💕');
      return;
    }

    // ✅ 3. sukses
    appendMessage('bot', formatLoveText(data.result));
    conversation.push({ role: "model", text: data.result });

  } catch (err) {
    loadingMsg.remove();
    appendMessage('bot', 'Error: gagal connect ke server');
    console.error(err);
  }
});

function formatLoveText(text) {
  const emojis = ["💕", "😘", "💖", "🥰", "😍"];
  const random = emojis[Math.floor(Math.random() * emojis.length)];
  return text + " " + random;
}

async function fetchWithRetry(url, options, retries = 2) {
  try {
    const res = await fetch(url, options);

    if (res.status === 503 && retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }

    return res;

  } catch (err) {
    throw err;
  }
}

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;

  return msg;
}
