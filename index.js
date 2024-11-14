const express = require('express');
const path = require('path');
const app = express();

const { MongoClient } = require("mongodb");
// Replace the uri string with your connection string.
const uri =
  "mongodb+srv://lehshak:nbuMKyq49HqqT4is@cluster0.7zhq4.mongodb.net";
const client = new MongoClient(uri);

// mongoimport --uri "mongodb+srv://lehshak:nbuMKyq49HqqT4is@cluster0.7zhq4.mongodb.net" --collection games.game --file steam_games.json --jsonArray

async function connectToDatabase() {
    try {
      await client.connect();
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }
  }
  
connectToDatabase();

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

//to get form perms
app.use(express.urlencoded({ extended: true }));


// Define routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

//make hints for trivia game
function makeHints(game){
    const hints = [];
    if (game.genre) {
      hints.push(`Game genres: ${game.genre}`);
  }
  if (game.developer) {
      hints.push(`Developed by: ${game.developer}`);
  }
  if (game.release_date) {
      hints.push(`Released in: ${new Date(game.release_date).getFullYear()}`);
  }
  if (game.popular_tags) {
    hints.push(`Popular tags: ${game.popular_tags}`);
  } if (game.game_details){
    hints.push(`Details: ${game.popular_tags}`);
  }
  shuffle(hints);

  return hints.slice(0,3);

}

//if an answer is submitted
app.post('/submit-answers', (req, res) => {
  const userAnswers = req.body.answers;
  const correctAnswers = req.body.correctAnswers;

  let score = 0;
  for (let i = 0; i < correctAnswers.length; i++) {
    if (userAnswers[i] === correctAnswers[i]) {
      score++;
    }
  }

  res.render('result', { score: score, total: correctAnswers.length });
});

app.get('/trivia', async (req, res) => {
  try {
    const database = client.db('test');
    const games = database.collection('games.game');

    const questions = [];
    const gameList = await games.find().limit(1000).toArray();

    for (let j = 0; j < 4; j++) {
      // Pick a random game as the correct answer
      const randoGame = gameList[Math.floor(Math.random() * gameList.length)];

      // set of choices with the correct answer inside
      const choicesSet = new Set([randoGame]);
      while (choicesSet.size < 4) {
        const randomFalseGame = gameList[Math.floor(Math.random() * gameList.length)];
        choicesSet.add(randomFalseGame);
      }

      const choices = Array.from(choicesSet);
      shuffle(choices);

      // Generate hints for the correct answer
      const hints = makeHints(randoGame);

      //each question formatted
      questions.push({
        game: randoGame, // Correct answer
        hints: hints,    // Hints array
        choices: choices // Choices array with the correct answer shuffled in
      });
    }

    res.render('trivia', { questions: questions });

  } catch (error) {
    console.error(error);
    res.status(500).send('Game database failed to open.');
  }

});


//game database is in test -> games.game
app.get('/games', async (req, res) => {
  const searchQuery = req.query.search || '';

  try{
      const database = client.db('test');
      const games = database.collection('games.game');

      // if we have a search use that as reference
      let gameList;
      if (searchQuery) {
          gameList = await games.find({ name: { $regex: searchQuery, $options: 'i' } }).limit(30).toArray();
      } else {
          // else get the first 30 movies
          gameList = await games.find().limit(30).toArray();
      }
      res.render('games', { games: gameList, searchQuery });

  } catch (error) {
    console.error(error);
    res.status(500).send('Could not open Game database.');
  }
});



app.get('/movies', async (req, res) => {
    const searchQuery = req.query.search || '';
    try{
        const database = client.db('sample_mflix');
        const movies = database.collection('movies');

        // if we have a search use that as reference
        let movieList;
        if (searchQuery) {
            movieList = await movies.find({ title: { $regex: searchQuery, $options: 'i' } }).limit(30).toArray();
        } else {
            // else get the first 30 movies
            movieList = await movies.find().limit(30).toArray();
        }

        res.render('movies', { movies: movieList, searchQuery });

    } catch (error) {
      console.error(error);
      res.status(500).send('Could not open movie database.');
    }
  });


app.get('/analysis', async (req, res) => {
  try {
    const database = client.db('sample_mflix');
    const movies = database.collection('movies');

    const movieList = await movies.find().limit(3000).toArray();
    const validMovies= movieList.filter(movie => movie.imdb.rating != null && movie.imdb.votes > 0);

    const movie1 = validMovies[Math.floor(Math.random() * validMovies.length)];
    const movie2 = validMovies[Math.floor(Math.random() * validMovies.length)];

    let rating_winner;
    if (movie1.imdb.rating > movie2.imdb.rating ){
      rating_winner = movie1;
    } else{
      rating_winner = movie2;
    }

    res.render('analyze', {movie1: movie1, movie2:movie2, rating_winner: rating_winner});


  } catch (error) {
    console.error(error);
    res.status(500).send('Game database failed to open.');
  }

});



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
