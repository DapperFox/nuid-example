const fetch = require('node-fetch')

const nuidApiKey = process.env.NUID_API_KEY
const nuidAuthApi = 'https://auth.nuid.io'

function nuidGet (path) {
  return fetch(`${nuidAuthApi}${path}`, {
    method: 'GET',
    headers: {
      'X-API-Key': nuidApiKey,
      'Content-Type': 'application/json'
    }
  })
}

function nuidPost (path, body) {
  return fetch(`${nuidAuthApi}${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'X-API-Key': nuidApiKey,
      'Content-Type': 'application/json'
    }
  })
}

async function register (req, res) {
  const {
    email,
    credential,
    firstName,
    lastName,
    phone
  } = req.body
  const credentialRes = await nuidPost('/credential', {
    'nuid.credential/verified': credential
  })
  const nuidBody = await credentialRes.json()
  const nuid = nuidBody['nu/id']

  // TODO: Use an actual DB here
  const saveRes = await fetch(process.env.SHEETY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user: {
        firstName,
        lastName,
        email,
        nuid,
        phone
      }
    })
  })
  const sheetSave = await saveRes.json()

  res.send(nuid)
}

async function challenge (req, res) {
  const { email } = req.body

  // TODO: Use an actual DB here
  const userResponse = await fetch(`${process.env.SHEETY_URL}/4`)
  const { user } = await userResponse.json()

  if (!user) {
    res.sendStatus(401)
    return
  }

  const credentialRes = await nuidGet(`/credential/${user.nuid}`)
  const credentialBody = await credentialRes.json()
  const challengeRes = await nuidPost('/challenge', credentialBody)
  const challengeBody = await challengeRes.json()
  const challengeJwt = challengeBody['nuid.credential.challenge/jwt']

  res.send({ challengeJwt: challengeJwt })
}

async function login (req, res) {
  const { email, proof, challengeJwt } = req.body

  // TODO: Use an actual DB here
  const userResponse = await fetch(`${process.env.SHEETY_URL}/4`)
  const { user } = await userResponse.json()

  console.log(proof, challengeJwt)
  if (!user) {
    res.sendStatus(401)
    return
  }
  const verifyRes = await nuidPost('/challenge/verify', {
    'nuid.credential.challenge/jwt': challengeJwt,
    'nuid.credential/proof': proof
  })
  console.log(verifyRes.ok)
  if (verifyRes.ok) {
    res.sendStatus(201)
  }
  else {
    res.sendStatus(401)
  }
}

module.exports = {
  challenge,
  login,
  register,
}
