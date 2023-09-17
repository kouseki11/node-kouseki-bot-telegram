const { Telegraf } = require("telegraf");
require("dotenv").config();
const bot = new Telegraf(process.env.BOT_API_KEY);
const axios = require("axios");
const sharp = require("sharp");
const fetch = require("node-fetch");
let startImg = sharp("./img/start.png");
let aboutImg = sharp("./img/about.jpg");
let spotifyImg = sharp("./img/spotify.png");
let querystring = require("querystring");
const { formatDistanceToNow } = require("date-fns");

const { getUser, getNowPlaying, getLastPlayed, getTopTracks } = require("./lib/spotify");

bot.command("start", (ctx) => {
  sendStartMessage(ctx);
});

bot.action("start", (ctx) => {
  ctx.deleteMessage();
  sendStartMessage(ctx);
});

async function sendStartMessage(ctx) {
  let startMessage = `Welcome, This Kouseki Bot`;
  const imgBuffer = await startImg.toBuffer();
  bot.telegram.sendPhoto(
    ctx.chat.id,
    { source: imgBuffer },
    {
      caption: startMessage,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "About", callback_data: "about" },
            { text: "Portfolio", callback_data: "portfolio" },
          ],
          [{ text: "Bot Info", callback_data: "info" }],
        ],
      },
    }
  );
}

bot.action("about", async (ctx) => {
  let helloMessage = `Hello, I am Muhamad Fadhil Daksana`;
  const imgBufferAbout = await aboutImg.toBuffer();
  ctx.deleteMessage();
  bot.telegram.sendPhoto(ctx.chat.id, { source: imgBufferAbout }, {
    caption: helloMessage,
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Social Media", callback_data: "socmed" },
          { text: "Contact", callback_data: "contact" },
        ],
        [
          { text: "Anime", callback_data: "anime" },
          { text: "Spotify", callback_data: "spotify" },
        ],
        [{ text: "Back to Main Menu", callback_data: "start" }],
      ],
    },
  });
});

bot.action("socmed", (ctx) => {
  let socmedMessage = `About my Social Media`;
  ctx.deleteMessage();
  bot.telegram.sendMessage(ctx.chat.id, socmedMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Instagram", url: "https://www.instagram.com/fadhilzou/" },
          {
            text: "Facebook",
            url: "https://web.facebook.com/mhmd.fadhil.3110",
          },
        ],
        [
          {
            text: "LinkedIn",
            url: "https://www.linkedin.com/in/muhamad-fadhil-daksana-196333220/",
          },
        ],
        [{ text: "Back to About", callback_data: "about" }],
      ],
    },
  });
});

bot.action("contact", (ctx) => {
  let socmedMessage = `About my Contact`;
  const whatsappLink = "https://api.whatsapp.com/send?phone=+62838-1197-2903";
  const emailLink = "mailto:ffadhil1108@gmail.com";
  ctx.deleteMessage();
  bot.telegram.sendMessage(ctx.chat.id, socmedMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Email", url: emailLink },
          { text: "Whatsapp", url: whatsappLink },
        ],
        [{ text: "Back to About", callback_data: "about" }],
      ],
    },
  });
});

bot.action("anime", (ctx) => {
  let priceMessage = `About my Favorite Anime`;
  ctx.deleteMessage();
  bot.telegram.sendMessage(ctx.chat.id, priceMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "One Piece", callback_data: "id-21" },
          { text: "Naruto", callback_data: "id-20" },
        ],
        [
          { text: "No Game no Life", callback_data: "id-19815" },
          {
            text: "Re:Zero kara Hajimeru Isekai Seikatsu",
            callback_data: "id-31240",
          },
        ],
        [{ text: "Back to About", callback_data: "about" }],
      ],
    },
  });
});

bot.action("spotify", async (ctx) => {
  let spotifyMessage = `About my Spotify`;
  const imgBufferSpotify = await spotifyImg.toBuffer();
  ctx.deleteMessage();
  bot.telegram.sendPhoto(ctx.chat.id, { source: imgBufferSpotify }, {
    caption: spotifyMessage,
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Profile", callback_data: "spotify-profile" },
          { text: "Now Playing", callback_data: "now-playing" },
        ],
        [
          { text: "Last Played", callback_data: "last-played" },
          { text: "Top Tracks", callback_data: "top-tracks" },
        ],
        [{ text: "Back to About", callback_data: "about" }],
      ],
    },
  });
});

let animeList = ["id-21", "id-20", "id-19815", "id-31240"];
bot.action(animeList, async (ctx) => {
  // console.log(ctx.match);
  let id = ctx.match[0].substring(3);
  // console.log(symbol)
  try {
    let res = await axios.get(`https://api.jikan.moe/v4/anime/${id}`);
    let data = res.data.data;
    let genres = res.data.data.genres;

    const genreNames = genres.map((genre) => genre.name);

    let message = `
Title : ${data.title}
Genres : ${genreNames.join(", ")}
Source : ${data.source}
Status : ${data.status}
Score : ${data.score}
Rank : ${data.rank}
        `;
    ctx.deleteMessage();
    bot.telegram.sendPhoto(ctx.chat.id, data.images.jpg.image_url, {
      caption: message,
      reply_markup: {
        inline_keyboard: [[{ text: "Back to About", callback_data: "about" }]],
      },
    });
  } catch (err) {
    console.log(err);
    ctx.reply("Find Error!");
  }
});

bot.action("spotify-profile", async (ctx) => {
  try {
    const userData = await getUser();
    const { display_name, images, external_urls, followers } = userData;

    const user = {
      name: display_name,
      avatar: images[0].url,
      url: external_urls.spotify,
      followers_: followers.total,
    };

    let message = `
Name : ${user.name}
Followers : ${user.followers_}
Profile Link : ${user.url}
    `;

    ctx.deleteMessage();
    bot.telegram.sendPhoto(ctx.chat.id, user.avatar, {
      caption: message,
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back to Spotify", callback_data: "spotify" }],
        ],
      },
    });
  } catch (err) {
    console.error(err);
    ctx.reply("Error: Failed to fetch user data");
  }
});

bot.action("now-playing", async (ctx) => {
  try {
    const nowPlaying = await getNowPlaying();

    if (nowPlaying.is_playing == false) {
      return ctx.reply("No song is currently playing.");
    }

    const { album, artists, name, external_urls } = nowPlaying.item;
    const albumImageUrl = nowPlaying.item.album.images[0].url;

    const message = `
Album : ${album.name}
Artist : ${artists.map((artist) => artist.name).join(", ")}
Title : ${name}
Listen on Spotify : ${external_urls.spotify}
      `;

    ctx.deleteMessage();
    bot.telegram.sendPhoto(ctx.chat.id,
      { url: albumImageUrl },
      {
        caption: message,
        reply_markup: {
          inline_keyboard: [
            [{ text: "Back to Spotify", callback_data: "spotify" }],
          ],
        },
      }
    );
  } catch (err) {
    console.error(err);
    ctx.reply("Error: Failed to fetch now playing");
  }
});

bot.action("last-played", async (ctx) => {
  try {
    const { items } = await getLastPlayed();

    if (items.length === 0) {
      return res.status(200).json({ isPlaying: false });
    }

    const lastPlayedTrack = items[0].track;
    const isPlaying = lastPlayedTrack.is_playing;
    const title = lastPlayedTrack.name;
    const artist = lastPlayedTrack.artists.map((_artist) => _artist.name).join(', ');
    const album = lastPlayedTrack.album.name;
    const albumImageUrl = lastPlayedTrack.album.images[0]?.url || ''; 
    const songUrl = lastPlayedTrack.external_urls.spotify;
    const playedAt = items[0].played_at;
    const timeAgo = formatDistanceToNow(new Date(playedAt), { addSuffix: true });


    const message = `
Album : ${album}
Artist : ${artist}
Title : ${title}
Played ${timeAgo}
Listen on Spotify : ${songUrl}
      `;

    ctx.deleteMessage();
    bot.telegram.sendPhoto(ctx.chat.id,
      { url: albumImageUrl },
      {
        caption: message,
        reply_markup: {
          inline_keyboard: [
            [{ text: "Back to Spotify", callback_data: "spotify" }],
          ],
        },
      }
    );
  } catch (err) {
    console.error(err);
    ctx.reply("Error: Failed to fetch last played");
  }
});

bot.action("top-tracks", async (ctx) => {
    try {
        const { items } = await getTopTracks();

        const tracks = items.slice(0, 5).map((track) => ({
            artist: track.artists.map((_artist) => _artist.name).join(', '),
            songUrl: track.external_urls.spotify,
            title: track.name,
            cover: track.album.images[0].url,
        }));

        let trackCount = 0;

        async function deleteMessageIfExists(messageId) {
            try {
                await bot.telegram.deleteMessage(ctx.chat.id, messageId);
            } catch (error) {
                console.error(`Error deleting message: ${error}`);
            }
        }

        deleteMessageIfExists(ctx.update.callback_query.message.message_id);

        tracks.forEach((track) => {
            const message = `
Album: ${track.title}
Artist: ${track.artist}
Title: ${track.title}
Listen on Spotify: ${track.songUrl}
            `;

            bot.telegram.sendPhoto(ctx.chat.id, { url: track.cover }, {
                caption: message,
            }).then(() => {
                trackCount++;

                if (trackCount === tracks.length) {
                    deleteMessageIfExists(ctx.update.callback_query.message.message_id);
                    bot.telegram.sendMessage(ctx.chat.id, "Top 5 Kouseki Favorite Song", {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "Back to Spotify", callback_data: "spotify" }],
                            ],
                        },
                    });
                }
            });
        });
    } catch (err) {
        console.error(err);
        ctx.reply("Error: Failed to fetch top tracks");
    }
});


  
bot.hears("Credits", (ctx) => {
  ctx.reply("This Bot Create by Kouseki");
});

bot.hears("API", (ctx) => {
  ctx.reply("This Bot using Jikan API");
});

bot.hears("Hidden keyboard", (ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, "Keyboard hidenned", {
    reply_markup: {
      remove_keyboard: true,
    },
  });
});

bot.launch();
