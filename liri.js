require("dotenv").config();

const keys = require('./keys');
const request = require('request');
const Spotify = require("node-spotify-api");
const Twitter = require("twitter");
const terminalImage = require('terminal-image');
var inquirer = require('inquirer');

var spotify = new Spotify(keys.spotify);
var twitter = new Twitter(keys.twitter);

function getTweets() {
    twitter.get('statuses/user_timeline', {count: 20}, function(error, tweets, response) {
        if(error) throw error;
        tweets.forEach(element => {
            console.log('******************************************');
            console.log(element.created_at);
            console.log(element.text);
        });
    });
};

function getAlbumPoster(imgUrl) {
        var fs = require('fs'),
        request = require('request');
            var download = function(uri, filename, callback){
                request.head(uri, function(err, res, body){
                    console.log('content-type:', res.headers['content-type']);
                    console.log('content-length:', res.headers['content-length']);
                    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
                });
            };
    
        download(imgUrl, 'img.jpeg', function(){
            (async () => {
                console.log(await terminalImage.file('img.jpeg'));
            })();
        });
}

function getSong(searchQuery) {
    spotify.search({type: 'track', query: searchQuery, limit: 20}, function(err, data) {
        if (err) {
            return console.log("Error");
        }
        var tracks = [];
        var trackFetcher = new Promise((resolve, reject) => {
            for(var track of data.tracks.items)
            {
                var trackData = {
                    name : track.artists[0].name + " | " + track.name,
                    value : {
                        name: track.name,
                        album: track.album.name,
                        artist: track.artists[0].name,
                        img: track.album.images[0].url,
                    }
                }
                tracks.push(trackData);
                resolve(tracks);
            }
        });

        trackFetcher.then((tracks) => {
            inquirer.prompt([
                {
                  type: 'list',
                  message: 'Which One?',
                  choices: tracks,
                  name: "track"
              }]).then(function(selected) {
                 getAlbumPoster(selected.track.img);
                

                 setTimeout(function() {
                    console.log('******************************************');
                    console.log("Track: " + selected.track.name);
                    console.log("Album: " + selected.track.album);
                    console.log("Artist: " + selected.track.artist);
                 }, 2000);

            });
        });

    });
};

function getMovie(query) {

    request('http://www.omdbapi.com/?s=' + query + '&plot=full&apikey=ba8ff641', function(error, response, body){
        if (error) {
            return console.log("Error");
        }
        var obj = JSON.parse(body);
        if (obj.Response === 'False') {
            console.log(obj.Error);
        }
        else {
            var movies = [];
            var movieFetcher = new Promise((resolve, reject) => {
                for(var movie of obj.Search)
                {
                    var movieData = {
                        name : movie.Title + " | " + movie.Year,
                        value : {
                            name: movie.Title,
                            year: movie.Year,
                            id: movie.imdbID,
                            poster: movie.Poster,
                        }
                    }
                    movies.push(movieData);
                    resolve(movies);
    
                }
            });

            movieFetcher.then((movies) => {
                inquirer.prompt([
                    {
                      type: 'list',
                      message: 'Which One?',
                      choices: movies,
                      name: "movies"
                  }]).then(function(selected) {
                        request('http://www.omdbapi.com/?i=' + selected.movies.id + '&plot=full&apikey=ba8ff641', function(error, response, body) {
                                 var obj = JSON.parse(body);
                                console.log('******************************************');
                                console.log("Name: " + obj.Title);
                                console.log("Year: " + obj.Year);
                                console.log("IMDB: " + obj.imdbRating);
                                if (obj.Ratings[1] !== void 0) {
                                    console.log("Rotten Tomatoes: " + obj.Ratings[1].Value);
                                }
                                console.log("Country: " + obj.Country);
                                console.log("Language: " + obj.Language);
                                console.log("Plot: " + obj.Plot);
                                console.log("Actors: " + obj.Actors);
                            });
    
                        });
            });
        }

  
    });

};



if (process.argv[2] === 'my-tweets') {
    getTweets();
}
else if (process.argv[2] === 'spotify-this-song') {
    var count = 3;
    var songname = "";
    while (process.argv[count] !== undefined) {
        songname += " " + process.argv[count];
        count++;
    }
    getSong(songname.trim());
    
}
else if (process.argv[2] === 'movie-this') {
    var count = 3;
    var moviename = "";
    while (process.argv[count] !== undefined) {
        moviename += " " + process.argv[count];
        count++;
    }
    getMovie(moviename.trim());
}
else if (process.argv[2] === 'do-what-it-says') {
    console.log('Random');
}
else {
    console.log('Wrong entry');
};






// var url = 'https://api.twitter.com/oauth2/token';
// var tKeys = twitter.options.consumer_key + ":" + twitter.options.consumer_secret;
// var tKeys64 = Buffer.from(tKeys).toString('base64');
// request({
//     url: url,
//     method: 'POST',
//     headers: {
//         "Authorization": "Basic " + tKeys64,
//         "Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"
//     },
//     body: "grant_type=client_credentials"
// }, function(err, response, body) {
//     console.log(body);
// });
