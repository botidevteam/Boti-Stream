module.exports = {
    //Define the functions so we can use it everywhere


    //#region Variables
    /**
     * @param Staff_List Used to get the staff list
     */

    Staff_List: "516033691525447680" //RisedSky
        + " - 394879199325847562" //Kotowi
        + " - 282905193513746432" //Kotya
        + " - 186213011097255936" //Lorio
        + " - 323039726040776705" //Tard0sTV
        + " - 326770983274938370" //Sloper39
        + " - 474108121560907787", //sez_

    //#region Emoji
    /**
     * @param EmojiGreenTickString Return ✅ 
     */
    EmojiGreenTickString: "✅",


    /**
     * @param EmojiRedTickString Return ❌ 
     */
    EmojiRedTickString: "❌",


    /**
     * @param EmojiThinkingString Return 🤔 
     */
    EmojiThinkingString: "🤔",
    //#endregion
    //#endregion

    //#region SQL Functions
    db_Model: {
        queue: "Queue",
        users: "Users",
        servers: "Servers",
        instancestats: "Instance_Stats",
        stats: "Stats",
        bannedusers: "BannedUsers"
    },
    log_test: require("./functions/log_test").function,

    SQL_GetResult: require("./functions/SQL_GetResult").function,
    SQL_getBanInfo: require("./functions/SQL_getBanInfo").function,
    SQL_GetUserStats: require("./functions/SQL_GetUserStats").function,
    SQL_addBannedUsers: require("./functions/SQL_addBannedUsers").function,
    SQL_removeBannedUsers: require("./functions/SQL_removeBannedUsers").function,
    //Not finished yet - SQL_addNewUser_In_DB_Users: require("./functions/SQL_addNewUser_In_DB_Users").function,

    /**
     * Instance function
     */
    SQL_Instance_Erase: require("./functions/SQL_Instance_Erase").function,
    //#endregion

    errorMessage: require("./functions/errorMessage").function,
    sendDMToUser: require("./functions/SQL_GetResult").function,
    NotifyUser: require("./functions/NotifyUser").function,
    deleteMyMessage: require("./functions/deleteMyMessage").function,
    CheckInfo_ToBooleanEmoji: require("./functions/SQL_GetResult").function,
    time_Into_String: require("./functions/time_Into_String").function
}