var Discord = require('discord.io');
var logger = require('winston');
// var auth = require('./auth.json');   :)
var cur_queue = -1;
var queue = [];
var queue_cap = [];
var queue_status = [];
var queue_linked = [];
var modsAndUp = []
var servers;
var bot_id;
var avatarURL;

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});//logger
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
   token: process.env.token,
   autorun: true
});//bot

//set up for pinging herokuapp
var http = require("http");
function pinger (){
setInterval(function() {
    http.get("http://spotlight-bot-discord.herokuapp.com");
    console.log("ping");
}, 3540000); // every 5 minutes (300000)  //3540000 every 59 minutes
}//pinger

//establishing accepted roles for certain commands
var acceptedRoles = ["Admin", "Head Mod", "Mod", "Auditioner", "Event Coordinator"];
    // var channel_ID = '358709303084974081';

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

var compliments =  [
    "is the bee's knees!",
    "is a beast!",
    "is a better love story than Twilight!",
    "is looking good!",
    "doesn't deserve coal for Christmas!",
    "makes me smile!",
    "rocks!",
    "is making it hot in here!",
    "is killing it!",
    "has got your back!",
    "is unstoppable!",
    "can't stop, won't stop!",
    "is the very best, like no one ever was!",
    "CAN belive it's not butter!",
    "has fallen, but they CAN get up!",
]

var cheers = [
    "Go get em!",
    "You're great!",
    "It's not a party without you!",
    " :heart: ",
    " :eggplant: ",
    "Dream on!",
    "You can do it!",
    " :smile: ",
    "WOOOOOOO!",
    "If you can't do it, then the admins might!",
    "You have zero deaths, perfect KDA!"
]

function getCompliment(){
    var rand = getRandomInt(compliments.length);
    return compliments[rand];
}

function getCheer(){
    var rand = getRandomInt(cheers.length);
    return cheers[rand];
}

function getRoast(){
    var rand = getRandomInt(roasts.length);
    return roasts[rand];
}

//checks if user has at least one accepted role
function checkForAcceptedRoles(channelID, uRoles){
    var found = false;
    Object.keys(bot.servers[channelID].roles).filter(function(role){
        for(var i = 0; i < Object.keys(bot.servers[channelID].roles).length; i++){
            var roleID;
            if(bot.servers[channelID].roles[role].name == acceptedRoles[i]){
                if(uRoles.some(r=>bot.servers[channelID].roles[role].id.includes(r))){
                    found = true;
                    return true;
                }//if
                return false;
            }//if
        }//for
        return false;
    });
    return found;
}//checkForAcceptedRoles

    // bot_id = '526011511093854229';
    //ef5086d73496a69d96fc5aaa820b3722

//logs bot into discord
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
        // var keys = Object.keys(evt.d.user);
        // console.log(evt.d.user_settings);
    bot_id = evt.d.user.id;
    pinger();    //prevent herokuapp from sleeping
});//bot.on

//For testing purposes - causes program to sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}//sleep

//whenever a message is sent by anyone in a joined server, this function is called
bot.on('message', function m (user, userID, channelID, message, evt){
        // sleep(500);
        // var keys = Object.keys(evt.d);
        // console.log(evt.d.member.roles);
        // console.log(evt.d.guild_id);
        // return;
    for(var i = 0; i < queue_linked.length; i++){
      if(queue_linked[i][0] == channelID){
        cur_queue = i;
        break;
      }//if
      cur_queue = -1;
    }//for
    if(cur_queue == -1){
      queue_linked.push([channelID]);
      queue.push([]);
      cur_queue = queue_linked.length - 1;
      queue_linked[cur_queue].push('unlinked');
      queue_status.push('Open');
      queue_cap.push(-1);
    }//if

    // if(message == 'boop'){
    //     bot.sendMessage({
    //         to: channelID,
    //         message: '?beep' + '\n'
    //     });//bot.sendMessage
    //     return;
    // }
    // //case bamxmejia

    //if anyone in the channel typed 'q!' the bot will listen for a command
    if (message.substring(0, 2) == 'q!') {
        var args = message.substring(2).split(' ');
        var cmd = args[0];
    		if(cmd == '' && args.length > 1){
    		    cmd = args[1];
    		}//if
        args = args.splice(1);
        if(args.length > 1 && args[0] == ' '){
            args.splice(1);
    		}//if

        //the following commands are checked regardless of whether or not the bot is linked to the current channel
        switch(cmd){
            case 'link':
            case 'lnk':
                if(!checkForAcceptedRoles(evt.d.guild_id, evt.d.member.roles)){
                    bot.sendMessage({
                        to: channelID,
                        message: 'Only authorized members can call this function!' + '\n'
                    });//bot.sendMessage
                    return;
                }//if
                if(queue_linked[cur_queue][1] == 'linked'){
                    bot.sendMessage({
                        to: channelID,
                        message: 'Already linked to this channel!' + '\n'
                    });//bot.sendMessage
                    return;
                }//if
                queue_linked[cur_queue][1] = 'linked';
                bot.sendMessage({
                    to: channelID,
                    message: 'Spotlight Bot has been linked!' + '\n'
                });//bot.sendMessage
                return;
            //case link

            case 'help':
            case 'h':
                avatarURL = 'https://cdn.discordapp.com/avatars/' + bot_id + '/' + bot.avatar + '.jpg';
                bot.sendMessage({
                    to: channelID,
                    embed: {
                        color: 0x02c4ff,
                            // background: 0xFFFFFF,
                            //3447003
                        author: {
                          name: bot.username + ' - Help',
                          icon_url: avatarURL,
                              // color: 0x02c4ff
                        },//author
                            // image : avatarURL,
                            // thumbnail : avatarURL,
                            // title: "**__Help Commands__**",
                            // url: "http://google.com",
                            // description: "This is a test embed to showcase what they look like and what they can do.",
                        fields: [{
                              name: "join (j)",
                              value: "Join the queue."
                          },
                          {
                              name: "leave (l)",
                              value: "Leave the queue."
                          },
                          {
                              name: "queue (que)",
                              value: "View who is in queue, how many spots are filled, and if queue is open."
                          },
                          {
                              name: "next (n)",
                              value: "Current singer or authorized member removes the current singer from queue after they are done."
                          },
                          {
                              name: "*link (lnk)",
                              value: "Links the bot to a channel, signaling it to respond to other command."
                          },
                          {
                              name: "*unlink (ulnk)",
                              value: "Unlink the bot from a channel, signaling it to stop responding to commands other than 'link', and clearing the queue."
                          },
                          {
                              name: "*open (o)",
                              value: "Opens the queue, allowing users to join it."
                          },
                          {
                              name: "*close (c)",
                              value: "Closes the queue, preventing users from joining it."
                          },
                          {
                              name: "*cap",
                              value: "Sets the maximum amount of users allowed in queue. (Negative integers uncap the queue)"
                          },
                          {
                              name: "*clear (clr)",
                              value: "Clears the queue, removing anyone in it."
                          },
                          {
                              name: "help (h)",
                              value: "Displays all commands."
                          },
                          {
                              name: "\u200B",
                              value: "(*)only authorized users may use",
                          }
                              // {
                              //   name: "leave(l)",
                              //   value: "You can put [masked links](http://google.com) inside of rich embeds."
                              // },
                              // {
                              //   name: "Markdown",
                              //   value: "You can put all the *usual* **__Markdown__** inside of them."
                              // }
                        ],//fields

                        blankField: [{
                            blankField:true
                        }],//blankField
                        timestamp: new Date(),
                        footer: {
                          icon_url: avatarURL,
                          text: "© bamxmejia"
                        }//footer
                    }//embed
                });//bot.sendMessage
                return;
            //case help
        }//switch

        //if current channel is unlinked, the rest of the following commands are ignored
        if(queue_linked[cur_queue][1] == 'unlinked') { return; }

        //if the channel is linked, then the following commands are checked
        switch(cmd) {
            case 'unlink':
            case 'ulnk':
                if(!checkForAcceptedRoles(evt.d.guild_id, evt.d.member.roles)){
                    bot.sendMessage({
                        to: channelID,
                        message: 'Only authorized members can call this function!' + '\n'
                    });//bot.sendMessage
                    return;
                }//if
                queue_linked[cur_queue][1] = 'unlinked';

                //deleting queues for current channel
                queue.splice(cur_queue);
                queue_linked.splice(cur_queue);
                queue_cap.splice(cur_queue);
                queue_status.splice(cur_queue);
                cur_queue = -1;
                bot.sendMessage({
                    to: channelID,
                    message: 'Spotlight Bot has been unlinked!' + '\n'
                });//bot.sendMessage
                break;
            //case unlink

        		case 'open':
        		case 'o':
                if(!checkForAcceptedRoles(evt.d.guild_id, evt.d.member.roles)){
                    bot.sendMessage({
                        to: channelID,
                        message: 'Only authorized members can call this function!' + '\n'
                    });//bot.sendMessage
                    return;
                }//if
                if(queue_status[cur_queue] == 'Open'){
                    bot.sendMessage({
                        to: channelID,
                        message: 'Queue is already open!' + '\n'
                    });//bot.sendMessage
                    return;
                }//if
                queue_status[cur_queue] = 'Open';
          		  bot.sendMessage({
                  to: channelID,
                  message: 'Queue has been opened!' + '\n'
                });//bot.sendMessage
        		    break;
            //case open

        		case 'close':
        		case 'c':
                if(!checkForAcceptedRoles(evt.d.guild_id, evt.d.member.roles)){
                    bot.sendMessage({
                        to: channelID,
                        message: 'Only authorized members can call this function!' + '\n'
                    });//bot.sendMessage
                    return;
                }//if
                if(queue_status[cur_queue] == 'Closed'){
                    bot.sendMessage({
                        to: channelID,
                        message: 'Queue is already closed!' + '\n'
                    });//bot.sendMessage
                    return;
                }//if
                queue_status[cur_queue] = 'Closed';
                bot.sendMessage({
                    to: channelID,
                    message: 'Queue has been closed!' + '\n'
                });//bot.sendMessage
                break;
            //case close

            case 'ping':
                bot.sendMessage({
                to: channelID,
                message: 'pong!' + '\n'
            });//bot.sendMessage
        		break;
            //case ping

            case 'join':
            case 'j':
                if(queue_status[cur_queue] == 'Open' && (queue_cap[cur_queue] < 0 || queue[cur_queue].length < queue_cap[cur_queue])){
                    var qbreak = 0;
                    for(var i = 1; i < queue[cur_queue].length; i+=2){
                        if(queue[cur_queue][i] == userID){
                            bot.sendMessage({
                                to: channelID,
                                message: 'You are already in queue!' + '\n'
                            });//bot.sendMessage
                            qbreak = 1;
                            break;
                        }//if
                    }//for
                    if(qbreak == 1){ break; }    //if user is already in queue, no further action is taken
                    queue[cur_queue].push(user);
                    queue[cur_queue].push(userID);
                    if(queue_cap[cur_queue] < 0){
                        bot.sendMessage({
                            to: channelID,
                            message: '<@!' + userID + '> has joined the queue!'
                                + '\nTo check who is in queue, type "q!queue"'
                                + '\nIf you need to leave the queue, type "q!leave"'
                                + '\nGood Luck!'
                                + '\n\n‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾'
                                + '\n#Users: ' + queue[cur_queue].length/2
                                + '\nCap: Uncapped'
                                + '\nStatus: ' + queue_status[cur_queue] + '\n'
                        });//bot.sendMessage
                    }//if
                    else{
                        bot.sendMessage({
                            to: channelID,
                            message: '<@!' + userID + '> has joined the queue!'
                                + '\nTo check who is in queue, type "q!queue"'
                                + '\nIf you need to leave the queue, type "q!leave"'
                                + '\nGood Luck!'
                                + '\n\n‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾'
                                + '\n#Users: ' + queue[cur_queue].length/2
                                + '\nCap: ' + queue_cap[cur_queue]/2
                                + '\nStatus: ' + queue_status[cur_queue] + '\n'
                        });//bot.sendMessage
                    }//else
                }//if
                else if(queue_status[cur_queue] == 'Closed'){
                    bot.sendMessage({
                        to: channelID,
                        message: 'Queue is currently closed!' + '\n'
                    });//bot.sendMessage
                }//else if
                else{
                    bot.sendMessage({
                        to: channelID,
                        message: 'Queue has reached its cap!' + '\n'
                    });//bot.sendMessage
                }//else
                break;
            //case join

        		case 'leave':
        		case 'l':
                if(queue[cur_queue].length == 0){
                    bot.sendMessage({
                        to: channelID,
                        message: 'You are not in queue!' + '\n'
                    });//bot.sendMessage
                }//if
          			for(var i = 1; i < queue[cur_queue].length ; i+=2){
            				if(queue[cur_queue][i] == userID){
            					  bot.sendMessage({
                            to: channelID,
                            message: 'You have left the queue!' + '\n'
                        });//bot.sendMessage
              					queue[cur_queue].splice(i, 1);
              					queue[cur_queue].splice(i-1, 1);
              					break;
            				}//if
                    if(i+2 >= queue[cur_queue]){
                        bot.sendMessage({
                            to: channelID,
                            message: 'You are not in queue!' + '\n'
                        });//bot.sendMessage
                    }//if
          			}//for
                break;
            //case leave

            //if an empty argument is passed
        		case '':
                bot.sendMessage({
                    to: channelID,
                    message: 'Enter "help" for a list of commands' + '\n'
                });//bot.sendMessage
                break;
            //case ''

        		case 'next':
        		case 'n':
                if(!checkForAcceptedRoles(evt.d.guild_id, evt.d.member.roles) && (queue[cur_queue].length > 0 && userID != queue[cur_queue][1])){
                    bot.sendMessage({
                        to: channelID,
                        message: 'Only authorized members can call this function!' + '\n'
                    });//bot.sendMessage
                    return;
                }//if
                if(queue[cur_queue].length <= 0){
                    bot.sendMessage({
                        to: channelID,
                        message: 'The queue is empty!' + '\n'
                    });//bot.sendMessage
                    break;
                }//if
          			var quserID = queue[cur_queue].splice(1,1);
          			queue[cur_queue].splice(0,1);
          			if(queue[cur_queue].length > 0){
                    bot.sendMessage({
                        to: channelID,
                        message: 'Thank you <@!' + quserID + '> for singing!\nUp next is: <@!' + queue[cur_queue][queue[cur_queue].length - 1] + '>' + '\n'
                    });//bot.sendMessage
          			}//if
          			else{
            				bot.sendMessage({
                        to: channelID,
                        message: 'Thank you <@!' + quserID + '> for singing!\nQueue is now empty' + '\n'
                    });//bot.sendMessage
          			}//else
          			break;
            //case next

            //see who's in queue
        		case 'queue':
            case 'que':

                var cap;    //make it easier for sending messages
                if(queue_cap[cur_queue] < 0) cap = 'Uncapped';
                else cap = queue_cap[cur_queue]/2;

                // var bmessage = '|\\_\\_/:musical_note:\\\\\\_\\_ *Singing Queue* \\_\\_/:musical_note:\\\\\\_\\_|\n';    //to store output message
                var bmessage = '_ _  _ _  :musical_note:    Singing Queue    :musical_note:  _ _  _ _  _ _  _ _  \n‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\n'    //ADD 6 more overlines if needed
                if(queue[cur_queue].length == 0){
                    bot.sendMessage({
                        to: channelID,
                        message: '#Users: ' + queue[cur_queue].length/2
                            + '\nCap: ' + cap
                            + '\nStatus: ' + queue_status[cur_queue] + '\n'
                    });//bot.sendMessage
                }//if
          			for(var i = 0; i < queue[cur_queue].length; i+=2){
                    if(i == 0){    //first userID in queue
                        if(i+2 < queue[cur_queue].length){
                            bmessage = bmessage.concat('Currently Singing: <@' + queue[cur_queue][i+1] + '>');
                        }//if
                        else{
                            bmessage = bmessage.concat('Currently Singing: <@' + queue[cur_queue][i+1] + '>'
                                // + '\n\n\\_\\_ \\_\\_ \\_\\_ \\_\\_ \\_\\_ \\_\\_ \\_\\_ \\_\\_ \\_\\_ \\_\\_ \\_\\_ \\_\\_ \\_\\_ \\_\\_'
                                + '\n\n‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾'
                                + '\n#Users: ' + queue[cur_queue].length/2
                                + '\nCap: ' + cap
                                + '\nStatus: ' + queue_status[cur_queue] + '\n');
                            bot.sendMessage({
                            		to: channelID,
                             		message: bmessage
                            });//bot.sendMessage
                        }//else
                    }//if
            				else if(i == 2){    //second userID in queue
                        if(i+2 < queue[cur_queue].length){
                            bmessage = bmessage.concat('\nUp Next: <@' + queue[cur_queue][i+1] + '>');
                        }//if
                        else{
                            bmessage = bmessage.concat('\nUp Next: <@' + queue[cur_queue][i+1] + '>'
                                + '\n\n‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾'
                                + '\n#Users: ' + queue[cur_queue].length/2
                                + '\nCap: ' + cap
                                + '\nStatus: ' + queue_status[cur_queue] + '\n');
                            bot.sendMessage({
                            		to: channelID,
                             		message: bmessage
                            });//bot.sendMessage
                        }//else
            				}//else if
            				else{
                        if(i+2 < queue[cur_queue].length){
                            bmessage = bmessage.concat('\n-' + queue[cur_queue][i]);
                        }//if
                        else{
                            bmessage = bmessage.concat('\n-' + queue[cur_queue][i]
                                + '\n\n‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾'
                                + '\n#Users: ' + queue[cur_queue].length/2
                                + '\nCap: ' + cap
                                + '\nStatus: ' + queue_status[cur_queue] + '\n');
                            bot.sendMessage({
                           			to: channelID,
                            		message: bmessage
                           	});//bot.sendMessage
                        }//else
            				}//else
          			}//for
          			break;
            //case queue

            //sets the maximum amount of user in a queue
        		case 'cap':
                if(!checkForAcceptedRoles(evt.d.guild_id, evt.d.member.roles)){
                    bot.sendMessage({
                        to: channelID,
                        message: 'Only authorized members can call this function!' + '\n'
                    });//bot.sendMessage
                    return;
                }//if
          			if(isNaN(args[0]) == false){
                    if(args[0] < 0){
                        queue_cap[cur_queue] = args[0] * 2;
                        bot.sendMessage({
                            to: channelID,
                            message: 'Queue is now uncapped' + '\n'
                        });//bot.sendMessage
                    }
                    else{
                				queue_cap[cur_queue] = args[0] * 2;
                				bot.sendMessage({
                            to: channelID,
                            message: 'Queue is now capped at: ' + queue_cap[cur_queue]/2 + '\n'
                        });//bot.sendMessage
                    }
          			}//if
          			else{
        				    bot.sendMessage({
                 			  to: channelID,
                        message: 'Enter an integer as an argument to cap the queue at. [q!cap ##] (numbers below zero uncap the queue)' + '\n'
                 		});//bot.sendMessage
          			}//else
          			break;
            //case cap

            case 'clear':
            case 'clr':
                if(!checkForAcceptedRoles(evt.d.guild_id, evt.d.member.roles)){
                    bot.sendMessage({
                        to: channelID,
                        message: 'Only authorized members can call this function!' + '\n'
                    });//bot.sendMessage
                    return;
                }//if
                queue[cur_queue].splice(0, queue[cur_queue].length);
                bot.sendMessage({
                    to: channelID,
                    message: 'Queue has been cleared.' + '\n'
                });//bot.sendMessage
                break;
            //case clear

            case 'league':
                bot.sendMessage({
                    to: channelID,
                    message: 'League\'s a terrible game!' + '\n'
                });//bot.sendMessage
                return;
            //case league

            case 'jesh':
                bot.sendMessage({
                    to: channelID,
                    message: 'jesh is a great admin!' + '\n'
                });//bot.sendMessage
                return;
            //case jesh

            case 'cinnabun$':
                bot.sendMessage({
                    to: channelID,
                    message: 'cinnabun$ comes up with great server names!' + '\n'
                });//bot.sendMessage
                return;
            //case cinnabun$

            case 'bamxmejia':
                bot.sendMessage({
                    to: channelID,
                    message: 'bamxmejia posts his passwords in public!' + '\n'
                });//bot.sendMessage
                return;
            //case bamxmejia

            case 'cheer':
            case 'cheerup':
                var cUser;
                if(args.length > 0){
                    cUser = userID;
                }
                else{
                    cUser = userID;
                }
                var cheer = getCheer();
                bot.sendMessage({
                    to: channelID,
                    message: '<@!' + cUser + '> ' + cheer + '\n'
                });//bot.sendMessage
                return;
            //case cheerup

            case 'compliment':
                var cUser;
                if(args.length > 0){
                    cUser = userID;
                }
                else{
                    cUser = userID;
                }
                var compliment = getCompliment();
                bot.sendMessage({
                    to: channelID,
                    message: '<@!' + cUser + '> ' + compliment + '\n'
                });//bot.sendMessage
                return;
            //case compliment

            case 'roast':
                // var rUser;
                // if(args.length > 0){
                //     rUser = userID;
                // }
                // else{
                //     rUser = userID;
                // }
                // var roast = getRoast();
                bot.sendMessage({
                    to: channelID,
                    message: 'tsssss' + '\n'
                });//bot.sendMessage
                return;
                    // bot.sendMessage({
                    //     to: channelID,
                    //     message: '<@!' + rUser + '> ' + roast + '\n'
                    // });//bot.sendMessage
                    // return;
            //case compliment

            case 'hello':
                bot.sendMessage({
                    to: channelID,
                    message: 'Hello!' + '\n'
                });//bot.sendMessage
                return;
            //case bamxmejia

            case 'bye':
                bot.sendMessage({
                    to: channelID,
                    message: 'Bye-bye!' + '\n'
                });//bot.sendMessage
                return;
            //case bamxmejia

            case 'beep':
                bot.sendMessage({
                    to: channelID,
                    message: 'boop!' + '\n'
                });//bot.sendMessage
                return;
            //case bamxmejia

            case 'suicide':
            case 'kill':
            case 'dies':
                bot.sendMessage({
                    to: channelID,
                    message: 'I\'m dead' + '\n'
                });//bot.sendMessage
                return;
            //case bamxmejia

            //when an incorrect command is entered
        		default:
          			bot.sendMessage({
                      to: channelID,
                      message: 'No such command' + '\n'
                });//bot.sendMessage
          			break;
            //default
        }//switch
    }//if
});//bot.on
