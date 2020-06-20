interface BootstapActionType {
  // Only this action is supported
  actionId: 'RUN_STARTUP_SCRIPT';
  script: string;
}

export default BootstapActionType
