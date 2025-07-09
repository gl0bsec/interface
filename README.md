# Text Embedding Explorer

An interactive web application for visualizing and analyzing text embeddings with AI-powered insights. Explore relationships between text data through an intuitive scatter plot interface and perform intelligent analysis using OpenAI's language models.

## Project Description

Text Embedding Explorer transforms text data into visual insights by plotting high-dimensional embeddings in an interactive 2D space. Each point represents a piece of text, positioned based on semantic similarity. Users can select clusters of related content and leverage AI analysis to discover patterns, themes, and insights within their data.

### Key Features

- **Interactive Visualization**: Plotly-powered scatter plot with smooth zoom, pan, and selection. Dedicated buttons and scroll wheel controls let you zoom in, zoom out, and return home.
- **AI-Powered Analysis**: Integration with OpenAI API for intelligent text analysis
- **Flexible Selection**: Lasso and box selection tools with keyboard shortcuts
- **Real-time Preview**: Instant preview of selected data points with metadata
- **Cost Estimation**: Transparent API usage and cost calculations
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support

## Usage Instructions

### Getting Started

1. **Start the Application**
   ```bash
   npm install
   npm start
   ```
   The application will open automatically at `http://localhost:3000`

2. **Explore Sample Data**
   - The application loads with sample text embeddings ready for exploration
   - Each point represents a text snippet with associated metadata (category, date, author, sentiment)
   - Points are color-coded by category with a legend in the top-left

### Selecting and Analyzing Data

#### Selection Methods
- **Lasso Selection**: `Shift + L` - Draw freeform shapes around points
- **Box Selection**: `Shift + B` - Drag rectangular selections
- **Clear Selection**: `Shift + C` - Remove all selected points

#### Analysis Workflow
1. **Select Points**: Use keyboard shortcuts to choose selection mode, then click and drag on the plot
2. **Review Selection**: Selected points appear in the expanded preview panel on the right
3. **Configure Analysis**: Click the settings icon (⚙) in the top-right of the sidebar to add your OpenAI API key
4. **Analyze**: Enter your analysis prompt and click "Analyze Selection"

### Settings Configuration

Click the settings icon (⚙) in the sidebar to configure:

- **API Key**: Your OpenAI API key (stored locally in browser)
- **Model Selection**: Choose between GPT-3.5 Turbo, GPT-4, or GPT-4 Turbo
- **API Endpoint**: Custom endpoint URL if needed
- **Token Limits**: Maximum response length
- **Field Selection**: Choose which data fields to include in analysis

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Shift + L` | Switch to Lasso selection mode |
| `Shift + B` | Switch to Box selection mode |
| `Shift + C` | Clear current selection |

### Sample Analysis Prompts

- "What common themes connect these selected texts?"
- "Identify sentiment patterns and emotional tone across this selection"
- "Summarize the main topics and create topic clusters"
- "Compare writing styles and identify different authors"
- "Find temporal trends and evolution of topics over time"

## Technical Requirements

- **Browser**: Modern browser with ES6+ support (Chrome 61+, Firefox 60+, Safari 10.1+, Edge 16+)
- **JavaScript**: Required for application functionality
- **Internet Connection**: Required for AI analysis features
- **OpenAI API Key**: Optional for AI analysis (visualization works without it)

## Data Format

The application currently works with sample data, but can be extended to support custom datasets with the following structure:

```javascript
{
  content: "Your text content here",
  category: "Classification category",
  date: "YYYY-MM-DD",
  author: "Author name",
  sentiment: "Positive/Negative/Neutral",
  // Additional custom fields...
}
```

## Privacy & Security

- API keys are stored locally in your browser's localStorage
- No data is sent to external servers except OpenAI (when using analysis features)
- All text analysis requests are made directly from your browser to OpenAI
- HTTPS enforced for all external API communications

## Getting an OpenAI API Key

1. Visit [OpenAI API Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Generate a new API key
4. Copy the key (starts with `sk-`)
5. Paste it in the application settings

## License

MIT License - Feel free to use, modify, and distribute.