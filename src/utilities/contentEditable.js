//On KeyDown
export const saveContentPressEnter = (e) => {
  if (e.key === "Enter") {
    e.target.blur();
  }
};
//Select content when click
export const selectAllInlineText = (e) => {
  e.target.focus();
  e.target.select();
};
