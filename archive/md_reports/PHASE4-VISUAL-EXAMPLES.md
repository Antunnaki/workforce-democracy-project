# 📝 Phase 4: Visual Examples

## What Backend Sends vs. What Users See

---

## Example 1: Bold Text with Citations

### Backend Sends:
```
Eric Adams was **indicted**[1] on federal corruption charges.
```

### Frontend Displays:
Eric Adams was **indicted**¹ on federal corruption charges.

*(with "indicted" in bold and ¹ as a small blue clickable superscript)*

---

## Example 2: Italic Text with Citations

### Backend Sends:
```
The investigation revealed *systemic corruption*[1] in city contracts.
```

### Frontend Displays:
The investigation revealed *systemic corruption*¹ in city contracts.

*(with "systemic corruption" in italic and ¹ as a clickable superscript)*

---

## Example 3: Combined Bold + Italic

### Backend Sends:
```
This represents a ***fundamental violation***[1] of public trust.
```

### Frontend Displays:
This represents a ***fundamental violation***¹ of public trust.

*(with "fundamental violation" in bold italic and ¹ as a clickable superscript)*

---

## Example 4: Bullet List with Citations

### Backend Sends:
```
Key allegations[1] include:
- **Illegal campaign donations**[2]
- *Luxury travel* and gifts[3]
- **Abuse of power** and influence[1]
```

### Frontend Displays:
Key allegations¹ include:
• **Illegal campaign donations**²
• *Luxury travel* and gifts³
• **Abuse of power** and influence¹

*(with proper bullet formatting, bold/italic text, and clickable superscripts)*

---

## Example 5: Numbered List with Citations

### Backend Sends:
```
**Housing rights principles**[1]:

1. **Rent stabilization** protects tenants[2]
2. *Eviction protections* ensure due process
3. **Anti-discrimination** laws prohibit bias[3]
```

### Frontend Displays:
**Housing rights principles**¹:

1. **Rent stabilization** protects tenants²
2. *Eviction protections* ensure due process
3. **Anti-discrimination** laws prohibit bias³

*(with numbered formatting, bold/italic text, and clickable superscripts)*

---

## Example 6: Complex Mixed Content

### Backend Sends:
```
**Democratic workplace principles**[1] transform power structures:

**Core Requirements:**
- Workers have *collective ownership* of decisions[2]
- **One worker, one vote** ensures equality
- Profits are *shared equitably* among all members

**Implementation Steps:**
1. **Establish** worker ownership structure[3]
2. *Implement* democratic governance systems
3. **Distribute** profits fairly to all workers

This treats workers as ***partners, not resources***[1].

Sources:
1. Democracy at Work Institute - Cooperative Principles
   URL: https://institute.coop/what-worker-cooperative
2. International Co-operative Alliance - Values & Principles
   URL: https://www.ica.coop/en/cooperatives/cooperative-identity
3. USFWC - Starting a Worker Cooperative
   URL: https://www.usworker.coop/starting-a-worker-coop/
```

### Frontend Displays:
**Democratic workplace principles**¹ transform power structures:

**Core Requirements:**
• Workers have *collective ownership* of decisions²
• **One worker, one vote** ensures equality
• Profits are *shared equitably* among all members

**Implementation Steps:**
1. **Establish** worker ownership structure³
2. *Implement* democratic governance systems
3. **Distribute** profits fairly to all workers

This treats workers as ***partners, not resources***¹.

**Sources:**
1. [Democracy at Work Institute - Cooperative Principles](https://institute.coop/what-worker-cooperative)
2. [International Co-operative Alliance - Values & Principles](https://www.ica.coop/en/cooperatives/cooperative-identity)
3. [USFWC - Starting a Worker Cooperative](https://www.usworker.coop/starting-a-worker-coop/)

*(with all markdown formatted, citations clickable, and sources displayed as a formatted list)*

---

## Example 7: Edge Cases

### Backend Sends:
```
**Testing edge cases**[1]:
- **Bold with *nested italic***
- *Italic with **nested bold***
- Citations in **bold text[2]** work
- Citations in *italic text[3]* work too
```

### Frontend Displays:
**Testing edge cases**¹:
• **Bold with *nested italic***
• *Italic with **nested bold***
• Citations in **bold text**² work
• Citations in *italic text*³ work too

*(with nested markdown, citations inside bold/italic, all rendering correctly)*

---

## Typewriter Animation

### What Users See:
1. **Typing indicator** appears: ●●●
2. Text appears **character-by-character**
3. **Bold words** appear as complete units (not character-by-character)
4. **Italic words** appear as complete units
5. **Citations** appear as complete superscripts ¹ ² ³
6. **Lists** build item by item
7. **Sources section** appears at the end

### Visual Flow:
```
●●● (typing indicator)
↓
E
↓
Er
↓
Eri
↓
Eric
↓
Eric Adams was
↓
Eric Adams was indicted¹ (entire word + citation appears at once)
↓
Eric Adams was indicted¹ on
↓
... continues character by character
```

---

## Mobile Display

### Desktop (≥768px)
- List padding: 1.5rem
- List item spacing: 0.5rem
- Citation size: 0.75em
- Font size: 16px base

### Mobile (<768px)
- List padding: 1.25rem (tighter)
- List item spacing: 0.35rem (tighter)
- Citation size: 0.65em (smaller)
- Font size: 15.2px (0.95em)

### Visual Comparison:

**Desktop:**
```
Key allegations¹ include:
  • Illegal campaign donations²
  • Luxury travel and gifts³
  • Abuse of power¹
```

**Mobile:**
```
Key allegations¹ include:
 • Illegal donations²
 • Luxury gifts³
 • Abuse of power¹
```
*(slightly tighter spacing, smaller citations)*

---

## Color & Styling

### Text Colors
- **Regular text**: Inherits from parent (usually #1f2937 or chat widget color)
- **Bold text**: Same color, 700 weight
- **Italic text**: Same color, italic style
- **Citations**: #2563eb (blue)

### List Styling
- **Bullet marker**: Inherits text color, 0.9em size
- **Number marker**: Inherits text color, 600 weight
- **List items**: 1.6 line-height for readability

### Hover States
- **Citations**: Pointer cursor, underline on hover
- **List items**: No hover state (text, not interactive)

---

## Accessibility

### Screen Readers
- **Bold text**: Announced as "emphasis" or "strong"
- **Italic text**: Announced as "emphasis"
- **Lists**: Announced as "list of X items"
- **Citations**: Announced as "superscript link"

### Keyboard Navigation
- **Citations**: Tabbable (can reach with Tab key)
- **Enter/Space**: Activates citation link
- **Lists**: Navigate by line (arrow keys)

---

## What's NOT Supported

### Intentionally Excluded for Security
- ❌ Raw HTML tags: `<script>`, `<div>`, etc.
- ❌ Image embeds: `![alt](url)`
- ❌ Links: `[text](url)`
- ❌ Code blocks: ` ```code``` `
- ❌ Tables: `| col | col |`
- ❌ Headings: `# Heading`
- ❌ Inline styles: `style="color: red"`

### Why Excluded
1. **Security**: Prevent XSS attacks
2. **Simplicity**: Keep parser fast and maintainable
3. **Consistency**: Ensure predictable rendering
4. **Focus**: Support most common formatting needs

---

## Backend Best Practices

### ✅ DO Use:
```markdown
**Important terms** for emphasis
*Subtle emphasis* for nuance
- Bullet lists for unordered items
1. Numbered lists for steps/priorities
**Bold text**[1] with citations
```

### ❌ DON'T Use:
```markdown
<strong>HTML tags</strong>
![image](url)
[link text](url)
# Headings (use bold instead)
```code blocks```
Complex nested lists (keep it simple)
```

### Recommended Structure:
```markdown
Opening paragraph with **key points**[1] and *context*.

**Section Header:**
- Bullet point one[2]
- Bullet point two
- Bullet point three[3]

Numbered steps:
1. **First step**[1]
2. *Second step*
3. **Third step**[2]

Concluding paragraph with ***strong emphasis***[1].

Sources:
1. Source Title
   URL: https://source.com
```

---

This guide shows exactly what users will see when backend sends markdown syntax! 📝✨
