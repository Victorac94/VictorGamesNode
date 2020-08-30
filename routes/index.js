var express = require('express');
var router = express.Router();
const axios = require('axios');

const createDeck = require('../utilities/createDeck');

// Putting the routes inside this function will allow us to use socket.io in these routes
const returnRouter = function (app) {

  /* GET home page. */
  router.get('/', function (req, res, next) {
    res.send('Hello there');
  });

  /* New game */
  router.get('/new-game/:roomId', async (req, res) => {
    try {
      let io = app.get("io");
      let users = io.sockets.adapter.rooms[req.params.roomId]; // Contains room's users' ID
      const cards = createDeck(JSON.parse(req.headers['deck-config']));
      let index = 0;

      console.log(JSON.parse(req.headers['deck-config']))
      console.log(cards);

      // Create a new deck of cards and shuffle it
      const apiResponse = await axios.get(`https://deckofcardsapi.com/api/deck/new/shuffle/?cards=${cards}`);
      console.log(apiResponse.data)

      // Draw cards from the deck (one for each user)
      const playingCards = await axios.get(`https://deckofcardsapi.com/api/deck/${apiResponse.data.deck_id}/draw/?count=${apiResponse.data.remaining}`);

      console.log(playingCards.data)

      // If error while drawing cards from external API
      if (!playingCards.data.success) throw 'Error while getting the cards';

      // Send a card to each connected user
      Object.keys(users.sockets).forEach(userId => {

        io.to(userId).emit('new-card', {
          card: playingCards.data.cards[index],
          users: users,
          deckId: apiResponse.data.deck_id
        });

        index++;
      })

      // Send response to admin user
      res.status(200).json('Cards sent');

    } catch (err) {
      console.log('Error: ', err);
      res.json(err);
    }
  });

  router.get('/next-round/:roomId/:deck_id', async (req, res) => {
    try {
      let io = app.get("io");
      let users = io.sockets.adapter.rooms[req.params.roomId]; // Contains room's users' ID
      let index = 0;

      // Shuffle existing deck
      const shuffledDeck = await axios.get(`https://deckofcardsapi.com/api/deck/${req.params.deck_id}/shuffle/`);

      // Draw cards from the deck (one for each user)
      const playingCards = await axios.get(`https://deckofcardsapi.com/api/deck/${shuffledDeck.data.deck_id}/draw/?count=${shuffledDeck.data.remaining}`);

      // If error while drawing cards from external API
      if (!playingCards.data.success) throw 'Error while getting the cards';

      // Send a card to each connected user
      Object.keys(users.sockets).forEach(userId => {

        io.to(userId).emit('new-card', {
          card: playingCards.data.cards[index],
          users: users,
          deckId: playingCards.data.deck_id
        });

        index++;
      })

      // Send response to admin user
      res.json('Cards sent');

    } catch (err) {
      console.log('Error: ', err);
      res.json(err);
    }
  });

  return router;
};

module.exports = returnRouter;
