# TaiPI Metadata Assessment

The Metadata Assessment Tool is a web-based application designed to evaluate the completeness and quality of metadata records against predefined validation criteria.
The tool supports dynamic configuration using JSON, allowing users to easily customize validation rules without modifying the application source code.

By externalizing validation logic into JSON files, the system becomes:

- flexible
- easily maintainable
- adaptable to different metadata standards
- scalable for new validation requirements

## Features

-   **URL-based fetch** of JSON or XML (`application/json`,
    `application/xml`, `text/xml`, or JSON served as `text/plain`)
-   **Robust XML → JSON** conversion using `fast-xml-parser`
-   **FAIR checks** with per-principle tallies and overall counts
-   **Visual summary** via `SummaryChart` and per-principle progress
    sections
-   **Tabbed checklists** (Passed, Failed, Warnings, Info)


## Core Logic

The main logic lives in `checkMetadata(md)`, which inspects a metadata
object and produces:

``` ts
{
  totalChecks: number,
  totalScores: { Findable: number, Accessible: number, Interoperable: number, Reusable: number },
  passed: number,
  warnings: number,
  failed: number,
  informational: number,
  passedScores: { Findable: number, Accessible: number, Interoperable: number, Reusable: number },
  passedChecks: Array<{ message, level, principle }>,
  warningChecks: Array<{ message, level, principle }>,
  failedChecks: Array<{ message, level, principle }>,
  informationalCheck: Array<{ message, level, principle }>
}
```

Checks currently include (examples):

-   Title word count\
-   Presence of identifiers (`metadataIdentifier`, `doi`)\
-   Authors array (name, ORCID, affiliation expected)\
-   `publicationDate`\
-   `short_description` and `documentation` word counts\
-   Spatial extent, landing page, download URL, API URL, dataset
    license\
-   Optional integrations like Interactive Map / TaiPIHub

> You can easily add or adjust checks inside `checkMetadata(md)`.



## Expected Metadata Shape

The app normalizes input so `checkMetadata` receives a single **dataset
object**.\
Minimum fields checked (examples):

``` json
{
  "title": "Dataset title",
  "metadataIdentifier": 11405141,
  "metadataCode": "ISWCA",
  "publicationDate": "2024-09-30T00:00:00.000Z",
  "doi": "https://doi.org/xxx",
  "short_description": "At least ~20 words...",
  "documentation": "At least ~100 words...",
  "spatialExtent": "...",
  "corresponding_author": "name@example.com",
  "license": "cc_by",
  "authors": [
    { "name": "First Author", "orcid": "0000-0000-0000-0000", "affiliation": "Org" }
  ]
}
```

### XML Input

For XML, the parser expects a root `<dataset>` with nested authors:

``` xml
<dataset>
  <title>...</title>
  <metadataIdentifier>11405141</metadataIdentifier>
  <authors>
    <author>
      <name>First Author</name>
      <orcid>0000-0000-0000-0000</orcid>
      <affiliation>Org</affiliation>
    </author>
  </authors>
  ...
</dataset>
```

The app flattens `authors` to an array if it detects
`dataset.authors.author`.

## Getting Started

### 1) Install

``` bash
# with npm
npm install

# or with yarn
yarn

# or with pnpm
pnpm install
```

Make sure you have these dependencies in `package.json`:

-   `react`, `react-dom`
-   `react-bootstrap`
-   `framer-motion`
-   `fast-xml-parser`

### 2) Run Dev Server

``` bash
npm run start
# or
yarn start
# or
pnpm start
```

Open http://localhost:3000 in your browser.

### 3) Build for Production

``` bash
npm run build
# or
yarn build
# or
pnpm build
```

## How to Use

1.  Start the app.
2.  Paste a **JSON** or **XML** URL into the input box.
    -   Examples:
        -   JSON served as `application/json` or `text/plain`
        -   XML served as `application/xml` or `text/xml`
3.  Click **Assess**.
4.  View the chart, per-principle bars, and tabbed checklists.

> If the URL returns an **array**, the app uses the **first element** as
> the dataset.



## Customization

-   Add or tune checks in `checkMetadata(md)`.
-   Change thresholds (e.g., title 4 words, documentation 100 words) to
    match your policy.
-   Update informational messages and levels (`REQUIRED`, `OPTIONAL`,
    `INFO`).
-   Extend UI by editing `SummaryChart`, `AssessmentSection`, and
    `CheckList`.

## Accessibility & UX Notes

-   Tabs consolidate results (Passed/Failed/Warnings/Info).
-   `SummaryChart` communicates distribution at a glance.
-   Progress bars per FAIR principle show coverage vs. requirements.

## Testing Tips

-   Test JSON with missing fields to verify Failed/Warn counts.
-   Test XML with/without `<authors>`; ensure author normalization
    works.
-   Try JSON served as `text/plain` and HTML pages with `<pre>`
    wrappers.

