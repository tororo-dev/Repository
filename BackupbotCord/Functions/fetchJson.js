async function fetchJson(url) {
  const res = await fetch(url);
  return res.json();
}
module.exports = { fetchJson };