export default {
    async getUser(discordId, db) {
        try {
            const response = await db.query(`SELECT * FROM users WHERE discord_id = $1`, [discordId]);

            return response.rows[0];
        } catch (error) {
            console.error(error.message);
        }
    },
    async getParty(partyName, db) {
        try {
            const response = await db.query(`SELECT * FROM parties WHERE name = $1`, [partyName]);

            return response.rows[0];
        } catch (error) {
            console.error(error.message);
        }
    }
}