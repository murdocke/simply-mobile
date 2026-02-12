let leftMenuNudgePending = false;

export const armLeftMenuNudgeForNextShell = () => {
  leftMenuNudgePending = true;
};

export const consumeLeftMenuNudgeForNextShell = () => {
  if (!leftMenuNudgePending) return false;
  leftMenuNudgePending = false;
  return true;
};
