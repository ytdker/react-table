import $ from "jquery";

const APIKEY = "KupWrBGwqyeKkUIgtcGvyJ1qUUQbrsGZ";
const BASEURL = "https://app.ticketmaster.com/discovery/v2"
const EVENTBASEURL = `${BASEURL}/events.json`;
const EVENTDETAILS = `${BASEURL}/events/`;
export function GetEvents(size, keyword, sortBy) { return $.ajax(`${EVENTBASEURL}?size=${size}&apikey=${APIKEY}&keyword=${keyword}${sortBy ? "&sort=" + sortBy : ""}`) }
export function GetEventsByUrl(url) { return $.ajax(`${EVENTBASEURL}?${url}&apikey=${APIKEY}`) }
export function GetEventDetails(id) { return $.ajax(`${EVENTDETAILS}${id}?apikey=${APIKEY}`); }
