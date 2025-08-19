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
const redis_1 = __importDefault(require("./redis"));
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("./db/db"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
const app = (0, express_1.default)();
app.enable('trust proxy');
const PORT = process.env.PORT || 3002;
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
app.get('/api/contact', async (req, res) => {
    const cacheKey = "contacts";
    try {
        // 1. Kiểm tra cache (với error handling)
        let cachedData = null;
        try {
            cachedData = await redis_1.default.get(cacheKey);
        }
        catch (redisError) {
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
        const client = await db_1.default.connect();
        const result = await client.query('SELECT id, email, content, created_at FROM contacts ORDER BY created_at DESC');
        client.release();
        const contacts = result.rows;
        // 3. Lưu vào cache (timeout 60 giây) với error handling
        try {
            await redis_1.default.set(cacheKey, JSON.stringify(contacts), 'EX', 60);
            console.log("Cache saved successfully");
        }
        catch (redisError) {
            console.warn("Failed to save Redis cache:", redisError instanceof Error ? redisError.message : String(redisError));
        }
        res.json({
            success: true,
            contacts,
            cached: false,
        });
    }
    catch (error) {
        console.error("Lỗi khi xử lý /api/contact:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy dữ liệu từ DB hoặc Redis",
        });
    }
});
// POST route để gửi contact form
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
        // Thử xóa cache sau khi thêm contact mới (không throw error nếu Redis fail)
        try {
            await redis_1.default.del("contacts");
            console.log("Cache cleared successfully");
        }
        catch (redisError) {
            console.warn("Failed to clear Redis cache:", redisError instanceof Error ? redisError.message : String(redisError));
            // Không throw error, vì database operation đã thành công
        }
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