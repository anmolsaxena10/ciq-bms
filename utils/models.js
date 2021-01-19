const { Sequelize } = require('sequelize');

const db = process.env.DB_NAME || "ciq";
const db_user = process.env.DB_USER || "postgres";
const db_pass = process.env.DB_PASS || "Abc@123";

const sequelize = new Sequelize(db, db_user, db_pass, {
    host: 'localhost',
    dialect: 'postgres',
    // logging: false
});

try{
    (async () => {await sequelize.authenticate();})();
    console.log('Connection has been established successfully.');
}
catch(error){
    console.error('Unable to connect to the database:', error);
}

const User = sequelize.define('user', {
    id:{
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    name:{
        type: Sequelize.STRING,
        allowNull: false
    },
    email:{
        type: Sequelize.STRING,
        allowNull:false,
        unique: true
    },
    pass_hash:{
        type: Sequelize.STRING,
        allowNull:false
    },
    is_admin:{
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});

const City = sequelize.define('city', {
    id:{
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    name:{
        type: Sequelize.STRING,
        allowNull: false,
        unique: 'cityUnique'
    }
});

const Movie = sequelize.define('movie', {
    id:{
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    name:{
        type: Sequelize.STRING,
        allowNull:false,
        unique: true
    },
    releaseDate:{
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    description:{
        type: Sequelize.STRING
    },
});

const Theatre = sequelize.define('theatre', {
    id:{
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    cityId:{
        type: Sequelize.UUID,
        allowNull: false,
        unique: "TheatreUnique"
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: "TheatreUnique"
    }
});

City.hasMany(Theatre, {
    targetKey: 'cityId'
});
Theatre.belongsTo(City, {sourceKey: 'id'});

const Seat = sequelize.define('seat', {
    id:{
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    price:{
        type: Sequelize.REAL,
        allowNull: false,
        defaultValue: 0
    },
    row:{
        type: Sequelize.STRING,
        allowNull:false,
        unique: "seatUnique"
    },
    number:{
        type: Sequelize.INTEGER,
        allowNull:false,
        unique: "seatUnique"
    },
});

Theatre.hasMany(Seat, {
    unique: "seatUnique"
});
Seat.belongsTo(Theatre);

const Show = sequelize.define('show', {
    id:{
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    startTime:{
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        unique: "showUnique"
    },
});

Movie.hasMany(Show, {
    unique: "showUnique"
});
Theatre.hasMany(Show, {
    unique: "showUnique"
})
Show.belongsTo(Movie);
Show.belongsTo(Theatre);

const Booking = sequelize.define('booking', {
    id:{
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    amount: {
        type: Sequelize.REAL,
        allowNull:false,
        defaultValue: 0
    }
})

User.hasMany(Booking);
Show.hasMany(Booking);
Booking.belongsTo(User);
Booking.belongsTo(Show);

const Booked_Seat = sequelize.define('booked_seat', {
    id:{
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    status: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});

Show.hasMany(Booked_Seat, {
    unique: "bookedSeatUnique"
});
Seat.hasMany(Booked_Seat, {
    unique: "bookedSeatUnique"
});
Booking.hasMany(Booked_Seat, {
    unique: "bookedSeatUnique"
});
Booked_Seat.belongsTo(Show);
Booked_Seat.belongsTo(Seat);
Booked_Seat.belongsTo(Booking);

const syncModels = async function(){
    await sequelize.sync();
}



module.exports = {
    User: User,
    Show: Show,
    Booking: Booking,
    Booked_Seat: Booked_Seat,
    Seat: Seat,
    City: City,
    Movie: Movie,
    Theatre: Theatre,
    syncModels: syncModels
}