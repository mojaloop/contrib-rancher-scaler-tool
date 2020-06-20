const config = {
  nodes: [
    // {
    //   nodePoolId: 'c-vsm2w:np-mg5wr',
    //   nodeTemplateId: 'cattle-global-nt:nt-user-s7l26-nt-2s4x5',
    //   minQuantity: 1,
    //   maxQuantity: 2,
    // },
    {
      nodePoolId: 'c-vsm2w:np-mg5wr',
      nodeTemplateId: 'cattle-global-nt:nt-user-s7l26-nt-2s4x5',
      minQuantity: 1,
      maxQuantity: 2,
      bootstrapActions: [
        // note: only 1 action is currently supported
        { 
          // Only this action type is supported
          actionType: 'RUN_STARTUP_SCRIPT',
          // TODO: to run the script, this could be something like `curl url_of_file | sh`
          script: `echo "HELLO WORLD"; 
                  wget https://google.com/ -O /tmp/hello; 
                  cat /tmp/hello`
        }
      ]
    }
  ]
}

module.exports = config