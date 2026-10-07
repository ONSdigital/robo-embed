// APP CONFIG

// Base paths
export const base_prod = "/robo-embed"; // Directory on the ONS website
export const base_preview = "/robo-embed"; // Directory on datavisweb preview server or Github Pages

// Public address of the app, with no trailing slash. This is only used where the app needs a full,
// absolute URL (the chart embed codes). It doesn't affect the build or the paths the app uses, which
// are set by base_prod and base_preview above.
export const app_url = "https://www.ons.gov.uk/robo-embed";

// BUILD DATA CONFIG

// Locations of data file and template (path to a local or shared drive)
export const source_dir = "./demo-data";
export const data_file = "data.csv";
export const template_file = "template.pug";

// 3-letter ID prefixes to filter from CSV id column
export const filter = ["E06", "E07", "E08", "E09", "N09", "S12", "W06"];

// Columns to extract from CSV
export const cols = ["areacd", "areanm", "parentcd"];

// Other files to copy from source_dir (OPTIONAL)
export const files_to_copy = [];
