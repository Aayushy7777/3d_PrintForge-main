import 'dotenv/config';
import { createApp } from './app.js';

const app = createApp();

const PORT = 5001;
app.listen(PORT, () => console.log('Server listening on port ' + PORT));
