const burger = document.querySelector(".burger");
const nav = document.querySelector(".nav-links");
let isOpen = false;


burger.addEventListener("click", () => {
    if (!isOpen) {
      nav.classList.add("fadein");
      nav.classList.remove("fadeout");
      // isOpen = true;
    } else {
      nav.classList.remove("fadein");
      nav.classList.add("fadeout");
      // isOpen = false;
    }
    isOpen = !isOpen;
  });
  