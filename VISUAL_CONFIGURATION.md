# Enhanced Visual Configuration Features

## Overview
The subathon timer now includes comprehensive visual configuration options that allow for detailed customization of appearance, spacing, effects, and styling. All options are configurable through the StreamElements widget fields interface.

## New Configuration Groups

### Layout Controls
Controls spacing and positioning of elements:

- **Spacing between elements** (0-100px): Controls the gap between title, timer, and event elements
- **Container padding** (0-100px): Sets padding around the entire widget
- **Extra space below title** (0-100px): Additional margin specifically below the title
- **Extra space below timer** (0-100px): Additional margin specifically below the timer

### Title Visual Effects

#### Glow Effect
- **Enable title glow effect**: Toggle for title glow
- **Title glow color**: Color picker for glow color
- **Title glow size** (0-50px): Size/intensity of the glow

#### Drop Shadow
- **Enable title drop shadow**: Toggle for drop shadow (enabled by default)
- **Title shadow color**: Color picker for shadow color
- **Title shadow X offset** (-50 to 50px): Horizontal shadow offset
- **Title shadow Y offset** (-50 to 50px): Vertical shadow offset
- **Title shadow blur** (0-50px): Shadow blur radius

### Timer Visual Effects

#### Border
- **Enable timer border**: Toggle for border around timer box
- **Timer border color**: Color picker for border
- **Timer border width** (1-20px): Border thickness
- **Timer border radius** (0-50px): Border corner roundness

#### Glow Effect
- **Enable timer glow effect**: Toggle for timer box glow
- **Timer glow color**: Color picker for glow color
- **Timer glow size** (0-50px): Size/intensity of the glow

#### Drop Shadow
- **Enable timer drop shadow**: Toggle for timer box shadow
- **Timer shadow color**: Color picker for shadow color
- **Timer shadow X offset** (-50 to 50px): Horizontal shadow offset
- **Timer shadow Y offset** (-50 to 50px): Vertical shadow offset
- **Timer shadow blur** (0-50px): Shadow blur radius

#### Text Effects
- **Enable timer text glow**: Toggle for glowing text effect on numbers
- **Timer text glow color**: Color picker for text glow
- **Timer text glow size** (0-30px): Size/intensity of text glow

#### Padding
- **Timer horizontal padding** (0-100px): Left/right padding inside timer box
- **Timer vertical padding** (0-100px): Top/bottom padding inside timer box

### Event Visual Effects

#### Border
- **Enable event border**: Toggle for border around event box
- **Event border color**: Color picker for border
- **Event border width** (1-10px): Border thickness
- **Event border radius** (0-30px): Border corner roundness

#### Glow Effect
- **Enable event glow effect**: Toggle for event box glow
- **Event glow color**: Color picker for glow color
- **Event glow size** (0-30px): Size/intensity of the glow

#### Drop Shadow
- **Enable event drop shadow**: Toggle for event box shadow
- **Event shadow color**: Color picker for shadow color
- **Event shadow X offset** (-30 to 30px): Horizontal shadow offset
- **Event shadow Y offset** (-30 to 30px): Vertical shadow offset
- **Event shadow blur** (0-30px): Shadow blur radius

## Technical Implementation

### CSS Template Variables
The CSS now uses StreamElements template variables for all visual properties:

```css
/* Layout */
gap: {{layoutSpacing}}px;
padding: {{containerPadding}}px;
margin-bottom: {{titleMarginBottom}}px;

/* Effects */
text-shadow: {{titleShadowX}}px {{titleShadowY}}px {{titleShadowBlur}}px {{titleShadowColor}};
filter: drop-shadow(0 0 {{titleGlowSize}}px {{titleGlowColor}});
border: {{timerBorderWidth}}px solid {{timerBorderColor}};
```

### JavaScript Effect Management
The JavaScript handles conditional application of effects based on checkbox states:

```javascript
function applyVisualEffects() {
  // Conditionally apply CSS classes based on field values
  if (!F.titleShadowEnabled) {
    title.classList.add("no-shadow");
  }
  // ... additional effect toggles
}
```

### CSS Class System
Effects are controlled through CSS classes that override the template variables:

```css
#title.no-shadow { text-shadow: none; }
#title.no-glow { filter: none; }
.timer.no-border { border: none; }
```

## Usage Instructions

1. **Copy the enhanced files**: Replace your existing `fields.json`, `styles.css`, and `script.js` with the enhanced versions
2. **Configure in StreamElements**: Use the new grouped controls in the widget fields panel
3. **Test effects**: Enable/disable various effects to see immediate changes
4. **Fine-tune values**: Adjust sizes, colors, and offsets to match your stream's aesthetic

## Example Configurations

### Neon/Cyberpunk Style
- Enable all glow effects
- Use bright neon colors for glows (cyan, magenta, etc.)
- Small or no shadows
- Thin borders with neon colors

### Classic/Professional Style
- Enable drop shadows
- Disable glow effects
- Use neutral shadow colors (dark grays)
- Medium borders with subtle colors

### Minimal/Clean Style
- Disable all effects
- Increase spacing between elements
- Use simple, clean fonts
- Light backgrounds or transparent

## Compatibility
- Works with all existing functionality
- Backward compatible with previous configurations
- All new fields have sensible defaults
- Optional effects don't interfere with core timer functionality