# Implementation Checklist & Troubleshooting

## Pre-Launch Checklist

- [ ] Backend `/analyze_game_idea` endpoint is available and working
- [ ] Backend response structure matches the expected format:
  ```json
  {
    "competitors": { "metrics": {...}, "list": [...] },
    "idea_analysis": { 
      "suggested_name": "...",
      "summary": "...",
      "scores": {...},
      "growth_points": [...]
    }
  }
  ```
- [ ] API_BASE_URL is correctly set (check `.env` or `vite.config.js`)
- [ ] Language parameter is correctly handled (check if backend expects 'en' or 'eng')
- [ ] CORS is properly configured on backend

## Testing Scenarios

### Scenario 1: Successful Analysis
**Steps:**
1. Fill idea description, genre, language
2. Click "Analyze Idea"
3. Wait for market data to load (should be fastest)
4. Navigate to Competitors tab
5. Navigate to Idea Analysis tab

**Expected:**
- All three tabs show data
- No loading spinners
- Radar chart is interactive

### Scenario 2: Slow Network (Competitors Lags)
**Steps:**
1. Open network tab in DevTools
2. Add throttling (slow 3G)
3. Click "Analyze Idea"
4. Immediately navigate to Competitors/Idea Analysis

**Expected:**
- Market shows loading state then data
- Competitors/Idea sections show loading spinner
- Data fills in when API responds
- User can still interact with completed sections

### Scenario 3: API Failure
**Steps:**
1. Temporarily disable network or mock failure
2. Click "Analyze Idea"
3. Check console for errors

**Expected:**
- Market section: Shows error message (current behavior)
- Competitors section: Falls back to mock data
- Idea Analysis section: Shows empty state
- No app crash

### Scenario 4: Radar Chart Hover
**Steps:**
1. Complete idea analysis
2. Navigate to Idea Analysis tab
3. Hover cursor over radar chart aspect labels

**Expected:**
- Label text changes color (yellow)
- Tooltip appears near cursor
- Tooltip shows reasoning text
- No visual glitches

## Common Issues & Solutions

### Issue 1: "Cannot read property 'score' of undefined"
**Cause:** Backend returns scores with null/undefined values
**Solution:** Component already handles this with `scoreObj?.score ?? 0`
**Check:** Verify backend provides all score keys or is okay with missing ones

### Issue 2: Radar chart tooltips not appearing
**Cause 1:** `reasonings` object is empty or missing
- **Solution:** Debug `reasoningsMap` generation
- **Check:** `console.log(reasoningsMap)` in component

**Cause 2:** Canvas mouse event handler not firing
- **Solution:** Check if canvas parent has CSS pointer-events
- **Check:** Canvas should have `cursor: 'help'` on hover

**Cause 3:** Tooltip positioned off-screen
- **Solution:** Adjust tooltip position calculation
- **Check:** May need `right` positioning instead of `left` near edges

### Issue 3: Data not updating in Idea Analysis tab
**Cause:** Component not re-rendering when `ideaAnalysisData` prop changes
**Solution:** Check useEffect dependency array includes `ideaAnalysisData`
**Check:**
```jsx
useEffect(() => {
    if (ideaAnalysisData) {
        setData(ideaAnalysisData);  // Must be here
    }
}, [ideaAnalysisData, ideaDescription]);  // Must be in dependencies
```

### Issue 4: Growth points rendering as empty
**Cause:** `data.growth_points` is undefined or not an array
**Solution:** Add safety check before mapping
**Fix:**
```jsx
{data?.growth_points && data.growth_points.length > 0 && (
    <div>...</div>
)}
```

### Issue 5: Language not respected in tooltip/labels
**Cause:** Radar chart labels are extracted from backend English response
**Solution:** Either:
- Option A: Backend returns labels in correct language
- Option B: Frontend translates labels using i18n
**Current:** Using backend English labels - may need translation map

## Performance Considerations

1. **Parallel requests** - Both API calls fire without waiting
   - Pro: Faster perceived performance
   - Con: Double network usage
   - Trade-off: Acceptable for this use case

2. **Canvas rendering** - RadarChart draws on every render
   - Current: Only redraws when data/labels/hovered change
   - Could optimize: Use Canvas requestAnimationFrame if needed

3. **Component re-renders** - IdeaAnalysisSection re-renders when:
   - `ideaAnalysisData` prop changes ✓
   - Parent component renders ✓
   - Could optimize: Use React.memo() if parent renders frequently

## Debugging Commands

```javascript
// In browser console:

// Check if ideaData was received
console.log('ideaData:', window.__ideaData)

// Manually trigger analysis
document.querySelector('[type="submit"]').click()

// Check localStorage for mock mode
localStorage.getItem('forceMockData')
```

## Backend API Contract

### analyze_game_idea Endpoint

**Request:**
```json
POST /analyze_game_idea
{
  "idea": "string (max 5000 chars)",
  "tags": ["string"],
  "language": "en" or "ru",
  "min_reviews": 0,
  "min_review_score": 0,
  "min_revenue": 0,
  "min_semantic_score": 0.8,
  "popularity_weight": 0.1,
  "limit": 100
}
```

**Response:**
```json
{
  "competitors": {
    "metrics": {
      "found": "string",
      "revenue": "string",
      "medianRevenue": "string",
      "avgRevenue": "string",
      "avgPrice": "string"
    },
    "list": [
      {
        "id": number,
        "title": "string",
        "image": "string (URL)",
        "positiveReviewPercent": "string",
        "reviewCount": "string",
        "revenue": "string",
        "downloads": "string",
        "releaseDate": "string",
        "price": "string",
        "description": "string",
        "tags": ["string"],
        "similarity": "string (percentage)",
        "peakCCU": "string",
        "developer": "string",
        "publisherClass": "string",
        "estimatedRevenue": "string",
        "publisher": "string",
        "genres": ["string"],
        "categories": ["string"],
        "mechanics": ["string"],
        "pros": ["string"],
        "cons": ["string"]
      }
    ]
  },
  "idea_analysis": {
    "suggested_name": "string",
    "summary": "string",
    "scores": {
      "gameplay": {
        "score": number (0-10) or null,
        "reasoning": "string",
        "lack_of_info": "string or null"
      },
      "story": { ... },
      "visual": { ... },
      "monetization": { ... },
      "niche": { ... },
      "innovation": { ... }
    },
    "growth_points": [
      {
        "aspect": "string",
        "current_state": "string",
        "recommendation": "string",
        "expected_outcome": "string"
      }
    ]
  }
}
```

## Rollback Plan

If issues occur post-launch:

1. **Quick disable competitors/idea tabs:**
   ```jsx
   // In LeftSidebar navItems, comment out:
   // { id: 'competitors', ... },
   // { id: 'idea', ... },
   ```

2. **Revert to old API:**
   ```jsx
   // In handleFormSubmit, comment out analyze_game_idea call
   // Keep only analyze_charts
   ```

3. **Use mock data by default:**
   ```jsx
   localStorage.setItem('forceMockData', 'true');
   ```

4. **Full rollback:**
   ```bash
   git revert <commit-hash>
   ```

## Sign-Off Checklist

- [ ] No console errors
- [ ] All three sections render correctly
- [ ] Tooltips appear on radar chart hover
- [ ] Data loads when switching between tabs
- [ ] Empty states show appropriately
- [ ] Performance is acceptable (<2s for all data)
- [ ] Mobile responsive (test on small screens)
- [ ] Works with both Russian and English UI
