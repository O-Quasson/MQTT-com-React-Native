import express from 'express';
import cors from 'cors';
import { Sequelize, Op } from 'sequelize';

import diceModel from './dadosModel.js'

const porta = 3000;
const app = express();

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db.sqlite'
});

const dice = await diceModel(sequelize);

app.use(express.json());
app.use(cors());

app.get('/get', async (req, res) => {

    const dados = await dice.findAll();

    if((dados)&&(dados.length>0)){
        res.send(dados);
    }else{

        let nachos = [
            //gg gng, eu n faço ideia do que eu to fazendo, mas potencialmente funciona
            {
                id: '00011',
                luz: false,
                temperatura: 27,
                umidade: 25,
            }
        ]

        res.send(nachos);
    }

    
})

app.post('/salva', async (req, res) => {

    const truta = { 
        luz: req.body.luz,
        temperatura: req.body.temperatura,
        umidade: req.body.umidade
    }

    const salvo = dice.create({
        luz: truta.luz,
        temperatura: truta.temperatura,
        umidade: truta.umidade
    })

    res.send(salvo)
})

app.listen(porta, async () => {
    await sequelize.sync();
    await sequelize.authenticate();

    let antes = new Date(Date.now());
    antes.setHours(antes.getHours() - 2);

    await dice.destroy({
        where: {
            createdAt: {
                [Op.lt]: antes
            }
        }
    })

    console.log(`Api funcionando, i guess: http://localhost:${porta}`);
})

