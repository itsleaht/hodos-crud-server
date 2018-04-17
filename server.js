const express = require('express')
const fs = require('fs')
const path = require('path')
const fileUpload = require('express-fileupload')
const app = express()

const CHARACTERS_FILE = path.join(__dirname, './data/characters.json')
const PLACES_FILE = path.join(__dirname, './data/places.json')

app.set('port', (process.env.PORT || 3000))

app.use('/', express.static(__dirname))
app.use(express.json())       // to support JSON-encoded bodies
app.use(fileUpload())

// Additional middleware which will set headers that we need on each request.
app.use( (req, res, next) => {
  // Set permissive CORS header - this allows this server to be used only as
  // an API server in conjunction with something like webpack-dev-server.
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE')

  // Disable caching so we'll always get the latest comments.
  res.setHeader('Cache-Control', 'no-cache')
  next()
})

app.get('/api', function (req, res) {
  res.send('API on fleek !')
})

/* ------------ */
/* View actions */
/* ------------ */
app.get('/api/characters', (req, res) => {
  fs.readFile(CHARACTERS_FILE, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    res.json(JSON.parse(data))
  })
})

app.get('/api/places', (req, res) => {
  fs.readFile(PLACES_FILE, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    res.json(JSON.parse(data))
  })
})

app.get('/api/characters/:id', (req, res) => {
  fs.readFile(CHARACTERS_FILE, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    const json = JSON.parse(data)
    const character = utils.findOneById(req.params.id, json)
    res.json(character.object)
  })
})

app.get('/api/places/:id', (req, res) => {
  fs.readFile(PLACES_FILE, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    const json = JSON.parse(data)
    const place = utils.findOneById(req.params.id, json)
    res.json(place.object)
  })
})

/* ------------ */
/* Edit actions */
/* ------------ */
app.patch('/api/characters/edit/:id', (req, res) => {
  fs.readFile(CHARACTERS_FILE, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    const json = JSON.parse(data)
    const bodyRequest = req.body
    const formerCharacter = utils.findOneById(req.params.id, json)

    const newCharacter = {
      id: formerCharacter.object.id,
      name: bodyRequest.name,
      type: bodyRequest.type,
      role: bodyRequest.role,
      place: bodyRequest.place,
      description: bodyRequest.description,
      family: bodyRequest.family
    }

    json[formerCharacter.index] = newCharacter

    fs.writeFile(CHARACTERS_FILE, JSON.stringify(json, null, 4), function(err) {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      res.json(json)
    })
  })
})

app.patch('/api/places/edit/:id', (req, res) => {
  fs.readFile(PLACES_FILE, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    const json = JSON.parse(data)
    const bodyRequest = req.body
    const formerPlace = utils.findOneById(req.params.id, json)

    const newPlace = {
      id: formerPlace.object.id,
      name: bodyRequest.name,
      chapters: bodyRequest.chapters
    }

    json[formerPlace.index] = newPlace

    fs.writeFile(PLACES_FILE, JSON.stringify(json, null, 4), function(err) {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      res.json(json)
    })
  })
})

/* ------------ */
/* Create actions */
/* ------------ */
app.post('/api/characters/create', (req, res) => {

  fs.readFile(CHARACTERS_FILE, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    const characters = JSON.parse(data)
    
    const newId = characters.length > 0 ? characters[characters.length - 1].id + 1 : 0
    const bodyRequest = req.body


    var newCharacter = {
      id: newId,
      name: bodyRequest.name,
      type: bodyRequest.type,
      role: bodyRequest.role,
      place: bodyRequest.place,
      description: bodyRequest.description,
      family: bodyRequest.family
    }

    characters.push(newCharacter)

    
    if (req.files) {
        const profileImageName = charactersFilesNames[0]
        const mapImagename = charactersFilesNames[1]
        if (req.files[profileImageName]) {
            const profileImage = req.files[profileImageName]
            profileImage.mv('public/assets/images/'+profileImageName+'/'+newId+'.jpg', function(err) {
                if (err)
                    console.log(res.status(500).send(err))
            })
        }

        if (req.files[mapImagename]) {
            const mapImage = req.files[mapImagename]
            mapImage.mv('public/assets/images/'+mapImagename+'/'+newId+'.jpg', function(err) {
                if (err)
                    console.log(res.status(500).send(err))
            })
        }
    }

    fs.writeFile(CHARACTERS_FILE, JSON.stringify(characters, null, 4), function(err) {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      res.json(characters)
    })
  })
})

app.post('/api/places/create', (req, res) => {

  fs.readFile(PLACES_FILE, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    const places = JSON.parse(data)
    const newId = places.length > 0? places[places.length - 1].id + 1 : 0
    const bodyRequest = req.body

    var newPlace = {
      id: newId,
      name: bodyRequest.name,
      chapters: bodyRequest.chapters
    }

    places.push(newPlace)

    fs.writeFile(PLACES_FILE, JSON.stringify(places, null, 4), function(err) {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      res.json(places)
    })
  })
})

/* ------------ */
/* Delete actions */
/* ------------ */
app.delete('/api/characters/delete/:id', function(req, res) {
  fs.readFile(CHARACTERS_FILE, function(err, data) {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    const json = JSON.parse(data);
    const character = utils.findOneById(req.params.id, json)

    json.splice(character.index, 1)

    fs.writeFile(CHARACTERS_FILE, JSON.stringify(json, null, 4), function(err) {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      res.json(json);
     })
  })
})

app.delete('/api/places/delete/:id', function(req, res) {
  fs.readFile(PLACES_FILE, function(err, data) {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    const json = JSON.parse(data);
    const place = utils.findOneById(req.params.id, json)

    json.splice(place.index, 1)

    fs.writeFile(PLACES_FILE, JSON.stringify(json, null, 4), function(err) {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      res.json(json);
     })
  })
})
/* ------------ */
/* Utils */
/* ------------ */
const utils = {
  findOneById: (id, json) => {
    for (let i = 0; i < json.length; i++) {
      if (json[i].id === Number(id)) {
        return {
          index: i,
          object: json[i]
        }
      }
    }
  }
}

const charactersFilesNames = [
    'profile',
    'map'
]

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
