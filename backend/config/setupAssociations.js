// backend/config/setupAssociations.js

const User = require('../models/User');
const Sector = require('../models/Sector');
const UserSector = require('../models/UserSector');

const setupAssociations = () => {
    
    User.belongsToMany(Sector, { 
        through: UserSector, 
        as: 'Sectors', 
        foreignKey: 'userId' 
    });

    Sector.belongsToMany(User, { 
        through: UserSector, 
        as: 'Users', 
        foreignKey: 'sectorId' 
    });
    
    console.log('Sequelize Associations setup complete.');
};

module.exports = setupAssociations;