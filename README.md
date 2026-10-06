# robo-embed

A Svelte Kit template for creating embedded semi-automated journalism (AKA "robo-journalism") content to sit within an iframe.

The template is design to use PUG templates and wide-format CSV files, as created within [this editor](https://github.com/ONSvisual/robo-editor).

_Note: If you'd like to create semi-automated articles on standalone pages, please use this [alternative template](https://github.com/ONSvisual/robo-article)._

## Getting started

Create a fork or local copy of this repository, and then run the following command to install dependencies:

```bash
npm install
```

Next, run this command to build the demo data files. This will read the PUG and CSV files in the **/demo-data** folder, and write JSON and CSV files to **/static/data**:

```bash
npm run build:data
```

And, finally, run the demo in preview/dev mode. It should be viewable at [localhost:5173](http://localhost:5173):

```bash
npm run dev
```

## Previewing as an iframe embed

Once your app is running, you can also see what the page would look like within an iframe by navigating to [localhost:5173/iframe.html](http://localhost:5173/iframe.html)

## Using your own data and templates

To use your own CSV data and PUG template, you will either need to overwrite the demo data or, for better collaboration, read directly from your project source files on a shared network drive (this also avoids the risk of writing data files to insecure locations).

When you move the files, you'll need to change the following parameters in the **/src/app.config.js** file:

```javascript
// Locations of data file and template (path to a local or shared drive)
export const source_dir = "./demo-data/";
export const data_file = "data.csv";
export const template_file = "template.pug";
```

If you're using a dataset that is not based around local authority data you'll need to change the **filter** parameter in the above file to an appropriate value. Setting this to **null** or an empty array **[ ]** will return all of the rows in the CSV (ie. will not filter the data):

```javascript
// 3-letter ID prefixes to filter from CSV id column
export const filter = ["E06", "E07", "E08", "E09", "N09", "S12", "W06"];
```

In the above case, you are also likely to want to change the **cols** parameter, which selects which columns to extract from the source CSV file for the purposes of powering the dropdown selector in the app. (The output CSV file can be found at **/static/data/places.csv**.)

```javascript
// Columns to extract from CSV
export const cols = ["areacd", "areanm", "parentcd"];
```

_Note: You might want to specify additional data columns here in order to supply data for charts/maps that cover many (or all) rows in the data set._

## Customising the app

To make further amendments to the app (eg. adding new section styles or custom charts/maps) requires a working knowledge of **Svelte**.

The best place to start editing is in the **/src/routes/+page.svelte** file.

## Building the app

When you're ready to publish the app (either for preview or for production), you'll need to run the **build** command. This will build a static version of the app in the **/build** folder, which can be copied to wherever you want to host the app:

```bash
npm run build
```

Before building the app, you'll need to customise the base paths in the **/app.config.js** file. The default path is **/robo-embed**. You can set a separate base-relative path for a preview server (eg. **/my-app**) and for a production server (eg. **/visualisations/my-app**):

```javascript
export const base_prod = "/robo-embed"; // Directory on the ONS website
export const base_preview = "/robo-embed"; // Directory on datavisweb preview server or Github Pages
```
