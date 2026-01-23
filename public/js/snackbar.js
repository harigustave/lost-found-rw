document.addEventListener("DOMContentLoaded", () => {
    const snackbar = document.getElementById("snackbar");

    if (!snackbar) return;

    setTimeout(() => {
        snackbar.style.opacity = "0";
        snackbar.style.visibility = "hidden";
    }, 15000);
});