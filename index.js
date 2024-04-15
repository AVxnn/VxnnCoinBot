const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

//Инициализируем переменные из .env
require("dotenv").config();

//Инициализируем бота
const bot = new TelegramBot(process.env.API_KEY_BOT, {
  polling: true,
});
//Массив с объектами для меню команд
const commands = [
  { command: "start", description: "Запуск бота" },
  { command: "ref", description: "Получить реферальную ссылку" },
  { command: "help", description: "Раздел помощи" },
  { command: "link", description: "Ссылка" },
  { command: "menu", description: "Меню-клавиатура" },
  { command: "second_menu", description: "Второе меню" },
];

//Устанавливаем меню команд
bot.setMyCommands(commands);

bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];

  bot.sendMessage(chatId, resp);
});

// bot.on("message", (msg) => {
//   const chatId = msg.chat.id;
//   const message = msg.text;

//   console.log(message);
//   bot.sendMessage(chatId, "Received your message");
// });

bot.on("text", async (msg) => {
  if (msg.text.startsWith("/start")) {
    await bot.sendMessage(
      msg.chat.id,
      `Привет, ${msg.chat.first_name} Это MetaVxnn, я тут по рофлу запустил свой кликер может потом чет еще докручу) Залетай ко мне и начинай кликать`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Начать играть",
                web_app: { url: process.env.SITE_URL },
              },
            ],
            [
              {
                text: "Написать мне в лс",
                url: "https://t.me/romashkog",
              },
            ],
            [
              {
                text: "Карта развития",
                callback_data: "map",
              },
            ],
          ],
        },
      }
    );

    if (msg.text.length > 6) {
      const refID = msg.text.slice(7);

      await bot.sendMessage(
        msg.chat.id,
        `Вы зашли по ссылке пользователя с ID ${refID}`
      );
    }
  } else if (msg.text == "/ref") {
    await bot.sendMessage(
      msg.chat.id,
      `${process.env.URL_TO_BOT}?start=${msg.from.id}`
    );
  } else if (msg.text == "❌ Закрыть меню") {
    await bot.sendMessage(msg.chat.id, "Меню закрыто", {
      reply_markup: {
        remove_keyboard: true,
      },
    });
  } else if (msg.text == "/gamecust") {
    console.log("start");
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    try {
      await bot.sendMessage(chatId, "Открыть самый лучший сайт в мире", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Клик сюда",
                web_app: { url: process.env.SITE_URL },
              },
            ],
          ],
        },
      });
    } catch (e) {
      console.log(e);
    }
  } else if (msg.text == "/menu") {
    await bot.sendMessage(msg.chat.id, `Меню`, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Стикер", callback_data: "sticker" },
            { text: "Круглое Видео", callback_data: "circleVideo" },
          ],
          [{ text: "Купить Файл", callback_data: "buyFile" }],
          [{ text: "Проверить Подписку", callback_data: "checkSubs" }],
          [{ text: "Закрыть Меню", callback_data: "closeMenu" }],
        ],
      },
      reply_to_message_id: msg.message_id,
    });
  } else if (msg.text == "/help") {
    await bot.sendMessage(
      msg.chat.id,
      `Раздел помощи HTML\n\n<b>Жирный Текст</b>\n<i>Текст Курсивом</i>\n<code>Текст с Копированием</code>\n<s>Перечеркнутый текст</s>\n<u>Подчеркнутый текст</u>\n<pre language='c++'>код на c++</pre>\n<a href='t.me'>Гиперссылка</a>`,
      {
        parse_mode: "HTML",
      }
    );

    await bot.sendMessage(
      msg.chat.id,
      "Раздел помощи Markdown\n\n*Жирный Текст*\n_Текст Курсивом_\n`Текст с Копированием`\n~Перечеркнутый текст~\n``` код ```\n||скрытый текст||\n[Гиперссылка](t.me)",
      {
        parse_mode: "MarkdownV2",
      }
    );
  } else {
    await bot.sendMessage(msg.chat.id, msg.text);
    console.log(msg);
  }
});

bot.on("photo", async (img) => {
  try {
    const photoGroup = [];

    for (let index = 0; index < img.photo.length; index++) {
      const photoPath = await bot.downloadFile(
        img.photo[index].file_id,
        "./image"
      );

      photoGroup.push({
        type: "photo",
        media: photoPath,
        caption: `Размер файла: ${img.photo[index].file_size} байт\nШирина: ${img.photo[index].width}\nВысота: ${img.photo[index].height}`,
      });
    }

    await bot.sendMediaGroup(img.chat.id, photoGroup);

    for (let index = 0; index < photoGroup.length; index++) {
      fs.unlink(photoGroup[index].media, (error) => {
        if (error) {
          console.log(error);
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
});

bot.on("voice", async (voice) => {
  try {
    await bot.sendAudio(voice.chat.id, voice.voice.file_id, {
      caption: `Вес файла: ${voice.voice.file_size} байт\nДлительность аудио: ${voice.voice.duration} секунд`,
    });
  } catch (error) {
    console.log(error);
  }
});

bot.on("callback_query", async (ctx) => {
  try {
    switch (ctx.data) {
      case "closeMenu":
        await bot.deleteMessage(ctx.message.chat.id, ctx.message.message_id);
        break;
      case "checkSubs":
        const subscribe = await bot.getChatMember(
          ctx.message.chat.id,
          ctx.from.id
        );
        console.log(ctx, subscribe);
        break;
      case "map":
        await bot.sendMessage(
          msg.chat.id,
          `<b>Карта обновлений кликера:</b> \n\n
          <code>
          ✅ Базовый кликер \n
          Сохранение ваших кликов\n
          Статистика всех пользователей\n
          Магазин и улучшения\n
          </code>
          Чет еще предлагайте)`,
          {
            parse_mode: "HTML",
          }
        );
        break;
    }
  } catch (error) {
    console.log(error);
  }
});

bot.on("sticker", async (sticker) => {
  try {
    const stickerPath = await bot.downloadFile(
      sticker.sticker.file_id,
      "./image"
    );

    if (sticker.sticker.is_video) {
      await bot.sendVideo(sticker.chat.id, stickerPath);
    } else if (sticker.sticker.is_animated) {
      await bot.sendAnimation(sticker.chat.id, stickerPath);
    } else {
      await bot.sendPhoto(sticker.chat.id, stickerPath);
    }

    fs.unlink(stickerPath, (error) => {
      if (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
});
