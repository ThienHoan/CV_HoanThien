"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("./db/db"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
const app = (0, express_1.default)();
app.enable('trust proxy');
const PORT = process.env.PORT || 3001;
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
app.post('/api/contact', async (req, res) => {
    const { email, content } = req.body;
    if (!email || !content) {
        return res.status(400).json({
            success: false,
            message: 'Email và nội dung không được để trống'
        });
    }
    const client = await db_1.default.connect();
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
    }
    catch (error) {
        console.error('Error saving contact:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lưu dữ liệu vào database'
        });
    }
    finally {
        client.release();
    }
});
// Get all contacts (optional - for admin)
app.get('/api/contacts', async (req, res) => {
    const client = await db_1.default.connect();
    try {
        const result = await client.query('SELECT * FROM contacts ORDER BY created_at DESC');
        res.json({
            success: true,
            contacts: result.rows
        });
    }
    catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy dữ liệu từ database'
        });
    }
    finally {
        client.release();
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
    db_1.default.end();
    process.exit(0);
});
//# sourceMappingURL=index.js.map