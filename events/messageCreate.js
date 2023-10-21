const { createConnection } = require('mysql2');
const config = require('../config.json')

module.exports = (client, messageCreate) => {
  const connection = []

  if (messageCreate.author.bot && messageCreate.channel.id != '640251592318386236') return
  if (messageCreate.channel.type === 'dm') return
  if (messageCreate.attachments.size !== 0) return
    
  const prefix = '--'
  const channel = messageCreate.channel.id;
  const member = messageCreate.author.id;
  const messageClean = messageCreate.content.toLowerCase().replace(/['!"’#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g," ");

  const words = ['bonjour', 'salut', 'coucou', 'hey', 'hi', 'hello', 'yo', 'bonsoir']
  if(words.some(v => messageClean.includes(v)) && messageCreate.mentions.users.size != 0 && messageCreate.mentions.users.first().id == '972251902484041768'){
    messageCreate.channel.send("Enfin quelqu'un qui s'intéresse à moi ! Je suis tellement ému :smiling_face_with_tear:")
  }
  
  if (!messageCreate.content.startsWith(prefix)) return;

  const args = messageCreate.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();
  if(cmd.length === 0) return;

  let command = client.commands.get(cmd);

  if(!command) command = client.commands.get(client.aliases.get(cmd));

  if(!command) return messageCreate.reply({content: `${cmd} n'existe pas.`});

  command.execute(client, messageCreate, args)
}
