---
name: playza-design-system
description: "Guidelines and design system tokens for maintaining consistent PlayZa styling across all pages (colors, cards, typography, buttons, glassmorphism)."
---

# PlayZa Design System & Styling Guidelines

This skill defines the unified design system and aesthetic tokens extracted from the **PlayZa Landing Page** (`resources/js/Pages/Welcome.jsx` and `resources/css/app.css`). All new or modified views, components, and pages must strictly follow these rules for seamless visual consistency.

---

## 🎨 Color Palette & CSS Variables

| Token Name | Value | Tailwind / CSS Class | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Navy** | `#0b1c30` | `text-[#0b1c30]`, `bg-[#0b1c30]` | Titles, hero text, primary buttons, main headers |
| **Primary Hover** | `#132c4a` | `hover:bg-[#132c4a]` | Primary button hover state |
| **Neon Lime Accent** | `#add911` | `text-[#add911]`, `bg-[#add911]` | Active status indicators, button arrows (`→`), badges |
| **Brand Blue Accent**| `#0077CC` | `text-[#0077CC]`, `bg-[#0077CC]` | Subheadings, links, secondary badges |
| **Background Surface**| `#f8fafc` | `bg-[#f8fafc]` (slate-50) | Main page background |
| **Card Surface** | `bg-white` | `bg-white border border-slate-200` | Section panels, facility cards, metric cards |

---

## ✍️ Typography Standards

- **Page Titles & Major Headings**:
  ```jsx
  <h1 className="text-3xl sm:text-5xl font-title font-black text-[#0b1c30] tracking-tight mb-4">
    Heading Title
  </h1>
  ```
- **Section Subtitles & Descriptions**:
  ```jsx
  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
    Description text here...
  </p>
  ```

---

## 🔘 Button & Interactive Styles

### 1. Primary Action Button (Navy + Neon Lime Arrow)
```jsx
<button className="px-8 py-4 bg-[#0b1c30] hover:bg-[#132c4a] text-white font-extrabold rounded-xl shadow-lg transition-all duration-200 text-sm hover-scale text-center flex items-center justify-center gap-2 active:scale-95">
  Action Label <span className="text-[#add911]">→</span>
</button>
```

### 2. Secondary Action Button (White + Slate Border)
```jsx
<button className="px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-[#0b1c30] font-bold rounded-xl transition-colors duration-200 text-sm shadow-sm">
  Secondary Action
</button>
```

---

## 🏷️ Badges & Status Indicators

### 1. Hero Pill Badge with Live Pulse Dot
```jsx
<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-[#0077CC] text-xs font-bold shadow-sm">
  <span className="h-2 w-2 rounded-full bg-[#add911] animate-pulse"></span>
  Badge Text
</div>
```

### 2. Status Badges
- **Approved / Done**: `bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-xs`
- **Pending Confirmation**: `bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full text-xs`
- **Cancelled**: `bg-rose-100 text-rose-800 font-bold px-2.5 py-1 rounded-full text-xs`
- **No Show**: `bg-slate-800 text-slate-200 font-bold px-2.5 py-1 rounded-full text-xs`

---

## 🃏 Cards & Glass Panels

```jsx
<div className="rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md bg-white p-6">
  {/* Content */}
</div>
```

```jsx
<div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
  {/* Glass panel container */}
</div>
```
