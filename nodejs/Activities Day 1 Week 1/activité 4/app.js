const { ajouterContact, listerContacts } = require("./contactService");
const formaterContact = require("./utils/format");

ajouterContact("Alice", "0600000000");
ajouterContact("Bob", "0611111111");

listerContacts().forEach(c => console.log(formaterContact(c)));