# Livaxis — Nhật Ký Công Việc

> Cập nhật lần cuối: 28/05/2026

---

## Mục Lục

1. [Refactor Sang Mô Hình Affiliate](#1-refactor-sang-mô-hình-affiliate)
   - [Backend — Model](#11-backend--model)
   - [Backend — Service](#12-backend--service)
   - [Backend — Controller](#13-backend--controller)
   - [Frontend — API Types](#14-frontend--api-types)
   - [Frontend — ProductDetail UI](#15-frontend--productdetail-ui)
   - [Frontend — Discovery Page](#16-frontend--discovery-page)
2. [Manager Panel (Admin UI)](#2-manager-panel-admin-ui)
   - [Auth Context](#21-auth-context)
   - [Manager Layout](#22-manager-layout)
   - [Manager Dashboard](#23-manager-dashboard)
   - [Product List Page](#24-product-list-page)
   - [Product Form Page](#25-product-form-page)
3. [Bug Fixes](#3-bug-fixes)

---

## 1. Refactor Sang Mô Hình Affiliate

**Bối cảnh:** Livaxis chuyển từ bán hàng trực tiếp → **affiliate Shopee**. Tab "New Arrival" đổi thành "Discovery" (hiển thị tất cả sản phẩm). Người dùng xem sản phẩm, dùng AI Try-On, rồi click sang Shopee để mua.

**Những trường bị xóa hoàn toàn:** `isNew`, `stock`  
**Những trường được giữ lại (có điều chỉnh):** `price` → đổi thành "giá tham khảo" lightweight  
**Trường cốt lõi mới:** `affiliateUrl` (required)

---

### 1.1 Backend — Model

**File:** `BE/src/models/product.model.ts`

| Thay đổi | Lý do |
|---|---|
| ❌ Xóa `isNew: boolean` khỏi interface + Schema | Không còn phân biệt "mới/cũ" — Discovery show all |
| ❌ Xóa index `{ isNew: 1 }` | Không còn query theo isNew |
| ✅ Giữ `price: Number` | Dùng làm giá tham khảo |
| ✅ Giữ `affiliateUrl: String` (required) | Link Shopee của sản phẩm |

---

### 1.2 Backend — Service

**File:** `BE/src/services/product.service.ts`

| Thay đổi | Chi tiết |
|---|---|
| ❌ Xóa `isNew` khỏi `CreateProductInput` | Không nhận field này khi tạo sản phẩm |
| ❌ Xóa `isNew` khỏi `ProductPublic` type | Không trả về qua API |
| ❌ Xóa `isNew` khỏi `toPublicProduct()` mapper | |
| ❌ Xóa `isNewOnly` khỏi `ProductListQuery` | Bỏ filter "chỉ sản phẩm mới" |
| 🔧 Fix sort `featured` / `newestFirst` | `{ isNew: -1, createdAt: -1 }` → `{ createdAt: -1 }` |
| 🔧 Fix `getNewArrivalsFacets()` | Bỏ filter `{ isNew: true }` — query toàn bộ sản phẩm |

```diff
  case 'featured':
  case 'newestFirst':
-   return { isNew: -1, createdAt: -1 };
+   return { createdAt: -1 };
```

---

### 1.3 Backend — Controller

**File:** `BE/src/controllers/product.controller.ts`

| Thay đổi | Chi tiết |
|---|---|
| ❌ Xóa hàm `parseBooleanQuery()` | Chỉ dùng cho `isNewOnly` |
| ❌ Xóa hàm `parsePriceRangesQuery()` | Filter khoảng giá không còn phù hợp |
| ❌ Xóa `priceAsc` / `priceDesc` khỏi allowed sort list | |
| ❌ Xóa `isNewOnly` và `priceRanges` khỏi `parseProductListQuery()` | |
| 🔧 Fix `listDiscoveryController` | Bỏ `isNewOnly: true` — Discovery hiển thị tất cả |

```diff
  listProducts({
    ...query,
-   isNewOnly: true,
    sortBy: query.sortBy ?? 'featured',
  })
```

---

### 1.4 Frontend — API Types

**File:** `FE/src/services/productApi.ts`

| Thay đổi | Chi tiết |
|---|---|
| ❌ Xóa type `NewArrivalsPriceRange` | |
| ❌ Xóa `isNew: boolean` khỏi `NewArrivalProduct` | |
| ❌ Xóa `isNew?: boolean` và `stock?: number` khỏi `ProductDetail` | |
| ❌ Xóa `priceRanges` khỏi `GetNewArrivalsParams` | |
| 🔧 Đổi sort options | Bỏ `priceAsc`/`priceDesc`, thêm `nameAsc`/`nameDesc` |
| 🔧 Fix `getFeaturedProducts()` | Bỏ `&isNewOnly=true` khỏi query string |

```diff
- await fetch(`${API_BASE}?limit=${limit}&isNewOnly=true&sortBy=featured`)
+ await fetch(`${API_BASE}?limit=${limit}&sortBy=featured`)
```

---

### 1.5 Frontend — ProductDetail UI

**File:** `FE/src/page/ProductDetail.tsx`

#### Badge "New Arrival" → Đã xóa
```diff
- {product.isNew && (
-   <span>✦ New Arrival</span>
- )}
```

#### Hiển thị giá → Đổi sang lightweight affiliate style (Phương án B)

| | Trước | Sau |
|---|---|---|
| Style | Font to Playfair 28px, dấu `$` | Font nhỏ Inter 15px |
| Label | `Reference price` | `· giá tham khảo trên Shopee` |
| Prefix | `$5,640` | `Khoảng 5.640₫` |
| Render | Luôn hiển thị | Chỉ hiển thị nếu `product.price` có giá trị |

#### Color → Đổi từ "selector" sang "info display"

| | Trước | Sau |
|---|---|---|
| Swatch | Tròn lớn (40px) + ring vàng + dấu ✓ | Dot nhỏ (16px) inline |
| Cảm giác | Như đang chọn màu | Thông tin mô tả |

#### Material → Đổi từ "button" sang "chip"

| | Trước | Sau |
|---|---|---|
| Style | `bg-black text-white` button | `bg-neutral-100 border rounded-full` chip |
| Cảm giác | Clickable option | Thẻ thông tin |

#### Import cleanup
```diff
- import { Sparkles, Check, ChevronLeft, ... }
+ import { Sparkles, ChevronLeft, ... }  // Xóa Check không còn dùng
```

---

### 1.6 Frontend — Discovery Page

**File:** `FE/src/page/Discovery.tsx`

| Thay đổi | Chi tiết |
|---|---|
| ❌ Xóa `priceRange` state và Price Range Slider | Không filter theo giá |
| ❌ Xóa filter chip `$0 - $6000` | |
| ❌ Xóa `activeFiltersCount` tính theo priceRange | Chỉ đếm category |
| ❌ Xóa sort `Price: Low to High` / `Price: High to Low` | |
| ❌ Xóa sort `Newest First` dùng `isNew` | |
| ✅ Thêm sort `A – Z` / `Z – A` | Sort theo tên |
| 🔧 "Free delivery" → "Shop on Shopee" | Label trên card product |
| 🔧 Xóa `priceRange` khỏi `useMemo` deps | Fix `ReferenceError` |

```diff
- const SORT_OPTIONS = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Newest First']
+ const SORT_OPTIONS = ['Featured', 'A – Z', 'Z – A', 'Newest First']
```

---

## 2. Manager Panel (Admin UI)

**Mục tiêu:** Xây dựng giao diện quản lý nội bộ cho role `manager` để CRUD sản phẩm mà không cần vào MongoDB Compass.

**Route prefix:** `/manager/*`  
**Bảo vệ:** Chỉ user có `role === 'manager'` mới truy cập được  
**Design:** Dark sidebar + Light main content

---

### 2.1 Auth Context

**File:** `FE/src/contexts/auth-context.tsx`

- Type `AuthUser` có field `role: 'user' | 'manager'`
- Context cung cấp `user`, `loading`, `setUser`, `refreshUser`, `logout`
- Auto-fetch `/api/auth/me` khi mount để restore session

---

### 2.2 Manager Layout

**File:** `FE/src/page/Manager/ManagerLayout.tsx`

Layout chia đôi: **Sidebar cố định (240px) + Main content** (`margin-left: 240px`).

**Sidebar features:**
- Logo "Livaxis · Manager" badge
- Nav items: Dashboard, Products — dùng `NavLink` với active indicator (line bên trái màu vàng)
- User info ở footer (avatar/placeholder + name + email)
- Nút logout → gọi `logout()` → redirect `/sign-in`

**Design tokens:**
- Sidebar background: `#0f0f0f` (near black)
- Active nav: `rgba(160, 140, 106, 0.1)` với border-left vàng `#a08c6a`
- Main background: `#f5f4f2` (warm gray)

---

### 2.3 Manager Dashboard

**File:** `FE/src/page/Manager/ManagerDashboard.tsx`

Trang chào mừng với greeting + Quick Action cards:

| Card | Route | Mô tả |
|---|---|---|
| Product Management | `/manager/products` | Xem danh sách sản phẩm |
| Add New Product | `/manager/products/new` | Tạo sản phẩm mới |

Cards có hover effect: `border-color` → vàng, `box-shadow`, `translateY(-1px)`.

---

### 2.4 Product List Page

**File:** `FE/src/page/Manager/products/ProductListPage.tsx`

Trang quản lý danh sách sản phẩm với đầy đủ tính năng:

**Filters:**
- Search input (debounce 400ms) — tìm theo tên/subtitle/description
- Dropdown Category (9 loại)
- Dropdown Style (Minimalist / Modern Luxury / Industrial)

**Table columns:** Thumbnail · Product (name + subtitle) · Category · Style · Price · Affiliate · Actions

**Actions:**
- ✏️ Edit → navigate `/manager/products/:id`
- 🗑️ Delete → mở confirm dialog → gọi API xóa

**Features khác:**
- Toast thông báo success/error (tự ẩn sau 3.5s)
- Confirm dialog với blur backdrop khi xóa
- Pagination (hiển thị tối đa ±2 trang xung quanh trang hiện tại)
- Loading spinner state + Empty state

**API:** `listManagerProducts`, `deleteManagerProduct` từ `managerProductApi`

---

### 2.5 Product Form Page

**File:** `FE/src/page/Manager/products/ProductFormPage.tsx`

Form dùng chung cho cả **Create** và **Edit** (`mode: 'create' | 'edit'`).

**Layout:** 2 cột — Main fields (trái) + Meta + Submit (phải)

**Trái — Basic Information:**
- Product Name *(required)*
- Subtitle
- Category + Style (2 cột)
- Reference Price VND *(required)*

**Trái — Images:**
- Main Image URL *(required)* + preview ảnh
- Gallery Images (textarea, mỗi dòng 1 URL)

**Trái — Description:** Textarea

**Phải — Submit card:** Error message + Submit button + Cancel button

**Phải — Affiliate Link:** Shopee URL *(required)* + link preview

**Phải — Specifications:**
- Material, Color, Color Hex (color picker + text input), Dimensions

**Validation client-side:**
```
name → required
category → required  
affiliateUrl → required
price → valid number ≥ 0
imageUrl → required
```

**Edit mode:** Auto-fetch sản phẩm theo `id` từ URL params, pre-fill form.

---

## 3. Bug Fixes

### ReferenceError: priceRange is not defined

**File:** `FE/src/page/Discovery.tsx:354`  
**Nguyên nhân:** Đã xóa `useState` của `priceRange` nhưng quên xóa khỏi dependency array của `useMemo`.

```diff
- }, [priceRange, selectedCategory, sortBy, products])
+ }, [selectedCategory, sortBy, products])
```

---

## Ghi Chú Kỹ Thuật

> [!NOTE]
> **MongoDB migration (tùy chọn):** Các document cũ vẫn còn field `isNew` trong database — không gây lỗi vì Mongoose schema không enforce nữa. Nếu muốn dọn sạch hoàn toàn:
> ```js
> db.products.updateMany({}, { $unset: { isNew: "" } })
> ```

> [!TIP]
> **Manager route protection:** Đảm bảo route `/manager/*` trong `App.jsx`/router được bọc bởi guard component kiểm tra `user?.role === 'manager'`, redirect về `/` nếu không đủ quyền.
