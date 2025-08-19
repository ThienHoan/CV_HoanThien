import express, { Request, Response } from 'express';
import redis from "./redis";
import path from 'path';
import pool from './db/db';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
app.enable('trust proxy');

const PORT = process.env.PORT || 3002;

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
app.get('/api/contact', async (req: Request, res: Response) => {
  const cacheKey = "contacts";
  try {
    // 1. Kiểm tra cache (với error handling)
    let cachedData = null;
    try {
      cachedData = await redis.get(cacheKey);
    } catch (redisError) {
      console.warn("Redis get error:", redisError instanceof Error ? redisError.message : String(redisError));
    }
    
    if (cachedData) {
      console.log("Trả từ Redis cache");
      return res.json({
        success: true,
        contacts: JSON.parse(cachedData),
        cached: true,
      });
    }

    // 2. Nếu không có trong cache thì truy vấn database
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, email, content, created_at FROM contacts ORDER BY created_at DESC'
    );
    client.release();

    const contacts = result.rows;

    // 3. Lưu vào cache (timeout 60 giây) với error handling
    try {
      await redis.set(cacheKey, JSON.stringify(contacts), 'EX', 60);
      console.log("Cache saved successfully");
    } catch (redisError) {
      console.warn("Failed to save Redis cache:", redisError instanceof Error ? redisError.message : String(redisError));
    }

    res.json({
      success: true,
      contacts,
      cached: false,
    });
  } catch (error) {
    console.error("Lỗi khi xử lý /api/contact:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu từ DB hoặc Redis",
    });
  }
});

// POST route để gửi contact form
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
    
    // Thử xóa cache sau khi thêm contact mới (không throw error nếu Redis fail)
    try {
      await redis.del("contacts");
      console.log("Cache cleared successfully");
    } catch (redisError) {
      console.warn("Failed to clear Redis cache:", redisError instanceof Error ? redisError.message : String(redisError));
      // Không throw error, vì database operation đã thành công
    }
    
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
