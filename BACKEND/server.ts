import express from 'express'
import cors from 'cors'
import multer from 'multer'
import csvToJson from 'convert-csv-to-json'

const app = express()
const port = process.env.PORT ?? 3000

// Como nosotros no queremos almacenar el archivo sino solo tenerlo en memoria
// usamos multer y le indicamos que usamos la memoria
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// como no sabemos los tipos del csv le decimos que sea un array de objetos de dos valores string
let userData:Array<Record<string,string>> = []

app.use(cors()) // Enable CORS

app.post('/api/files', upload.single('file') ,async (req, res) => {
  // 1. Extract file from request
  const { file } = req
  // 2. Validate that we have file
  if (!file) {
    return res.status(500).json({ mesage: 'File is required' })
  }
  // 3. Validate the mimetype <- tipo de archivo csv
  if (file.mimetype !== 'text/csv') {
    return res.status(500).json({ mesage: 'File must be CSV' })
  }
  // 4. Transform the File (Buffer) to string
  let json: Array<Record<string,string>>
  try {
    const rawCsv = Buffer.from(file.buffer).toString('utf-8')
    console.log(rawCsv);
    // 5. Transform string (csv) to JSON 
    json = csvToJson.fieldDelimiter(',').csvStringToJson(rawCsv)
  } catch (error) {
    return res.status(500).json({ mesage: 'Error parsing the file' })
  }
  // 6. Save the JSON to db (or memory)
  userData = json
  // 7. Return 200 with the message and the JSON
  res.status(200).send({ data: json,message: 'El archivo se cargó correctamente' })
})

app.get('/api/users', async (req, res) => {
  // 1. Extract the query param 'q' from the request
  const { q } = req.query
  // 2. Validate that we have the query param
  if (!q) {
    return res.status(500).json({ message: 'Query param q is required'})
  }
  
  if (Array.isArray(q)) {
    return res.status(500).json({ message: 'Query param q must be a string'})
   }

  // 3. Filter the data from db (or memory) with the query param
  const search = q.toString().toLowerCase()
  
  const filteredData = userData.filter(row => {
    return Object
      .values(row)
      .some(value => value.toLocaleLowerCase().includes(search))
  })
  // 4. Return 200 with the filtered data
  return res.status(200).send({ data: filteredData })  
})

app.listen(port, () => {
  console.log(`Server on port: http://localhost:${port}`);  
})