const {Sequelize, DataTypes, Op} = require('sequelize');

async function sequelizeInit() {
    const sequelize = new Sequelize('UserManagement','postgres', 'admin', // databasename, dbuser, dbuserpassword 
    {
        host: 'localhost',
        dialect: "postgres", // you can use other database too but provide proper  serializing tool like pg-hstore 
        define: {
            freezeTableName: true, // default table name will be pluralrized ex: if tablename was user it will become users to prevent it 
            timeStamps: false, // to not to add createdAt, updatedAt
            // paranoid: true  // will be use full to mark the record as the deleted instead of deleting the actual data from the database      
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
            defaultValue: null,
            get() {
                return `Country -${this.getDataValue('userCountry')}` // only a virtual representation
            },
            // determines how data is written in the db
            // set(value) {
            //     this.setDataValue('userCountry',`country=${value}` )
            // }
        },
        aboutUser: {
            type: DataTypes.VIRTUAL, // custom field built as an overlay and not stored in database. mostly used for combinations 
            get() {
                return `${this.userName}_${this.userAge}`
            }
        }
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
    
    // for inserting multiple data at once
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
    
    // for seletct * on a condition
    let dbUsers = await User.findAll({where:{
        userAge:{
            [Op.gt] : 23
        }
    }});
    dbUsers.forEach(user => console.dir(user.toJSON(),{depth: null} ));// people who have age above 23 will have 2 more added age

    // find a single data
    let beforeUpdate = await User.findOne({
        where: {
            userId: 1
        }
    });
    console.log("beforeUpdate", beforeUpdate.toJSON());

    // actual update statement
    await User.update({ userCountry : "USA"}, {where: {
        userId: 1
    }});

    let afterUpdate = await User.findOne({
        where: {
            userId: 1
        }
    });
    console.log("afterUpdate", afterUpdate.toJSON());

    // to avoid tojson use raw:true
    let usingRaw =  await User.findOne({
        where: {
            userId: 1
        },
        raw: true
    });
    console.log(usingRaw);

    //you can query using findbypk alone
    let pkUser = await User.findByPk(2);
    console.log(pkUser.toJSON());

    // find and if not found create the data
    let findOrCreate = await User.findOrCreate({
        where: {
            userName: "dummy",
        },
        defaults: {
            userName: "dummy",
            userAge: 23,
            userCountry: "India",
            userOccupation: "Sde"
        }
    });
    console.log(findOrCreate);
    // returns a result data inserted / found and it returns a boolean for created new
    let [ result, created ] = findOrCreate; 
    console.log(result.toJSON()) 
    console.log(created) 

    // find and count all
    let { count, rows } = await User.findAndCountAll({
        where: {
            userAge: {
                [Op.and]: {
                    [Op.gte]: 23,
                    [Op.lte]: 25
                } 
            },
        },
        raw:true
    });
    console.log(rows);
    console.log(count);

    // GETTERS AND SETTERS: 
    // check the field userCountry in the model
    let getterUser = await User.findByPk(1);
    console.log(`getter value ---> ${getterUser.userCountry}`);
    // you can uncomment setter func in the userCountry in the model to see the behaviour of setters

    // virtual fields userandage field in the model for more details 
    // dont use raw it will remove the property from the model object
    let virutalTest = await User.findByPk(1);
    console.log(virutalTest.toJSON())
    console.log(virutalTest.aboutUser)

    // custom queries
    let customQuery =  await sequelize.query("SELECT * FROM public.user")
    console.log('CustomQuery --> ');
    console.log(customQuery);
    // plain and model specific
    let plainAndModel =  await sequelize.query("SELECT * FROM public.user",{ model: User, plain: true});
    console.log(plainAndModel)
    
    // custom logging
    await sequelize.query("SELECT * FROM public.user",{ logging: function () { console.log("logging") }});
}

sequelizeInit();