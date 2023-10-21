const { EmbedBuilder } = require('discord.js')
const { createConnection } = require('mysql2');
const config = require('../config.json')

module.exports = {
	name: 'roles',
	aliases: ['reactionrole'],
	description: 'Utilisation ~roles.',
	execute: async (_client, messageCreate, args) => {

		const connection = []

		if(!args[0]) messageCreate.channel.send("Il me faut une catégorie.") 

		const cat = args.join(' ');

		connection.push(createConnection({
			host: config.connexion.host,
			user: config.connexion.user,
			password: config.connexion.password,
			database: config.connexion.database
		}));

		var roles = [];

		connection[0].query(`SELECT * FROM commun_categories_roles WHERE nom = ?`,
			[cat], 
			async function(err, results) {
				if (err) console.log(err);
				if(results[0]){
			        results.forEach(e => {
			        	roles.push([e.nom, e.description, []])
			        	connection.push(createConnection({
							host: config.connexion.host,
							user: config.connexion.user,
							password: config.connexion.password,
							database: config.connexion.database
						}));
						connection[0].query(`SELECT * FROM commun_reaction_role WHERE categorie = ?`,
							[e.id],
							async function(err, results2) {
								if(err) console.log(err);
								if(results2[0]){
									results2.forEach(element => {
										let nom = messageCreate.guild.roles.cache.get(element.role).name
										let index = roles.filter(function(value,index) {return value[0]==e.nom;});
										roles[roles.indexOf(index[0])][2].push([nom, element.emote])
									})
									var values = new Map();
									for (const categorie of roles) {
										let contenu = ""
										const promesse = new Promise((resolve, reject) => {
											for (const role of categorie[2]) {
												contenu = contenu+role[0].toString()+' : '+role[1].toString()+'\n';
											}
											values.set(categorie[0], contenu)
											resolve();
										})
										promesse
											.then(async function() { 
												var embed = new EmbedBuilder()
												embed
													.setTitle(categorie[0])
													.setColor('#3498db')
												embed.addFields({name: categorie[1], value: values.get(categorie[0])})
												var messageEmbed = await messageCreate.channel.send({embeds: [embed]})
												for (const role of categorie[2]){
													messageEmbed.react(role[1])
												}
											})
									}
								}
							}
						);
						connection[0].end()
						connection.shift()
			        })
		      	}
			});
		connection[0].end()
		connection.shift()
	}
}