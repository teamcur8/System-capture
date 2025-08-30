const { MongoClient } = require('mongodb');

class DatabaseManager {
    constructor() {
        this.client = null;
        this.db = null;
        this.users_collection = null;
        this.connectionString = 'mongodb://Echo:Echo123@3.111.215.244:27017/admin?authSource=admin';
    }

    async connect() {
        try {
            console.log("DEBUG: Attempting to connect to MongoDB...");
            this.client = new MongoClient(this.connectionString);
            await this.client.connect();
            
            this.db = this.client.db('Echo');
            this.users_collection = this.db.collection('users');
            
            // Test the connection
            await this.client.db('admin').command({ ping: 1 });
            console.log("DEBUG: MongoDB connection established successfully");
            return true;
        } catch (error) {
            console.error(`ERROR: Failed to connect to MongoDB: ${error}`);
            throw error;
        }
    }

    async saveUserData(email, userData) {
        try {
            console.log(`DEBUG: save_user_data called with email: ${email}`);
            
            // ABSOLUTE SAFETY NET - Extract name from email FIRST
            const extractNameFromEmail = (emailAddr) => {
                try {
                    const username = emailAddr.split('@')[0];
                    const cleanUsername = username.replace(/[._-]/g, ' ');
                    const parts = cleanUsername.split(' ')
                        .filter(part => /^[a-zA-Z]+$/.test(part))
                        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
                    return parts.length > 0 ? parts.join(' ') : "User";
                } catch (e) {
                    return "User";
                }
            };
            
            // Get email-based name as fallback
            const emailBasedName = extractNameFromEmail(email);
            
            // Get full_name from userData
            const providedName = userData.full_name;
            
            // Decision logic - use provided name only if it's actually valid
            let finalName = emailBasedName; // Default to email-based
            
            if (providedName) {
                const nameStr = String(providedName).trim();
                if (nameStr && !['none', 'null', '', '0'].includes(nameStr.toLowerCase())) {
                    finalName = nameStr;
                }
            }
            
            console.log(`DEBUG: Email-based name: '${emailBasedName}'`);
            console.log(`DEBUG: Provided name: '${providedName}'`);
            console.log(`DEBUG: Final name: '${finalName}'`);
            
            // Create document - GUARANTEED to have a valid full_name
            const document = {
                email: email,
                user_id: userData.user_id,
                team_id: userData.team_id,
                manager_id: userData.manager_id,
                company_id: userData.company_id,
                full_name: finalName // This can NEVER be None or null
            };
            
            console.log(`DEBUG: Document to save: ${JSON.stringify(document, null, 2)}`);
            
            // Update if exists, insert if new (upsert)
            const result = await this.users_collection.updateOne(
                { email: email },
                { $set: document },
                { upsert: true }
            );
            
            console.log(`DEBUG: MongoDB result - matched: ${result.matchedCount}, modified: ${result.modifiedCount}`);
            
            return true;
            
        } catch (error) {
            console.error(`ERROR: Exception in save_user_data: ${error}`);
            console.error(`ERROR: Traceback: ${error.stack}`);
            return false;
        }
    }

    async getUserData(email) {
        try {
            console.log(`DEBUG: Getting user data for email: ${email}`);
            const userDoc = await this.users_collection.findOne({ email: email });
            
            if (userDoc) {
                // Remove MongoDB's _id field
                delete userDoc._id;
                
                // FIXED: Ensure full_name is never None/null when retrieved
                if (!userDoc.full_name || ['', 'None', 'null'].includes(String(userDoc.full_name).trim())) {
                    // Extract name from email as fallback
                    try {
                        const username = email.split('@')[0];
                        const cleanUsername = username.replace(/[._-]/g, ' ');
                        const parts = cleanUsername.split(' ')
                            .filter(part => /^[a-zA-Z]+$/.test(part))
                            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
                        userDoc.full_name = parts.length > 0 ? parts.join(' ') : "User";
                        
                        // Update the database with the corrected name
                        await this.users_collection.updateOne(
                            { email: email },
                            { $set: { full_name: userDoc.full_name } }
                        );
                    } catch (e) {
                        userDoc.full_name = "User";
                    }
                }
                
                console.log(`DEBUG: Retrieved user data: ${JSON.stringify(userDoc, null, 2)}`);
                return userDoc;
            } else {
                console.log(`DEBUG: No user found for email: ${email}`);
                return null;
            }
        } catch (error) {
            console.error(`ERROR: Exception in get_user_data: ${error}`);
            return null;
        }
    }

    async userExists(email) {
        try {
            const exists = await this.users_collection.findOne({ email: email }) !== null;
            console.log(`DEBUG: User exists check for ${email}: ${exists}`);
            return exists;
        } catch (error) {
            console.error(`ERROR: Exception in user_exists: ${error}`);
            return false;
        }
    }

    async testConnection() {
        try {
            // Test the connection
            await this.client.db('admin').command({ ping: 1 });
            console.log("DEBUG: MongoDB connection test successful");
            return true;
        } catch (error) {
            console.error(`ERROR: MongoDB connection test failed: ${error}`);
            return false;
        }
    }

    async closeConnection() {
        try {
            if (this.client) {
                await this.client.close();
                console.log("DEBUG: MongoDB connection closed");
            }
        } catch (error) {
            console.error(`ERROR: Error closing MongoDB connection: ${error}`);
        }
    }
}

module.exports = DatabaseManager;
