const {Sequelize, DataTypes, Op} = require('sequelize');

async function sequelizeInit() {
    const sequelize = new Sequelize('UserManagement','postgres', 'admin', // databasename, dbuser, dbuserpassword 
    {
        host: 'localhost',
        dialect: "postgres", // you can use other database too but provide proper  serializing tool like pg-hstore 
        define: {
            freezeTableName: true, // default table name will be pluralrized ex: if tablename was user it will become users to prevent it 
            timeStamps: false // to not to add createdAt, updatedAt
        }
    });
    await sequelize.authenticate();
    
    const User = sequelize.define('user', // table name 
    {
        userId: {
            type: DataTypes.INTEGER, // data type
            autoIncrement:true,
            primaryKey: true
        },
        userName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userAge: {
            type: DataTypes.INTEGER,
            validate: {
                min: 18
            }
        },
        userOccupation: {
            type: DataTypes.STRING,
            defaultValue: "VIP"
        },
        userCountry: {
            type: DataTypes.STRING,
            defaultValue: null
        },
    });

    await User.sync( {
        alter: true // if schema changes in future table will be altered
    });

    // insert a data to the table 
    let sangar = await User.create({
        userName: "sangar",
        userAge: 23,
        userOccupation: 'SDE',
        userCountry: "INDIA",
    });
    
   


    let users = await User.bulkCreate([
        {
            userName: "anand",
            userAge: 24,
            userOccupation: 'SDE',
            userCountry: "INDIA",
        },
        {
            userName: "renjith",
            userAge: 23,
            userOccupation: 'SDE',
            userCountry: "INDIA",
        },
        {
            userName: "hari",
            userAge: 23,
            userOccupation: 'SDE',
            userCountry: "INDIA",
        }
    ], {
        validate:true // if not validations will not be checked
    });
    console.dir(sangar, {depth: null}); // prints enitre stamp
    console.dir(users,{depth: null});// prints enitre stamp for array
    console.dir(sangar.toJSON(), {depth: null}); // prints only data
    users.forEach(  user => console.dir(user.toJSON(),{depth: null} ));// prints only data
    
    // for increamenting specific user's particular attribute
    await User.increment({userAge: 2}, { where: {
        userAge:{
            [Op.gt]: 23
        }
    }});
    
    let dbUsers = await User.findAll({where:{
        userAge:{
            [Op.gt] : 23
        }
    }});
    dbUsers.forEach(  user => console.dir(user.toJSON(),{depth: null} ));// people who have age above 23 will have 2 more added age

    // update userId 1
    let beforeUpdate = await User.findOne({
        where: {
            userId: 1
        }
    });
    console.log("beforeUpdate", beforeUpdate.toJSON());

    await User.update({ userCountry : "USA"}, {where: {
        userId: 1
    }});

    let afterUpdate = await User.findOne({
        where: {
            userId: 1
        }
    });
    console.log("afterUpdate", afterUpdate.toJSON());



    
}

sequelizeInit();