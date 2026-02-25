import express from 'express';
import cors from 'cors';
import { initDb } from './db';
import routes from './routes';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Initialize Database
initDb();

app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('Gantt Backend is running!');
});


app.listen(port, "127.0.0.1", () => {
  console.log(`Server is running at http://localhost:${port}`);
});
