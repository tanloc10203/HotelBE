# Hướng dẫn chạy sql.

- Bạn có thể đọc thêm để hiểu code trong file `config/database.ts`
- B1: Thêm những table vào file `.sql`
  > - **Lưu ý**
  > - **_Bạn phải tạo đúng cấu trúc Table theo đúng Table mẫu và chỉ được phép comment code giống như ví dụ_**
  > - **_Tên table phải thêm `s`_**
- B2: Chạy lệnh

```sh
npm run sql --database=yourFileNameSql
```

# HƯỚNG DẪN CLONE VÀ CHẠY

```sh
git clone https://github.com/tanloc10203/base-server-node-mysql.git
cd base-server-node-mysql
npm install
npm run dev
```

# HƯỚNG DẪN CÀI ĐẶT LÚC BAN ĐẦU

- B1: Đầu tiên lên github tạo repository. (https://github.com/)
- B2: Khởi tạo git (Làm theo hướng dẫn sau khi tạo repository)

#### Câu lệnh khởi tạo file `.gitignore`

```sh
npx gitignore node
```

## CÀI ĐẶT PACKAGE

#### Khởi tạo typescript `tsconfig.json`

**_Nếu đã cài typescript thì chỉ cần tsc --init_**

```sh
npm install typescript -g
```

```sh
tsc --init
```

#### Câu hình file `tsconfig.json` như sau:

```json
{
  "compilerOptions": {
    "target": "es2016",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "module": "commonjs",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

#### Khởi tạo server.

```sh
npm init -y
```

#### Install dev dependencies

```sh
npm install typescript ts-node-dev tsconfig-paths @types/express @types/config @types/lodash @types/jsonwebtoken @types/cors @types/compression @types/morgan @types/bcrypt -D
```

#### Install dependencies

```sh
npm install express mysql2 config bcrypt dayjs nanoid lodash jsonwebtoken dotenv zod cors compression helmet morgan
```

#### Cài đặt file `package.json`

```json
"scripts": {
  "start": "ts-node -r tsconfig-paths/register server.ts",
  "dev": "ts-node-dev --cls -r tsconfig-paths/register server.ts",
  "build": "npm install"
},
```

```js
.replace(/--.*/g, "")
.replace(/\/\*([^*]|\*(?!\/))*\*\//g, "")

if (!fs.existsSync(fileRouteIndex)) {
  contentIndexRoute += `import { Router } from "express";\n\n`;
  contentIndexRoute += `const router = Router();\n\n`;
  contentIndexRoute += `export default router;`;
}
```
