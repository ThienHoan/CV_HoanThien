import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001; // Đổi port để tránh conflict

// Database file path
const DB_FILE = './contacts.json';

// Initialize database file
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// Helper functions for database operations
const readContacts = (): any[] => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeContacts = (contacts: any[]): void => {
  fs.writeFileSync(DB_FILE, JSON.stringify(contacts, null, 2));
};

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
app.post('/api/contact', (req: Request, res: Response) => {
  const { email, content } = req.body;
  
  if (!email || !content) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email và nội dung không được để trống' 
    });
  }

  try {
    const contacts = readContacts();
    const newContact = {
      id: contacts.length + 1,
      email,
      content,
      created_at: new Date().toISOString()
    };
    
    contacts.push(newContact);
    writeContacts(contacts);
    
    res.json({ 
      success: true, 
      message: 'Gửi liên hệ thành công!',
      id: newContact.id 
    });
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lưu dữ liệu' 
    });
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
  process.exit(0);
});
