"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001; // Đổi port để tránh conflict
// Database file path
const DB_FILE = './contacts.json';
// Initialize database file
if (!fs_1.default.existsSync(DB_FILE)) {
    fs_1.default.writeFileSync(DB_FILE, JSON.stringify([]));
}
// Helper functions for database operations
const readContacts = () => {
    try {
        const data = fs_1.default.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    }
    catch {
        return [];
    }
};
const writeContacts = (contacts) => {
    fs_1.default.writeFileSync(DB_FILE, JSON.stringify(contacts, null, 2));
};
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Set view engine
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, '../views'));
// Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'Trang Chủ' });
});
app.get('/contact', (req, res) => {
    res.render('contact', { title: 'Liên Hệ', message: null });
});
// API Routes
app.post('/api/contact', (req, res) => {
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
    }
    catch (error) {
        console.error('Error saving contact:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lưu dữ liệu'
        });
    }
});
// 404 Handler
app.use((req, res) => {
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
//# sourceMappingURL=index.js.map