import TelegramBot from 'node-telegram-bot-api';
import express from 'express';

// Ambil token dari Environment Variable
const token = process.env.TELEGRAM_TOKEN || '';

if (!token) {
  console.error('ERROR: TELEGRAM_TOKEN belum diatur!');
}

// Inisialisasi Bot dengan Polling
const bot = new TelegramBot(token, { polling: true });

// Server dummy Express agar Render tetap menganggap Web Service ini aktif
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('Bot Cek Rekening sedang berjalan...');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Response saat user mengetik /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    'Halo! Bot Cek Rekening aktif.\n\nGunakan format berikut untuk mengecek:\n`/cek <nama_bank> <nomor_rekening>`\n\nContoh:\n`/cek bri 667301035776536`',
    { parse_mode: 'Markdown' }
  );
});

// Response saat user mengetik /cek ...
bot.onText(/\/cek (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const input = match ? match[1] : '';
  const args = input.trim().split(/\s+/);

  if (args.length < 2) {
    bot.sendMessage(chatId, 'Format salah! Gunakan: `/cek <nama_bank> <nomor_rekening>`', { parse_mode: 'Markdown' });
    return;
  }

  const bank = args[0].toLowerCase();
  const norek = args[1];

  bot.sendMessage(chatId, `🔍 Sedang mengecek rekening *${bank.toUpperCase()}* dengan nomor *${norek}*...`, { parse_mode: 'Markdown' });

  // Panggil API cek rekening di sini
});

// Tangkap error polling agar bot tidak berhenti silent/crash
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('Bot Telegram berhasil dinyalakan...');
