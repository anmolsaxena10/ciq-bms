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
    theatreId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: "seatUnique"
    }
});

Theatre.hasMany(Seat, {
    targetKey: 'theatreId'
});
Seat.belongsTo(Theatre, {sourceKey: 'id'});

const Show = sequelize.define('show', {
    id:{
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    startDatetime:{
        type: Sequelize.DATE,
        allowNull: false,
        unique: "showUnique"
    },
    movieId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: "showUnique"
    },
    theatreId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: "showUnique"
    }
});

Movie.hasMany(Show, {
    targetKey: 'movieId'
});
Theatre.hasMany(Show, {
    targetKey: 'theatreId'
})
Show.belongsTo(Movie, {sourceKey: 'id'});
Show.belongsTo(Theatre, {sourceKey: 'id'});

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
    },
    userId: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    showId: {
        type: Sequelize.UUID,
        allowNull: false,
    }
})

User.hasMany(Booking, {
    targetKey: 'userId'
});
Show.hasMany(Booking, {
    targetKey: 'showId'
});
Booking.belongsTo(User, {sourceKey: 'id'});
Booking.belongsTo(Show, {sourceKey: 'id'});

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
    },
    showId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: "bookedSeatUnique"
    },
    seatId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: "bookedSeatUnique"
    },
    bookingId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: "bookedSeatUnique"
    }
});

Show.hasMany(Booked_Seat, {
    targetKey: 'showId'
});
Seat.hasMany(Booked_Seat, {
    targetKey: 'seatId'
});
Booking.hasMany(Booked_Seat, {
    targetKey: 'bookingId'
});
Booked_Seat.belongsTo(Show, {sourceKey: 'id'});
Booked_Seat.belongsTo(Seat, {sourceKey: 'id'});
Booked_Seat.belongsTo(Booking, {sourceKey: 'id'});

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