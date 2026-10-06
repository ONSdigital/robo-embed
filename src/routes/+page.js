export const prerender = true;

import { base } from "$app/paths";
import { getData, getPlace } from "$lib/utils";

export async function load({ fetch }) {
	let places = await getData(`${base}/data/places.csv`, fetch); // Array of data for all places
	let place = await getPlace(`${base}/data/json/default.json`, fetch);

	return { places, place };
}
