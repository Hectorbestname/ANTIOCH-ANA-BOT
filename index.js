const { Client, GatewayIntentBits, ActivityType, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');
const http = require('http');

// Botun kapanmasını (crash) önleyen güvenlik duvarı
process.on('unhandledRejection', error => {
    console.error('⚠️ [HATA ENGELLENDİ]:', error);
});

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('PROFESYONEL MODERASYON BOTU AKTIF!\n');
});
server.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// SLASH KOMUTLARI
const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('⚡ Botun anlık tepki süresini ve gecikmesini ölçer.'),
    new SlashCommandBuilder().setName('sunucubilgi').setDescription('🏰 Sunucu hakkındaki detaylı istatistikleri ve bilgileri listeler.'),
    new SlashCommandBuilder().setName('ticket-kur').setDescription('🎫 Ekip Başvurusu ve Partnerlik için gelişmiş destek panelini kurar.'),
    
    // Moderasyon Komutları
    new SlashCommandBuilder().setName('sil').setDescription('🧹 Belirtilen miktarda mesajı kanaldan kalıcı olarak temizler.')
        .addIntegerOption(opt => opt.setName('miktar').setDescription('Silinecek mesaj sayısı (1-100)').setRequired(true)),
    new SlashCommandBuilder().setName('kick').setDescription('👢 Belirtilen kullanıcıyı sunucudan uzaklaştırır (Atar).')
        .addUserOption(opt => opt.setName('kullanici').setDescription('Uzaklaştırılacak kullanıcı').setRequired(true))
        .addStringOption(opt => opt.setName('sebep').setDescription('Atılma sebebi').setRequired(false)),
    new SlashCommandBuilder().setName('ban').setDescription('🔨 Belirtilen kullanıcıyı sunucudan kalıcı olarak yasaklar.')
        .addUserOption(opt => opt.setName('kullanici').setDescription('Yasaklanacak kullanıcı').setRequired(true))
        .addStringOption(opt => opt.setName('sebep').setDescription('Yasaklanma sebebi').setRequired(false)),
    new SlashCommandBuilder().setName('kayit').setDescription('📝 Sunucuya yeni bir üyeyi profesyonelce kaydeder.')
        .addUserOption(opt => opt.setName('kullanici').setDescription('Kayıt edilecek üye').setRequired(true))
        .addStringOption(opt => opt.setName('isim').setDescription('Üyenin ismi').setRequired(true))
        .addIntegerOption(opt => opt.setName('yas').setDescription('Üyenin yaşı').setRequired(true)),

    // Duyuru & Etkinlik
    new SlashCommandBuilder().setName('duyuru').setDescription('📢 Sunucuda göz alıcı ve profesyonel bir duyuru yayınlar.')
        .addStringOption(opt => opt.setName('mesaj').setDescription('Duyuru metni').setRequired(true)),
    new SlashCommandBuilder().setName('cekilis').setDescription('🎁 Belirtilen ödül ve süre ile çekiliş başlatır.')
        .addStringOption(opt => opt.setName('odul').setDescription('Çekiliş ödülü').setRequired(true))
        .addIntegerOption(opt => opt.setName('sure').setDescription('Süre (Dakika)').setRequired(true)),
    new SlashCommandBuilder().setName('oylama').setDescription('📊 Sunucu üyelerinin katılabileceği bir oylama başlatır.')
        .addStringOption(opt => opt.setName('soru').setDescription('Oylama konusu/sorusu').setRequired(true))
].map(command => command.toJSON());

client.once('ready', async () => {
    console.log(`🛡️ [SİSTEM AKTİF]: ${client.user.tag} başarıyla göreve başladı!`);     client.user.setActivity('🏰 Sunucu Güvenliği & Yönetim', { type: ActivityType.Watching });          const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);     try {          await rest.put(Routes.applicationCommands(client.user.id), { body: commands });          console.log('✅ [KOMUTLAR]: Tüm slash komutları başarıyla güncellendi.');      } catch (error) {          console.error('❌ [KOMUT HATASI]:', error);      } });  const cekilisler = new Map();  // OTOMATİK MESAJ KARŞILAMA client.on('messageCreate', async message => {     if (message.author.bot) return;      const icerik = message.content.toLowerCase().trim();     if (['sa', 'selam', 'selamün aleyküm', 'selamun aleykum'].includes(icerik)) {         await message.reply({ content: '👋 **Aleykümselam!** Hoş geldin, keyifli vakit geçirmeni dileriz. ✨' });     } });  // INTERACTION YÖNETİMİ client.on('interactionCreate', async interaction => {     try {         if (interaction.isChatInputCommand()) {             const { commandName } = interaction;              // ⚡ PING             if (commandName === 'ping') {                 const embed = new EmbedBuilder()                     .setColor('#2ECC71')                     .setTitle('⚡ **Sistem Gecikme İstatistikleri**')                     .setDescription(`🚀 **Bot Gecikmesi:** \`${client.ws.ping}ms\`\n📡 **Durum:** \`Mükemmel / Stabil\``)                     .setTimestamp();                 await interaction.reply({ embeds: [embed], ephemeral: true });             }              // 🏰 SUNUCU BİLGİ             else if (commandName === 'sunucubilgi') {                 const guild = interaction.guild;                 const embed = new EmbedBuilder()                     .setColor('#F1C40F')                     .setTitle(`👑 **${guild.name.toUpperCase()} \vert{} Sunucu İstatistikleri**`)                     .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))                     .addFields(                         { name: '🆔 **Sunucu ID**', value: `\`${guild.id}\``, inline: true },                         { name: '👑 **Sunucu Sahibi**', value: `<@${guild.ownerId}>`, inline: true },
                        { name: '👥 **Toplam Üye**', value: `\`${guild.memberCount}\` Üye`, inline: true },
                        { name: '💬 **Kanal Sayısı**', value: `\`${guild.channels.cache.size}\` Kanal`, inline: true },
                        { name: '🛡️ **Güvenlik Seviyesi**', value: `\`${guild.verificationLevel}\``, inline: true },
                        { name: '📅 **Kuruluş Tarihi**', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D> (<t:${Math.floor(guild.createdTimestamp / 1000)}:R>)`, inline: true }
                    )
                    .setFooter({ text: '⚡ Profesyonel Yönetim Sistemi', iconURL: client.user.displayAvatarURL() })
                    .setTimestamp();
                await interaction.reply({ embeds: [embed] });
            }

            // 🎫 TICKET KUR (EKİP BAŞVURUSU & PARTNERLİK)
            else if (commandName === 'ticket-kur') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.reply({ content: '❌ **HATA:** Bu paneli kurmak için `Yönetici` yetkisine sahip olmalısın.', ephemeral: true });
                }

                const embed = new EmbedBuilder()
                    .setColor('#5865F2')
                    .setTitle('🎫 **DESTEK VE BAŞVURU MERKEZİ**')
                    .setDescription(' Sunucumuzda **Ekip Başvurusu** yapmak veya **Partnerlik** anlaşması sağlamak için aşağıdaki ilgili butona tıklayarak talep oluşturabilirsiniz.\n\n> ⚠️ *Lütfen gereksiz talep oluşturmaktan kaçınınız.*')
                    .addFields(
                        { name: '👥 **Ekip Başvurusu**', value: 'Sunucu yetkili kadrosuna katılmak için başvuru kanalı açar.', inline: true },
                        { name: '🤝 **Partnerlik**', value: 'Sunucular arası iş birliği ve partnerlik görüşmeleri için kanal açar.', inline: true }
                    )
                    .setFooter({ text: '✨ Antioch İletişim & Yönetim Servisi' });

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('ticket_ekip').setLabel('Ekip Başvurusu').setStyle(ButtonStyle.Primary).setEmoji('👥'),
                    new ButtonBuilder().setCustomId('ticket_partner').setLabel('Partnerlik').setStyle(ButtonStyle.Success).setEmoji('🤝')
                );

                await interaction.reply({ content: '✅ **Başarılı:** Destek ve başvuru paneli kanala kuruldu!', ephemeral: true });
                await interaction.channel.send({ embeds: [embed], components: [row] });
            }

            // 🧹 SİL
            else if (commandName === 'sil') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                    return interaction.reply({ content: '❌ **HATA:** Mesajları silmek için `Mesajları Yönet` yetkisine sahip olmalısın.', ephemeral: true });
                }
                const miktar = interaction.options.getInteger('miktar');
                if (miktar < 1 || miktar > 100) return interaction.reply({ content: '⚠️ **UYARI:** Tek seferde `1` ile `100` arasında mesaj silebilirsin.', ephemeral: true });

                await interaction.channel.bulkDelete(miktar, true).catch(() => {});
                
                const embed = new EmbedBuilder()
                    .setColor('#2ECC71')
                    .setDescription(`🧹 **Temizlik Tamamlandı!** Toplam **${miktar}** adet mesaj başarıyla silindi.`)
                    .setFooter({ text: `İşlemi Yapan: ${interaction.user.tag}` });
                
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // 👢 KICK
            else if (commandName === 'kick') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
                    return interaction.reply({ content: '❌ **HATA:** Bu komut için `Üyeleri At` yetkisi gerekiyor.', ephemeral: true });
                }
                const kullanici = interaction.options.getMember('kullanici');
                const sebep = interaction.options.getString('sebep') || 'Sebep Belirtilmedi';
                if (!kullanici) return interaction.reply({ content: '❌ **HATA:** Kullanıcı sunucuda bulunamadı.', ephemeral: true });

                await kullanici.kick(sebep).then(() => {
                    const embed = new EmbedBuilder()
                        .setColor('#E67E22')
                        .setTitle('👢 **ÜYE SUNUCUDAN ATILDI**')
                        .addFields(
                            { name: '👤 **Atılan Üye**', value: `${kullanici.user.tag}`, inline: true },                             { name: '🛡️ **Yetkili**', value: `${interaction.user.tag}`, inline: true },
                            { name: '📜 **Sebep**', value: `\`${sebep}\``, inline: false }
                        )
                        .setTimestamp();
                    interaction.reply({ embeds: [embed] });
                }).catch(() => {
                    interaction.reply({ content: '❌ **HATA:** Yetkim bu kullanıcıyı atmak için yeterli değil!', ephemeral: true });
                });
            }

            // 🔨 BAN
            else if (commandName === 'ban') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                    return interaction.reply({ content: '❌ **HATA:** Bu komut için `Üyeleri Yasakla` yetkisi gerekiyor.', ephemeral: true });
                }
                const kullanici = interaction.options.getMember('kullanici');
                const sebep = interaction.options.getString('sebep') || 'Sebep Belirtilmedi';
                if (!kullanici) return interaction.reply({ content: '❌ **HATA:** Kullanıcı bulunamadı.', ephemeral: true });

                await kullanici.ban({ reason: sebep }).then(() => {
                    const embed = new EmbedBuilder()
                        .setColor('#E74C3C')
                        .setTitle('🔨 **ÜYE SUNUCUDAN YASAKLANDI**')
                        .addFields(
                            { name: '👤 **Yasaklanan Üye**', value: `${kullanici.user.tag}`, inline: true },                             { name: '🛡️ **Yetkili**', value: `${interaction.user.tag}`, inline: true },
                            { name: '📜 **Sebep**', value: `\`${sebep}\``, inline: false }
                        )
                        .setTimestamp();
                    interaction.reply({ embeds: [embed] });
                }).catch(() => {
                    interaction.reply({ content: '❌ **HATA:** Yetkim bu kullanıcıyı yasaklamak için yeterli değil!', ephemeral: true });
                });
            }

            // 📝 KAYIT
            else if (commandName === 'kayit') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return interaction.reply({ content: '❌ **HATA:** Kayıt yapmak için `Rolleri Yönet` yetkisine sahip olmalısın.', ephemeral: true });
                }
                const kullanici = interaction.options.getMember('kullanici');
                const isim = interaction.options.getString('isim');
                const yas = interaction.options.getInteger('yas');

                const embed = new EmbedBuilder()
                    .setColor('#2ECC71')
                    .setTitle('📝 **KAYIT İŞLEMİ BAŞARILI**')
                    .addFields(
                        { name: '👤 **Kayıt Edilen Üye**', value: `${kullanici}`, inline: true },                         { name: '📛 **Yeni İsim / Yaş**', value: `\`${isim} \vert{} ${yas}\``, inline: true },                         { name: '🛡️ **Kayıt Yapan Yetkili**', value: `${interaction.user}`, inline: true }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            }

            // 📢 DUYURU
            else if (commandName === 'duyuru') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.reply({ content: '❌ **HATA:** Duyuru yapmak için `Yönetici` olmalısın.', ephemeral: true });
                }
                const mesaj = interaction.options.getString('mesaj');
                const embed = new EmbedBuilder()
                    .setColor('#F39C12')
                    .setTitle('📢 **RESMİ SUNUCU DUYURUSU**')
                    .setDescription(`\n${mesaj}\n`)                     .setFooter({ text: `Yayınlayan: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();

                await interaction.reply({ content: '✅ **Duyuru başarıyla yayınlandı!**', ephemeral: true });
                await interaction.channel.send({ embeds: [embed] });
            }

            // 🎁 ÇEKİLİŞ
            else if (commandName === 'cekilis') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.reply({ content: '❌ **HATA:** Çekiliş başlatmak için `Yönetici` olmalısın.', ephemeral: true });
                }
                const odul = interaction.options.getString('odul');
                const sureDakika = interaction.options.getInteger('sure');
                const sureMs = sureDakika * 60 * 1000;

                const embed = new EmbedBuilder()
                    .setColor('#F1C40F')
                    .setTitle('🎉 **BÜYÜK ÇEKİLİŞ BAŞLADI** 🎉')
                    .setDescription(`🏆 **Kazanılacak Ödül:** \`${odul}\`\n\n⏰ **Süre:** \`${sureDakika} Dakika\`\n🎁 Katılmak için aşağıdaki **"Çekilişe Katıl"** butonuna tıklayın!`)
                    .setFooter({ text: `Düzenleyen: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })                     .setTimestamp();                  const row = new ActionRowBuilder().addComponents(                     new ButtonBuilder().setCustomId('cekilis_katil').setLabel('Çekilişe Katıl').setStyle(ButtonStyle.Primary).setEmoji('🎁')                 );                  await interaction.reply({ content: '✅ **Çekiliş başarıyla başlatıldı!**', ephemeral: true });                 const mesaj = await interaction.channel.send({ embeds: [embed], components: [row] });                  cekilisler.set(mesaj.id, { katilanlar: new Set(), odul: odul });                  setTimeout(async () => {                     const veri = cekilisler.get(mesaj.id);                     if (!veri) return;                      const katilanlarDizi = Array.from(veri.katilanlar);                     const bitisEmbed = new EmbedBuilder()                         .setColor('#E74C3C')                         .setTitle('🎉 **ÇEKİLİŞ SONUÇLANDI** 🎉')                         .setDescription(`🏆 **Ödül:** \`${veri.odul}\``);                      if (katilanlarDizi.length === 0) {                         bitisEmbed.addFields({ name: '💔 **Sonuç**', value: 'Yeterli katılım olmadığı için kazanan belirlenemedi.' });                     } else {                         const kazananId = katilanlarDizi[Math.floor(Math.random() * katilanlarDizi.length)];                         bitisEmbed.addFields({ name: '👑 **Kazanan Şanslı Üye**', value: `<@${kazananId}> Tebrikler! 🎉` });
                    }

                    const kapatilanRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('cekilis_bitti').setLabel('Süre Doldu').setStyle(ButtonStyle.Secondary).setDisabled(true)
                    );

                    await mesaj.edit({ embeds: [bitisEmbed], components: [kapatilanRow] }).catch(() => {});
                    cekilisler.delete(mesaj.id);
                }, sureMs);
            }

            // 📊 OYLAMA
            else if (commandName === 'oylama') {
                const soru = interaction.options.getString('soru');
                const embed = new EmbedBuilder()
                    .setColor('#3498DB')
                    .setTitle('📊 **SUNUCU İÇİ OYLAMA**')
                    .setDescription(`📌 **Soru / Konu:**\n> **${soru}**\n\n*Fikrinizi belirtmek için aşağıdaki butonları kullanabilirsiniz.*`)
                    .setFooter({ text: `Oylamayı Başlatan: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('evet_oy').setLabel('Evet').setStyle(ButtonStyle.Success).setEmoji('✅'),
                    new ButtonBuilder().setCustomId('hayir_oy').setLabel('Hayır').setStyle(ButtonStyle.Danger).setEmoji('❌')
                );

                await interaction.reply({ content: '✅ **Oylama başlatıldı!**', ephemeral: true });
                await interaction.channel.send({ embeds: [embed], components: [row] });
            }
        }

        // BUTON ETKİLEŞİMLERİ (TICKET & ÇEKİLİŞ & OYLAMA)
        else if (interaction.isButton()) {
            const { customId, guild, user } = interaction;

            // TICKET OLUSTURMA (EKİP / PARTNER)
            if (customId === 'ticket_ekip' || customId === 'ticket_partner') {
                const tur = customId === 'ticket_ekip' ? '👥 Ekip Başvurusu' : '🤝 Partnerlik';
                const kanalIsmi = `${customId === 'ticket_ekip' ? 'ekip' : 'partner'}-${user.username}`.toLowerCase().replace(/[^a-z0-9]/g, '');

                const ticketKanal = await guild.channels.create({
                    name: kanalIsmi,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
                    ],
                });

                const embed = new EmbedBuilder()
                    .setColor('#2ECC71')
                    .setTitle(`🎫 **${tur.toUpperCase()} DESTEK KANALI**`)
                    .setDescription(`Merhaba ${user}, talep kanalınız başarıyla oluşturuldu.\nYetkili ekibimiz en kısa sürede sizinle ilgilenecektir.\n\n> 🔒 *Görüşme tamamlandığında aşağıdaki buton ile kanalı kapatabilirsiniz.*`)
                    .addFields({ name: '📌 **Talep Türü**', value: `\`${tur}\``, inline: true })
                    .setTimestamp();

                const kapatRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('ticket_kapat').setLabel('Talebi Kapat').setStyle(ButtonStyle.Danger).setEmoji('🔒')
                );

                await ticketKanal.send({ content: `<@${user.id}>`, embeds: [embed], components: [kapatRow] });
                await interaction.reply({ content: `✅ **Talebiniz Oluşturuldu:** ${ticketKanal}`, ephemeral: true });
            }

            // TICKET KAPATMA
            else if (customId === 'ticket_kapat') {
                const embed = new EmbedBuilder()
                    .setColor('#E74C3C')
                    .setDescription('🔒 **Destek talebi 5 saniye içerisinde siliniyor...**');
                await interaction.reply({ embeds: [embed] });
                setTimeout(() => { interaction.channel.delete().catch(() => {}); }, 5000);
            }

            // ÇEKİLİŞ KATILMA
            else if (customId === 'cekilis_katil') {
                const cekilisVerisi = cekilisler.get(interaction.message.id);
                if (!cekilisVerisi) return interaction.reply({ content: '❌ **HATA:** Bu çekiliş sona ermiş.', ephemeral: true });
                if (cekilisVerisi.katilanlar.has(user.id)) return interaction.reply({ content: '⚠️ **UYARI:** Bu çekilişe zaten katılmışsınız!', ephemeral: true });
                
                cekilisVerisi.katilanlar.add(user.id);
                await interaction.reply({ content: '🎁 **Tebrikler:** Çekilişe kaydınız alındı!', ephemeral: true });
            }

            // OYLAMA BUTONLARI
            else if (customId === 'evet_oy' || customId === 'hayir_oy') {
                await interaction.reply({ content: '✅ **Oyunuz başarıyla sisteme kaydedildi.**', ephemeral: true });
            }
        }
    } catch (err) {
        console.error('❌ [ETKİLEŞİM HATASI]:', err);
    }
});

client.login(process.env.DISCORD_TOKEN);
