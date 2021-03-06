module.exports = {
    function() {
        const bot = require("../bot")
            , Util = require("../Util")
            , Discord = require("discord.js")
            , colors = require("colors")

        bot.con.query(`SELECT * FROM ${Util.db_Model.users} ORDER BY IS_STREAMING DESC, ID ASC`, (error_users, results_users) => {
            /**
             * @param results_users.UserID
             * @param results_users.UserTwitch
             * @param results_users.ServerID
             * @param results_users.ChannelID
             * @param results_users.Stream_Text
             * @param results_users.Remove_MSG_On_End
             * @param results_users.IS_STREAMING
             * @param results_users.COINS
             */

            if (error_users) return console.log(error_users);

            const Streaming_User = []
            results_users.forEach(i_u => {
                if (i_u.IS_STREAMING) { Streaming_User.push(i_u) }
            });

            if (Streaming_User == "" || Streaming_User == null || Streaming_User == undefined) return //console.log(`Nothing in the Streaming_User`)
            //Will prevent any call in the db for nothing if nobody is streaming


            //console.log(colors.green(Streaming_User)
            //console.log(colors.green(results)

            bot.con.query(`SELECT * FROM ${Util.db_Model.queue}`, (error_queue, results_queue) => {
                /**
                * @param results_queue.UserID
                * @param results_queue.UserTwitch
                * @param results_queue.ServerID
                * @param results_queue.ChannelID
                * @param results_queue.Stream_Text
                * @param results_queue.Remove_MSG_On_End
                * @param results_queue.IS_STREAMING
                * @param results_queue.COINS
                */

                if (error_queue) console.error(error_queue)

                //console.log(colors.green("---  results_queue  ---")
                //console.log(colors.green(results_queue)
                //console.log(colors.green("---  results_queue  ---\n\n")

                if (results_queue == "" || results_queue == null || results_queue == undefined) {
                    //console.log(colors.green("NULL -> y'a rien donc on ajoute")
                    Streaming_User.forEach(i_u => {
                        if (i_u == "" || i_u == null || i_u == undefined) return
                        if (i_u.ServerID == null || i_u.ChannelID == null) return

                        addUser(i_u)
                    });
                } else {
                    //console.log("NON NULL")

                    Streaming_User.forEach(r_u => {
                        //console.log(colors.green(r_u.UserID)
                        SelectAll_Queue(r_u.UserTwitch, r_u.ServerID, r_u.ChannelID)
                            .then(result => {
                                if (!result) {
                                    //console.log(colors.green("pas result")
                                    addUser(r_u)
                                } else {
                                    //console.log(colors.green(`result=${result}`)
                                    Verify_Twitch_Status(result)
                                }
                            })
                    })
                }
            });

        });

        function addUser(Streaming_User) {
            bot.con.query(`INSERT INTO ${Util.db_Model.queue} (UserID, UserTwitch, ServerID, ChannelID, Stream_Text, Remove_MSG_On_End, IS_STREAMING) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [Streaming_User.UserID,
                Streaming_User.UserTwitch,
                Streaming_User.ServerID,
                Streaming_User.ChannelID,
                Streaming_User.Stream_Text,
                Streaming_User.Remove_MSG_On_End,
                Streaming_User.IS_STREAMING
                ])
        }

        function SelectAll_Queue(UserTwitch, ServerID, ChannelID) {
            /**
             * @param UserTwitch The UserTwitch
             * @param ServerID The ServerID
             * @param ChannelID The ChannelID
             * @param returns 
             */
            return new Promise(async (resolve, reject) => {
                bot.con.query(`SELECT * FROM ${Util.db_Model.queue} WHERE UserTwitch = '${UserTwitch}' AND ServerID = '${ServerID}' AND ChannelID = '${ChannelID}'`, (err, results) => {
                    /**
                    * @param results.UserID
                    * @param results.UserTwitch
                    * @param results.ServerID
                    * @param results.ChannelID
                    * @param results.MessageID
                    * @param results.Stream_Text
                    * @param results.Remove_MSG_On_End
                    * @param results.Compact_Mode
                    * @param results.IS_STREAMING
                    * @param results.COINS
                    */
                    if (!err) {
                        if (results == null) {
                            resolve();
                        } else resolve(results[0]);
                    } else reject(err);
                });
            });
        }

        function Verify_Twitch_Status(Streaming_User) {
            /**
             * @param Streaming_User The Streaming User variable
             */

            bot.twitch.getUser(Streaming_User.UserTwitch)
                //bot.twitch.getUser("squeezielive")
                .then(async data => {
                    const dataUser = await data;

                    /* *
                    _id: 33166101328
                    average_fps: 60
                    broadcast_platform: "live"
                        channel: Object { mature: false, status: "Squeezie ► La squad la plus éclatée du jeu (ft Loc…", broadcaster_language: "fr", … }
                        status:"Squeezie ► La squad la plus éclatée du jeu (ft Locklear) #sponsorisé"
                        updated_at:"2019-03-12T20:22:40.323794Z"
                        url:"https://www.twitch.tv/squeezielive"
                        video_banner:"https://static-cdn.jtvnw.net/jtv_user_pictures/1e3c5fd7-de47-4a59-bc94-50baa1572123-channel_offline_image-1920x1080.png"
                        views: 11 554 222
                    community_id: ""
                    community_ids: Array(0)[]
                    created_at: "2019-03-12T18:55:38Z"
                    delay: 0
                    game: "Tom Clancy's The Division 2"
                    is_playlist: false
                    stream_type:"live"
                    video_height:1080
                    viewers:  8653
                    * */

                    //console.log(dataUser)
                    if (dataUser.stream == null || dataUser.stream == undefined) {
                        //console.log(colors.green(`dataUser=NULL`))

                        /*
                        bot.con.query(`SELECT * FROM ${Util.db_Model.queue} WHERE UserTwitch = '${Streaming_User.UserTwitch}' AND ServerID = '${Streaming_User.ServerID}' AND ChannelID = '${Streaming_User.ChannelID}'`, (results, error) => {
                            console.log(results)
                            //console.log()
                        })
                        */

                        return Delete_User_data_and_Streaming_Status(Streaming_User)
                    } else {
                        //console.log(colors.green(`dataUser!=NULL`))
                        //console.log(colors.green(`il devrait stream normalement (${Streaming_User.UserTwitch})`))



                        //var guild_user = bot.bot.guilds.resolve(Streaming_User.ServerID)
                        let guild_user = bot.bot.guilds.resolve(Streaming_User.ServerID)

                        if (!guild_user) {
                            //If the ServerID isn't findable
                            console.log(colors.green(`Can't find the ServerID of the user data`))
                            Delete_User_data_and_Streaming_Status(Streaming_User)
                            const User = bot.bot.users.resolve(Streaming_User.UserID)
                            if (User) {
                                User.createDM().then(Util.SQL_DM_Invalid(Streaming_User.UserID, Streaming_User, "ServerID"))
                            }
                            return;
                        }

                        //var channel_user = guild_user.channels.resolve(Streaming_User.ChannelID)
                        let channel_user = guild_user.channels.resolve(Streaming_User.ChannelID)
                        if (!channel_user) {
                            //If the ChannelID isn't findable
                            console.log(colors.green(`Can't find the ChannelID of the user data`))
                            Delete_User_data_and_Streaming_Status(Streaming_User)
                            const User = bot.bot.users.resolve(Streaming_User.UserID)
                            if (User) {
                                User.createDM().then(Util.SQL_DM_Invalid(Streaming_User.UserID, Streaming_User, "ChannelID"))
                            }
                            return;
                        }


                        if (!Streaming_User.MessageID) {
                            //Si le message de notif est PAS envoyé
                            console.log(colors.green(`MessageID=NULL`))
                            if (guild_user && channel_user) {
                                const Send_Perm = await channel_user.permissionsFor(guild_user.me).has("SEND_MESSAGES")
                                if (Send_Perm) {
                                    //We send the notification here
                                    Util.SQL_Announce_Stream(Streaming_User, dataUser, false)
                                } else {
                                    console.log(`I don't have the permission to send the notification`)
                                    /*
                                    guild_user.owner.createDM().then(c => {
                                        var message_to_send = new Discord.MessageEmbed()
                                            .setColor("GREEN")
                                        c.send(message_to_send)
                                    })
                                    */
                                }
                            }

                        } else if (Streaming_User.MessageID != null) {
                            //Si le message de notif EST envoyé
                            //console.log(colors.green(`MessageID=${Streaming_User.MessageID}`))
                            var message_user = channel_user.messages.fetch(Streaming_User.MessageID)
                                .then(async msg => {
                                    //console.log(colors.green("Finded the msg"))
                                    //msg.edit("TEST DE OUF")
                                })
                                .catch(error => {
                                    console.error(`Can't find the MessageID of the user - '${Streaming_User.UserTwitch}'`)
                                    console.log(colors.cyan(`Re-Sending the message!`))
                                    Util.SQL_Announce_Stream(Streaming_User, dataUser, Streaming_User.Compact_Mode)
                                });

                            if (guild_user && channel_user && message_user) {
                                //console.log(colors.green(message_user)

                            }


                        }

                    }
                })
                .catch(error => {
                    console.error(error);
                    console.error("Detected a rate limit of the API, reducing the call from now");
                    Util.restartTimer(Util.Verify_Stream_Table, 60, 60000, "interval");
                    console.log(colors.red("Rate Limit the function Verify_Stream_Table"))
                    //console.error(Streaming_User.UserTwitch)
                })
        }

        function Delete_User_data_and_Streaming_Status(Streaming_User) {
            console.log(colors.green(`Deleting the data of the user ${Streaming_User.UserID} - ${Streaming_User.UserTwitch}`));
            bot.con.query(`UPDATE ${Util.db_Model.users} SET IS_STREAMING = '0' WHERE UserTwitch = '${Streaming_User.UserTwitch}' AND ServerID = '${Streaming_User.ServerID}' AND ChannelID = '${Streaming_User.ChannelID}'`, (error) => {
                if (error) console.error(error);
            })

            bot.con.query(`DELETE FROM ${Util.db_Model.queue} WHERE UserTwitch = '${Streaming_User.UserTwitch}' AND ServerID = '${Streaming_User.ServerID}' AND ChannelID = '${Streaming_User.ChannelID}'`, (error) => {
                if (error) console.error(error);
            })

            if (Streaming_User.MessageID) {
                console.log(colors.green(`Deleting the announced message of the channelID`))

                var channel_user = bot.bot.channels.resolve(Streaming_User.ChannelID);
                if (channel_user) {
                    channel_user.messages.fetch(Streaming_User.MessageID)
                        .then(async msg => {
                            console.log("++" + msg)
                            console.log(colors.green("Finded the msg"))
                            await msg.delete()
                        })
                        .catch(console.log(colors.cyan("Didn't found the message")));
                }
            }
        }
    }
}