import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import http from 'http'; // Tambahkan ini

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot Telegram Cek Rekening Aktif!\n');
}).listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const TELEGRAM_TOKEN: string = process.env.TELEGRAM_TOKEN || '';
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// ... (sisa kode bot Anda seperti biasa)
