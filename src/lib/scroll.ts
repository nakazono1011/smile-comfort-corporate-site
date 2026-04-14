export function scrollToElement(id: string, offset = 80) {
  const element = document.getElementById(id);
  if (element) {
    const elementPosition =
      element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: elementPosition, behavior: "smooth" });
  }
}
