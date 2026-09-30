import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import http from 'http';

// Interface untuk tipe data respons API
interface CekRekeningResponse {
  account_name?: string;
  account_number?: string;
  bank_code?: string;
}

// 1. HTTP Server sederhana agar Render Web Service tetap aktif (tidak perlu express)
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot Cek Rekening Aktif!\n');
}).listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// 2. Inisialisasi Bot Telegram
const TELEGRAM_TOKEN: string = process.env.TELEGRAM_TOKEN || '';

if (!TELEGRAM_TOKEN) {
  console.error('ERROR: TELEGRAM_TOKEN belum diatur di Environment Variables Render!');
}

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Command /start
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

// Command /cek bank norek
bot.onText(/\/cek (.+) (.+)/, async (msg: TelegramBot.Message, match: RegExpExecArray | null) => {
  const chatId = msg.chat.id;
  if (!match) return;

  const bank: string = match[1].toLowerCase().trim();
  const accountNo: string = match[2].trim();

  bot.sendMessage(chatId, '🔍 Sedang mengecek data...');

  try {
    const response = await axios.get<CekRekeningResponse>(
      `https://cekrekening.github.io/api/account?bank=${bank}&accountNumber=${accountNo}`
    );
    const data = response.data;

    if (data && data.account_name) {
      const reply = `*HASIL CEK REKENING*\n\n` +
                    ` Bank: ${bank.toUpperCase()}\n` +
                    ` No. Rekening: ${accountNo}\n` +
                    ` Nama Pemilik: *${data.account_name}*`;
      bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' });
    } else {
      bot.sendMessage(chatId, ' Rekening tidak ditemukan atau kombinasi bank/rekening salah.');
    }
  } catch (error) {
    bot.sendMessage(chatId, ' Gagal mengambil data. Pastikan nama bank dan nomor rekening valid.');
  }
});

// Tangkap polling error
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('Bot Telegram Berjalan...');
