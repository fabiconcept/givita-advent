# Givita Question Import Guide

Paste a JSON array of question objects into the Import dialog.

---

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | The question text shown to respondents |
| `type` | string | One of the 13 supported types (see below) |

---

## Optional Fields

| Field | Type | Description | Supported Types |
|-------|------|-------------|-----------------|
| `required` | boolean | Is the question mandatory? Default: `false` | All |
| `description` | string | Helper text below the question title | All |
| `options` | string[] | Answer choices | multiple-choice, checkbox, ranking |
| `placeholder` | string | Input placeholder | text, textarea, email, url, phone, number, date, rating |
| `minLabel` | string | Left label for scale | likert-scale |
| `maxLabel` | string | Right label for scale | likert-scale |
| `maxScore` | number | Max scale value (default: 5) | likert-scale, rating |
| `min` | number | Minimum value | number |
| `max` | number | Maximum value | number |
| `unit` | string | Unit suffix (e.g. "NGN", "years") | number |
| `minLength` | number | Minimum character count | text, textarea |
| `maxLength` | number | Maximum character count | text, textarea |
| `pattern` | string | Regex pattern for validation | text, textarea, email, phone |
| `patternMessage` | string | Custom error when pattern fails | text, textarea, email, phone |
| `repeat` | number | Auto-repeat N times with numbered titles | All |

---

## Question Types

| Type | Description | Key Fields |
|------|-------------|------------|
| `multiple-choice` | Single select from options | `options` |
| `checkbox` | Multi-select from options | `options` |
| `ranking` | Drag-to-rank options | `options` |
| `likert-scale` | Scale with labels | `minLabel`, `maxLabel`, `maxScore` |
| `rating` | Star or numeric rating | `maxScore`, `placeholder` |
| `text` | Short text input | `placeholder`, `minLength`, `maxLength`, `pattern` |
| `textarea` | Long text (multiline) | `placeholder`, `minLength`, `maxLength`, `pattern` |
| `email` | Email with validation | `placeholder`, `pattern` |
| `number` | Numeric input | `min`, `max`, `unit`, `placeholder` |
| `url` | URL input | `placeholder` |
| `phone` | Phone number input | `placeholder`, `pattern` |
| `yes-no` | Binary yes/no toggle | — |
| `date` | Date picker | `placeholder` |

---

## Example JSON

```json
[
  {
    "title": "What is your name?",
    "type": "text",
    "required": true,
    "placeholder": "Enter your full name",
    "minLength": 2,
    "maxLength": 100
  },
  {
    "title": "How would you rate our service?",
    "type": "rating",
    "required": true,
    "maxScore": 5,
    "placeholder": "Tap to rate"
  },
  {
    "title": "How satisfied are you?",
    "type": "likert-scale",
    "required": true,
    "minLabel": "Not satisfied",
    "maxLabel": "Very satisfied",
    "maxScore": 5
  },
  {
    "title": "Which features do you use?",
    "type": "checkbox",
    "required": false,
    "options": ["Dashboard", "Reports", "Analytics", "Settings"]
  },
  {
    "title": "How did you hear about us?",
    "type": "multiple-choice",
    "required": true,
    "options": ["Social media", "Friend", "Search engine", "Advertisement"]
  },
  {
    "title": "Rank these priorities",
    "type": "ranking",
    "required": true,
    "options": ["Speed", "Price", "Quality", "Support"]
  },
  {
    "title": "Are you a returning user?",
    "type": "yes-no",
    "required": true
  },
  {
    "title": "How old are you?",
    "type": "number",
    "required": false,
    "min": 18,
    "max": 100,
    "unit": "years",
    "placeholder": "Enter your age"
  },
  {
    "title": "Any additional comments?",
    "type": "textarea",
    "required": false,
    "placeholder": "Tell us more...",
    "minLength": 10,
    "maxLength": 500
  },
  {
    "title": "Your email address",
    "type": "email",
    "required": true,
    "placeholder": "you@example.com",
    "pattern": "^[^@]+@[^@]+\\.[^@]+$",
    "patternMessage": "Please enter a valid email address"
  },
  {
    "title": "Phone number",
    "type": "phone",
    "required": false,
    "placeholder": "+234 ...",
    "pattern": "^\\+?[0-9\\s\\-]+$",
    "patternMessage": "Please enter a valid phone number"
  },
  {
    "title": "Preferred date",
    "type": "date",
    "required": false
  },
  {
    "title": "Website or portfolio",
    "type": "url",
    "required": false,
    "placeholder": "https://..."
  },
  {
    "title": "Rate our support team",
    "type": "rating",
    "required": true,
    "maxScore": 10,
    "placeholder": "1 = poor, 10 = excellent",
    "repeat": 3
  }
]
```

---

## Notes

- `options` can be a string array or a pipe-separated string: `"option1|option2|option3"`
- `pattern` accepts any valid JavaScript regex (escape backslashes: `\\d+`)
- `repeat` creates N copies with numbered titles: "Rate support team 1", "Rate support team 2", etc.
- `id` and `order` are auto-generated on import — no need to include them
