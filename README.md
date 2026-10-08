# robo-embed

A SvelteKit template for semi-automated ("robo-journalism") content about local areas that sits within another page in an iframe. It's a single page that loads an area's content when the reader chooses it.

## Part of the robo-journalism toolkit

This repository is one of a set of open-source tools from the Office for National Statistics (ONS) for producing semi-automated ("robo-journalism") content about local areas:

| Repository                                                                   | What it does                                                                                                                         |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [robo-utils](https://github.com/ONSdigital/robo-utils)                       | A JavaScript library of functions for writing text from data, and for rendering Pug templates into JSON                              |
| [robo-editor](https://github.com/ONSdigital/robo-editor)                     | A browser-based editor for writing and testing Pug templates against your data ([try it](https://onsdigital.github.io/robo-editor/)) |
| [robo-article](https://github.com/ONSdigital/robo-article)                   | A SvelteKit template that publishes a Pug template as a standard article page for each area                                          |
| [robo-embed](https://github.com/ONSdigital/robo-embed) **(this repository)** | A SvelteKit template for content that sits within another page in an iframe                                                          |
| [robo-scrolly](https://github.com/ONSdigital/robo-scrolly)                   | A SvelteKit template for scrollytelling articles, with charts and maps that change as you scroll                                     |

Templates are usually written and tested in robo-editor, then published with one of the SvelteKit templates, with robo-utils doing the work in both.

## Getting started

Create a fork or local copy of this repository, then install the dependencies:

```bash
npm install
```

Next, build the demo data. This renders the Pug template in **/demo-data** for every area in its CSV file, and writes a JSON file for each area (plus a list of areas) to **/static/data**:

```bash
npm run build:data
```

Then run the app in development mode, at [localhost:5173](http://localhost:5173):

```bash
npm run dev
```

To see how the page looks within an iframe, go to [localhost:5173/iframe.html](http://localhost:5173/iframe.html). Add an area code to the address (eg. **iframe.html#E06000001**) to open the embed at that area, as a parent page can.

## Using your own data and templates

To use your own CSV data and Pug template, either replace the demo files or, for better collaboration, read them directly from your project folder on a shared drive (which also avoids copying sensitive data into a repository like GitHub). Set their locations in **/src/app.config.js**:

```javascript
// Locations of data file and template (path to a local or shared drive)
export const source_dir = "./demo-data";
export const data_file = "data.csv";
export const template_file = "template.pug";
```

The **filter** setting keeps only the rows whose area code starts with one of these prefixes. If your data isn't based on local authorities, change it, or set it to **null** or an empty array **[ ]** to keep every row:

```javascript
// 3-letter ID prefixes to filter from CSV id column
export const filter = ["E06", "E07", "E08", "E09", "N09", "S12", "W06"];
```

The **cols** setting chooses which columns go into **/static/data/places.csv**, which the app loads for its list of areas and its area links:

```javascript
// Columns to extract from CSV
export const cols = ["areacd", "areanm", "parentcd"];
```

`npm run build:data` prints a summary of how many pages were generated. If any page has a Pug error, it lists the first few area codes and exits with an error, and it keeps the previous output. Once every page renders, it also removes the JSON files of areas that are no longer in the data.

## Writing templates

Templates are written in [Pug](https://pugjs.org), using the functions in [robo-utils](https://github.com/ONSdigital/robo-utils/blob/main/docs/api.md) to write text from the data, and are easiest to write and test in [robo-editor](https://onsdigital.github.io/robo-editor/). The rendered template for the selected area becomes the page's content. The class of each top-level `section` sets how it's shown:

| Section                     | Shown as                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------ |
| `section.Meta`              | Not shown: its props set the page title, description and analytics details                       |
| `section.Header`            | The title block, with the area search                                                            |
| `section.Summary`           | A row of headline figures, from its nested sections                                              |
| `section.Chart`             | A chart (set its type with `prop.chartType`), with options to download it or copy its embed code |
| `section.Map`               | A map of the areas in a region, coloured by a value (see below)                                  |
| `section.Highlight`         | A coloured block of text                                                                         |
| `section.Warning`           | A warning notice                                                                                 |
| `section.(any other class)` | A section of text, with `prop.title` as its heading                                              |

A `Map` section's `data` gives a value for each area code, and its `regioncd` sets the region the map zooms to. The boundaries are in **/src/lib/boundaries** (local authorities and regions, as TopoJSON), and areas missing from them aren't drawn.

## Customising the app

The app is built with [SvelteKit](https://svelte.dev/docs/kit) and [Svelte 5](https://svelte.dev/docs/svelte), with components from [@onsvisual/svelte-components](https://github.com/ONSdigital/svelte-components) and charts from [@onsvisual/svelte-charts](https://github.com/ONSdigital/svelte-charts). Making further changes (eg. adding new section styles, or custom charts and maps) needs a working knowledge of Svelte.

The best place to start is **/src/routes/+page.svelte**, which shows each section.

As well as the main page, **/embed/** shows a single chart, for the chart embed codes (eg. **/embed/?area=E06000001&chart=chart-id**).

## Building the app

When you're ready to publish the app, build it into the **/build** folder, which can be copied to wherever you want to host it. The build is a set of static HTML, CSS and JavaScript files, and doesn't need any back-end code to run.

```bash
npm run build
```

This prerenders the page, and makes a small fix to the JavaScript files so that they're served correctly on the ONS website.

The base paths are set in **/src/app.config.js**:

```javascript
export const base_prod = null; // Directory on the ONS website
export const base_preview = "/my-app"; // Directory on datavisweb preview server or Github Pages
```

- With **base_prod** set to **null**, the app is built with relative paths, so the **/build** folder works from any folder on any server. Set it to a path (eg. **"/visualisations/my-app"**) to build the app for that folder only.
- **app_url** is the full public address of the app (eg. **"https://www.ons.gov.uk/my-app"**). It's only used where the app needs a complete URL (the chart embed codes), and doesn't affect the build.

### Preview builds

To build a preview, eg. for a private server or GitHub Pages, run:

```bash
npm run build:preview
```

A preview build uses **base_preview**, and isn't prerendered: instead of a page for each area, it's a single **404.html** page that loads the app in the browser for any URL. The server needs to send unknown URLs to **404.html**. The **web.config** file in **/static** does this on IIS servers, such as our internal preview server, and GitHub Pages does it automatically.
