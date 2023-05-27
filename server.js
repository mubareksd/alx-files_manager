import express from 'express';

import router from './routes';

const app = express();
app.use(express.json());

app.use('/', router);

const PORT = parseInt(process.env.PORT, 10) || 5000;

app.listen(PORT, () => {
  console.log(`connected on http://localhost:${PORT}`);
});

export default app;
