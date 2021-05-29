const defaultOptionsRestoredMessage = "Default settings restored.";
const optionsSavedMessage = "Settings saved.";

const hiddenClass = "is-hidden";
const messageRemovalDelay = 3000;
const twitchUrlPatterns =
  chrome.runtime.getManifest().content_scripts[0].matches;

const nodeIds = {
  messageNodeId: "message",
  messageContainerNodeId: "message-container",
  fontSizeSelectNodeId: "font-size",
  positionSelectNodeId: "position",
  enclosedCheckboxNodeId: "enclose",
  localeStringCheckboxNodeId: "locale-string",
};

const fontSizeMap = {
  small: "5",
  medium: "4",
  big: "3",
};

const positionMap = {
  nextToChannelName: "0",
  nextToFollowButton: "1",
};

const defaultOptions = {
  fontSize: fontSizeMap.medium,
  insertNextToFollowButton: false,
  enclosed: false,
  localeString: true,
};

const saveOptions = () => {
  const fontSizeNodeValue = document.getElementById(
    nodeIds.fontSizeSelectNodeId
  ).value;
  const positionNodeValue = document.getElementById(
    nodeIds.positionSelectNodeId
  ).value;
  const enclosedCheckboxChecked = document.getElementById(
    nodeIds.enclosedCheckboxNodeId
  ).checked;
  const localeStringCheckboxChecked = document.getElementById(
    nodeIds.localeStringCheckboxNodeId
  ).checked;
  const optionsToSave = {
    fontSize: fontSizeNodeValue,
    insertNextToFollowButton:
      positionMap.nextToFollowButton === positionNodeValue,
    enclosed: enclosedCheckboxChecked,
    localeString: localeStringCheckboxChecked,
  };
  chrome.storage.sync.set(optionsToSave, () => {
    showMessage(optionsSavedMessage);
  });
  chrome.tabs.query({ url: twitchUrlPatterns }, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, optionsToSave);
    });
  });
};

const restoreSavedOptions = () => {
  chrome.storage.sync.get(defaultOptions, (savedOptions) => {
    setOptionPageFields(savedOptions);
  });
};

const showMessage = (message) => {
  const statusContainer = document.getElementById(
    nodeIds.messageContainerNodeId
  );
  const status = document.getElementById(nodeIds.messageNodeId);
  statusContainer.classList.remove(hiddenClass);
  status.textContent = message;
  setTimeout(() => {
    status.textContent = "";
    statusContainer.classList.add(hiddenClass);
  }, messageRemovalDelay);
};

const resetOptionsToDefault = () => {
  chrome.storage.sync.set(defaultOptions, () => {
    showMessage(defaultOptionsRestoredMessage);
  });
  chrome.tabs.query({ url: twitchUrlPatterns }, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, defaultOptions);
      setOptionPageFields(defaultOptions);
    });
  });
};

const setOptionPageFields = ({
  fontSize,
  insertNextToFollowButton,
  enclosed,
  localeString,
}) => {
  document.getElementById(nodeIds.fontSizeSelectNodeId).value = fontSize;
  document.getElementById(nodeIds.positionSelectNodeId).value =
    insertNextToFollowButton
      ? positionMap.nextToFollowButton
      : positionMap.nextToChannelName;
  document.getElementById(nodeIds.enclosedCheckboxNodeId).checked = enclosed;
  document.getElementById(nodeIds.localeStringCheckboxNodeId).checked =
    localeString;
};

document.addEventListener("DOMContentLoaded", restoreSavedOptions);
document.getElementById("save").addEventListener("click", saveOptions);
document
  .getElementById("default")
  .addEventListener("click", resetOptionsToDefault);
