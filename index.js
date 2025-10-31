const {
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    PermissionsBitField
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const TOKEN = config.TOKEN;
const PREFIX = config.PREFIX;
const KOMUTLAR = config.KOMUTLAR;
const MESAJLAR = config.MESAJLAR;
const EMBEDS = config.EMBEDS;

const dbPath = path.join(__dirname, 'database.json');

function readDatabase() {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { 
            settings: {},
            roles: {}
        }; 
    }
}

function writeDatabase(data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Veritabani yazma hatasi:', error.message);
    }
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.on('ready', () => {
    console.log(`Bot Hazir! Giris yapildi: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild || !message.content.startsWith(PREFIX)) return;
    
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const guildId = message.guild.id;
    const db = readDatabase();

    if (command === KOMUTLAR.PANEL_KUR || command === KOMUTLAR.AYARLA) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply(MESAJLAR.YETKI_YOK);
        }
    }

    if (command === KOMUTLAR.YARDIM) {
        const helpEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(EMBEDS.YARDIM_BASLIK)
            .setDescription(EMBEDS.YARDIM_ACIKLAMA)
            .addFields(
                { 
                    name: EMBEDS.YARDIM_AYARLA_BASLIK, 
                    value: 
                    `\`${PREFIX}${KOMUTLAR.PANEL_KUR}\`\n-> Rol panelini kanala gonderir.\n\n` + 
                    `\`${PREFIX}${KOMUTLAR.AYARLA} <Mesaj ID> <Rol ID> <Buton Etiketi>\`\n-> Belirtilen mesaja rol butonu ekler.`, 
                    inline: false 
                },
                {
                    name: EMBEDS.YARDIM_KULLANICI_BASLIK,
                    value: `Bu altyapida kullanici komutu yoktur. Roller butonlar uzerinden alinir.`,
                    inline: false
                }
            )
            .setTimestamp();

        return message.channel.send({ embeds: [helpEmbed] });
    }

    if (command === KOMUTLAR.PANEL_KUR) {
        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle('Rol Secim Paneli')
            .setDescription('Asagidaki butonlara tiklayarak istediginiz rolleri alabilirsiniz.');

        const row = new ActionRowBuilder();
        
        const roleSettings = db.roles[guildId] || {};
        
        for (const messageId in roleSettings) {
            if (messageId) {
                for (const roleId in roleSettings[messageId]) {
                     row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`role_${roleId}`)
                            .setLabel(roleSettings[messageId][roleId].label)
                            .setStyle(ButtonStyle.Primary)
                    );
                }
                break;
            }
        }
        
        if (row.components.length > 0) {
            await message.channel.send({ embeds: [embed], components: [row] });
        } else {
             await message.channel.send({ embeds: [embed], content: "Henuz bir rol ayarlanmamis. Lutfen once rol ayarlayin." });
        }
        
        message.delete().catch(() => {});
    }

    if (command === KOMUTLAR.AYARLA) {
        if (args.length < 3) {
            return message.reply(MESAJLAR.AYAR_EKSİK.replace('{prefix}', PREFIX).replace('{komut}', KOMUTLAR.AYARLA));
        }

        const [panelMessageId, roleId, ...labelParts] = args;
        const label = labelParts.join(' ');

        if (!db.roles[guildId]) {
            db.roles[guildId] = {};
        }
        if (!db.roles[guildId][panelMessageId]) {
             db.roles[guildId][panelMessageId] = {};
        }

        db.roles[guildId][panelMessageId][roleId] = { label: label };
        writeDatabase(db);
        
        try {
             const panelMessage = await message.channel.messages.fetch(panelMessageId);
             
             const existingRow = panelMessage.components[0] || new ActionRowBuilder();
             const newRow = new ActionRowBuilder().addComponents(...existingRow.components);

             newRow.addComponents(
                new ButtonBuilder()
                    .setCustomId(`role_${roleId}`)
                    .setLabel(label)
                    .setStyle(ButtonStyle.Primary)
             );

             await panelMessage.edit({ components: [newRow] });
             
             return message.reply(MESAJLAR.ROL_AYARLANDI);
             
        } catch (e) {
             console.error("Panel mesaji bulunamadi veya guncellenemedi:", e.message);
             return message.reply("Hata: Panel mesaji bulunamadi veya butonu eklerken sorun olustu. Mesaj ID'sini kontrol edin.");
        }
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton() || !interaction.guild) return;

    if (!interaction.customId.startsWith('role_')) return;

    const guildId = interaction.guild.id;
    const member = interaction.member;
    const roleId = interaction.customId.replace('role_', '');
    const db = readDatabase();
    
    const roleSettings = db.roles[guildId];
    if (!roleSettings) {
        return interaction.reply({ content: 'Bu sunucu icin rol butonu ayari bulunamadi.', ephemeral: true });
    }

    let isRoleConfigured = false;
    for (const messageId in roleSettings) {
        if (roleSettings[messageId][roleId]) {
            isRoleConfigured = true;
            break;
        }
    }

    if (!isRoleConfigured) {
        return interaction.reply({ content: 'Bu rol butonu artik gecersiz.', ephemeral: true });
    }

    try {
        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) {
            return interaction.reply({ content: 'Rol bulunamadi.', ephemeral: true });
        }

        if (member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId);
            interaction.reply({ content: MESAJLAR.ROL_ALINDI, ephemeral: true });
        } else {
            await member.roles.add(roleId);
            interaction.reply({ content: MESAJLAR.ROL_VERILDI, ephemeral: true });
        }
    } catch (error) {
        console.error('Rol islemi hatasi:', error);
        interaction.reply({ content: 'Rol islemi yapilirken bir hata olustu. Bot yetkilerini kontrol edin.', ephemeral: true });
    }
});

client.login(TOKEN);
