# Rough.js integration plugin for Oxygen Game Engine

## Install
```bash
npm install --save oxygen-roughjs-plugin
```

## Usage
**src/index.js**:
```javascript
// Import helper component.
import { initializeRoughjsPlugin } from 'oxygen-roughjs-plugin';

// After engine lazyInitialization:
initializeRoughjsPlugin();
```

**static/assets/config.json**, `assets` section:
```json
{
  "assets": [
    "roughsvg://images/logo.svg?{variants:2,styles:{bowing:4,roughness:1.25}}"
  ]
}
```
