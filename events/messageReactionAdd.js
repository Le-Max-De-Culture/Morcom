const { createConnection } = require('mysql2');
const config = require('../config.json');
var roles = require('../roles.js');

module.exports = async (client, messageReaction, user) => {

	if (messageReaction.message.guild.id !== '506449018885242890') return

	const connection = []

	if(messageReaction.message.partial) await messageReaction.message.fetch();
	if(messageReaction.partial) await reaction.fetch();
	if(user.bot) return;
	if(!messageReaction.message.guild) return;

	if(messageReaction.message.channelId == 640251592318386236){

		role = roles.get(messageReaction.emoji.name)

		messageReaction.message.guild.members.cache.get(user.id).roles.add(role)
	}
}