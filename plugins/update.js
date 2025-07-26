const fs = require('fs');
const { downloadContentFromMessage } = require('baileys');

let handler = async (m, { text, reply, sleep }) => {
    if (!text || !text.startsWith("./")) return m.reply(`*Example:* .update ./plugins/update.js`);

    try {
        const filePath = text.trim(); // Path file yang ingin diupdate
        const quotedMessage = m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.documentMessage;

        if (!quotedMessage) return m.reply("Balas pesan dokumen dengan perintah ini.");
        const fileName = quotedMessage.fileName || '';

        if (!fileName) return m.reply("Nama file tidak ditemukan dalam dokumen yang di-quote.");
        if (!fs.existsSync(filePath)) return m.reply(`File tidak ditemukan: ${filePath}`);

        // Validasi apakah file sesuai dengan yang di-quote
        const directory = filePath.substring(0, filePath.lastIndexOf('/'));
        const files = fs.readdirSync(directory);
        if (!files.includes(fileName)) return m.reply("Nama file tidak ditemukan dalam direktori yang diberikan.");

        // Unduh dokumen
        const media = await downloadContentFromMessage(quotedMessage, "document");
        let buffer = Buffer.from([]);
        for await (const chunk of media) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Tulis ke file
        fs.writeFileSync(filePath, buffer);

        m.reply(`Tunggu sebentar... sedang memperbarui file ${fileName}`);
        await sleep(3000);
        m.reply(`Berhasil mengganti file ${fileName}!`);
    } catch (error) {
        console.error("Error di handler update:", error);
        m.reply("Terjadi kesalahan saat mengganti file. Pastikan file valid dan coba lagi.");
    }
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update']
handler.owner = true
handler.botutama = true

module.exports = handler;
