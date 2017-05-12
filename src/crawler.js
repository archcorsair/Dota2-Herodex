const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const got = require('got')
const cheerio = require('cheerio')

const app = express()
app.disable('x-powered-by')
app.use(bodyParser.json())
app.use(morgan('dev'))

let loading = true

// Kill the CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});

app.get('/heroes', (req, res) => {
  if (loading) {
    res.json('Data is still loading, try again.')
  } else {
    res.send(allHeroes)
  }
})

app.get('/hero/:name', getHero)

app.listen(4000, () => {
  console.log('Listening...')
})

let heroModel = {}
const allHeroes = {
  heroes: [],
}
const _urlMap = {}

function heroModelReset() {
  heroModel = {
    name: '',
    stats: {},
    abilites: [],
  }
}

async function getHero(req, res) {
  heroModelReset()
  try {
    const data = await got(_urlMap[req.params.name])
    heroModel.name = req.params.name
    const $ = cheerio.load(data.body)
    $('#overviewPrimaryStats > div')
      .each((i, el) => {
        const statValue = el.children[0].data
        if (el.attribs.id === 'overview_IntVal') {
          heroModel.stats.intellect = statValue
        }
        if (el.attribs.id === 'overview_AgiVal') {
          heroModel.stats.agility = statValue
        }
        if (el.attribs.id === 'overview_StrVal') {
          heroModel.stats.strength = statValue
        }
        if (el.attribs.id === 'overview_AttackVal') {
          heroModel.stats.attack = statValue
        }
        if (el.attribs.id === 'overview_SpeedVal') {
          heroModel.stats.speed = statValue
        }
        if (el.attribs.id === 'overview_DefenseVal') {
          heroModel.stats.armor = statValue
        }
      })
      $('.overviewAbilityRowDescription')
        .each((i, el) => {
          heroModel.abilites.push({
            name: el.children[1].children[0].data,
            description: el.children[3].children[0].data
          })
        })
      res.send(heroModel)
  } catch (e) {
    console.log('error:', e)
    res.status(404).json('Hero not found, make sure you are using the correct case and spelling')
  }

  // const hero = {}
  // res.send(hero)
}

// Get hero data
(async function getHeroData() {
  const data = await got('http://www.dota2.com/heroes/')
  const $ = cheerio.load(data.body)
  $('.heroIcons > a').each((i, el) => {
    const dirty = el.attribs.href.substring(26, el.attribs.href.length - 1)
    const heroName = el.attribs.href
      .substring(26, el.attribs.href.length - 1)
      .replace(/_/g, ' ')
    allHeroes.heroes.push({ name: heroName, url: el.attribs.href })
    _urlMap[dirty] = el.attribs.href
  })
  if (allHeroes.heroes.length) {
    loading = false
  }
})();
