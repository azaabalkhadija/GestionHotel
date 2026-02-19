const express = require('express');

const mongoose= require('mongoose')
require('dotenv').config()

const UsersRoutes = require ('./routes/account')
const RoomsRoutes = require ('./routes/Admin/chambre')
const ReservationsReception =require('./routes/Receptionist/reservation')
const ClientRoutes = require('./routes/Client/reservation')
const ClientAdmin =require('./routes/Admin/client')
const Facture = require('./routes/Receptionist/facture')

mongoose.connect(`${process.env.MONGOOSE}`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


const app = express();
app.use(express.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');

  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});


app.use('/api/users', UsersRoutes );
app.use('/api/rooms', RoomsRoutes);
app.use('/api/admin',ClientAdmin)
app.use('/api/reception/reservations',ReservationsReception)
app.use('/api/factures',Facture)
app.use('/api/client', ClientRoutes );

module.exports = app;