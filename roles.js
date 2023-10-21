const { createConnection } = require('mysql2');
const config = require('./config.json');


const connection = []

var roles = new Map();

connection.push(createConnection({
    host: config.connexion.host,
    user: config.connexion.user,
    password: config.connexion.password,
    database: config.connexion.database
  }))
connection[0].query(`SELECT * FROM commun_reaction_role`,
async function(err, results) {
  if (err) console.log(err);
  if(results[0]){
    results.forEach(e => {
      roles.set(e.emote, e.role);
    })
  }
})

connection[0].end()
connection.shift()

module.exports = roles