import { asset } from "$app/paths";
import { getData, getPlace } from "$lib/utils";

export async function load({ fetch }) {
	let places = await getData(asset("/data/places.csv"), fetch); // Array of data for all places
	let place = await getPlace(asset("/data/json/default.json"), fetch);
	const meta = place.sections.find((s) => s.type === "Meta"); // Page title and analytics props

	return { places, place, meta };
}
