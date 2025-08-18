import express, { Request, Response } from 'express';
import path from 'path';
import pool from './db/db';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
app.enable('trust proxy');

const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.render('index', { title: 'Trang Chủ' });
});

app.get('/contact', (req: Request, res: Response) => {
  res.render('contact', { title: 'Liên Hệ', message: null });
});

// API Routes
app.post('/api/contact', async (req: Request, res: Response) => {
  const { email, content } = req.body;
  
  if (!email || !content) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email và nội dung không được để trống' 
    });
  }

  const client = await pool.connect();
  
  try {
    // Insert new contact into database
    const insertQuery = `
      INSERT INTO contacts (email, content, created_at) 
      VALUES ($1, $2, NOW()) 
      RETURNING id, email, content, created_at
    `;
    
    const result = await client.query(insertQuery, [email, content]);
    const newContact = result.rows[0];
    
    res.json({ 
      success: true, 
      message: 'Gửi liên hệ thành công!',
      id: newContact.id 
    });
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lưu dữ liệu vào database' 
    });
  } finally {
    client.release();
  }
});

// Get all contacts (optional - for admin)
app.get('/api/contacts', async (req: Request, res: Response) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json({ 
      success: true, 
      contacts: result.rows 
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy dữ liệu từ database' 
    });
  } finally {
    client.release();
  }
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).render('404', { title: '404 - Không Tìm Thấy Trang' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Đang tắt server...');
  pool.end();
  process.exit(0);
});
