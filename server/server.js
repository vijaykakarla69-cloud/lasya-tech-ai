import express from 'express';
import cors from 'cors';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const contactsFile = path.join(dataDir, 'contacts.jsonl');
const subscribersFile = path.join(dataDir, 'subscribers.jsonl');
const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json({ limit: '100kb' }));

const required = (value) => typeof value === 'string' && value.trim().length > 0;
const appendRecord = async (file, record) => {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.appendFile(file, JSON.stringify({ ...record, createdAt: new Date().toISOString() }) + '\n', 'utf8');
};

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'lasya-ai-tech-api' }));

app.post('/api/contact', async (req, res) => {
  const { name, email, service, message } = req.body ?? {};
  if (!required(name) || !required(email) || !required(service) || !required(message)) {
    return res.status(400).json({ ok: false, message: 'Please complete all contact fields.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, message: 'Please enter a valid email address.' });
  }
  await appendRecord(contactsFile, { name: name.trim(), email: email.trim(), service: service.trim(), message: message.trim() });
  return res.status(201).json({ ok: true, message: 'Thanks — your enquiry has been received.' });
});

app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body ?? {};
  if (!required(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, message: 'Please enter a valid email address.' });
  }
  await appendRecord(subscribersFile, { email: email.trim() });
  return res.status(201).json({ ok: true, message: 'You are subscribed.' });
});

app.listen(port, () => console.log(`Lasya AI Tech API running at http://127.0.0.1:${port}`));
