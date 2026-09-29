import 'dotenv/config'
import { app } from './app.js'

const port = Number(process.env.PORT ?? 4174)

app.listen(port, () => {
  console.log(`BhashaSetu API listening on http://localhost:${port} (Demo Mode)`)
})