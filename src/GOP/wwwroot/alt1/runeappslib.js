
function jsonDecode(str) {
	if (str == "") { return null;}
	try { return JSON.parse(str); }
	catch (e) { return null; }
}

function jsonEncode(obj,pretty) {
	return JSON.stringify(obj, pretty ? 2 : 0);
}
