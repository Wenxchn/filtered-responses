require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(cors())
const PORT = 4000
const BASE_URL = 'https://api.fillout.com/v1/api'

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/:formID/filteredResponses', async (req, res) => {
  const apiRes = await axios.get(
    `${BASE_URL}/forms/${req.params.formID}/submissions`,
    {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
    }
  )
  const data = apiRes.data
  const out = new Map()

  for (let response of data.responses) {
    let valid = true
    for (let userInput of req.body) {
      const question = response.questions.find((q) => userInput.id === q.id)
      if (userInput.condition === 'equals') {
        if (question.value !== userInput.value) {
          valid = false
        }
      } else if (userInput.condition === 'does_not_equal') {
        if (question.value === userInput.value) {
          valid = false
        }
      } else if (userInput.condition === 'greater_than') {
        if (question.value < userInput.value) {
          valid = false
        }
      } else if (userInput.condition === 'less_than') {
        if (question.value > userInput.value) {
          valid = false
        }
      }
    }

    if (valid) {
      out.set(response.submissionId, response)
    }
  }

  let outArr = []
  out.forEach((val, key) => {
    outArr.push(val)
  })

  res.json({
    responses: outArr,
    totalResponses: outArr.length,
    pageCount: Math.ceil(outArr.length / 20), //20 responses per page for example
  })
})

app.listen(PORT, async () => {
  console.log('Server is running!')
})
