import { asset } from "$app/paths";
import { getData } from "$lib/utils";

export async function load({ fetch }) {
	const places = await getData(asset("/data/places.csv"), fetch);

	return { places };
}
