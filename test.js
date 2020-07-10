require("dotenv").config()
const Discord = require("discord.js")
const client = new Discord.Client()
const http = require('http');
const https = require('https');
var MongoClient = require('mongodb').MongoClient;
var zz = 0;

async function dbQuery(query) {
    const db = await MongoClient.connect("mongodb://localhost:27017/");
    const dbo = db.db("Mushbot");
    const res = await dbo.collection("botVariables").find({ var: query }).toArray();
    return res[0].value;
}

async function dbUpdate(query) {
		const db = await MongoClient.connect("mongodb://localhost:27017/");
		  var dbo = db.db("Mushbot");
		  const res = await dbo.collection("botVariables").find({ var: query }).toArray();
		  var x = res[0].value;
			    x++;
			    var newvalues = { $set: { value: x } };
			    const result = await dbo.collection("botVariables").updateOne({ var: query }, newvalues);
				    return x; 
}

async function init(query, check, update) {
    try {
    	if (check == 1) {
        	const res = await dbQuery(query)
        	        return res
    	} else if (update == 1) {
    		const res = await dbUpdate(query)
    		        return res
    	}

    } catch (error) {
        console.log(error);
    }
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})
client.on("message", msg => {
	if(msg.author.bot) return;

    if (msg.content.startsWith("!rps")) {
    	var win = false;
		var draw = false;
		var n = Math.floor(Math.random() * 3 + 1);
		var str = "";
		if (n == 1) {
			str = "rock"
		} else if (n == 2) {
			str = "paper" 
		} else {
			str = "scissors"
		}
    	if (msg.content === "!rps") {
    		msg.reply("Specify which you want !rps <rock, paper, scissors>.")
    	} else {
		var messagesplit = msg.content.split("!rps ")
		if (messagesplit[1] === "rock") {
			if (n == 3) {
				win = true;
			} else if (n == 1) {
				draw = true;
			}
		} else if (messagesplit[1] === "paper") {
			if (n == 1) {
				win = true;
			} else if (n == 2) {
				draw = true;
			}
		} else if (messagesplit[1] === "scissors") {
			if (n == 2) {
				win = true;
			} else if (n == 3) {
				draw = true;
			}
		} else {
    		msg.reply("Specify which you want !rps <rock, paper, scissors>.")			
		}
			msg.reply("You picked " + messagesplit[1] + " and I picked " + str)	

		init("Draws", 1, 0).then(function(value) {
	  		var d = value;	
	  			init("Wins", 1, 0).then(function(value) {
	  			var w = value;
	  				init("Losses", 1, 0).then(function(value) {
	  				var l = value;	
					if (win == true) {
						msg.reply("Wow, you beat me!")
							init("Losses", 0, 1).then(function(value) {
				  					var q = value;	
				  					msg.reply(`My current record is... Wins: ${w} - Draws: ${d} - Losses: ${q}`);
							});	
					} else if (draw == true) {
						msg.reply("Hah, It's a draw!")
							init("Draws", 0, 1).then(function(value) {
				  					var q = value;	
				  					msg.reply(`My current record is... Wins: ${w} - Draws: ${q} - Losses: ${l}`);
							});	
					} else {
						msg.reply("Easy, I beat you!")
							init("Wins", 0, 1).then(function(value) {
				  					var q = value;	
				  					msg.reply(`My current record is... Wins: ${q} - Draws: ${d} - Losses: ${l}`);
							});	
					}	
	  				});
	  			});
		});
		}
	}

	if (msg.content === "!check") {
		init("Count", 1, 0).then(function(value) {
  		var q = value;	
  		msg.reply(q);
		});
		//console.log(res)


		// Connect to the db

		//MongoClient.connect("mongodb://localhost:27017/", function (err, db) {

		 // if (err) throw err;
		 // var dbo = db.db("Mushbot");
		 // var query = { var: "Count" };
		 // dbo.collection("botVariables").find(query).toArray(function(err, result) {
		 //   if (err) throw err;
		  //  var x = result[0].value;
		 //   msg.reply(x);
		 //   db.close();
		//})

		//  });   
	}
	if (msg.content === "!add") {
		init("Count", 0, 1).then(function(value) {
	  		var q = value;	
	  		msg.reply(q);
		});	 
	}
	if (msg.content === "!commands") {
	    msg.reply("**!gif random** for a random gif \n**!gif <search>** for a specific topic random gif \n**!rps <rock, paper scissors>** to play rock, paper, scissors against me")
	}
    if (msg.content.startsWith("!gif")) {
    	if (msg.content === "!gif") {
    		msg.reply("Specify something to search for with '!gif <search>' or type '!gif random' for a random gif.")
    	} else {
		var messagesplit = msg.content.split("!gif ")
		if (messagesplit[1] === "random") {
			let randUrl = "http://api.giphy.com/v1/gifs/random?&api_key=" + process.env.GIPHY_TOKEN;
			http.get(randUrl,(res) => {
			    let body = "";

			    res.on("data", (chunk) => {
			        body += chunk;
			    });

			    res.on("end", () => {
			        try {
			            let json = JSON.parse(body);
			            	msg.reply(json.data.url)
			        } catch (error) {
			            console.error(error.message);
			        };
			    });

			}).on("error", (error) => {
			    console.error(error.message);
			});
		} else if (messagesplit[1].length < 32) {
			let url = "http://api.giphy.com/v1/gifs/search?q=" + messagesplit[1] +  "&api_key=" + process.env.GIPHY_TOKEN + "&limit=25";
			http.get(url,(res) => {
			    let body = "";

			    res.on("data", (chunk) => {
			        body += chunk;
			    });

			    res.on("end", () => {
			        try {
			            let json = JSON.parse(body);
			            	var n = Math.floor(Math.random() * 26);
			            	if (json.data[0] == undefined) {
			            		msg.reply("No results found.")
			            	} else if (json.data[n] != undefined) {
			            		msg.reply(json.data[n].url)
			            	} else {
			            		while(json.data[n] == undefined) {
				            		n = Math.floor(Math.random() * 26);
				            	}
				            	msg.reply(json.data[n].url)
			            	}

			        } catch (error) {
			            console.error(error.message);
			        };
			    });

			}).on("error", (error) => {
			    console.error(error.message);
			});
		} else {
			msg.reply("too long of a search.")
		}
	}
	}
})
client.login(process.env.BOT_TOKEN)
