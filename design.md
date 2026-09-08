# Design Guidelines - IPMVote

## Philosophy
The application follows a **Clean, Professional, and Interactive** design philosophy.
We avoid distracting elements like glassmorphism (no `backdrop-blur` or heavy translucent overlays) and rely on solid colors, ample whitespace, and subtle interactive micro-animations to create a premium, trustworthy interface.

## Color Palette
The primary color scheme relies heavily on solid White with warm Yellow/Orange as the secondary/accent color.
- **Background**: `#FFFFFF` (Tailwind `white`) - The vast majority of the app uses a clean white background to emphasize content.
- **Surface/Cards**: `#FFFFFF` (Tailwind `white`) - Cards are solid white, distinguished by subtle solid borders (`border-slate-200`) rather than heavy drop shadows or glass effects.
- **Primary Accent (Yellow/Orange)**: `#F59E0B` (Tailwind `amber-500`) or `#EAB308` (Tailwind `yellow-500`) - Used for primary buttons, active states, and highlights. It gives a warm, energetic, and professional feel.
- **Dark Text**: `#0F172A` (Tailwind `slate-900`) - Used for headings.
- **Muted Text**: `#64748B` (Tailwind `slate-500`) - Used for secondary text.
- **Light Gray**: `#F8FAFC` (Tailwind `slate-50`) or `#F1F5F9` (Tailwind `slate-100`) - Used sparingly for section dividers, alternating rows, or disabled states.

## Typography
Clean sans-serif font (Inter or Outfit).
- **Headings**: Bold (`font-bold`), crisp, dark.
- **Body**: Regular weight, highly readable line height.

## UI Components & Interaction
- **Cards & Containers**: Solid white background, 1px solid border (`border-slate-200`). NO glassmorphism.
- **Interactive States**: 
  - Hovering over buttons or cards triggers subtle translation (`-translate-y-1`) and solid border color changes (e.g., `hover:border-amber-500`).
  - Active states use solid amber backgrounds.
- **Shadows**: Kept to an absolute minimum. Use `shadow-sm` or none at all, relying on borders for separation.
- **Modals/Overlays**: Solid background overlays (`bg-slate-900/40`) with solid white modal boxes. No `backdrop-blur`.

## Admin Panel
- **Sidebar**: Solid white background, right border (`border-r border-slate-200`). Active menu items highlighted with a subtle amber background or left-border.
- **Header**: Solid white, bottom border (`border-b border-slate-200`).

## Responsiveness
Fully responsive layout utilizing Tailwind's breakpoint utilities.
