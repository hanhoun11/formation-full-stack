const contacts = [];

function ajouterContact(nom, telephone) {
  contacts.push({ nom, telephone });
}

function listerContacts() {
  return contacts;
}

module.exports = { ajouterContact, listerContacts };