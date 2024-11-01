document.addEventListener("DOMContentLoaded", function () {
  // Messages dropdown functionality
  const messagesIcon = document.querySelector(".messages-icon");
  const messagesDropdown = document.querySelector(".messages-dropdown");

  messagesIcon.addEventListener("click", function (e) {
    messagesDropdown.classList.toggle("show");
    e.stopPropagation();
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (
      !messagesDropdown.contains(e.target) &&
      !messagesIcon.contains(e.target)
    ) {
      messagesDropdown.classList.remove("show");
    }
  });

  // Sidebar functionality
  const menuButton = document.querySelector(".menu-button");
  const sidebar = document.querySelector(".sidebar");
  const sidebarOverlay = document.querySelector(".sidebar-overlay");
  const miniSidebar = document.querySelector(".mini-sidebar");

  menuButton.addEventListener("click", function () {
    sidebar.classList.toggle("show");
    sidebarOverlay.classList.toggle("show");
    miniSidebar.classList.toggle("hide");
  });

  // Close sidebar when clicking overlay
  sidebarOverlay.addEventListener("click", function () {
    sidebar.classList.remove("show");
    sidebarOverlay.classList.remove("show");
    miniSidebar.classList.remove("hide");
  });
});
