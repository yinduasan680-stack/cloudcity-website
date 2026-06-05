# Cloud City Food 官网 v4 — 部署说明 / Deployment Guide

> 📅 版本日期:2026-01-27
> 📦 内容:静态网站 + PWA + SEO 完整包
> 🌐 目标域名:www.cloudcitymm.com

---

## 📋 这个包是什么?

Cloud City Food 官网 + 法律文件页的完整静态网站,包含:

- ✅ 三语支持(English / 中文 / မြန်မာ),**默认英文**
- ✅ 响应式设计,桌面 + 平板 + 手机全适配
- ✅ PWA 支持(可"添加到主屏幕",像 App 一样使用)
- ✅ 完整 SEO(Google 收录优化:sitemap、robots、Open Graph、hreflang)
- ✅ 离线缓存(Service Worker)
- ✅ 苹果 / 安卓 / Windows 全平台图标
- ✅ 无任何外部依赖,纯静态文件

---

## 📂 文件结构

```
cloudcity-website/
├── index.html          # 主页(部署时建议改名为 index.html)
├── legal.html         # 法律文件页
├── manifest.json                   # PWA 配置(必须放根目录)
├── service-worker.js               # 离线缓存逻辑(必须放根目录)
├── sitemap.xml                     # 站点地图(给 Google)
├── robots.txt                      # 爬虫规则(给 Google)
└── icons/
    ├── favicon.ico                 # 浏览器标签页图标
    ├── icon-32.png ~ icon-512.png  # PWA 各尺寸图标
    ├── icon-192-maskable.png       # Android 自适应图标
    ├── icon-512-maskable.png       # Android 自适应图标
    └── icon-512.svg                # 矢量图标(现代浏览器优先用)
```

**所有 13 个图标共 ~120KB,两个 HTML 共 ~265KB,SEO/PWA 配置共 ~9KB。整站约 400KB。**

---

## 🚀 部署方式(选一个)

### 方案 A:Cloudflare Pages(推荐 ⭐)

**优点:** 免费、自动 HTTPS、全球 CDN、自动部署、无需服务器知识

1. 注册 https://dash.cloudflare.com/ (免费)
2. 进入 **Pages** → Create a project → **Direct Upload**
3. 把整个项目文件夹打包成 ZIP 上传
4. 几秒后获得 `xxx.pages.dev` 临时域名
5. 在 Cloudflare 的 DNS 里把 `www.cloudcitymm.com` 添加 CNAME 指向 `xxx.pages.dev`
6. ✅ 完成。HTTPS 自动启用。

### 方案 B:Vercel

1. 注册 https://vercel.com (免费)
2. New Project → 上传 ZIP / 连接 GitHub
3. 自动部署,获得 `xxx.vercel.app` 域名
4. Settings → Domains → 添加 `www.cloudcitymm.com`
5. ✅ 完成

### 方案 C:自有服务器 / VPS / 虚拟主机

1. 把所有文件 FTP 上传到 web 根目录(如 `/var/www/html/`)
2. **必须启用 HTTPS** —— 用 Let's Encrypt 免费证书
3. 配置 web server(Nginx / Apache)的默认页为 `index.html` 或重命名为 `index.html`
4. 注意:**`service-worker.js` 必须能从根域名访问**,否则离线功能失效

---

## ✅ 部署后必做的 4 件事

### 1️⃣ 文件名(已经命好,无需改动)

文件名已经按 web 部署惯例命好:

| 文件 | URL |
|---|---|
| `index.html` | `https://www.cloudcitymm.com/` |
| `legal.html` | `https://www.cloudcitymm.com/legal.html` |

> 💡 进阶:如果想要更干净的 URL `/legal`(无 `.html` 后缀),可以在服务器配置 URL rewrite,或把 `legal.html` 移到 `legal/index.html`。

### 2️⃣ 域名配置

代码里所有 `https://www.cloudcitymm.com` 是占位 URL。如果**最终部署的域名不同**(比如先用 `cloudcity.pages.dev` 测试),需要全局替换:

```bash
# 在所有文件里替换
grep -r "cloudcitymm.com" --include="*.html" --include="*.json" --include="*.xml" --include="*.txt"
```

涉及文件:
- `index.html`(canonical、og:url、hreflang)
- `legal.html`(canonical、og:url、hreflang)
- `sitemap.xml`(所有 `<loc>`)
- `robots.txt`(Sitemap 行)

### 3️⃣ 启用 HTTPS

**这是 PWA 工作的强制要求。** Cloudflare Pages / Vercel 自动处理。自有服务器用 Let's Encrypt:

```bash
sudo certbot --nginx -d www.cloudcitymm.com
```

### 4️⃣ 提交给 Google 收录

部署成功后:
1. 注册 [Google Search Console](https://search.google.com/search-console)(免费)
2. **添加资源** → 输入 `cloudcitymm.com`
3. 验证域名所有权(用 DNS TXT 记录或上传 HTML 文件)
4. **Sitemaps** → 提交 `https://www.cloudcitymm.com/sitemap.xml`
5. 等几天,Google 会开始收录所有页面

📈 同样可以提交到 Bing Webmaster Tools 提升 Bing/DuckDuckGo 收录率。

---

## 🔍 部署后测试清单

### 桌面端测试
- [ ] Chrome / Edge:打开主页正常
- [ ] Safari:打开主页正常
- [ ] Firefox:打开主页正常
- [ ] 法律页 4 个 Tab 切换正常
- [ ] 语言切换器(EN/中/MY)三种语言都正常
- [ ] 切换语言后刷新页面,语言记忆生效

### 手机端测试
- [ ] iOS Safari 打开主页布局正常,字体清晰
- [ ] Android Chrome 打开主页布局正常
- [ ] 输入框点击不会自动放大(iOS 关键)
- [ ] 顶部导航在 iPhone 14/15 Pro 不被刘海遮挡
- [ ] 横屏不出现意外横向滚动条

### PWA 测试
- [ ] iOS Safari:分享菜单 → 「添加到主屏幕」 → Cloud City 图标出现
- [ ] Android Chrome:浏览几秒后弹出「安装应用」按钮 → 可安装到桌面
- [ ] 安装后图标点击打开,无浏览器边框(独立 App 体验)
- [ ] 离线状态(关 WiFi)再打开仍能查看主页

### SEO 测试
- [ ] [Google Rich Results Test](https://search.google.com/test/rich-results):输入网站 URL → 通过
- [ ] [PageSpeed Insights](https://pagespeed.web.dev/):性能评分 > 80
- [ ] 访问 `https://www.cloudcitymm.com/sitemap.xml`:返回 XML
- [ ] 访问 `https://www.cloudcitymm.com/robots.txt`:返回文本
- [ ] 访问 `https://www.cloudcitymm.com/manifest.json`:返回 JSON

---

## ❓ 常见问题

**Q: 我一定要 HTTPS 吗?**
A: **是的,必须。** 没有 HTTPS:① PWA 不工作 ② Service Worker 不工作 ③ Google 排名降低 ④ Chrome 显示「不安全」警告。Cloudflare/Vercel 都免费提供。

**Q: 怎么改主页文案?**
A: 主页所有文字在 `<script>` 里的 `I18N` 对象里(三语并列),改完保存就生效。

**Q: 怎么改法律条款?**
A: 法律页里每个 `<div class="version-panel" id="xxx-zh|en|my">` 块对应一种语言版本,直接改 HTML 内容即可。

**Q: 怎么加新页面?**
A: 复制 `legal.html` 改造结构,记得在 `sitemap.xml` 里增加 URL,在 `service-worker.js` 的 `PRECACHE_URLS` 增加路径。

**Q: 改了内容后,用户的浏览器还显示旧版本?**
A: 这是 Service Worker 缓存导致的。打开 `service-worker.js`,把 `CACHE_VERSION` 字符串改一下(如改成 `v1.2026.02.10`),用户下次访问会自动更新缓存。

**Q: 邮箱如果换了怎么办?**
A: 全局搜索 `cloudcitymm@gmail.com` 替换为新邮箱即可。

**Q: 加了第三个城市(比如内比都)怎么办?**
A: 在两个 HTML 文件里搜 "Mandalay" 和 "Lashio",在每处适当位置加上新城市;同时在 `manifest.json` 的 description 加上。

---

## 📞 技术联系人

如有部署问题,联系 cloudcitymm@gmail.com

---

## 📜 文件清单(交接确认)

部署前,请确认以下 19 个文件齐全:

```
□ index.html
□ legal.html
□ manifest.json
□ service-worker.js
□ sitemap.xml
□ robots.txt
□ README.md (本文件)
□ icons/favicon.ico
□ icons/icon-32.png
□ icons/icon-64.png
□ icons/icon-96.png
□ icons/icon-144.png
□ icons/icon-180.png
□ icons/icon-192.png
□ icons/icon-192-maskable.png
□ icons/icon-256.png
□ icons/icon-384.png
□ icons/icon-512.png
□ icons/icon-512-maskable.png
```

总大小约 **600 KB**(包含 12 个图标 + 3 张 App 截图),可一次性压缩为 ZIP 发送。

---

*文档版本 v1.0 — 如有更新请同步修订日期。*
