import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import http from 'http';

// Membuat dummy HTTP server agar Render Web Service tetap ON
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot Telegram Cek Rekening Aktif!\n');
}).listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const TELEGRAM_TOKEN: string = process.env.TELEGRAM_TOKEN || '';

if (!TELEGRAM_TOKEN) {
  console.error('ERROR: TELEGRAM_TOKEN belum diisi!');
}

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

bot.onText(/\/start/, (msg: TelegramBot.Message) => {
  bot.sendMessage(
    msg.chat.id,
    ' Selamat datang! Bot Cek Rekening Siap Digunakan.\n\n' +
    'Gunakan format:\n' +
    '`/cek [nama_bank] [nomor_rekening]`\n\n' +
    'Contoh:\n' +
    '`/cek bca 1234567890`',
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/\/cek (.+) (.+)/, async (msg: TelegramBot.Message, match: RegExpExecArray | null) => {
  const chatId = msg.chat.id;
  if (!match) return;

  const bank: string = match[1].toLowerCase().trim();
  const accountNo: string = match[2].trim();

  bot.sendMessage(chatId, '🔍 Sedang mengecek data...');

  try {
    const response = await axios.get(`https://cekrekening.github.io/api/account?bank=${bank}&accountNumber=${accountNo}`);
    const data = response.data;

    if (data && data.account_name) {
      const reply = `*HASIL CEK REKENING*\n\n` +
                    ` Bank: ${bank.toUpperCase()}\n` +
                    ` No. Rekening: ${accountNo}\n` +
                    ` Nama Pemilik: *${data.account_name}*`;
      bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' });
    } else {
      bot.sendMessage(chatId, ' Rekening tidak ditemukan atau kombinasi salah.');
    }
  } catch (error) {
    bot.sendMessage(chatId, ' Gagal mengambil data. Pastikan nama bank dan nomor rekening benar.');
  }
});

console.log('Bot Telegram Berjalan...');
