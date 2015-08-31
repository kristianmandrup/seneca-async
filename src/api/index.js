// Return self. Mostly useful as a check that this is a Seneca instance.
function api_seneca() {
  return this
}

// Describe this instance using the form: Seneca/VERSION/ID
function api_toString() {
  return this.name
}
