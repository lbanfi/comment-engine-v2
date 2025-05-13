import express from 'express';
import { scheduleJobs } from './scheduler.js';
import {
  getCommentsOnOthers,
  getRepliesForMine,
  doReciprocation,
  sendConnections,
  getCostReport
} from './linkedin.js';

const app = express();
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 1. Comment on others
app.post('/api/comment', async (req, res) => {
  const { profileIds } = req.body;
  const result = await getCommentsOnOthers(profileIds);
  res.json(result);
});

// 2. Reply to own posts
app.post('/api/reply', async (req, res) => {
  const { postId } = req.body;
  const result = await getRepliesForMine(postId);
  res.json(result);
});

// 3. Reciprocation
app.post('/api/reciprocate', async (req, res) => {
  const { commenterIds } = req.body;
  const result = await doReciprocation(commenterIds);
  res.json(result);
});

// 4. Connections
app.post('/api/connect', async (req, res) => {
  const { peopleIds } = req.body;
  const result = await sendConnections(peopleIds);
  res.json(result);
});

// 5. Cost Analysis
app.get('/api/cost', async (req, res) => {
  const report = await getCostReport();
  res.json(report);
});

// Kick off the scheduler when the server starts
scheduleJobs();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
// server entry point
