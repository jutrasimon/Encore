// The same build serves main (/) and the preview (/audio-test/); each talks to its own function.
const preview=typeof location!=='undefined'&&location.pathname.split('/').includes('audio-test');
export const SERVER_URL = 'https://imghkkvpotbxqvwnbjxg.supabase.co/functions/v1/'+(preview?'encore-preview':'encore');
