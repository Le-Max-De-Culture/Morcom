const { Client, Intents, Collection, EmbedBuilder, GatewayIntentBits, Partials } = require('discord.js')
const { readdir } = require('fs')
const { createConnection } = require('mysql2');
const config = require('./config.json');

const client = new Client({
  partials: [Partials.Message,
              Partials.GuildMember,
              Partials.User,
              Partials.Channel
            ],
  intents: [GatewayIntentBits.Guilds, 
            GatewayIntentBits.GuildMembers, 
            GatewayIntentBits.GuildPresences, 
            GatewayIntentBits.GuildMessages, 
            GatewayIntentBits.GuildMessageReactions, 
            GatewayIntentBits.GuildVoiceStates, 
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.MessageContent
          ]
  })

client.commands = new Collection();
client.aliases = new Collection();

client.login(config.token);

process.on('warning', (warning) => {
    console.log(warning.stack);
});

const connection = []

connection.push(createConnection({
    host: config.connexion.host,
    user: config.connexion.user,
    password: config.connexion.password,
    database: config.connexion.database
  }))

connection[0].connect(function(err){
  if(err) throw err;
  console.log("Connecté à la base de données.")
});
connection[0].end()
connection.shift()

client.on('ready', function() {
  const channel = client.channels.cache.get("640251592318386236");
  channel.send('Choisissez vos rôles ici !');
  connection.push(createConnection({
      host: config.connexion.host,
      user: config.connexion.user,
      password: config.connexion.password,
      database: config.connexion.database
    }));
  connection[0].query(`SELECT * FROM commun_categories_roles ORDER BY ordre`,
    async function(err, results) {
      if (err) console.log(err);
      if(results[0]){
        let messages = [];

        // Create message pointer
        let message = await channel.messages
          .fetch({ limit: 1 })
          .then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null));

        while (message) {
          await channel.messages
            .fetch({ limit: 100, before: message.id })
            .then(messagePage => {
              messagePage.forEach(msg => messages.push(msg));

              // Update our message pointer to be last message in page of messages
              message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
            })
        }

        messages.forEach(e => e.delete());
        
        results.forEach(e => {
          channel.send('--roles '+e.nom)
            .then(m => m.delete())
        })
      }
    })
  connection[0].end()
  connection.shift()
});


readdir('./events/', (err, files) => {
    if (err) throw err;

    for (const f of files.filter(f => f.endsWith('.js'))) {
        const event = require(`./events/${f}`);
        const eventName = f.split('.')[0];
        client.on(eventName, event.bind(null, client))
        delete require.cache[require.resolve(`./events/${f}`)]
        console.log(`-> ${f} chargé`)
    }
});

readdir('./commands/', (err, files) => {
  if (err) throw err;
  for (const command of files.filter(f => f.endsWith('.js'))) {
    const props = require(`./commands/${command}`)
    if(props.name){
      client.commands.set(props.name, props)
      console.log(`-> ${command} chargé`)
    } else {
      console.log(`Manque un truc dans ${command}`)
    }

    if(props.aliases && Array.isArray(props.aliases)){
      props.aliases.forEach(alias => client.aliases.set(alias, props.name));
    }

  }
})
