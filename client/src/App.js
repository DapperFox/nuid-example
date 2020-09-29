import React, { useState } from 'react'
import { InputGroup, Button } from '@blueprintjs/core'
import styled from 'styled-components'
import Zk from '@nuid/zk'

function App() {
  const [userInfo, setUserInfo] = useState()

  async function onSubmit (event) {
    event.preventDefault()
    const {
      email,
      firstName,
      lastName,
      password,
      phone,
    } = userInfo
    const verifiedCredential = Zk.verifiableFromSecret(password)
    const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        credential: verifiedCredential,
        email,
        firstName,
        lastName,
        phone,
      })
    })
  }

  async function onLogin (event) {
    const { email, password } = userInfo
    event.preventDefault()
    const challengeRes = await fetch(`${process.env.REACT_APP_SERVER_URL}/challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email
      })
    })

    const challengeBody = await challengeRes.json()
    const challengeJwt = challengeBody.challengeJwt
    const payloadBase64 = challengeJwt.split('.')[1];
    const json = Buffer.from(payloadBase64, 'base64').toString();
    const challengeClaims = JSON.parse(json);

    const proof = Zk.proofFromSecretAndChallenge(password, challengeClaims)

    const loginRes = await fetch(`${process.env.REACT_APP_SERVER_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        proof,
        challengeJwt
      })
    })
  }

  return (
    <div>
      <main>
        <FormContainer onSubmit={onSubmit}>
          <StyledInput
            onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
            id='firstName'
            placeholder='First Name'
          />
          <StyledInput
            onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
            id='lastName'
            placeholder='Last Name'
          />
          <StyledInput
            onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
            id='phone'
            type='tel'
            placeholder='Phone'
          />
          <StyledInput
            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
            id='email'
            type='email'
            placeholder='bobsaget@fullhouse.com'
          />
          <StyledInput
            onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
            id='password'
            placeholder='Add an awesome password'
            type='password'
          />
          <Button type='submit'>Register</Button>
        </FormContainer>
        <FormContainer onSubmit={onLogin}>
          <StyledInput
            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
            id='email'
            type='email'
            placeholder='bobsaget@fullhouse.com'
          />
          <StyledInput
            onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
            id='password'
            placeholder='Add an awesome password'
            type='password'
          />
          <Button type='submit'>Login</Button>
        </FormContainer>
      </main>
    </div>
  )
}

const FormContainer = styled.form`
  width: 30%;
  margin: 10rem auto;
  padding: 2rem;
  background: #F2F2F2;
`

const StyledInput = styled(InputGroup)`
  margin: 2rem 0;
`

export default App
