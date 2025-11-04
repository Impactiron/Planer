# Personal Task Planner

A personal web-based task planning system that runs entirely in your browser using GitHub Pages.

## Features

- ✅ Manual task entry via web form
- 📊 Excel file upload and parsing
- 📅 Automatic task scheduling with conflict resolution
- 🎨 Clean, modern calendar UI
- 💾 Local data storage (no backend needed)
- 🚀 Runs entirely client-side on GitHub Pages

## Getting Started

### Local Development

1. Clone this repository
2. Open `index.html` in your browser
3. Start planning your tasks!

### Deploy to GitHub Pages

1. Go to your repository settings
2. Navigate to "Pages" section
3. Select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Save and wait for deployment

Your app will be available at: `https://Impactiron.github.io/Planer/`

## Usage

### Adding Tasks Manually
1. Click "Add Task" button
2. Fill in task name, duration (in hours), and optional preferred date
3. Click "Save Task"

### Importing from Excel
1. Prepare an Excel file with columns: `Task Name`, `Duration (hours)`, `Preferred Date` (optional)
2. Click "Import Excel" button
3. Select your file
4. Tasks will be automatically parsed and scheduled

### Managing Your Schedule
- View tasks in calendar view
- Drag and drop to reschedule
- Click on tasks to edit or delete
- Auto-scheduling prevents conflicts

## Excel File Format

Create an Excel file with these columns:
- **Task Name** (required) - Name of the task
- **Duration (hours)** (required) - e.g., 2.5
- **Preferred Date** (optional) - YYYY-MM-DD or any date format
- **Notes** (optional) - Additional information

Example:
| Task Name | Duration (hours) | Preferred Date | Notes |
|-----------|------------------|----------------|-------|
| Write report | 3 | 2025-11-05 | Final draft |
| Review code | 2 | 2025-11-06 | PR #123 |
| Team meeting | 1 | 2025-11-07 | Weekly sync |

## Technical Stack

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Calendar**: FullCalendar.js
- **Excel Parsing**: SheetJS (xlsx)
- **Storage**: Browser LocalStorage
- **Icons**: Lucide Icons

## Customization

You can customize the app by editing these settings in `app.js`:

```javascript
// Work hours (default: 9 AM to 5 PM)
const WORK_START_HOUR = 9;
const WORK_END_HOUR = 17;
```

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Data Storage

All data is stored locally in your browser using `localStorage`. Your tasks never leave your device, ensuring complete privacy.

To backup your data:
1. Click the "Export" button
2. Save the JSON file
3. Re-import it later if needed

## License

MIT License - Free for personal use

## Support

For issues or questions, please open an issue on GitHub.
