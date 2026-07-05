# Educational Block Styling Utilities

This document describes the educational content block styling utilities added in Task 1.2 of the Study Workspace Redesign.

## Overview

These utilities provide reusable CSS classes for styling educational content, animations, and responsive layouts. All utilities are theme-aware and work correctly in both light and dark modes.

## Educational Content Blocks

### Available Block Types

#### 1. Definition Block (`.edu-definition`)
For terminology definitions and key terms.

```html
<div class="edu-definition">
  <div class="edu-block-title">Definition</div>
  <div class="edu-block-content">
    <strong>Algorithm:</strong> A step-by-step procedure for solving a problem.
  </div>
</div>
```

**Styling:**
- Background: Subtle blue tint
- Left border: 4px solid blue accent
- Padding: 16px 20px
- Border radius: 12px

#### 2. Example Block (`.edu-example`)
For illustrative examples and use cases.

```html
<div class="edu-example">
  <div class="edu-block-title">Example</div>
  <div class="edu-block-content">
    For instance, when implementing a bubble sort...
  </div>
</div>
```

**Styling:**
- Background: Subtle purple tint
- Border: 1px solid theme border
- Padding: 20px
- Border radius: 12px

#### 3. Formula Block (`.edu-formula`)
For mathematical formulas and equations (centered).

```html
<div class="edu-formula">
  <div class="edu-block-content">
    E = mc²
  </div>
</div>
```

**Styling:**
- Background: Subtle cyan tint
- Padding: 24px (generous)
- Text-align: center
- Border radius: 12px
- Box shadow for elevation

#### 4. Tip Block (`.edu-tip`)
For exam tips and study aids.

```html
<div class="edu-tip">
  <div class="edu-block-title">📚 Exam Tip</div>
  <div class="edu-block-content">
    Remember to show your work for partial credit.
  </div>
</div>
```

**Styling:**
- Background: Amber/yellow tint
- Left border: 4px solid amber
- Padding: 16px 20px
- Border radius: 12px

#### 5. Warning Block (`.edu-warning`)
For important warnings and cautions.

```html
<div class="edu-warning">
  <div class="edu-block-title">⚠️ Warning</div>
  <div class="edu-block-content">
    Dividing by zero will cause runtime errors.
  </div>
</div>
```

**Styling:**
- Background: Red tint
- Left border: 4px solid error red
- Padding: 16px 20px
- Border radius: 12px

#### 6. Note Block (`.edu-note`)
For supplementary notes and information.

```html
<div class="edu-note">
  <div class="edu-block-title">ℹ️ Note</div>
  <div class="edu-block-content">
    This will be covered in detail later.
  </div>
</div>
```

**Styling:**
- Background: Subtle blue tint
- Left border: 4px solid blue accent
- Padding: 16px 20px
- Border radius: 12px

#### 7. Concept Highlight (`.edu-concept`)
For key concepts and important ideas.

```html
<div class="edu-concept">
  <div class="edu-block-content">
    <strong>Key Concept:</strong> Time complexity measures performance scaling.
  </div>
</div>
```

**Styling:**
- Background: Green highlight
- Border: 1px solid theme border
- Padding: 14px 18px
- Border radius: 8px

## Animation Utilities

### Keyframes Available

1. **fadeIn** - Simple opacity transition
2. **fadeInUp** - Fade in with upward slide (20px)
3. **fadeInDown** - Fade in with downward slide (20px)
4. **slideInRight** - Slide in from right (20px)
5. **slideInLeft** - Slide in from left (20px)
6. **subtleScale** - Gentle scale pulse (1 → 1.02 → 1)
7. **gentlePulse** - Opacity pulse for attention
8. **progressGrow** - Horizontal progress bar growth
9. **shimmer** - Background shimmer for loading states

### Animation Classes

```html
<!-- Fade In -->
<div class="animate-fade-in">Content</div>

<!-- Fade In Up -->
<div class="animate-fade-in-up">Content</div>

<!-- Fade In Down -->
<div class="animate-fade-in-down">Content</div>

<!-- Slide In Right -->
<div class="animate-slide-in-right">Content</div>

<!-- Slide In Left -->
<div class="animate-slide-in-left">Content</div>

<!-- Subtle Scale -->
<div class="animate-subtle-scale">Content</div>

<!-- Gentle Pulse (infinite) -->
<div class="animate-gentle-pulse">Content</div>
```

### Staggered Animations

For list items that should animate in sequence:

```html
<div class="animate-fade-in-up animate-stagger-1">Item 1</div>
<div class="animate-fade-in-up animate-stagger-2">Item 2</div>
<div class="animate-fade-in-up animate-stagger-3">Item 3</div>
<div class="animate-fade-in-up animate-stagger-4">Item 4</div>
<div class="animate-fade-in-up animate-stagger-5">Item 5</div>
```

Each stagger class adds 100ms delay per step.

### Animation Timing

All animations use the design system timing tokens:
- **Fast:** 150ms (var(--np-timing-fast))
- **Normal:** 300ms (var(--np-timing-normal))
- **Slow:** 500ms (var(--np-timing-slow))

### Accessibility - Reduced Motion

All animations respect the `prefers-reduced-motion` media query. Users who have enabled reduced motion will see instant transitions instead of animations.

## Responsive Breakpoint Utilities

### Breakpoints

- **Mobile:** < 640px
- **Tablet:** 640px - 767px
- **Desktop:** >= 1024px (matches study workspace layout)
- **Large Desktop:** >= 1280px

### Visibility Classes

```html
<!-- Hide on mobile -->
<div class="hide-mobile">Desktop/Tablet content</div>

<!-- Show on mobile -->
<div class="show-mobile">Mobile-only content</div>

<!-- Hide below desktop (< 1024px) -->
<div class="hide-below-desktop">Desktop-only content</div>

<!-- Show below desktop (< 1024px) -->
<div class="show-below-desktop">Mobile/Tablet content</div>

<!-- Show on desktop (>= 1024px) -->
<div class="show-desktop">Desktop content</div>

<!-- Hide on desktop (>= 1024px) -->
<div class="hide-desktop">Mobile/Tablet content</div>

<!-- Hide on tablet (< 768px) -->
<div class="hide-tablet">Desktop/Tablet+ content</div>

<!-- Show on large desktop (>= 1280px) -->
<div class="show-large-desktop">Large desktop content</div>
```

### Prose Container

Centers content with optimal reading width (680px):

```html
<div class="prose-container">
  <p>Readable content constrained to 680px max-width</p>
</div>
```

## Design Tokens Reference

### Educational Content Colors

#### Dark Theme
```css
--np-edu-definition-bg: rgba(59, 130, 246, 0.08)
--np-edu-definition-border: var(--np-blue)
--np-edu-example-bg: rgba(139, 92, 246, 0.06)
--np-edu-formula-bg: rgba(6, 182, 212, 0.08)
--np-edu-tip-bg: rgba(245, 158, 11, 0.12)
--np-edu-concept-highlight: rgba(16, 185, 129, 0.10)
--np-edu-warning-bg: rgba(239, 68, 68, 0.10)
--np-edu-warning-border: #EF4444
--np-edu-note-bg: rgba(59, 130, 246, 0.10)
--np-edu-note-border: var(--np-blue)
```

#### Light Theme
```css
--np-edu-definition-bg: rgba(37, 99, 235, 0.06)
--np-edu-definition-border: var(--np-blue)
--np-edu-example-bg: rgba(124, 58, 237, 0.05)
--np-edu-formula-bg: rgba(8, 145, 178, 0.06)
--np-edu-tip-bg: rgba(217, 119, 6, 0.10)
--np-edu-concept-highlight: rgba(5, 150, 105, 0.08)
--np-edu-warning-bg: rgba(220, 38, 38, 0.08)
--np-edu-warning-border: #DC2626
--np-edu-note-bg: rgba(37, 99, 235, 0.08)
--np-edu-note-border: var(--np-blue)
```

### Prose Spacing System
```css
--np-prose-max-width: 680px
--np-prose-line-height: 1.75
--np-prose-spacing-tight: 0.75rem
--np-prose-spacing-normal: 1.5rem
--np-prose-spacing-generous: 2.5rem
```

### Timing Constants
```css
--np-timing-fast: 150ms
--np-timing-normal: 300ms
--np-timing-slow: 500ms
```

## Usage Examples

### In React Components

```tsx
import React from 'react';

const EducationalContent: React.FC = () => {
  return (
    <div className="prose-container">
      <div className="edu-definition animate-fade-in">
        <div className="edu-block-title">Definition</div>
        <div className="edu-block-content">
          <strong>React:</strong> A JavaScript library for building user interfaces.
        </div>
      </div>

      <div className="edu-example animate-fade-in-up animate-stagger-1">
        <div className="edu-block-title">Example</div>
        <div className="edu-block-content">
          Here's how you create a simple React component...
        </div>
      </div>

      {/* Desktop-only table of contents */}
      <aside className="show-desktop">
        <nav>Table of Contents</nav>
      </aside>
    </div>
  );
};
```

### Combining with Existing Utilities

Educational blocks work well with other NotePilot utilities:

```html
<!-- With custom spacing -->
<div class="edu-note" style="margin-top: var(--np-spacing-xl)">
  ...
</div>

<!-- With animations -->
<div class="edu-tip animate-slide-in-right">
  ...
</div>

<!-- In responsive layouts -->
<div class="hide-mobile">
  <div class="edu-formula">
    Complex formula only shown on larger screens
  </div>
</div>
```

## Testing

A test HTML page is available at `src/test-educational-blocks.html` to verify:
- All educational block styles
- Animation behaviors
- Responsive breakpoints
- Theme transitions

Open the file in a browser and toggle between light/dark themes to verify proper styling.

## Browser Support

All utilities are compatible with:
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile Safari (iOS 15+)
- Mobile Chrome (Android 10+)

## Notes

- All educational blocks include smooth theme transitions
- Colors are defined as CSS custom properties for easy theme support
- Reduced motion preference is respected for accessibility
- All animations use GPU-accelerated properties (opacity, transform) for performance
