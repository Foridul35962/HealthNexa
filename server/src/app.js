import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import errorHandler from './helpers/ErrorHandler.js'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(cookieParser())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get('/', (req, res) => {
    res.send("HealthNexa server is running ...")
})

app.use(errorHandler)

export default app