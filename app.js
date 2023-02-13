require('dotenv').config();

const express = require('express');
const hbs = require('hbs');
const SpotifyWebApi = require("spotify-web-api-node")
// require spotify-web-api-node package here:

const app = express();
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then(data => spotifyApi.setAccessToken(data.body['access_token']))
  .catch(error => console.log('Something went wrong when retrieving an access token', error));

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));


// setting the spotify-api goes here:

// Our routes go here:
app.get("/", (req, res, next) => {
    try {
        res.locals.cssFiles = ["home"]
        res.render("home");
    } catch(error) {
        next(error);
    }
});

app.get("/artist-search", (req, res, next) => {
    spotifyApi
    .searchArtists(req.query.name)
    .then(data => {
        res.locals.cssFiles = ["search-results"]
        res.locals.artists = [];
        for (artist of data.body.artists.items) {
            res.locals.artists.push({
                name: artist.name,
                image: artist.images[0],
                linkUrl: `/albums/${artist.id}`
            });
        }
        res.render("artist-search-results")
    })
    .catch(err => console.log(err));
})

app.get("/albums/:id", (req, res, next) => {
    spotifyApi
    .getArtistAlbums(req.params.id)
    .then(data => {
        res.locals.albums = [];
        for (album of data.body.items) {
            res.locals.albums.push({
                name: album.name,
                image: album.images[0],
                linkUrl: `/album/${album.id}`
            });
        }
        res.render("albums")
    })
    .catch(err => next(err));
})

app.get("/album/:id", (req, res, next) => {
    spotifyApi
    .getAlbumTracks(req.params.id)
    .then(data => {
        res.locals.tracks = [];
        for (track of data.body.items) {
            res.locals.tracks.push({
                number: track.track_number,
                title: track.name,
                audioSrc: track.preview_url,
                downloadLink: track.external_urls.spotify
            });
        }
        res.render("album")
    })
    .catch(err => next(err));
})

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
