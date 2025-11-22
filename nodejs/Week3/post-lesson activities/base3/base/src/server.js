require('dotenv').config();
const {connectToDatabase} =require('./config/database.js')
const app = require('./app');
const URI=process.env.MONGO_URI;
const PORT = process.env.PORT;
async function start(){
  try{
    await connectToDatabase(URI);
    app.listen(PORT, () => {
    console.log(`Smart Inventory v2 démarré sur http://localhost:${PORT}`);
});

  }catch(e){
    console.error('echec de connection ',e.message);
    process.exit(1);
  }
}
start();


