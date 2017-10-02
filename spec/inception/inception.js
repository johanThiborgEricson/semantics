if(URL&&new URL(document.location).searchParams.get("inception") != "false"){
  describe("Fetching source code...", function() {
    
    var FactoryBackup = InterpreterMethodFactory;
    var factorySourceCode;
    var interpreter = new JavaScriptInterpreter();
    
    beforeAll(function(done) {
      function reqListener() {
        factorySourceCode = this.responseText;
        done();
      }
      
      var oReq = new XMLHttpRequest();
      oReq.addEventListener("load", reqListener);
      oReq.open("GET", "src/InterpreterMethodFactory.js");
      oReq.send();
    });
    
    it("compiling...", function() {
      interpreter.program(factorySourceCode, window);
      JavaScriptInterpreter.hack();
      expect(InterpreterMethodFactory).not.toBe(FactoryBackup);
    });
    
  });
}
