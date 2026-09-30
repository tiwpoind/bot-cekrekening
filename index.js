const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Token bot diambil dari Environment Variable Render demi keamanan
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Perintah /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    ' Halo! Bot Cek Rekening siap digunakan.\n\n' +
    'Gunakan format perintah:\n' +
    '`/cek [nama_bank] [nomor_rekening]`\n\n' +
    'Contoh:\n' +
    '`/cek bca 1234567890`',
    { parse_mode: 'Markdown' }
  );
});

// Perintah /cek [bank] [rekening]
bot.onText(/\/cek (.+) (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const bank = match[1].toLowerCase().trim();
  const accountNo = match[2].trim();

  bot.sendMessage(chatId, '🔍 Sedang mengecek data ke cekrekening...');

  try {
    // Memanggil API cekrekening.github.io
    const response = await axios.get(`https://cekrekening.github.io/api/account?bank=${bank}&accountNumber=${accountNo}`);
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

console.log('Bot Cek Rekening aktif dan berjalan...');
