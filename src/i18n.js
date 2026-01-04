// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "My shopping lists": "My shopping lists",
      "Create new list": "Create new list",
      "Show active lists": "Show active lists",
      "Show archived lists": "Show archived lists",
      "Owner": "Owner",
      "Open": "Open",
      "Archive": "Archive",
      "Delete": "Delete",
      "Light Mode": "Light Mode",
      "Dark Mode": "Dark Mode",
      "Log out": "Log out",
      "Lists overview": "Lists overview",
      "Items status": "Items status",
      "Completed": "Completed",
      "Not completed": "Not completed",
      "Back to lists": "Back to lists",
      "Show completed items": "Show completed items",
      "Add item": "Add item",
      "Complete": "Complete",
      "Members": "Members",
      "Manage": "Manage",
      "Confirm leave list": "Are you sure you want to leave this list?",
      "Members of the shopping list": "Members of the shopping list",
      "Name": "Name",
      "Role": "Role",
      "Member": "Member",
      "Remove": "Remove",
      "+ Add member": "+ Add member",
      "Cancel": "Cancel",
      "Name of the list": "Name of the list",
      "Create": "Create",
      "Rename": "Rename"
    }
  },
  cs: {
    translation: {
      "My shopping lists": "Moje nákupní seznamy",
      "Create new list": "Vytvořit nový seznam",
      "Show active lists": "Zobrazit aktivní seznamy",
      "Show archived lists": "Zobrazit archivované seznamy",
      "Owner": "Vlastník",
      "Open": "Otevřít",
      "Archive": "Archivovat",
      "Delete": "Smazat",
      "Light Mode": "Světle",
      "Dark Mode": "Tmavě",
      "Log out": "Odhlásit se",
      "Lists overview": "Přehled seznamů",
      "Items status": "Stav položek",
      "Completed": "Dokončeno",
      "Not completed": "Nedokončeno",
      "Back to lists": "Zpět na seznamy",
      "Show completed items": "Zobrazit dokončené položky",
      "Add item": "Přidat položku",
      "Complete": "Dokončit",
      "Members": "Členové",
      "Manage": "Spravovat",
      "Confirm leave list": "Opravdu chceš odejít z tohoto seznamu?",
      "Members of the shopping list": "Členové seznamu",
      "Name": "Jméno",
      "Role": "Role",
      "Member": "Člen",
      "Remove": "Odebrat",
      "+ Add member": "+ Přidat člena",
      "Cancel": "Zrušit",
      "Name of the list": "Název seznamu",
      "Create": "Vytvořit",
      "Rename": "Přejmenovat"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "cs", // výchozí jazyk
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
