const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()

const PERSONNAGES_FILE = path.join(__dirname, './data/personnages.json')
const LIEUX_FILE = path.join(__dirname, './data/lieux.json')

app.set('port', (process.env.PORT || 3000))

app.use('/', express.static(__dirname))
app.use(express.json())       // to support JSON-encoded bodies

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
app.get('/api/personnages', (req, res) => {
  fs.readFile(PERSONNAGES_FILE, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    res.json(JSON.parse(data))
  })
})

app.get('/api/lieux', (req, res) => {
  fs.readFile(LIEUX_FILE, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    res.json(JSON.parse(data))
  })
})

app.get('/api/personnages/:id', (req, res) => {
  fs.readFile(PERSONNAGES_FILE, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    const json = JSON.parse(data)
    const personnage = utils.findOneById(req.params.id, json)
    res.json(personnage.object)
  })
})

app.get('/api/lieux/:id', (req, res) => {
  fs.readFile(LIEUX_FILE, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    const json = JSON.parse(data)
    const lieu = utils.findOneById(req.params.id, json)
    res.json(lieu.object)
  })
})

/* ------------ */
/* Edit actions */
/* ------------ */
app.patch('/api/personnages/edit/:id', (req, res) => {
  fs.readFile(PERSONNAGES_FILE, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    const json = JSON.parse(data)
    const bodyRequest = req.body
    const formerPersonnage = utils.findOneById(req.params.id, json)

    const newPersonnage = {
      id: formerPersonnage.object.id,
      name: bodyRequest.name,
      type: bodyRequest.type,
      role: bodyRequest.role,
      place: bodyRequest.place,
      description: bodyRequest.description,
      family: bodyRequest.family
    }

    json[formerPersonnage.index] = newPersonnage

    fs.writeFile(PERSONNAGES_FILE, JSON.stringify(json, null, 4), function(err) {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      res.json(json)
    })
  })
})

app.patch('/api/lieux/edit/:id', (req, res) => {
  fs.readFile(LIEUX_FILE, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    const json = JSON.parse(data)
    const bodyRequest = req.body
    const formerLieu = utils.findOneById(req.params.id, json)

    const newLieu = {
      id: formerLieu.object.id,
      name: bodyRequest.name,
      chapters: bodyRequest.chapters
    }

    json[formerLieu.index] = newLieu

    fs.writeFile(LIEUX_FILE, JSON.stringify(json, null, 4), function(err) {
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
app.post('/api/personnages/create', (req, res) => {

  fs.readFile(PERSONNAGES_FILE, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    const personnages = JSON.parse(data)

    const newId = personnages.length > 0 ? personnages[personnages.length - 1].id + 1 : 0
    const bodyRequest = req.body

    var newPersonnage = {
      id: newId,
      name: bodyRequest.name,
      type: bodyRequest.type,
      role: bodyRequest.role,
      place: bodyRequest.place,
      description: bodyRequest.description,
      family: bodyRequest.family
    }

    personnages.push(newPersonnage)

    fs.writeFile(PERSONNAGES_FILE, JSON.stringify(personnages, null, 4), function(err) {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      res.json(personnages)
    })
  })
})

app.post('/api/lieux/create', (req, res) => {

  fs.readFile(LIEUX_FILE, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    const lieux = JSON.parse(data)
    const newId = lieux.length > 0? lieux[lieux.length - 1].id + 1 : 0
    const bodyRequest = req.body

    var newLieu = {
      id: newId,
      name: bodyRequest.name,
      chapters: bodyRequest.chapters
    }

    lieux.push(newLieu)

    fs.writeFile(LIEUX_FILE, JSON.stringify(lieux, null, 4), function(err) {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      res.json(lieux)
    })
  })
})

/* ------------ */
/* Delete actions */
/* ------------ */
app.delete('/api/personnages/delete/:id', function(req, res) {
  fs.readFile(PERSONNAGES_FILE, function(err, data) {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    const json = JSON.parse(data);
    const personnage = utils.findOneById(req.params.id, json)

    json.splice(personnage.index, 1)

    fs.writeFile(PERSONNAGES_FILE, JSON.stringify(json, null, 4), function(err) {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      res.json(json);
     })
  })
})

app.delete('/api/lieux/delete/:id', function(req, res) {
  fs.readFile(LIEUX_FILE, function(err, data) {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    const json = JSON.parse(data);
    const lieu = utils.findOneById(req.params.id, json)

    json.splice(lieu.index, 1)

    fs.writeFile(LIEUX_FILE, JSON.stringify(json, null, 4), function(err) {
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

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
