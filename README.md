# Field Hospital — Bed Demand Forecast Tool

A web-based bed demand forecasting dashboard.

## Features

- **Trained LOS model** — Empirical survival curves stratified by diagnosis group, age band, readmission status, and body region
- **Conditional prediction** — Estimates remaining LOS given how long a patient has already been admitted
- **Body region parsing** — Auto-parses free-text diagnosis descriptions (e.g., "GSW to the leg") into 12 anatomical categories
- **Ward-level forecast** — 3–7 day bed demand projections with confidence intervals
- **Bed map** — Visual grid showing occupancy, near-discharge, and long-stay patients
- **CSV import** — Upload current inpatient data to generate live predictions

## Deploy to Vercel

### Option A: Via GitHub (recommended)

1. Create a GitHub repository:
   ```bash
   cd bed-forecast-app
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/bed-forecast.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) and sign up with GitHub

3. Click **"New Project"** → Import your `bed-forecast` repository

4. Vercel auto-detects Create React App — click **"Deploy"**

5. Your app will be live at `https://bed-forecast-xxx.vercel.app`

### Option B: Via Vercel CLI

1. Install the CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   cd bed-forecast-app
   vercel
   ```

3. Follow the prompts. For production:
   ```bash
   vercel --prod
   ```

## Local Development

```bash
cd bed-forecast-app
npm install
npm start
```

Opens at http://localhost:3000

## Data Format

Upload CSV with these columns:

| Field | Required | Description |
|-------|----------|-------------|
| patient_id | Yes | Unique identifier |
| age | Yes | Patient age |
| sex | Yes | M/F |
| ward | Yes | Ward assignment |
| bed | Yes | Bed code (e.g., WA-5) |
| diagnosis_group | Yes | GSW, Blast Injury, Stab Wound, etc. |
| admit_date | Yes | YYYY-MM-DD |
| los | Yes | Current length of stay in days |
| body_region | Optional | lower_limb, chest, abdomen_pelvis, etc. |
| diagnosis_text | Optional | Free text (auto-parsed to body_region) |
| is_readmission | Optional | Y/N |
