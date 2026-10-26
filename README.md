# VELORA ESTATES

A premium real-estate website: listings with photography, floor plans, a regional site plan, a mortgage calculator and procedural 3D villa models. This edition is a **static website**: no server and no database. Listings and agents are bundled in `src/data/*.json` and photos are in `public/uploads/`, so it deploys to any static host (Vercel, Netlify, GitHub Pages).


## Stack

| Layer | Technology |
| --- | --- |
| UI | React 19, TypeScript, React Router 8 |
| Build | Vite 8 |
| 3D | three.js, @react-three/fiber, @react-three/drei (villas are modelled in code, no model files) |
| Motion | Motion for React |
| Styling | CSS Modules, self-hosted Gloock and Hanken Grotesk fonts |
| Icons | lucide-react |
| Quality | Vitest + Testing Library, oxlint, axe-core, Playwright (screenshots) |

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check and build into dist/
npm run preview    # serve the production build on :4173
npm test
```

## Deploy on Vercel

1. Push this folder to a GitHub repository.
2. In Vercel choose **Add New > Project**, import the repository and keep the defaults (`vercel.json` sets the build command, the `dist` output and the single-page-app rewrite).
3. Optional: set `VITE_CREDIT_NAME` to change the footer credit ("Website by ..."); it defaults to Sondos Lasheen. An empty value hides it.

## Editing the content

- Listings: `src/data/properties.json` (price in USD, images reference `/uploads/properties/<file>.jpg`).
- Agents: `src/data/agents.json`.
- Photos: add files to `public/uploads/properties/` and reference them from the listing.
- Enquiry and viewing forms are validated in the browser and confirmed on screen only. To receive real messages, connect `src/services/enquiries.ts` to a form service or an API.

## Photo credits

Photographs are CC0 images from StockSnap contributors; the credit for each is shown on its listing and listed in `public/uploads/properties/CREDITS.json`.
