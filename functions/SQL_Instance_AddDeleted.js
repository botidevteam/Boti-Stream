module.exports = {
    function() {
        const bot = require("../bot")
            , Util = require("../Util")

        bot.con.query(`SELECT * FROM ${Util.db_Model.instancestats}`, (err, results) => {
            /**
             * @param results.StreamMSG_Announced
             * @param results.StreamMSG_Deleted
             * @param results.StatsErrors
             * @param results.StatsGood
             */

            if (err) console.log(err);
            bot.con.query(`UPDATE ${Util.db_Model.instancestats} SET StreamMSG_Deleted = ${Number(results[0].StreamMSG_Deleted) + 1} WHERE ID = 1`)
            console.log(`Successfully added a Deleted on the instance in the ${Util.db_Model.instancestats}`);
        });
    }
}